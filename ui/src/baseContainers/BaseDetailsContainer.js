import React from 'react';
import PropTypes from 'prop-types';
import {Card} from 'primereact/card';
import {Messages} from 'primereact/messages';
import BaseContainer from './BaseContainer';
import ActionLink from '../components/ActionLink';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import AppPrefixUtils from "../utils/AppPrefixUtils";

class BaseDetailsContainer extends BaseContainer {
    constructor(props, service) {
        super(props);
        this.service = service;
        this.onUpload = this.onUpload.bind(this);
        this.addBackAndEditButton = this.addBackAndEditButton.bind(this);
        this.addCancelAndSaveButtons = this.addCancelAndSaveButtons.bind(this);
        this.prepareCancelButton = this.prepareCancelButton.bind(this);
        this.prepareBackLink = this.prepareBackLink.bind(this);
        this.updateElement = this.updateElement.bind(this);
        this.createOrUpdate = this.createOrUpdate.bind(this);
        this.getAddSucces = this.getAddSucces.bind(this);
        this.getUpdateSucces = this.getUpdateSucces.bind(this);
        this.renderBackLink = this.renderBackLink.bind(this);
        this.getBackLabel = this.getBackLabel.bind(this);
        this.renderDetails = this.renderDetails.bind(this);
        this.renderView = this.renderView.bind(this);
        this.handleFileCountExceeded = this.handleFileCountExceeded.bind(this);
        this.onRemoveAction = this.onRemoveAction.bind(this);
        this.showRemoveConfirmation = this.showRemoveConfirmation.bind(this);
        this.hideRemoveConfirmation = this.hideRemoveConfirmation.bind(this);
        this.backLinkRendered = true;
        if (service !== undefined && service !== null) {
            this.service.setUiMethods(this.blockUi, this.unblockUi);
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.blockUi();
        this.initBeforeSetElement();
        this.setElement();
    }

    showRemoveConfirmation() {
        this.setState({showConfirmRemoveDialog: true});
    }

    hideRemoveConfirmation() {
        this.setState({showConfirmRemoveDialog: false});
    }

    onRemoveAction(type, costam, target) {
        if (target.value) {
            this.blockUi();
            this.service
                .remove(this.state.element)
                .then(() => {
                    this.persistMessage('success', '', this.getRemoveSucces());
                    window.location.href = AppPrefixUtils.locationHrefUrl(this.props.backUrl);
                })
                .catch((err) => {
                    this.showErrorMessage(err.message);
                    this.hideRemoveConfirmation();
                });
        } else {
            this.hideRemoveConfirmation();
        }
    }

    setElement() {
        const {viewMode} = this.props;
        const {elementId} = this.state;
        if (elementId && (viewMode === 'EDIT' || viewMode === 'VIEW')) {
            this.blockUi();
            this.service
                .get(elementId, viewMode)
                .then((data) => {
                    this.setState({loading: false}, () => this.updateElement(data));
                })
                .catch((err) => {
                    this.handleGetDetailsError(err);
                });
        } else {
            this.setState({loading: false}, this.initAfterSetElement());
        }
    }

    handleGetDetailsError(err) {
        this.showErrorMessage('Błąd podczas pobrania szczegółów');
        if (this.props.backUrl) {
            window.location.href = AppPrefixUtils.locationHrefUrl(this.props.backUrl);
        } else {
            this.setState({loading: false}, () => this.unblockUi());
        }
    }

    updateElement(data) {
        if (this._isMounted) {
            this.setState(
                {
                    element: data,
                },
                () => this.initAfterSetElement()
            );
        }
    }

    initAfterSetElement() {
        this.unblockUi();
    }

    initBeforeSetElement() {
    }

    onUpload(event, varName) {
        const {element} = this.state;
        const varValue = JSON.parse(event.xhr.response);
        if (this._isMounted) {
            const modifiedList = element[varName].concat(varValue);
            this.setState((prevState) => ({
                element: {
                    ...prevState.element,
                    [varName]: modifiedList,
                },
            }));
        }
    }

    handleFileCountExceeded(max) {
        this.showInfoMessage(`Maksymanla ilość załączanych plików wynosi: ${max}!`, 10000);
        this.scrollToTop();
    }

    getAddSucces() {
        return 'Element został utworzony';
    }

    getUpdateSucces() {
        return 'Element został zaktualizowany';
    }

    getRemoveSucces() {
        return 'Element został usunięty';
    }

    getContainerListName() {
        return 'list-container';
    }

    persistMessage(severity, summary, detail) {
        this.saveCookie(
            this.getContainerListName(),
            JSON.stringify({
                severity,
                summary,
                detail,
            })
        );
    }

    handleValidForm() {
        this.createOrUpdate();
    }

    createOrUpdate() {
        const {backUrl} = this.props;
        const {element} = this.state;
        this.scrollToTop();
        if (this._isMounted) {
            if (element.id === undefined || element.id === null) {
                this.service
                    .add(element)
                    .then((response) => {
                        this.blockUi();
                        this.persistMessage('success', '', this.getAddSucces(response));
                        window.location.href = AppPrefixUtils.locationHrefUrl(backUrl);
                    })
                    .catch((err) => {
                        this.showErrorMessage(err.message, 10000);
                    });
            } else {
                this.service
                    .update(element)
                    .then((response) => {
                        this.blockUi();
                        this.persistMessage('success', '', this.getUpdateSucces(response));
                        window.location.href = AppPrefixUtils.locationHrefUrl(backUrl);
                        ;
                    })
                    .catch((err) => {
                        this.showErrorMessage(err.message, 10000);
                    });
            }
        }
    }

    addBackAndEditButton(backLabel) {
        const {editUrl, viewMode} = this.props;
        const {element} = this.state;
        const buttons = [
            this.prepareBackLink(backLabel),
            {
                label: 'Edytuj',
                className: 'float-right',
                href: `${editUrl}/${element.id}`,
                rendered: viewMode === 'VIEW',
            },
        ];
        return this.prepareHeader(buttons);
    }

    prepareBackLink(backLabel) {
        const {backUrl} = this.props;
        return {label: backLabel, href: backUrl, type: 'LINK'};
    }

    prepareCancelButton() {
        const {backUrl, cancelUrl, viewMode} = this.props;
        const {element} = this.state;
        let goBackUrl;
        if (viewMode === 'NEW') {
            goBackUrl = backUrl;
        } else {
            goBackUrl = `${cancelUrl}/${element.id}`;
        }
        return {label: 'Anuluj', href: goBackUrl};
    }

    addCancelAndSaveButtons() {
        const buttons = [
            this.prepareCancelButton(),
            {
                label: 'Zapisz',
                className: 'float-right',
                onClick: this.handleFormSubmit,
            },
        ];
        return this.prepareFooter(buttons);
    }

    getBackLabel() {
        return 'Wróć';
    }

    handleGoBack(e) {
        e.preventDefault();
        this.blockUi();
        const {backUrl} = this.props;
        window.location.href = AppPrefixUtils.locationHrefUrl(backUrl);
        ;
    }

    renderBackLink() {
        return <ActionLink rendered={this.backLinkRendered} label={this.getBackLabel()} className='p-link float-right'
                           handleClick={this.handleGoBack.bind(this)} variant='blue' iconName='mdi-arrow-left'
                           iconSide='left' iconSize='xs' iconColor='blue'/>;
    }

    prepareEditButton(rendered, label) {
        const {editUrl} = this.props;
        const {element} = this.state;
        return {
            label: label !== undefined ? label : 'Edytuj',
            type: 'BUTTON',
            variant: '',
            className: 'float-right',
            href: `${editUrl}/${element.id}`,
            rendered: rendered,
            iconName: 'mdi-pencil',
            iconSide: 'left',
            iconSize: 'm',
        };
    }

    prepareFooterItems() {
        const {backUrl, cancelUrl, viewMode} = this.props;
        const {element} = this.state;
        let goBackUrl;
        if (viewMode === 'NEW') {
            goBackUrl = backUrl;
        } else {
            goBackUrl = `${cancelUrl}/${element.id}`;
        }
        switch (viewMode) {
            case 'EDIT':
            case 'NEW':
                return [
                    {label: 'Anuluj', href: goBackUrl},
                    {
                        label: 'Zapisz',
                        className: 'float-right',
                        onClick: this.handleFormSubmit,
                    },
                ];
            case 'VIEW':
            default:
                return [];
        }
    }

    renderDetails() {
        return null;
    }

    renderView() {
        return (
            <DivContainer colClass=''>
                <DivContainer colClass='col-12 separator-container'>
                    <DivContainer colClass='row'>
                        <DivContainer colClass='separator'></DivContainer>
                    </DivContainer>
                </DivContainer>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <Messages id="custom-messages" ref={(el) => (this.messages = el)}></Messages>
                    <div className='row'>
                        <div className='col-12'>{this.renderBackLink()}</div>
                    </div>
                    {this.state.loading ? null : (
                        this.renderCard()
                    )}
                </BlockUi>
            </DivContainer>
        );
    }

    renderCard() {
        return <Card footer={this.renderFooter()} header={this.renderHeader()}>
            <form onSubmit={this.handleFormSubmit} noValidate>
                {this.renderDetails()}
            </form>
        </Card>
    }

    renderViewWithoutCard() {
        return <DivContainer colClass=''>{this.state.loading ? null : this.renderDetails()}</DivContainer>;
    }
}

BaseDetailsContainer.defaultProps = {
    currentUser: undefined,
    viewMode: 'VIEW',
};

BaseDetailsContainer.propTypes = {
    backUrl: PropTypes.string,
    cancelUrl: PropTypes.string,
    currentUser: PropTypes.object,
    editUrl: PropTypes.string,
    viewMode: PropTypes.string,
};

export default BaseDetailsContainer;

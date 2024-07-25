import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ActionLink from '../components/ActionLink';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import SimpleReactValidator from '../components/validator';
import AuthService from '../services/AuthService';
import $ from 'jquery';
import Constants from '../utils/Constants';
import BlockUi from '../components/waitPanel/BlockUi';
import {Toast} from 'primereact/toast';
import {Message} from 'primereact/message';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import EditRowUtils from '../utils/EditRowUtils';
import ConsoleHelper from '../utils/ConsoleHelper';
import {LoadIndicator} from 'devextreme-react';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import EntryResponseHelper from '../utils/helper/EntryResponseHelper';
import CrudService from '../services/CrudService';
import UrlUtils from '../utils/UrlUtils';
import {readObjFromCookieGlobal, readValueCookieGlobal, removeCookieGlobal} from '../utils/Cookie';
import DataPluginStore from '../containers/dao/DataPluginStore';
import LocalizationService from '../services/LocalizationService';
import DataHistoryLogStore from '../containers/dao/DataHistoryLogStore';
import BatchService from '../services/BatchService';
import ResponseHelper from '../utils/helper/ResponseHelper';
import EditSpecService from '../services/EditSpecService';
import {OperationType} from '../model/OperationType';
import {InputType} from '../model/InputType';
import {StringUtils} from '../utils/StringUtils';
import LocUtils from '../utils/LocUtils';
import EditListUtils from '../utils/EditListUtils';
import { RequestUtils } from '../utils/RequestUtils';

class BaseContainer extends React.Component {
    constructor(props, service) {
        super(props);
        this.refDataGrid = null;
        this.service = service;
        this.authService = new AuthService(this.props.backendUrl);
        this.crudService = new CrudService();
        this.batchService = new BatchService();
        this.editSpecService = new EditSpecService();
        this.scrollToFirstError = this.scrollToFirstError.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleValidForm = this.handleValidForm.bind(this);
        this.prepareFooter = this.prepareFooter.bind(this);
        this.prepareHeader = this.prepareHeader.bind(this);
        this.prepareHeaderItems = this.prepareHeaderItems.bind(this);
        this.prepareFooterItems = this.prepareFooterItems.bind(this);
        this.setWaitPanelLabel = this.setWaitPanelLabel.bind(this);
        this.blockUi = this.blockUi.bind(this);
        this.unblockUi = this.unblockUi.bind(this);
        this.loader = this.loader.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.showSuccessMessage = this.showSuccessMessage.bind(this);
        this.showInfoMessage = this.showInfoMessage.bind(this);
        this.showWarningMessage = this.showWarningMessage.bind(this);
        this.executePlugin = this.executePlugin.bind(this);
        this.showErrorMessages = this.showErrorMessages.bind(this);
        this.handleGetDetailsError = this.handleGetDetailsError.bind(this);
        this.renderGlobalTop = this.renderGlobalTop.bind(this);
        this.handleEditRowChange = this.handleEditRowChange.bind(this);
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleEditRowSave = this.handleEditRowSave.bind(this);
        this.handleEditRowBlur = this.handleEditRowBlur.bind(this);
        this.handleAutoFillRowChange = this.handleAutoFillRowChange.bind(this);
        this.handleRightHeadPanelContent = this.handleRightHeadPanelContent.bind(this);
        this.handleCancelRowChange = this.handleCancelRowChange.bind(this);
        this.handleEditListRowChange = this.handleEditListRowChange.bind(this);
        this.handleAttachmentEntry = this.handleAttachmentEntry.bind(this);
        this.getRealViewId = this.getRealViewId.bind(this);
        this.unselectAllDataGrid = this.unselectAllDataGrid.bind(this);
        this.setVariableFromEvent = this.setVariableFromEvent.bind(this);
        this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
        this.getConfigUrl = this.getConfigUrl.bind(this);
        this.refreshSubView = this.refreshSubView.bind(this);
        this.prepareCalculateFormula = this.prepareCalculateFormula.bind(this);
        this.validator = new SimpleReactValidator();
        this.localizationService = new LocalizationService();
        this._isMounted = false;
        this.jwtRefreshBlocked = false;
        this.scrollToError = false;
    }

    getMessages() {}

    shouldComponentUpdate() {
        const sessionTimeoutDialog = document.getElementById('sessionTimeoutDialog');
        if (sessionTimeoutDialog) {
            return false;
        }
        return true;
    }
    componentDidMount() {
        window.addEventListener('beforeunload', function () {});
        this._isMounted = true;
        if (!this.jwtRefreshBlocked && this.authService.loggedIn()) {
            if (this.authService.isTokenExpiredDate()) {
                this.refreshFromAuthService();
            }
        }
        this.scrollToError = false;
        // eslint-disable-next-line no-undef
        $(window).off('beforeunload');
        // eslint-disable-next-line no-undef
        $(window).unbind();
    }

    refreshJwtToken() {
        if (!this.jwtRefreshBlocked && this.authService.loggedIn() && this.authService.isTokenValidForRefresh()) {
            this.refreshFromAuthService();
        }
    }

    refreshFromAuthService() {
        this.jwtRefreshBlocked = true;
        this.authService
            .refresh()
            .then(() => {
                this.jwtRefreshBlocked = false;
            })
            .catch((err) => {
                this.jwtRefreshBlocked = false;
            });
    }

    getTranslationParam(language, param) {
        let frameworkType = 'rd'.toLowerCase();
        let lang = language.toLowerCase();
        return this.fetch(`${readObjFromCookieGlobal('CONFIG_URL')}/lang/${frameworkType}_translations_${lang}.json`, {
            method: 'GET',
        })
            .then((arr) => {
                return Promise.resolve(arr.labels.find((el) => el.code.toLowerCase() === param.toLowerCase()));
            })
            .catch((err) => {
                throw err;
            });
    }
    componentDidUpdate() {
        this.refreshJwtToken();
        if (this.scrollToError) {
            this.scrollToError = false;
            this.scrollToFirstError();
        }
    }

    handleLogoutUser() {
        this.authService.logout();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showInfoMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = 'Informacja') {
        this.getMessages()?.show({
            severity: 'info',
            life: Constants.SUCCESS_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'info'} content={detail} />
                </div>
            ),
        });
    }

    showWarningMessage(detail, life = Constants.ERROR_MSG_LIFE, summary = '') {
        this.getMessages()?.show({
            severity: 'warn',
            life: Constants.ERROR_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'warn'} content={detail} />
                </div>
            ),
        });
    }

    showSuccessMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = '') {
        this.getMessages()?.show({
            severity: 'success',
            life: life,
            summary: summary,
            detail: detail,
        });
        this.unblockUi();
    }

    showResponseErrorMessage(errorResponse) {
        let title = 'Błąd';
        let message;
        if (!!errorResponse?.error) {
            message = errorResponse.error?.message;
        } else {
            message = 'Wystąpił nieoczekiwany błąd';
        }
        this.getMessages()?.show({
            severity: 'error',
            sticky: false,
            closable: true,
            life: Constants.ERROR_MSG_LIFE,
            summary: title,
            detail: message,
        });
        this.unblockUi();
    }

    showGlobalErrorMessage(err) {
        console.error(err);
        if (!!err.error) {
            this.showResponseErrorMessage(err);
        } else {
            this.showErrorMessages(err);
        }
    }

    showErrorMessage(errMsg, life = Constants.ERROR_MSG_LIFE, closable = true, summary = 'Błąd!') {
        this.getMessages()?.show({
            severity: 'error',
            sticky: false,
            life: life,
            summary: summary,
            detail: errMsg,
        });
        this.unblockUi();
    }

    getConfigUrl() {
        let browseUrl = window.location.href;
        const id = browseUrl.indexOf('/#');
        if (id > 0) {
            browseUrl = browseUrl.substring(0, id + 1);
        }
        let configUrl;
        const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        if (urlPrefixCookie === undefined || urlPrefixCookie == null || urlPrefixCookie === '') {
            configUrl = browseUrl;
        } else {
            configUrl = browseUrl.trim().match('^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)', '')[0] + '/' + urlPrefixCookie;
        }

        return configUrl;
    }

    showErrorMessages(err) {
        let message;
        let title;
        let messages = [];
        if (typeof err === 'string') {
            message = err;
        } else if (err) {
            message = err.message;
            title = err.title;
            if (!message) {
                if (err.errors) {
                    const keys = Object.keys(err.errors);
                    keys.forEach((key, idx) => {
                        let item = key + ': ';

                        const values = err.errors[key];
                        if (values) {
                            if (Array.isArray(values)) {
                                values.forEach((v) => {
                                    item += '' + v;
                                });
                            } else if (typeof values === 'string') {
                                item += values;
                            }
                        }
                        item += idx === keys.length - 1 ? '' : '; ';
                        messages.push(item);
                    });
                }
            }
        }
        if (!message && messages.length === 0) {
            message = 'Wystąpił nieoczekiwany błąd';
        }
        if (messages.length === 0) {
            messages.push(message);
        }
        if (title) {
            title = `Błąd: ${title}`;
        } else {
            title = 'Błąd';
        }
        this.getMessages()?.clear();
        this.getMessages()?.show({
            severity: 'error',
            summary: title,
            content: (
                <React.Fragment>
                    <div className='p-flex p-flex-column' style={{flex: '1 1 0%'}}>
                        <span className='p-toast-message-icon pi' />
                        <div className='p-toast-message-text'>
                            <span className='p-toast-summary'>{title}</span>
                            {messages.map((msg) => {
                                return <div className='p-toast-detail'>{msg}</div>;
                            })}
                        </div>
                    </div>
                </React.Fragment>
            ),
            life: Constants.ERROR_MSG_LIFE,
            closable: true,
        });
        this.unblockUi();
    }

    showMessage(severity, summary, detail, life = Constants.ERROR_MSG_LIFE, closable = true, errMsg) {
        if (this.messages !== undefined && this.messages !== null) {
            this.getMessages()?.clear();
            this.getMessages()?.show({
                severity,
                summary,
                detail,
                life,
                closable,
            });
        } else {
            if (errMsg !== undefined) {
                ConsoleHelper('this.messages === undefined', errMsg);
            } else {
                ConsoleHelper('this.messages === undefined');
            }
        }
    }

    scrollToFirstError() {
        if (this !== undefined && ReactDOM.findDOMNode(this) !== undefined && ReactDOM.findDOMNode(this) !== null) {
            const errors = ReactDOM.findDOMNode(this).getElementsByClassName('srv-validation-message');
            if (errors && errors.length > 0) {
                errors[0].parentNode.scrollIntoView();
            }
        } else {
            ConsoleHelper('scrollToFirstError ', this, ReactDOM.findDOMNode(this));
        }
    }

    handleValidForm() {}

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.blockUi(this.handleValidForm);
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.forceUpdate();
        }
    }

    renderFooter() {
        const footerItems = this.prepareFooterItems();
        if (footerItems !== undefined && footerItems.length > 0) {
            return this.prepareFooter(footerItems);
        } else {
            return null;
        }
    }

    prepareFooterItems() {
        return [];
    }

    prepareFooter(items) {
        const leftItems = [];
        const rightItems = [];
        if (items !== undefined && items.length > 0) {
            items.forEach((item) => {
                if (item.className !== undefined && item.className.includes('float-right')) {
                    item.className = item.className.replace('float-right', '');
                    rightItems.push(item);
                } else {
                    leftItems.push(item);
                }
            });
        }
        return (
            <DivContainer colClass='p-card-header-minheight'>
                {leftItems && leftItems.length > 0 ? this.renderItemCustom(leftItems) : null}
                <DivContainer colClass='float-right'>
                    {rightItems && rightItems.length > 0 ? this.renderItemCustom(rightItems) : null}
                </DivContainer>
            </DivContainer>
        );
    }

    prepareHeaderItems() {
        return [];
    }

    renderHeader() {
        const headerItems = this.prepareHeaderItems();
        if (headerItems !== undefined && headerItems.length > 0) {
            return this.prepareHeader(headerItems);
        } else {
            return null;
        }
    }

    renderItem(item, index) {
        if (item.type === 'LABEL') {
            return (
                <h2 className={`pageheader-title ${item.className}`} key={item.label + index}>
                    {item.label}
                </h2>
            );
        } else if (item.type === 'LINK') {
            return (
                <ActionLink
                    label={item.label}
                    className={`${item.className} header-item`}
                    // eslint-disable-next-line react/jsx-handler-names
                    handleClick={item.onClick instanceof Function ? item.onClick : undefined}
                    href={item.href}
                    rendered={item.rendered}
                    disabled={item.disabled}
                    iconColor={item.iconColor}
                    iconName={item.iconName}
                    iconSize={item.iconSize}
                    iconSide={item.iconSide}
                    variant={item.variant}
                    size={item.size}
                    key={item.label + index}
                />
            );
        } else if (item.type === 'SUBMIT') {
            return item.rendered ? (
                <button
                    value={item.label}
                    // eslint-disable-next-line max-len
                    className={`p-button p-component p-button-text-only header-item ${item.className} ${item.variant} ${item.size}`}
                    type='submit'
                    disabled={item.disabled}
                    key={item.label + index}
                >
                    <span className='p-button-text p-c'>{item.label}</span>
                </button>
            ) : null;
        } else {
            return (
                <ActionButton
                    label={item.label}
                    className={`${item.className} header-item`}
                    // eslint-disable-next-line react/jsx-handler-names
                    handleClick={item.onClick instanceof Function ? item.onClick : undefined}
                    href={item.href}
                    rendered={item.rendered}
                    disabled={item.disabled}
                    iconColor={item.iconColor}
                    iconName={item.iconName}
                    iconSize={item.iconSize}
                    iconSide={item.iconSide}
                    variant={item.variant}
                    size={item.size}
                    key={item.label + index}
                />
            );
        }
    }

    prepareHeader(items) {
        const leftItems = [];
        const rightItems = [];
        if (items !== undefined && items.length > 0) {
            items.forEach((item) => {
                if (item.className !== undefined && item.className.includes('float-right')) {
                    item.className = item.className.replace('float-right', '');
                    rightItems.push(item);
                } else {
                    leftItems.push(item);
                }
            });
        }
        return (
            <DivContainer colClass='p-card-header-minheight'>
                <DivContainer colClass='col-12'>
                    <DivContainer colClass='row'>
                        <DivContainer colClass='col-12'>
                            {leftItems && leftItems.length > 0 ? this.renderItemCustom(leftItems) : null}
                        </DivContainer>
                        <DivContainer colClass='col-12'>
                            <DivContainer colClass='float-right'>
                                {rightItems && rightItems.length > 0 ? this.renderItemCustom(rightItems) : null}
                            </DivContainer>
                        </DivContainer>
                    </DivContainer>
                </DivContainer>
            </DivContainer>
        );
    }
    renderItemCustom(items) {
        return items.map((item, index) =>
            item.customRenderFunction instanceof Function ? item.customRenderFunction() : this.renderItem(item, index)
        );
    }
    renderSeparator(pt) {
        return (
            <div className={`row ${pt}`}>
                <div className='col'>
                    <div className='ade-border-bottom ade-separator' />
                </div>
            </div>
        );
    }

    setWaitPanelLabel(waitPanelLabel, callBack) {
        this.setState({waitPanelLabel}, () =>
            callBack !== undefined && callBack instanceof Function ? callBack() : null
        );
    }

    blockUi(callBack, waitPanelLabel) {
        if (waitPanelLabel !== undefined) {
            this.setState(
                {
                    blocking: true,
                    waitPanelLabel,
                },
                () => (callBack !== undefined && callBack instanceof Function ? callBack() : null)
            );
        } else {
            if (this._isMounted) {
                this.setState({blocking: true}, () =>
                    callBack !== undefined && callBack instanceof Function ? callBack() : null
                );
            }
        }
    }

    unblockUi(callBack) {
        this.setState({blocking: false}, () =>
            callBack !== undefined && callBack instanceof Function ? callBack() : null
        );
    }

    loader() {
        const {waitPanelLabel} = this.state;
        let label = 'Operacja w toku, proszę czekać.';
        if (waitPanelLabel !== undefined && waitPanelLabel !== null) {
            label = waitPanelLabel;
        }
        return (
            <div id='cover-spin-container'>
                <LoadIndicator visible={true} height={40} width={40} />
                <div id='cover-spin-text'>
                    <p>{label}</p>
                </div>
            </div>
        );
    }

    renderContent() {
        return <React.Fragment />;
    }

    renderHeaderRight() {
        return <React.Fragment />;
    }

    renderHeaderLeft() {
        return <React.Fragment />;
    }

    renderHeaderContent() {
        return <React.Fragment />;
    }

    renderHeadPanel() {
        return <React.Fragment />;
    }

    renderGlobalTop() {
        return <React.Fragment />;
    }

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <BlockUi
                    tag='div'
                    className='block-ui-div'
                    blocking={this.state.blocking || this.state.loading}
                    loader={this.loader}
                    renderBlockUi={this.state.gridViewType !== 'dashboard'}
                >
                    {this.state.loading === false ? this.renderView() : null}
                </BlockUi>
            </React.Fragment>
        );
    }

    renderView() {
        return (
            <React.Fragment>
                {this.renderGlobalTop()}
                <DivContainer colClass='base-container-div'>
                    <DivContainer colClass='row base-container-header'>
                        <DivContainer id='header-left' colClass={''}>
                            {this.renderHeaderLeft()}
                        </DivContainer>
                        <DivContainer id='header-right' colClass={''}>
                            {this.renderHeaderRight()}
                        </DivContainer>
                        <DivContainer id='header-content' colClass='col-12'>
                            {this.renderHeaderContent()}
                        </DivContainer>
                    </DivContainer>
                    <DivContainer colClass='row base-container-head-panel'>
                        <DivContainer id='header-panel' colClass='col-12'>
                            {this.renderHeadPanel()}
                        </DivContainer>
                    </DivContainer>
                    <DivContainer colClass='row base-container-content'>
                        <DivContainer id='content' colClass='col-12'>
                            {this.renderContent()}
                        </DivContainer>
                    </DivContainer>
                </DivContainer>
            </React.Fragment>
        );
    }

    handleGetDetailsError(err) {
        this.showErrorMessages(err);
        if (this.props.backUrl) {
            window.location.href = AppPrefixUtils.locationHrefUrl(this.props.backUrl);
        } else {
            this.setState({loading: false}, () => this.unblockUi());
        }
    }

    handleEditRowSave(viewId, recordId, parentId, token) {
        ConsoleHelper(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`);
        const saveElement = RequestUtils.createObjectDataToRequest(
            UrlUtils.isEditRowView() ? this.props : this.state
        );
        ConsoleHelper(`handleEditRowSave: element to save = ${JSON.stringify(saveElement)}`);
        this.rowSave(viewId, recordId, parentId, saveElement, false, token);
        if (this.shloudUnselectOnEditRowSave()) {
            this.unselectAllDataGrid();
        }
    }
    shloudUnselectOnEditRowSave() {
        return !this.state?.copyData && !UrlUtils.isEditRowView();
    }

    refreshView() {
        if (this.isCardView()) {
            if (!!this.getRefCardGrid()) {
                this.getRefCardGrid().current?.refresh(true);
            }
        } else if (this.isGanttView()) {
            if (!!this.getRefGanttView()) {
                this.getRefGanttView().current.refresh();
            }
        } else if (this.isGridView()) {
            if (!!this.getRefGridView()) {
                if (window?.dataGrid) {
                    if (this.state?.gridViewType !== 'cardView') window.dataGrid.clearSelection();
                }
                this.getRefGridView().instance.getDataSource().reload();
            }
        } else if (this.isDashboard()) {
            this.getRefGridView()?.instance?.getDataSource()?.reload();
        }
    }
    windowNotHaveSubView() {
        return (
            this.isCardView() &&
            UrlUtils.getViewType() === 'cardView' &&
            !UrlUtils.getParentId() &&
            !UrlUtils.getRecordId()
        );
    }
    notValidTypeForRefresh() {
        return (
            UrlUtils.getViewType() === 'gridView' &&
            this.state.elementViewType === 'cardView' &&
            this.state.gridViewType === 'gridView'
        );
    }
    refreshSubView(forceReStateSubView) {
        if (this.windowNotHaveSubView()) {
            this.unblockUi();
            return;
        }
        if (
            ((this.state.kindView === 'ViewSpec' || this.state.kindView === 'View') && this.state.subView) ||
            forceReStateSubView
        ) {
            if (!this.notValidTypeForRefresh()) {
                if (window?.dataGrid) {
                    if (this.state?.gridViewType !== 'cardView') window.dataGrid.clearSelection();
                }
                const id = UrlUtils.getViewIdFromURL();
                // Patrz na viewContainer
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId,
                    this.state.elementParentId,
                    this.state.elementViewType,
                    forceReStateSubView
                );
            }
        } else {
            removeCookieGlobal('refreshSubView');
        }
    }

    reloadOnlyDataGrid() {
        if (this.isGridView()) {
            if (!!this.getRefGridView()) this.getRefGridView().instance.getDataSource().reload();
        }
    }

    repaintGridView() {
        if (!!this.getRefGridView()) {
            this.getRefGridView().instance.repaint();
        }
    }

    batchSave = (viewId, parentId, saveElement, confirmSave, fncRedirect) => {
        this.blockUi();
        this.batchService
            .save(viewId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                ResponseHelper.run(
                    saveResponse,
                    () => this.batchSave(viewId, parentId, saveElement, true),
                    () => {},
                    (res) => {
                        this.showErrorMessages(res);
                    },
                    (res) => {
                        this.showResponseErrorMessage(res);
                    }
                );
                if (fncRedirect) {
                    fncRedirect();
                }
                this.getRefGridView().instance.getDataSource().reload();
                this.unblockUi();
            })
            .catch((ex) => {
                this.showResponseErrorMessage(ex);
                this.unblockUi();
            });
    };

    specSave = (viewId, parentId, saveElement, confirmSave, fncRedirect) => {
        this.blockUi();
        saveElement.forEach((array) => {
            array.forEach((el) => {
                if (el.fieldName === '_STATUS' && el.value === 'inserted') {
                    let ID = array.find((arr) => arr.fieldName === 'ID');
                    ID.value = null;
                }
            });
        });
        this.editSpecService
            .save(viewId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                ResponseHelper.run(
                    saveResponse,
                    () => {
                        this.specSave(viewId, parentId, saveElement, true)},
                    () => {
                    },
                    (res) => {
                        this.showErrorMessages(res);
                    },
                    (res) => {
                        this.showResponseErrorMessage(res);
                    },
                    ()=>{
                        if (fncRedirect) {
                            fncRedirect();
                        }            
                    }
                );
                if((StringUtils.isBlank(saveResponse?.status) || saveResponse?.status !== "NOK") && fncRedirect){
                    fncRedirect();
                }
                this.refreshView();
                if (UrlUtils.urlParamExsits('grid-view')) this.refreshSubView(true);
                this.unselectAllDataGrid();
                this.unblockUi();
               
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
                this.unblockUi();
            });
    };
    kindOperationForRow() {
        if (UrlUtils.isEditRowView()) {
            return 'Edit';
        }
        return this.state.editData.editInfo?.kindOperation ? this.state.editData.editInfo?.kindOperation : undefined;
    }
    rowSave = (viewId, recordId, parentId, saveElement, confirmSave, token) => {
        this.blockUi();
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        const kindOperation = this.kindOperationForRow();
        this.crudService
            .save(viewId, recordId, parentId, kindView, kindOperation, saveElement, confirmSave, token)
            .then((saveResponse) => {
                ResponseHelper.run(
                    saveResponse,
                    () => () => this.rowSave(viewId, recordId, parentId, saveElement, true),
                    () => {
                        this.setState({visibleEditPanel: false});
                        this.returnFromRowEdit();
                    },
                    (res) => {
                        this.showErrorMessages(res);
                    },
                    (res) => {
                        this.showResponseErrorMessage(res);
                    }
                );
                let refresh = true;
                if (kindOperation.toUpperCase() === 'COPY') {
                    if (saveResponse?.status !== 'NOK') {
                        this.copyAfterSave(saveResponse);
                    } else {
                        refresh = false;
                    }
                }
                if (this.state?.attachmentFiles?.length) {
                    this.uploadAttachemnt(this.state.parsedGridView, this.state.attachmentFiles[0]);
                }
                if (refresh && saveResponse.status !== 'NOK') {
                    if (this.shouldRefreshSubView(kindOperation)) {
                        this.refreshSubView();
                    }
                    this.refreshView(saveElement);
                }
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };
    shouldRefreshSubView(kindOperation) {
        const attachmentDialog = document.getElementById('attachmentDialog');
        return !attachmentDialog && readValueCookieGlobal('refreshSubView') && kindOperation.toUpperCase() !== 'COPY';
    }
    copyAfterSave = (saveResponse) => {
        let {copyOptions, copyCounter} = this.state.copyData;
        let selectedRowKeys = this.state.selectedRowKeys;
        let currentSelectedRowKeyId = this.state.currentSelectedRowKeyId;
        if (copyOptions.numberOfCopy !== copyCounter.counter) {
            copyCounter.counter = copyCounter.counter + 1;
            if (copyOptions.copyLastModifiedObject) {
                selectedRowKeys = selectedRowKeys.filter((rowKey) => rowKey.ID !== currentSelectedRowKeyId);
                currentSelectedRowKeyId = saveResponse.recordId;
                this.setState({
                    currentSelectedRowKeyId: currentSelectedRowKeyId,
                });
            }
            this.copyEntry(currentSelectedRowKeyId);
        } else {
            selectedRowKeys = selectedRowKeys.filter((rowKey) => rowKey.ID !== currentSelectedRowKeyId);
            this.setState({
                currentSelectedRowKeyId: undefined,
                selectedRowKeys: selectedRowKeys,
            });
            if (selectedRowKeys.length !== 0 && !this.state.copyId) {
                copyCounter.counter = copyCounter.reInitializeCounter;
                this.copyEntry();
            } else {
                this.setState({
                    copyData: undefined,
                    copyId: undefined,
                });
                this.refreshView();
                this.unselectAllDataGrid();
                return;
            }
        }
        this.setState((prevState) => ({
            ...prevState,
            copyCounter: copyCounter,
            selectedRowKeys: selectedRowKeys,
        }));
    };
    rowCancel = (viewId, recordId, parentId, saveElement) => {
        this.blockUi();
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        const kindOperation = this.kindOperationForRow();
        this.crudService
            .cancel(viewId, recordId, parentId, kindView, kindOperation, saveElement)
            .then(() => {
                this.unselectAllDataGrid();
                this.unblockUi();
                this.returnFromRowEdit();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };
    delete(id) {
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .deleteEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .delete(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((deleteResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    if (
                                        kindView !== undefined &&
                                        kindView !== null &&
                                        kindView.toUpperCase() === 'VIEWSPEC' &&
                                        UrlUtils.urlParamExsits('grid-view')
                                    ) {
                                        this.refreshSubView(true);
                                    }
                                    const msg = deleteResponse.message;
                                    if (!!msg) {
                                        this.showErrorMessage(msg.text, Constants.SUCCESS_MSG_LIFE, true, msg.title);
                                    } else if (!!deleteResponse.error) {
                                        this.showResponseErrorMessage(deleteResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi(),
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    generate(id) {
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
        const listId = {listId: idRowKeys};
        this.crudService
            .getDocumentDatasInfo(viewId, id, listId, parentId)
            .then((res) => {
                if (res.info.kind === 'GE') {
                    if (res.info.next) {
                        if (res.message) {
                            this.showSuccessMessage(res.message.text, undefined, res.message.title);
                        } else {
                            this.executeDocument(null, viewId, id, parentId);
                        }
                    }
                } else {
                    if (res.inputDataFields?.length) {
                        let documentInfo = {
                            inputDataFields: res.inputDataFields,
                            info: res.info,
                        };
                        this.setState({
                            visibleDocumentPanel: true,
                            documentInfo: documentInfo,
                        });
                    } else {
                        this.executeDocument(null, viewId, id, parentId);
                    }
                }
            })
            .catch((ex) => {
                this.showResponseErrorMessage(ex);
            });
    }
    isDashboardView() {
        return this.state.subView === null && this.state?.gridViewType === 'dashboard';
    }
    executePlugin(pluginId, requestBody, refreshAll) {
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.isDashboardView()
            ? this.state.elementRecordId
            : this.state.subView == null
            ? UrlUtils.getParentId()
            : this.state.elementRecordId;
        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        this.crudService
            .getPluginExecuteColumnsDefinitions(viewIdArg, pluginId, requestBody, parentIdArg)
            .then((res) => {
                let parsedPluginViewData;
                let renderNextStep = true;
                if (res.info.kind === 'GRID') {
                    visiblePluginPanel = true;
                    let datas = this.dataPluginStore.getPluginExecuteDataStore(
                        viewIdArg,
                        pluginId,
                        requestBody,
                        parentIdArg,
                        (err) => {
                            this.showErrorMessages(err);
                        },
                        () => {
                            this.setState({dataPluginStoreSuccess: true});
                        },
                        () => {
                            return {selectAll: this.state.selectAll};
                        }
                    );
                    parsedPluginViewData = datas;
                } else {
                    if (res.info.message === null && res.info.question == null) {
                        renderNextStep = false;
                    } else visibleMessagePluginPanel = true;
                }

                if (renderNextStep) {
                    this.setState({
                        pluginId: pluginId,
                        parsedPluginViewData: parsedPluginViewData,
                        parsedPluginView: res,
                        visiblePluginPanel: visiblePluginPanel,
                        visibleMessagePluginPanel: visibleMessagePluginPanel,
                        isPluginFirstStep: false,
                    });
                }
                if (res.viewOptions?.refreshAll) {
                    this.unselectAllDataGrid(false);
                    this.refreshView();
                }
            })
            .catch((ex) => {
                this.showResponseErrorMessage(ex);
            });
    }
    plugin(id) {
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
        const listId = {listId: idRowKeys};
        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        this.crudService
            .getPluginColumnsDefnitions(viewId, id, listId, parentId)
            .then((res) => {
                let parsedPluginViewData;
                if (res.info.kind === 'GRID') {
                    visiblePluginPanel = true;
                    if (!this.dataPluginStore) {
                        this.dataPluginStore = new DataPluginStore();
                    }
                    let datas = this.dataPluginStore.getPluginDataStore(
                        viewId,
                        id,
                        listId,
                        parentId,
                        (err) => {
                            if (typeof this.showErrorMessage === 'undefined') {
                                this.props.showErrorMessage(err);
                            } else {
                                this.showErrorMessages(err);
                            }
                        },
                        () => {
                            this.setState({dataPluginStoreSuccess: true});
                        }
                    );
                    parsedPluginViewData = datas;
                } else {
                    visibleMessagePluginPanel = true;
                }
                this.setState({
                    parsedPluginView: res,
                    parsedPluginViewData: parsedPluginViewData,
                    visiblePluginPanel: visiblePluginPanel,
                    visibleMessagePluginPanel: visibleMessagePluginPanel,
                    isPluginFirstStep: true,
                    pluginId: id,
                });
            })
            .catch((err) => {
                this.showResponseErrorMessage(err);
            });
    }
    historyLog(recordId) {
        const viewId = this.realViewSelector(recordId);
        const recordIsZero = recordId === 0 || recordId === '0';
        const parentId = recordIsZero ? recordId : this.state.elementRecordId;
        const kindView = recordIsZero ? 'view' : this.state.kindView;
        recordId = recordIsZero ? UrlUtils.getRecordId() : recordId;
        let visibleHistoryLogPanel = false;
        this.crudService
            .getHistoryLogColumnsDefnitions(viewId, recordId, parentId, kindView)
            .then((res) => {
                let parsedHistoryLogViewData;
                if (res.info.kind === 'GRID') {
                    visibleHistoryLogPanel = true;
                    if (!this.historyLogStore) {
                        this.historyLogStore = new DataHistoryLogStore();
                    }
                    const datas = this.historyLogStore.getHistoryLogDataStore(
                        viewId,
                        recordId,
                        parentId,
                        kindView,
                        (err) => {
                            if (typeof this.showErrorMessage === 'undefined') {
                                this.props.showErrorMessage(err.error.message, 3000, true, err.error.code);
                            } else {
                                this.showErrorMessage(err.error.message, 3000, true, err.error.code);
                            }
                        },
                        () => {
                            this.setState({dataHistoryLogStoreSuccess: true});
                        }
                    );
                    parsedHistoryLogViewData = datas;
                }
                this.setState({
                    parsedHistoryLogView: res,
                    parsedHistoryLogViewData: parsedHistoryLogViewData,
                    visibleHistoryLogPanel: visibleHistoryLogPanel,
                });
            })
            .catch((err) => {
                this.showResponseErrorMessage(err);
            });
    }
    handleRightHeadPanelContent(element) {
        const elementId = `${element?.id}`;
        switch (element.type) {
            case OperationType.OP_PLUGINS:
            case OperationType.SK_PLUGIN:
                this.plugin(elementId);
                break;
            case OperationType.OP_ATTACHMENTS:
                this.attachment(elementId);
                break;
            case OperationType.OP_DOCUMENTS:
            case OperationType.SK_DOCUMENT:
                this.generate(elementId);
                break;
            case OperationType.OP_PUBLISH:
            case OperationType.SK_PUBLISH:
                this.publishEntry();
                break;
            case OperationType.OP_HISTORY:
            case OperationType.SK_HISTORY:
                this.historyLog(elementId);
                break;
            default:
                return null;
        }
    }
    getSelectedRowKeysIds(id) {
        return id === undefined || id === null || id === ''
            ? this.state.selectedRowKeys.map((e) => {
                  return e.ID === undefined ? e : e.ID;
              })
            : [id];
    }
    getParentValidNumber(gridView) {
        const recordId = UrlUtils.getRecordId();
        if (recordId === undefined || recordId === null) {
            // is global
            if (gridView.viewInfo) {
                return gridView.viewInfo.parentId;
            }
            // is dashboard?
            else {
                return this.props.id;
            }
        } else {
            // is header
            const elementId = UrlUtils.getIdFromUrl();
            if (elementId === this.props.id) {
                return UrlUtils.getRecordId();
            }
            // is grid in sub
            else {
                return this.props.recordId;
            }
        }
    }
    uploadAttachemnt(gridView, attachmentFile) {
        this.blockUi();
        const viewInfo = gridView.viewInfo;
        const viewId = viewInfo.id;
        let parentId = this.getParentValidNumber(gridView);
        const parentViewId = viewInfo.parentViewId;
        const isKindViewSpec = this.props.isKindViewSpec;
        this.crudService
            .uploadAttachemnt(viewId, parentId, parentViewId, attachmentFile, isKindViewSpec)
            .then((uploadResponse) => {
                EntryResponseHelper.run(
                    uploadResponse,
                    () => {
                        if (uploadResponse?.status === 'OK') {
                            this.crudService
                                .edit(viewId, uploadResponse.recordId, parentId, 'View')
                                .then((editDataResponse) => {
                                    const renderEditData = gridView.options.addFilesAddForm;
                                    if (renderEditData) {
                                        let attachmentFiles = this.state.attachmentFiles;
                                        attachmentFiles.shift();
                                        // editDataResponse.parentId = parentId;
                                        this.setState(
                                            {
                                                attachmentFiles: attachmentFiles,
                                                editData: editDataResponse,
                                            },
                                            () => {
                                                this.refreshView();
                                                this.handleShowEditPanel(editDataResponse);
                                            }
                                        );
                                    } else {
                                        this.unblockUi();
                                    }
                                })
                                .catch((err) => {
                                    this.showErrorMessages(err);
                                });
                        } else {
                            if (!!uploadResponse.error) {
                                this.showResponseErrorMessage(uploadResponse);
                            } else if (!!uploadResponse.message) {
                                this.showErrorMessage(
                                    uploadResponse.message.text,
                                    3000,
                                    true,
                                    uploadResponse.message.title
                                );
                            } else {
                                this.showErrorMessages(uploadResponse);
                            }
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi(),
                    () => this.unblockUi(),
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    downloadAttachment(id) {
        const viewId = this.getRealViewId();
        let recordId = this.getSelectedRowKeysIds(id);
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        this.crudService
            .downloadAttachment(viewId, recordId)
            .then(() => {
                const selectedRowKeys = this.state.selectedRowKeys.filter((el) => el.ID !== recordId);
                if (selectedRowKeys.length !== 0) {
                    this.downloadAttachment(selectedRowKeys[0].ID);
                } else {
                    this.unselectAllDataGrid();
                }
                this.setState({
                    selectedRowKeys,
                });
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    copyEntry(id, callBack) {
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeys = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .copyEntry(viewId, parentId, kindView, selectedRowKeys)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            const copyData = this.state.copyData;
                            let copyOptions = {copyOptions: copyData.copyOptions};
                            this.crudService
                                .copy(viewId, parentId, kindView, selectedRowKeys[0], copyOptions)
                                .then((copyResponse) => {    
                                    EditListUtils.addUuidToFields(copyResponse);
                                    const msg = copyResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!copyResponse.error) {
                                        this.showResponseErrorMessage(copyResponse);
                                    }
                                    this.setState(
                                        {
                                            visibleEditPanel: true,
                                            editData: copyResponse,
                                        },
                                        () => {
                                            if (callBack) {
                                                callBack(copyData);
                                            }
                                        }
                                    );
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                            this.setState({
                                currentSelectedRowKeyId: selectedRowKeys[0],
                            });
                            this.unblockUi();
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi(),  
                    () => this.unblockUi()  
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    restore(id) {
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .restoreEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .restore(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((restoreResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    const msg = restoreResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!restoreResponse.error) {
                                        this.showResponseErrorMessage(restoreResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    attachment(id, isAttachmentFromHeader) {
        this.blockUi();
        const viewId = isAttachmentFromHeader ? this.props.id : this.getRealViewId();
        let recordId = this.getSelectedRowKeysIds(id);
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        let parentIdParam = '';
        if (!isAttachmentFromHeader) {
            const recordId = UrlUtils.getRecordId();
            if (recordId !== undefined && recordId !== null) {
                parentIdParam = '?parentId=' + recordId;
            }
        }
        const isKindViewSpec = this.isKindViewSpec(recordId);
        if (recordId === '0' || recordId === 0) {
            recordId = this.state.elementRecordId;
        }
        this.handleAttachmentEntry(viewId, recordId, parentIdParam, isKindViewSpec);
    }
    handleAttachmentEntry(viewId, recordId, parentIdParam, isKindViewSpec) {
        this.crudService
            .attachmentEntry(viewId, recordId, parentIdParam)
            .then((attachmentResponse) => {
                EntryResponseHelper.run(
                    attachmentResponse,
                    () => {
                        if (!!attachmentResponse.next) {
                            this.unselectAllDataGrid();
                            this.setState({
                                attachmentViewInfo: {
                                    viewId,
                                    recordId,
                                    isKindViewSpec,
                                },
                            });
                        }
                        this.unblockUi();
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }
    isKindViewSpec(recordId) {
        return (
            this.state.elementKindView === 'ViewSpec' &&
            this.state.kindView === 'ViewSpec' &&
            recordId !== '0' &&
            recordId !== 0
        );
    }
    prepareCalculateFormula(rowId) {
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementParentId;
        let datas = [];
        if (this.state?.elementViewType?.toUpperCase() !== 'CARDVIEW') {
            if (!!this.getRefGridView()) {
                datas = this.getRefGridView()?.instance?.getDataSource()?._items;
            }
            if (!this.state.gridViewType) {
                datas = this.state.parsedData;
            }
        }
        const fieldsToCalculate = RequestUtils.createObjectToCalculate(datas.filter(data=>data._STATUS !== "deleted" ));
        this.calculateFormula(viewId, parentId, rowId, fieldsToCalculate);
    }
    // TODO:  tutaj powinien byc jakis refactoring
    calculateFormula(viewId, parentId, rowId, fieldsToCalculate) {
        const selectedRowKeys = this.state.selectedRowKeys;
        if (UrlUtils.isEditSpec()) {
            this.calculateFormulaForEditSpec(viewId, parentId, rowId, fieldsToCalculate);
        } else if (UrlUtils.isBatch()) {
            this.calculateFormulaForBatch(viewId, parentId, rowId, fieldsToCalculate);
        } else if (this.state.elementKindView && this.state.elementKindView.toUpperCase() === 'VIEWSPEC') {
            parentId = UrlUtils.getRecordId();
            let params = '';
            if (!!rowId) {
                params = `&specId=${rowId}`;
            } else {
                if (selectedRowKeys.length !== 0) {
                    selectedRowKeys.forEach((rowKey) => {
                        params = params + `&specId=${rowKey.ID}`;
                    });
                }
            }
            this.calculateFormulaForView(viewId, parentId, params);
        } else {
            let params = '';
            if (!!rowId) {
                params = `?recordId=${rowId}`;
            } else {
                if (selectedRowKeys.length !== 0) {
                    selectedRowKeys.forEach((rowKey, index) => {
                        params = index === 0 ? params + `?recordId=${rowKey.ID}` : params + `&recordId=${rowKey.ID}`;
                    });
                }
            }
            this.calculateFormulaForView(viewId, parentId, params);
        }
    }
    changeWart(calcultedFormula, oldFormula) {
        if (parseInt(calcultedFormula[0].value) === parseInt(oldFormula.ID)) {
            oldFormula.WART = calcultedFormula[1].value;
        }
    }
    calculateFormulaForEditSpec(viewId, parentId, id, fieldsToCalculate) {
        this.crudService
            .calculateFormula(viewId, parentId, id, fieldsToCalculate)
            .then((res) => {
                res?.data?.forEach((calcultedFormula) => {
                    this.state?.parsedData.forEach((item) => {
                        this.changeWart(calcultedFormula, item);
                    });
                });
                this.responseMessage(res);
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unselectAllDataGrid();
            });
    }
    calculateFormulaForBatch(viewId, batchId, id, fieldsToCalculate) {
        this.crudService
            .calculateFormula(viewId, batchId, id, fieldsToCalculate)
            .then((res) => {
                this.responseMessage(res);
                this.refreshView();
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unselectAllDataGrid();
            });
    }
    calculateFormulaForView(viewId, recordId, params) {
        this.blockUi();
        this.crudService
            .calculateFormulaForView(viewId, recordId, params)
            .then((res) => {
                this.responseMessage(res);
                this.refreshView();
                this.refreshSubView(true);
            })
            .finally(() => {
                this.unblockUi();
                this.unselectAllDataGrid();
            });
    }
    responseMessage(res) {
        const msg = res.message;
        if (!!msg) {
            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
        } else if (!!res.error) {
            this.showResponseErrorMessage(res);
        }
    }
    archive(id) {
        ConsoleHelper('handleArchive');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .archiveEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .archive(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((archiveResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    const msg = archiveResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!archiveResponse.error) {
                                        this.showResponseErrorMessage(archiveResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    publish(id, body) {
        ConsoleHelper('publish');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        const publishOptions = {publishOptions: body};
        this.crudService
            .publish(viewId, parentId, kindView, selectedRowKeysIds, publishOptions)
            .then((publishResponse) => {
                let visiblePublishSummaryDialog = false;
                const msg = publishResponse.message;
                if (!!msg) {
                    this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                } else if (!!publishResponse.error) {
                    this.showResponseErrorMessage(publishResponse);
                }
                if (id && this.state.selectedRowKeys.length === 0) {
                    visiblePublishSummaryDialog = true;
                    this.refreshView();
                    this.unselectAllDataGrid();
                } else {
                    const currentSelectedRowKeyId = this.state.currentSelectedRowKeyId;
                    let selectedRowKeys = this.state.selectedRowKeys.filter((el) => el.ID !== currentSelectedRowKeyId);
                    this.setState({selectedRowKeys: selectedRowKeys});
                    if (selectedRowKeys.length === 0) {
                        visiblePublishSummaryDialog = true;
                        this.refreshView();
                        this.unselectAllDataGrid();
                    } else {
                        this.publishEntry(selectedRowKeys[0].ID);
                    }
                }
                let publishSummary = this.state.publishSummary;
                publishSummary.publishedIds.push(selectedRowKeysIds[0]);
                this.setState({
                    publishSummary,
                    visiblePublishSummaryDialog,
                });
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    publishEntry(id) {
        ConsoleHelper('publishEntry');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .publishEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            let isInitializePublish = this.state?.isInitializePublish;
                            if (this.state?.isInitializePublish === undefined) {
                                isInitializePublish = true;
                            }
                            if (this.state?.isInitializePublish) {
                                isInitializePublish = false;
                            }
                            if (isInitializePublish && id) {
                                this.unselectAllDataGrid();
                            }
                            if (entryResponse.publishOptions === null) {
                                this.publish(id, null);
                            } else {
                                this.setState({
                                    publishValues: entryResponse.publishValues,
                                    visiblePublishDialog: true,
                                    currentSelectedRowKeyId: id,
                                    isInitializePublish: isInitializePublish,
                                });
                                if (id && this.state.selectedRowKeys.length === 0) {
                                    this.unselectAllDataGrid();
                                }
                            }
                            if (id === undefined) {
                                this.setState({
                                    currentSelectedRowKeyId: selectedRowKeysIds[0],
                                });
                            }
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi(),
                    () => this.unblockUi(),
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    unselectAllDataGrid() {
        this.refTreeList?.instance.deselectAll();
        this.setState({
            selectAll: false,
            select: false,
            selectedRowKeys: [],
        });
        this.unblockUi();
    }

    handleEditListRowChange(editInfo, editListData) {
        ConsoleHelper(`handleEditListRowChange = `, JSON.stringify(editListData));
        try {
            this.blockUi();
            const editData = UrlUtils.isEditRowView() ? this.props.editData : this.state.editData;
            editListData.forEach((element) => {
                EditRowUtils.searchAndAutoFill(editData, element.fieldEdit, element.fieldValue);
            });
            this.setEditData(editData);
            if (editInfo?.field?.refreshFieldVisibility) {
                this.refreshFieldVisibility(editInfo);
            }
        } catch (err) {
            this.showErrorMessages(err);
        } finally {
            this.unblockUi();
        }
    }

    handleAutoFillRowChange(viewId, recordId, parentId, kindView) {
        this.blockUi();
        const autofillBodyRequest = RequestUtils.createObjectDataToRequest(
            UrlUtils.isEditRowView() ? this.props : this.state
        );
        this.crudService
            .editAutoFill(viewId, recordId, parentId, kindView, autofillBodyRequest)
            .then((editAutoFillResponse) => {
                const arrayTmp = editAutoFillResponse?.data;
                const editData = UrlUtils.isEditRowView() ? this.props.editData : this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndAutoFill(editData, element.fieldName, element.value);
                });
                this.setEditData(editData);
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    handleCancelRowChange(viewId, recordId, parentId) {
        ConsoleHelper(`handleCancelRowChange: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`);
        const cancelElement = RequestUtils.createObjectDataToRequest(
            UrlUtils.isEditRowView() ? this.props : this.state
        );
        ConsoleHelper(`handleCancelRowChange: element to cancel = ${JSON.stringify(cancelElement)}`);
        this.rowCancel(viewId, recordId, parentId, cancelElement, false);
    }

    /** Dla gantta ID_PARENT nie moze byc '' */
    replaceEmptyValuesFromParent(editData) {
        editData.editFields?.filter((editField) => {
            return editField?.panels?.filter((panel) => {
                return panel?.groups?.filter((group) => {
                    return group?.fields?.filter((field) => {
                        if (field.fieldName === 'ID_PARENT') {
                            field.value = field.value === '' ? null : field.value;
                        }
                        return field;
                    });
                });
            });
        });
    }

    handleChangeCriteria(inputType, event) {
        ConsoleHelper(`handleChangeCriteria inputType=${inputType}`);
        const documentInfo = this.state.documentInfo;
        if (event) {
            const result = this.setVariableFromEvent(inputType, event);
            const varName = result.varName;
            const varValue = result.varValue;
            const fieldArr = documentInfo.inputDataFields.find(
                (field) => field.fieldName.toUpperCase() === varName.toUpperCase()
            );
            fieldArr.value = varValue;

            this.setState({documentdInfo: documentInfo, modifyEditData: true});
        }
    }
    handleEditRowChange(inputType, event, groupUuid, info) {
        ConsoleHelper(`handleEditRowChange inputType=${inputType} groupUuid=${groupUuid}`);
        const editData = UrlUtils.isEditRowView() ? this.props.editData : this.state.editData;
        const groupData = [];
        outerLoop: for (let editField of editData?.editFields) {
            for (let panel of editField.panels) {
                for (let group of panel.groups) {
                    if (group.uuid === groupUuid) {
                        groupData.push(group);
                        break outerLoop;
                    }
                }
            }
        }
        if (event !== undefined) {
            const result = this.setVariableFromEvent(inputType, event);
            const varName = result.varName;
            const varValue = result.varValue;
            const refreshFieldVisibility = result.refreshFieldVisibility;
            const fieldArr = groupData[0]?.fields?.filter((obj) => {
                return obj.fieldName === varName;
            });
            const field = fieldArr[0];
            if (!!fieldArr && !!field) {
                field.value = varValue;
            }
            if (!!field && refreshFieldVisibility) {
                this.refreshFieldVisibility(info);
            }
            if (this.isGanttView()) {
                this.replaceEmptyValuesFromParent(editData);
            }
            this.setEditData(editData);
        } else {
            ConsoleHelper('handleEditRowChange implementation error');
        }
    }
    setEditData(editData) {
        if (UrlUtils.isEditRowView()) {
            this.props.editDataChange(editData);
        } else {
            this.setState({editData: editData, modifyEditData: true});
        }
    }
    setVariableFromEvent(inputType, event) {
        let varName;
        let varValue;
        let refreshFieldVisibility = false;
        switch (inputType) {
            case InputType.IMAGE64:
                varName = event == null ? null : event.fieldName;
                varValue = event == null ? '' : event.base64[0];
                break;
            case InputType.MULTI_IMAGE64:
                varName = event == null ? null : event.fieldName;
                varValue = event == null ? '' : event.base64;
                break;
            case InputType.CHECKBOX:
                varName = event.target.name;
                varValue = event.checked ? event.checked : false;
                refreshFieldVisibility = event.refreshFieldVisibility;
                break;
            case InputType.EDITOR:
                varName = event.name;
                varValue = event.value || event.value === '' ? event.value : undefined;
                break;
            case InputType.TEXT:
            case InputType.AREA:
                varName = event.target?.name;
                varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                break;
            case InputType.DATE:
            case InputType.DATETIME:
            case InputType.TIME:
                varName = event.target?.name;
                varValue = event.value || event.value === '' ? event.value : undefined;
                break;
            default:
                varName = event.target?.name;
                varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                break;
        }
        if (varValue === '') {
            varValue = null;
        }
        return {
            varName: varName,
            varValue: varValue,
            refreshFieldVisibility: refreshFieldVisibility,
        };
    }
    realViewSelector(recordId) {
        if (this.isViewSpecHeader(recordId) || this.isViewSpecBody(recordId)) {
            return this.getRealViewId();
        }
        if (this.isGridViewHeader(recordId)) {
            return this.props.id;
        }
        if (this.isGridViewBody(recordId)) {
            return this.getRealViewId();
        }
        if (this.getRealViewId() === undefined) {
            return UrlUtils.getViewIdFromURL();
        }
        return this.getRealViewId();
    }

    handleEditRowBlur(inputType, event, groupName, viewInfo, field) {
        ConsoleHelper(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        this.handleEditRowChange(inputType, event, groupName, viewInfo, field);
    }

    renderFields(editData) {
        return editData?.editFields
            .flatMap((editField) => editField.panels)
            .flatMap((panel) => panel.groups)
            .map((group, index) => {
                const hiddenElements = group.fields.filter((field) => field.hidden);
                if (hiddenElements.length === group.fields.length) {
                    return null;
                }
                return this.renderGroup(group, index);
            });
    }

    // to overide
    renderGroup(group, index) {}

    refreshFieldVisibility(info) {
        this.blockUi();
        const isEditRowView = UrlUtils.isEditRowView();
        const refreshObject = RequestUtils.createObjectDataToRequest(isEditRowView ? this.props : this.state);
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        this.crudService
            .refreshFieldVisibility(info.viewId, info.recordId, info.parentId, kindView, refreshObject)
            .then((editRefreshResponse) => {
                const arrayTmp = editRefreshResponse?.data;
                const editData = isEditRowView ? this.props.editData : this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndRefreshVisibility(editData, element.fieldName, element.hidden);
                });
                if (isEditRowView) {
                    this.props.editDataChange(editData);
                } else {
                    this.setState({editData: editData});
                }
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    }

    handleShowEditPanel(editDataResponse) {
        this.setState({
            visibleEditPanel: true,
            modifyEditData: false,
            editData: editDataResponse,
        });
        this.unblockUi();
    }
    replaceOperationsLabels(operations, labels) {
        for (let index = 0; index < operations.length; index++) {
            const operation = operations[index];
            operation.label = LocUtils.loc(labels, operation.type, operation.label);
        }
    }

    getRefGridView() {
        return !!this.refDataGrid ? this.refDataGrid : null;
    }
    getRefGanttView() {
        return !!this.ganttRef ? this.ganttRef : null;
    }

    getRefCardGrid() {
        return !!this.refCardGrid ? this.refCardGrid : null;
    }

    getRealViewId() {
        const {elementSubViewId} = this.state;
        const elementId = this.props.id;
        return DataGridUtils.getRealViewId(elementSubViewId, elementId);
    }

    isGridView() {
        return this.state.gridViewType === 'gridView';
    }

    isGanttView() {
        return this.state.gridViewType === 'gantt';
    }

    isTreeView() {
        return this.state.gridViewType === 'gridView' && this.state.kindView === 'ViewSpec';
    }

    isCardView() {
        return this.state.gridViewType === 'cardView';
    }

    isDashboard() {
        return this.state.gridViewType === 'dashboard';
    }

    isHeader(recordId) {
        return recordId === '0' || recordId === 0;
    }
    isBody(recordId) {
        return !(recordId === '0' || recordId === 0);
    }
    isChoosenKindView(kindViewSelected) {
        return this.state.kindView === kindViewSelected && this.state.elementKindView === kindViewSelected;
    }
    isViewSpecHeader(recordId) {
        return this.isHeader(recordId) && this.isChoosenKindView('ViewSpec');
    }
    isViewSpecBody(recordId) {
        return this.isBody(recordId) && this.isChoosenKindView('ViewSpec');
    }
    isGridViewHeader(recordId) {
        return this.isHeader(recordId) && this.isChoosenKindView('View');
    }
    isGridViewBody(recordId) {
        return this.isBody(recordId) && this.isChoosenKindView('View');
    }
    returnFromRowEdit() {
        window.location.href = UrlUtils.getUrlWithoutEditRowParams().replace('edit-row-view', 'grid-view');
    }
}

BaseContainer.defaultProps = {
    viewMode: 'VIEW',
};

BaseContainer.propTypes = {
    viewMode: PropTypes.string,
};

export default BaseContainer;

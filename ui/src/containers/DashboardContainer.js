import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import {Toast} from "primereact/toast";
import DashboardService from "../services/DashboardService";
import ViewService from "../services/ViewService";
import DataGridStore from "./dao/DataGridStore";
import {GridViewContainer} from "./GridViewContainer";
import CardViewComponent from "./cardView/CardViewComponent";
import {Breadcrumb} from "../utils/BreadcrumbUtils";
import EditRowComponent from "../components/prolab/EditRowComponent";
import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";
import PropTypes from "prop-types";
import ShortcutButton from "../components/prolab/ShortcutButton";
import AppPrefixUtils from "../utils/AppPrefixUtils";
import UrlUtils from "../utils/UrlUtils";
import EditService from "../services/EditService";

class DashboardContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.viewService = new ViewService();
        this.dashboardService = new DashboardService();
        this.dataGridStore = new DataGridStore();
        this.editService = new EditService();
        this.state = {
            loading: true,
            cardView: []
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.props.handleRenderNoRefreshContent(false);
        if (!!this.props.dashboard) {
            this.setState({
                dashboard: this.props.dashboard,
                loading: false
            }, () => {
                this.prepareCardView();
                this.unblockUi();
            });
            this.unblockUi();
        } else {
            this.dashboardService
                .getDashboard()
                .then((response) => {
                    this.setState({
                        dashboard: response,
                        loading: false
                    }, () => {
                        this.prepareCardView();
                        this.unblockUi();
                    });
                }).catch((err) => {
                if (!!err.error) {
                    this.showResponseErrorMessage(err);
                } else {
                    this.showErrorMessages(err);
                }
            });
        }
    }

    prepareCardView() {
        try {
            const cardOptions = this.state.dashboard.headerOptions;
            cardOptions.width = cardOptions?.width;
            cardOptions.height = cardOptions?.height;
            const cardView = {
                viewInfo: this.state.dashboard.viewInfo,
                cardOptions: cardOptions,
                cardHeader: this.state.dashboard.headerFields.cardHeader,
                cardImage: this.state.dashboard.headerFields.cardImage,
                cardBody: this.state.dashboard.headerFields.cardBody,
                cardFooter: this.state.dashboard.headerFields.cardFooter,
                operations: this.state.dashboard.headerOperations,
                shortcutButtons: [],
                documentsList: [],
                pluginsList: [],
                batchesList: [],
                filtersList: []
            }
            this.setState({cardView: cardView})
        } catch (e) {
            return null;
        }
    }

    render() {
        const {labels} = this.props;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => this.messages = el}/>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <DivContainer colClass='col-12 dashboard-link-container'>
                        {!!this.props.dashboard ? null : Breadcrumb.render(labels)}
                        <DivContainer colClass='dashboard'>
                            {this.state.loading === false ? (
                                    <React.Fragment>
                                        {this.renderGlobalTop()}
                                        {this.renderContent()}
                                    </React.Fragment>)
                                : null}
                        </DivContainer>
                    </DivContainer>
                </BlockUi>
            </React.Fragment>
        );
    }

    renderGlobalTop() {
        return (
            <React.Fragment>
                <EditRowComponent
                    visibleEditPanel={this.state.visibleEditPanel}
                    editData={this.state.editData}
                    onChange={this.handleEditRowChange}
                    onBlur={this.handleEditRowBlur}
                    onSave={this.handleEditRowSave}
                    onAutoFill={this.handleAutoFillRowChange}
                    onCancel={this.handleCancelRowChange}
                    validator={this.validator}
                    onHide={(e) => !!this.state.modifyEditData ? confirmDialog({
                        message: 'Czy na pewno chcesz zamknąć edycję?',
                        header: 'Potwierdzenie',
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: localeOptions('accept'),
                        rejectLabel: localeOptions('reject'),
                        accept: () => this.setState({visibleEditPanel: e}),
                        reject: () => undefined,
                    }) : this.setState({visibleEditPanel: e})}
                    onError={(e) => this.showErrorMessage(e)}
                />
            </React.Fragment>)
    }

    renderHeaderLeft() {
        return <React.Fragment>
            <div className='font-medium mb-4'>{this.getViewInfoName()}</div>
        </React.Fragment>;
    }

    renderContent() {
        const recordId = UrlUtils.getURLParameter('recordId');
        const cardId = this.state.dashboard?.headerData ? this.state.dashboard?.headerData[0]?.ID : null;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return <React.Fragment>
            <div className="rows">
                <div className="column left" style={{width: this.state.cardView.cardOptions?.width + 10}}>
                    <CardViewComponent
                        id={this.state.cardView.viewInfo?.id}
                        mode='dashboard'
                            handleOnInitialized={(ref) => this.cardGrid = ref}
                            parsedGridView={this.state.cardView}
                            parsedCardViewData={this.state.dashboard.headerData}
                            handleShowEditPanel={(editDataResponse) => {
                            this.handleShowEditPanel(editDataResponse)
                        }}
                            handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                    />
                    {this.state.dashboard?.views?.filter(item => item.position === 'left').map((item) => {
                        return this.renderGridView(item, cardId, currentBreadcrumb, this.state.cardView.cardOptions?.height, recordId);
                    })}
                </div>
                <div className="column right">
                    {this.state.dashboard?.views?.filter(item => item.position === 'right').map((item) => {
                        return this.renderGridView(item, cardId, currentBreadcrumb, this.state.cardView.cardOptions?.height, recordId);
                    })}
                </div>
            </div>
        </React.Fragment>;
    }

    renderGridView(item, cardViewId, currentBreadcrumb, _cardHeight, recordId) {
        return (<div className='panel-dashboard'>
                                   <span
                                       className='title-dashboard'>{item.label}</span>
            <div style={{float: 'right'}}>
                <ShortcutButton
                    id={`_menu_button`}
                    className={`action-button-with-menu`}
                    iconName={'mdi-magnify'}
                    href={AppPrefixUtils.locationHrefUrl(
                        `/#/grid-view/${item.id}?parentId=${cardViewId}${currentBreadcrumb}`
                    )}
                    label={''}
                    title={'Przenieś do'}
                    rendered={true}
                />
            </div>
            <GridViewContainer id={item.id}
                               key={item.id}
                               subViewId={undefined}
                               recordId={recordId}
                               filterId={undefined}
                               viewType={'dashboard'}
                               showColumnLines={false}
                               showRowLines={true}
                               showBorders={false}
                               showColumnHeaders={false}
                               showFilterRow={false}
                               showSelection={false}
                               handleBlockUi={() => {
                                   this.blockUi();
                                   return true;
                               }}
                               handleUnBlockUi={() => {
                                   this.unblockUi();
                                   return true;
                               }}
                               handleShowErrorMessages={(err) => {
                                   this.showErrorMessages(err);
                                   return true;
                               }}
                               dataGridHeight={_cardHeight - 60}
            >
            </GridViewContainer>
        </div>);
    }

    renderDetails() {
        return (
            <React.Fragment>
            </React.Fragment>
        );
    }
}

DashboardContainer.defaultProps = {}
DashboardContainer.propTypes = {dashboard: PropTypes.object, handleRenderNoRefreshContent: PropTypes.bool.isRequired,}

export default DashboardContainer;

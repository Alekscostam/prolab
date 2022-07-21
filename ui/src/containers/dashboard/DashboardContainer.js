import React from 'react';
import BaseContainer from '../../baseContainers/BaseContainer';
import DivContainer from '../../components/DivContainer';
import BlockUi from '../../components/waitPanel/BlockUi';
import {Toast} from "primereact/toast";
import DashboardService from "../../services/DashboardService";
import ViewService from "../../services/ViewService";
import DataGridStore from "../dao/DataGridStore";
import {DashboardGridViewComponent} from "./DashboardGridViewComponent";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import EditRowComponent from "../../components/prolab/EditRowComponent";
import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";
import PropTypes from "prop-types";
import ShortcutButton from "../../components/prolab/ShortcutButton";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import UrlUtils from "../../utils/UrlUtils";
import LocUtils from "../../utils/LocUtils";
import DashboardCardViewComponent from "./DashboardCardViewComponent";
import CrudService from "../../services/CrudService";

class DashboardContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.viewService = new ViewService();
        this.dashboardService = new DashboardService();
        this.dataGridStore = new DataGridStore();
        this.crudService = new CrudService();
        this.messages = React.createRef();
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
            this.initializeDashboard();
        }
    }

    initializeDashboard = () => {
        this.dashboardService
            .getDashboard()
            .then((response) => {
                this.setState({
                    dashboard: response,
                    loading: false
                }, () => {
                    this.prepareCardView();
                    this.forceUpdate();
                    this.unblockUi();
                });
            }).catch((err) => {
            if (!!err.error) {
                this.showResponseErrorMessage(err);
            } else {
                this.showErrorMessages(err);
            }
        }).finally(() => {
            this.setState({
                loading: false
            });
        });
    }

    prepareCardView = () => {
        try {
            const cardOptions = this.state.dashboard.headerOptions;
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
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}
                         renderBlockUi={true}>
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
                    onHide={(e, viewId, recordId, parentId) => !!this.state.modifyEditData ? confirmDialog({
                        appendTo: document.body,
                        message: LocUtils.loc(this.props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
                        header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                        icon: 'pi pi-exclamation-triangle',
                        acceptLabel: localeOptions('accept'),
                        rejectLabel: localeOptions('reject'),
                        accept: () => {
                            this.handleCancelRowChange(viewId, recordId, parentId);
                            this.setState({visibleEditPanel: e});
                        },
                        reject: () => undefined,
                    }) : this.setState({visibleEditPanel: e}, () => {
                        this.handleCancelRowChange(viewId, recordId, parentId);
                    })}
                    onError={(e) => this.showErrorMessage(e)}
                    labels={this.props.labels}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                />
            </React.Fragment>)
    }

    renderHeaderLeft() {
        return <React.Fragment>
            <div className='font-medium mb-4'>{this.getViewInfoName()}</div>
        </React.Fragment>;
    }

    //override
    refreshView() {
        if(!(UrlUtils.getURLParameter('recordId'))){
            this.initializeDashboard();
        }
    }

    renderContent() {
        const recordId = UrlUtils.getURLParameter('recordId');
        const cardId = this.state.dashboard?.headerData ? this.state.dashboard?.headerData[0]?.ID : null;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return <React.Fragment>
            <div className="rows">
                <div className="column left" style={{width: this.state.cardView.cardOptions?.width + 10}}>
                    <DashboardCardViewComponent
                        id={this.state.cardView.viewInfo?.id}
                        mode='dashboard'
                        handleOnInitialized={(ref) => this.cardGrid = ref}
                        parsedGridView={this.state.cardView}
                        parsedCardViewData={this.state.dashboard?.headerData}
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
            <span className='title-dashboard'>{item.label}</span>
            <div style={{float: 'right'}}>
                <ShortcutButton
                    id={`_menu_button`}
                    className={`action-button-with-menu`}
                    iconName={'mdi-open-in-new'}
                    href={AppPrefixUtils.locationHrefUrl(
                        `/#/grid-view/${item.id}?parentId=${cardViewId}${currentBreadcrumb}`
                    )}
                    label={''}
                    title={LocUtils.loc(this.props.labels, 'Move_To', 'Przenieś do')}
                    rendered={true}
                    buttonShadow={false}
                />
            </div>
            <DashboardGridViewComponent id={item.id}
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
                                        labels={this.props.labels}
            />
        </div>);
    }

    getMessages(){
        return this.messages;
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

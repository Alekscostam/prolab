import React from 'react';
import BaseContainer from '../../baseContainers/BaseContainer';
import DivContainer from '../../components/DivContainer';
import BlockUi from '../../components/waitPanel/BlockUi';
import {Toast} from 'primereact/toast';
import DashboardService from '../../services/DashboardService';
import ViewService from '../../services/ViewService';
import DataGridStore from '../dao/DataGridStore';
import {DashboardGridViewComponent} from './DashboardGridViewComponent';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import EditRowComponent from '../../components/prolab/EditRowComponent';
import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import PropTypes from 'prop-types';
import ShortcutButton from '../../components/prolab/ShortcutButton';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import UrlUtils from '../../utils/UrlUtils';
import LocUtils from '../../utils/LocUtils';
import DashboardCardViewComponent from './DashboardCardViewComponent';
import CrudService from '../../services/CrudService';
import EntryResponseUtils from '../../utils/EntryResponseUtils';
import HistoryLogDialogComponent from '../../components/prolab/HistoryLogDialogComponent';
import {AttachmentViewDialog} from '../attachmentView/AttachmentViewDialog';
import {OperationType} from '../../model/OperationType';
import ReactDOM from 'react-dom';

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
            copyData: null,
            cardView: undefined,
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.props.handleRenderNoRefreshContent(false);
        if (!!this.props.dashboard) {
            this.restateDashboard();
        } else {
            this.initializeDashboard();
        }
    }

    refreshDashboard(savedElement) {
        if (savedElement) {
            this.downloadDashboardData();
            return;
        }
        this.restateDashboard();
    }

    restateDashboard() {
        this.blockUi();
        this.setState(
            {
                dashboard: this.props.dashboard,
                loading: false,
            },
            () => {
                this.prepareCardView();
                this.unblockUi();
            }
        );
    }

    downloadDashboardData = () => {
        UrlUtils.isStartPage() ? this.initializeDashboard() : this.getSubViewEntry();
    };

    getSubViewEntry() {
        const {dashboard} = this.props;
        const id = dashboard?.viewInfo?.id;
        const recordId = UrlUtils.getRecordId();
        const parentId = UrlUtils.getParentId();
        if (id) {
            this.viewService
                .subViewEntry(id, recordId, parentId)
                .then((entryResponse) => {
                    EntryResponseUtils.run(
                        entryResponse,
                        () => {
                            if (!!entryResponse.next) {
                                this.viewService
                                    .getSubView(id, recordId, parentId)
                                    .then((subViewResponse) => {
                                        if (subViewResponse.viewInfo?.type === 'dashboard') {
                                            this.setState(
                                                {
                                                    dashboard: subViewResponse,
                                                    loading: false,
                                                },
                                                () => {
                                                    this.prepareCardView();
                                                    this.unblockUi();
                                                }
                                            );
                                        }
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
    }

    initializeDashboard = () => {
        this.dashboardService
            .getDashboard()
            .then((response) => {
                this.setState(
                    {
                        dashboard: response,
                        loading: false,
                    },
                    () => {
                        this.prepareCardView();
                        this.forceUpdate();
                        this.unblockUi();
                    }
                );
            })
            .catch((err) => {
                if (!!err.error) {
                    this.showResponseErrorMessage(err);
                } else {
                    this.showErrorMessages(err);
                }
            })
            .finally(() => {
                this.setState({
                    loading: false,
                });
            });
    };

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
                filtersList: [],
            };
            this.setState({cardView: cardView});
        } catch (e) {
            return null;
        }
    };

    render() {
        const {labels} = this.props;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <BlockUi
                    tag='div'
                    blocking={this.state.blocking || this.state.loading}
                    loader={this.loader}
                    renderBlockUi={true}
                >
                    <DivContainer colClass='col-12 dashboard-link-container'>
                        {!!this.props.dashboard ? null : Breadcrumb.render(labels)}
                        <DivContainer colClass='dashboard'>
                            {this.state.loading === false ? (
                                <React.Fragment>
                                    {this.renderGlobalTop()}
                                    {this.renderContent()}
                                </React.Fragment>
                            ) : null}
                        </DivContainer>
                    </DivContainer>
                </BlockUi>
            </React.Fragment>
        );
    }

    renderGlobalTop() {
        return (
            <React.Fragment>
                {this.state.visibleEditPanel && (
                    <EditRowComponent
                        visibleEditPanel={this.state.visibleEditPanel}
                        editData={this.state.editData}
                        onChange={this.handleEditRowChange}
                        onBlur={this.handleEditRowBlur}
                        onSave={this.handleEditRowSave}
                        onEditList={this.handleEditListRowChange}
                        onAutoFill={this.handleAutoFillRowChange}
                        onCancel={this.handleCancelRowChange}
                        copyData={this.state?.copyData}
                        validator={this.validator}
                        onCloseCustom={() => {
                            this.setState({
                                visibleEditPanel: false,
                            });
                        }}
                        onHide={(e, viewId, recordId, parentId) => {
                            if (!!this.state.modifyEditData) {
                                const confirmDialogWrapper = document.createElement('div');
                                document.body.appendChild(confirmDialogWrapper);
                                ReactDOM.render(
                                    <ConfirmDialog
                                        visible={true}
                                        closable={false}
                                        message={LocUtils.loc(
                                            this.props.labels,
                                            'Question_Close_Edit',
                                            'Czy na pewno chcesz zamknąć edycję?'
                                        )}
                                        header={LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie')}
                                        icon={'pi pi-exclamation-triangle'}
                                        acceptLabel={localeOptions('accept')}
                                        rejectLabel={localeOptions('reject')}
                                        accept={() => {
                                            this.handleCancelRowChange(viewId, recordId, parentId);
                                            this.setState({visibleEditPanel: e});
                                            document.body.removeChild(confirmDialogWrapper);
                                        }}
                                        reject={() => {
                                            document.body.removeChild(confirmDialogWrapper);
                                        }}
                                    />,
                                    confirmDialogWrapper
                                );
                            } else {
                                this.setState({visibleEditPanel: e}, () => {
                                    this.handleCancelRowChange(viewId, recordId, parentId);
                                });
                            }
                        }}
                        onError={(e) => this.showErrorMessage(e)}
                        labels={this.props.labels}
                        showErrorMessages={(err) => this.showErrorMessages(err)}
                    />
                )}

                {this.state.visibleHistoryLogPanel ? (
                    <HistoryLogDialogComponent
                        visible={this.state.visibleHistoryLogPanel}
                        field={this.state.editListField}
                        parsedHistoryLogView={this.state.parsedHistoryLogView}
                        parsedHistoryLogViewData={this.state.parsedHistoryLogViewData}
                        onHide={() => this.setState({visibleHistoryLogPanel: false})}
                        handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                        unselectAllDataGrid={() => {
                            this.setState({
                                selectedRowKeys: [],
                            });
                        }}
                        historyLogId={this.state.historyLogId}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleUnblockUi={() => this.unblockUi}
                        showErrorMessages={(err) => this.showErrorMessages(err)}
                        dataGridStoreSuccess={this.state.dataHistoryLogStoreSuccess}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        labels={this.props.labels}
                    />
                ) : null}
                {this.state.attachmentViewInfo ? (
                    <AttachmentViewDialog
                        ref={this.viewContainer}
                        recordId={this.state.attachmentViewInfo.recordId}
                        id={this.state.attachmentViewInfo.viewId}
                        handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                            this.setState({renderNoRefreshContent: renderNoRefreshContent});
                        }}
                        prevDataGridGlobalReference={this.state.prevDataGridGlobalReference}
                        setPrevDataGridGlobalReference={() => {
                            this.setState({
                                prevDataGridGlobalReference: window.dataGrid,
                                isAttachement: true,
                            });
                        }}
                        handleBackToOldGlobalReference={() => {
                            const prevDataGridGlobalReference = this.state.prevDataGridGlobalReference;
                            window.dataGrid = prevDataGridGlobalReference;
                            this.setState({
                                isAttachement: false,
                            });
                        }}
                        handleShowGlobalErrorMessage={(err) => {
                            this.setState({
                                attachmentViewInfo: undefined,
                            });
                            this.showGlobalErrorMessage(err);
                        }}
                        handleShowErrorMessages={(err) => {
                            this.showErrorMessage(err);
                        }}
                        handleShowEditPanel={(editDataResponse) => {
                            this.handleShowEditPanel(editDataResponse);
                        }}
                        onHide={() => {
                            this.setState({
                                attachmentViewInfo: undefined,
                            });
                        }}
                        handleViewInfoName={(viewInfoName) => {
                            this.setState({viewInfoName: viewInfoName});
                        }}
                        handleSubView={(subView) => {
                            this.setState({subView: subView});
                        }}
                        handleOperations={(operations) => {
                            this.setState({operations: operations});
                        }}
                        handleShortcutButtons={(shortcutButtons) => {
                            this.setState({shortcutButtons: shortcutButtons});
                        }}
                        collapsed={this.state.collapsed}
                    />
                ) : null}
            </React.Fragment>
        );
    }

    renderHeaderLeft() {
        return (
            <React.Fragment>
                <div className='font-medium mb-4'>{this.getViewInfoName()}</div>
            </React.Fragment>
        );
    }

    //override
    refreshView(saveElement) {
        this.refreshDashboard(saveElement);
    }

    handleOperation = (operation) => {
        switch (operation.type) {
            case OperationType.OP_ATTACHMENTS:
                this.handleAttachmentEntry(
                    UrlUtils.getViewIdFromURL(),
                    UrlUtils.getRecordId(),
                    '?parentId=' + operation.id,
                    false
                );
                break;
            case OperationType.OP_HISTORY:
            case OperationType.SK_HISTORY:
                this.historyLog(operation.id);
                break;
            default:
                return null;
        }
    };

    renderContent() {
        const recordId = UrlUtils.getRecordId();
        const cardId = this.state.dashboard?.headerData ? this.state.dashboard?.headerData[0]?.ID : null;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const width = this.state.cardView?.cardOptions?.width;
        const widthStyle = width ? {width: width + 10} : {};
        return (
            <React.Fragment>
                {this.state.cardView && (
                    <div className='rows'>
                        <div className='column left' style={widthStyle}>
                            <DashboardCardViewComponent
                                id={this.state.cardView.viewInfo?.id}
                                mode='dashboard'
                                handleOnInitialized={(ref) => (this.cardGrid = ref)}
                                parsedGridView={this.state.cardView}
                                parsedCardViewData={this.state.dashboard?.headerData}
                                handleShowEditPanel={(editDataResponse) => {
                                    this.handleShowEditPanel(editDataResponse);
                                }}
                                handleOperation={(operation) => {
                                    this.handleOperation(operation);
                                }}
                                handleBlockUi={() => {
                                    this.blockUi();
                                    return true;
                                }}
                                showErrorMessages={(err) => this.showErrorMessages(err)}
                            />
                            {this.state.dashboard?.views
                                ?.filter((item) => item.position === 'left')
                                .map((item) => {
                                    return this.renderGridView(
                                        item,
                                        cardId,
                                        currentBreadcrumb,
                                        this.state.cardView.cardOptions?.height,
                                        recordId
                                    );
                                })}
                        </div>
                        <div className='column right'>
                            {this.state.dashboard?.views
                                ?.filter((item) => item.position === 'right')
                                .map((item) => {
                                    return this.renderGridView(
                                        item,
                                        cardId,
                                        currentBreadcrumb,
                                        this.state.cardView.cardOptions?.height,
                                        recordId
                                    );
                                })}
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }

    renderGridView(item, cardViewId, currentBreadcrumb, _cardHeight, recordId) {
        return (
            <div key={`${item.id}_${cardViewId}_grid-view`} className='panel-dashboard'>
                <span className='title-dashboard'>{item.label}</span>
                <div style={{float: 'right'}}>
                    <ShortcutButton
                        key={`${item.id}_shortcut`}
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
                <DashboardGridViewComponent
                    id={item.id}
                    key={item.id}
                    subViewId={undefined}
                    parentId={cardViewId}
                    recordId={recordId}
                    copyDataForDashboard={(copyData) => {
                        this.setState({copyData});
                    }}
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
            </div>
        );
    }

    getMessages() {
        return this.messages;
    }

    renderDetails() {
        return <React.Fragment></React.Fragment>;
    }
}

DashboardContainer.defaultProps = {};
DashboardContainer.propTypes = {dashboard: PropTypes.object, handleRenderNoRefreshContent: PropTypes.func.isRequired};

export default DashboardContainer;

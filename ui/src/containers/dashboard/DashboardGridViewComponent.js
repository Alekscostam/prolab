import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../../baseContainers/BaseContainer';
import ActionButton from '../../components/ActionButton';
import ActionButtonWithMenu from '../../components/prolab/ActionButtonWithMenu';
import EditRowComponent from '../../components/prolab/EditRowComponent';
import HeadPanel from '../../components/prolab/HeadPanel';
import ShortcutsButton from '../../components/prolab/ShortcutsButton';
import CrudService from '../../services/CrudService';
import ViewService from '../../services/ViewService';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import UrlUtils from '../../utils/UrlUtils';
import DataGridStore from '../dao/DataGridStore';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import GridViewComponent from '../dataGrid/GridViewComponent';
import ConsoleHelper from '../../utils/ConsoleHelper';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import {AttachmentViewDialog} from '../attachmentView/AttachmentViewDialog';
import CopyDialogComponent from '../../components/prolab/CopyDialogComponent';
import PluginListComponent from '../../components/prolab/PluginListComponent';
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class DashboardGridViewComponent extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('GridViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.dataGridStore = new DataGridStore();
        this.subGridView = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
            copyData: null,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: [],
            batchesList: [],
            viewTypes: [],
            viewType: null,
            subView: null,
            viewInfoTypes: [],
            visibleEditPanel: false,
            visibleCopyDialog: false,
            modifyEditData: false,
            editData: null,
            kindView: 'View',
        };
        this.viewTypeChange = this.viewTypeChange.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.showCopyView = this.showCopyView.bind(this);
        this.messages = React.createRef();
        this.refDataGrid = React.createRef();
    }

    componentDidMount() {
        ConsoleHelper('GridViewContainer::componentDidMount -> path ', window.location.pathname);
        this._isMounted = true;
        const id = this.props.id;
        const subViewId = this.props.subViewId;
        const recordId = this.props.recordId;
        const filterId = this.props.filterId;
        const viewType = this.props.viewType;
        ConsoleHelper(
            `GridGridViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`
        );
        this.setState(
            {
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId,
                viewType: viewType,
            },
            () => {
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId,
                    viewType
                );
            }
        );
    }

    //@override
    componentDidUpdate(prevProps, prevState, snapshot) {}

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, recordId, subviewId, filterId, viewType) {
        ConsoleHelper(
            `GridGridViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}, viewType=${viewType}`
        );
        this.getViewById(viewId, recordId, filterId, viewType, null);
    }

    //@override
    getViewById(viewId, recordId, filterId, viewType, subviewMode) {
        this.setState({loading: true}, () => {
            this.viewService
                .getView(viewId, viewType)
                .then((responseView) => {
                    if (this._isMounted) {
                        ViewValidatorUtils.validation(responseView);
                        let gridViewColumnsTmp = [];
                        let pluginsListTmp = [];
                        let documentsListTmp = [];
                        let batchesListTmp = [];
                        let filtersListTmp = [];
                        let columnOrderCounter = 0;
                        new Array(responseView.gridColumns).forEach((gridColumns) => {
                            gridColumns?.forEach((group) => {
                                group.columns?.forEach((column) => {
                                    column.groupName = group.groupName;
                                    column.freeze = group.freeze;
                                    column.columnOrder = columnOrderCounter++;
                                    gridViewColumnsTmp.push(column);
                                });
                            });
                        });
                        for (let plugin in responseView?.pluginsList) {
                            pluginsListTmp.push({
                                id: responseView?.pluginsList[plugin].id,
                                label: responseView?.pluginsList[plugin].label,
                            });
                        }
                        for (let document in responseView?.documentsList) {
                            documentsListTmp.push({
                                id: responseView?.documentsList[document].id,
                                label: responseView?.documentsList[document].label,
                            });
                        }
                        for (let batch in responseView?.batchesList) {
                            batchesListTmp.push({
                                id: responseView?.batchesList[batch].id,
                                label: responseView?.batchesList[batch].label,
                            });
                        }
                        for (let filter in responseView?.filtersList) {
                            filtersListTmp.push({
                                id: responseView?.filtersList[filter].id,
                                label: responseView?.filtersList[filter].label,
                                command: (e) => {
                                    let recordId = UrlUtils.getURLParameter('recordId');
                                    ConsoleHelper(
                                        `Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                    );
                                    if (!!e.item?.id) {
                                        const filterId = parseInt(e.item?.id);
                                        window.location.href = AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${this.state.elementId}/?filterId=${filterId}`
                                        );
                                    }
                                },
                            });
                        }
                        let viewInfoTypesTmp = [];
                        let viewButton = DataGridUtils.containsOperationsButton(responseView.operations, 'OP_GRIDVIEW');
                        if (viewButton) {
                            viewInfoTypesTmp.push({
                                icon: 'contentlayout',
                                type: 'gridView',
                                hint: viewButton?.label,
                            });
                        }
                        this.setState(
                            () => ({
                                loading: false,
                                //elementId: this.props.id,
                                gridViewType: responseView?.viewInfo?.type,
                                viewType: responseView?.viewInfo?.type,
                                parsedGridView: responseView,
                                gridViewColumns: gridViewColumnsTmp,
                                pluginsList: pluginsListTmp,
                                documentsList: documentsListTmp,
                                batchesList: batchesListTmp,
                                filtersList: filtersListTmp,
                                selectedRowKeys: [],
                                viewInfoTypes: viewInfoTypesTmp,
                                packageRows: responseView?.viewInfo?.dataPackageSize,
                            }),
                            () => {
                                const initFilterId = responseView?.viewInfo?.filterdId;
                                this.setState({loading: true}, () => {
                                    let res = this.dataGridStore.getDataGridStore(
                                        this.state.subView == null ? this.state.elementId : this.state.elementSubViewId,
                                        this.state.viewType,
                                        this.state.subView == null ? recordId : this.state.elementRecordId,
                                        !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId,
                                        this.state.kindView,
                                        () => {
                                            this.setState({
                                                blocking: true,
                                            });
                                        },
                                        () => {
                                            this.setState({
                                                blocking: false,
                                            });
                                        },
                                        (err) => {
                                            this.showErrorMessages(err);
                                        }
                                    );
                                    this.setState({
                                        loading: false,
                                        parsedGridViewData: res,
                                    });
                                });
                            }
                        );
                    }
                })
                .catch((err) => {
                    console.error('Error getView in GridView. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err);
                    });
                });
        });
    }

    //override
    viewTypeChange(e) {
        let newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), 'viewType', e.itemData.type);
        window.history.replaceState('', '', newUrl);
        this.setState({viewType: e.itemData.type}, () => {
            this.downloadData(
                this.state.elementId,
                this.state.elementRecordId,
                this.state.elementSubViewId,
                this.state.elementFilterId,
                this.state.viewType
            );
        });
    }

    //override
    renderGlobalTop() {
        return (
            <React.Fragment>
                <React.Fragment>
                    {this.state.visibleEditPanel ? (
                        <EditRowComponent
                            visibleEditPanel={this.state.visibleEditPanel}
                            editData={this.state.editData}
                            onChange={this.handleEditRowChange}
                            onBlur={this.handleEditRowBlur}
                            onSave={this.handleEditRowSave}
                            onAutoFill={this.handleAutoFillRowChange}
                            onEditList={this.handleEditListRowChange}
                            onCancel={this.handleCancelRowChange}
                            onCloseCustom={() => {
                                this.setState({
                                    visibleEditPanel: false,
                                });
                            }}
                            validator={this.validator}
                            onHide={(e, viewId, recordId, parentId) =>
                                !!this.state.modifyEditData
                                    ? confirmDialog({
                                          appendTo: document.body,
                                          message: LocUtils.loc(
                                              this.props.labels,
                                              'Question_Close_Edit',
                                              'Czy na pewno chcesz zamknąć edycję?'
                                          ),
                                          header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                                          icon: 'pi pi-exclamation-triangle',
                                          acceptLabel: localeOptions('accept'),
                                          rejectLabel: localeOptions('reject'),
                                          accept: () => {
                                              this.handleCancelRowChange(viewId, recordId, parentId);
                                              this.setState({visibleEditPanel: e});
                                          },
                                          reject: () => undefined,
                                      })
                                    : this.setState({visibleEditPanel: e}, () => {
                                          this.handleCancelRowChange(viewId, recordId, parentId);
                                      })
                            }
                            onError={(e) => this.showErrorMessage(e)}
                            labels={this.props.labels}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                        />
                    ) : null}
                    {this.state.visibleCopyDialog ? (
                        <CopyDialogComponent
                            visible={this.state.visibleCopyDialog}
                            onHide={() => this.setState({visibleCopyDialog: false})}
                            isSpecification={this.state.parsedGridView.viewInfo.isSpecification}
                            handleUnselectAllData={this.unselectAllDataGrid}
                            handleCopy={(datas) => {
                                this.setState({
                                    copyData: datas,
                                });
                                this.copyEntry(this.state.copyId, this.props?.copyDataForDashboard);
                            }}
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
                    {this.state.visiblePluginPanel && (
                        <PluginListComponent
                            visible={this.state.visiblePluginPanel}
                            field={this.state.editListField}
                            parsedPluginView={this.state.parsedPluginView}
                            parsedPluginViewData={this.state.parsedPluginViewData}
                            onHide={() => this.setState({visiblePluginPanel: false})}
                            handleBlockUi={() => {
                                this.blockUi();
                                return true;
                            }}
                            unselectAllDataGrid={() => {
                                this.setState({
                                    selectedRowKeys: [],
                                });
                            }}
                            pluginId={this.state.pluginId}
                            isPluginFirstStep={this.state.isPluginFirstStep}
                            executePlugin={this.executePlugin}
                            selectedRowKeys={this.state.selectedRowKeys}
                            handleUnblockUi={() => this.unblockUi}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            dataGridStoreSuccess={this.state.dataPluginStoreSuccess}
                            selectedRowData={this.state.selectedRowData}
                            defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                            labels={this.props.labels}
                        />
                    )}

                    {this.state.visibleMessagePluginPanel ? (
                        <ConfirmDialog
                            acceptLabel={
                                this.state.parsedPluginView.info.question
                                    ? LocUtils.loc(this.props.labels, 'Yes', 'Tak')
                                    : LocUtils.loc(this.props.labels, 'Ok', 'Ok')
                            }
                            rejectLabel={
                                this.state.parsedPluginView.info.question
                                    ? LocUtils.loc(this.props.labels, 'No', 'Nie')
                                    : LocUtils.loc(this.props.labels, 'Close', 'Zamknij')
                            }
                            /** Question jest nadrzedny tzn. jesli message i question !== null to bierze wartosci z question */
                            header={
                                this.state.parsedPluginView.info.question
                                    ? LocUtils.loc(
                                          this.props.labels,
                                          '',
                                          this.state.parsedPluginView.info.question?.title
                                      )
                                    : LocUtils.loc(
                                          this.props.labels,
                                          '',
                                          this.state.parsedPluginView.info.message?.title
                                      )
                            }
                            visible={true}
                            onHide={() => this.setState({visibleMessagePluginPanel: false})}
                            message={
                                this.state.parsedPluginView.info.question
                                    ? LocUtils.loc(
                                          this.props.labels,
                                          '',
                                          this.state.parsedPluginView.info.question?.text
                                      )
                                    : LocUtils.loc(
                                          this.props.labels,
                                          '',
                                          this.state.parsedPluginView.info.message?.text
                                      )
                            }
                            icon='pi pi-exclamation-triangle'
                            accept={() => {
                                const refreshAll = this.state.parsedPluginView?.viewOptions?.refreshAll;
                                if (this.state.isPluginFirstStep) {
                                    const isThereNextStep = this.state.parsedPluginView?.info?.next;
                                    const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
                                    const listId = {listId: idRowKeys};
                                    const pluginId = this.state.pluginId;
                                    if (isThereNextStep) this.executePlugin(pluginId, listId, refreshAll);
                                    else this.setState({visibleMessagePluginPanel: false});
                                }
                                if (refreshAll) {
                                    this.refreshView();
                                    this.unselectAllDataGrid(false);
                                }
                                this.setState({visibleMessagePluginPanel: false});
                            }}
                            reject={() => this.setState({visibleMessagePluginPanel: false})}
                        />
                    ) : null}
                </React.Fragment>
            </React.Fragment>
        );
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <div id='left-header-panel' className='float-left pt-2' />
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        let opADD = DataGridUtils.containsOperationsButton(this.state.parsedGridView?.operations, 'OP_ADD');
        return (
            <React.Fragment>
                <ActionButton rendered={opADD} label={opADD?.label} handleClick={() => {}} />
            </React.Fragment>
        );
    }

    //override
    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} maxShortcutButtons={5} />
            </React.Fragment>
        );
    };

    leftHeadPanelContent = () => {
        let centerElementStyle = 'mr-1 ';
        let opBatches = DataGridUtils.containsOperationsButton(this.state.parsedGridView?.operations, 'OP_BATCH');
        let opDocuments = DataGridUtils.containsOperationsButton(this.state.parsedGridView?.operations, 'OP_DOCUMENTS');
        let opPlugins = DataGridUtils.containsOperationsButton(this.state.parsedGridView?.operations, 'OP_PLUGINS');
        return (
            <React.Fragment>
                <ButtonGroup
                    className={`${centerElementStyle}`}
                    items={this.state.viewInfoTypes}
                    keyExpr='type'
                    stylingMode='outlined'
                    selectedItemKeys={this.state.viewType}
                    onItemClick={this.viewTypeChange}
                />
                <div className={`${centerElementStyle} op-buttongroup`}>
                    {opDocuments && this.state.documentsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_documents'
                            iconName='mdi-file-document'
                            items={this.state.documentsList}
                            title={opDocuments?.label}
                        />
                    ) : null}

                    {opPlugins && this.state.pluginsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_plugins'
                            iconName='mdi-puzzle'
                            items={this.state.pluginsList}
                            title={opPlugins?.label}
                        />
                    ) : null}

                    {opBatches && this.state.batchesList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='batches_plugins'
                            iconName='mdi-cogs'
                            items={this.state.batchesList}
                            title={opBatches?.label}
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    };

    //override
    renderHeadPanel = () => {
        return (
            <React.Fragment>
                <HeadPanel
                    labels={this.props.labels}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => this.delete()}
                    handleFormula={() => {
                        this.prepareCalculateFormula();
                    }}
                    handleRestore={() => this.restore()}
                    handleCopy={() => this.copyEntry()}
                    handleArchive={() => this.archive()}
                    handleAttachments={() => this.attachment()}
                    handlePublish={() => this.publishEntry()}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleBlockUi={() => this.blockUi()}
                />
            </React.Fragment>
        );
    };

    unselectedDataGrid() {
        this.getRefGridView().instance?.deselectAll();
        this.setState({
            selectedRowKeys: {},
        });
    }

    //override
    renderHeaderContent() {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment />;
        }
    }

    //override
    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                {this.renderGlobalTop()}
                {this.renderContent()}
            </React.Fragment>
        );
    }

    //override
    blockUi() {
        if (!!this.props.handleBlockUi()) {
            return this.props.handleBlockUi();
        } else {
            super.blockUi();
            return true;
        }
    }

    //override
    unblockUi() {
        if (!!this.props.handleUnBlockUi()) {
            return this.props.handleUnBlockUi();
        } else {
            super.unblockUi();
            return true;
        }
    }

    //override
    showErrorMessages(err) {
        if (!!this.props.handleShowErrorMessages(err)) {
            return this.props.handleShowErrorMessages(err);
        } else {
            this.showErrorMessages(err);
            return true;
        }
    }
    showCopyView(id) {
        this.setState({
            visibleCopyDialog: true,
            copyId: id,
        });
    }

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        <GridViewComponent
                            id={this.props.id}
                            gridFromDashboard={true}
                            elementSubViewId={this.state.elementSubViewId}
                            handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                            parsedGridView={this.state.parsedGridView}
                            parsedGridViewData={this.state.parsedGridViewData}
                            gridViewColumns={this.state.gridViewColumns}
                            elementRecordId={this.props.parentId}
                            selectedRowKeys={this.state.selectedRowKeys}
                            handleBlockUi={() => {
                                return this.blockUi();
                            }}
                            getRef={() => {
                                return this.refDataGrid;
                            }}
                            handleUnblockUi={() => {
                                return this.unblockUi();
                            }}
                            showErrorMessages={(err) => {
                                return this.showErrorMessages(err);
                            }}
                            packageRows={this.state.packageRows}
                            handleShowEditPanel={(editDataResponse) => {
                                this.setState({
                                    visibleEditPanel: true,
                                    modifyEditData: false,
                                    editData: editDataResponse,
                                });
                                this.unblockUi();
                            }}
                            handleSelectedRowKeys={(e) => this.setState({selectedRowKeys: e?.selectedRowKeys})}
                            showColumnLines={this.props.showColumnLines}
                            showRowLines={this.props.showRowLines}
                            showBorders={this.props.showBorders}
                            showColumnHeaders={this.props.showColumnHeaders}
                            showFilterRow={this.props.showFilterRow}
                            showSelection={this.props.showSelection}
                            dataGridHeight={this.props.dataGridHeight}
                            handleDeleteRow={(id) => this.delete(id)}
                            handleFormulaRow={(id) => {
                                this.prepareCalculateFormula(id);
                            }}
                            handleUnselectAll={() => {
                                this.unselectAllDataGrid();
                            }}
                            handleHistoryLogRow={(id) => this.historyLog(id)}
                            handleRestoreRow={(id) => this.restore(id)}
                            handleDocumentRow={(id) => this.generate(id)}
                            handlePluginRow={(id) => this.plugin(id)}
                            handleCopyRow={(id) => this.showCopyView(id)}
                            handleArchiveRow={(id) => this.archive(id)}
                            handleDownloadRow={(id) => this.downloadAttachment(id)}
                            handleAttachmentRow={(id) => this.attachment(id)}
                            handlePublishRow={(id) => this.publishEntry(id)}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };

    getMessages() {
        return this.messages;
    }

    static defaultProps = {
        viewMode: 'VIEW',
        showColumnLines: true,
        showRowLines: true,
        showBorders: true,
        showColumnHeaders: true,
        showFilterRow: true,
        showSelection: true,
    };

    static propTypes = {
        id: PropTypes.number.isRequired,
        subViewId: PropTypes.number.isRequired,
        recordId: PropTypes.number.isRequired,
        filterId: PropTypes.number.isRequired,
        viewType: PropTypes.number.isRequired,
        showColumnLines: PropTypes.bool,
        showRowLines: PropTypes.bool,
        showBorders: PropTypes.bool,
        showColumnHeaders: PropTypes.bool,
        showFilterRow: PropTypes.bool,
        showSelection: PropTypes.bool,
        handleBlockUi: PropTypes.func,
        handleUnBlockUi: PropTypes.func,
        handleShowErrorMessages: PropTypes.func,
        dataGridHeight: PropTypes.number,
        labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    };
}

import {Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButton from '../components/ActionButton';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import EditRowComponent from '../components/prolab/EditRowComponent';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import EditService from '../services/EditService';
import ViewService from '../services/ViewService';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {GridViewUtils} from '../utils/GridViewUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import DataGridStore from './dao/DataGridStore';
import {confirmDialog} from "primereact/confirmdialog";
import Constants from "../utils/Constants";
import {localeOptions} from "primereact/api";
import GridViewComponent from "./dataGrid/GridViewComponent";
import SubGridViewComponent from "./dataGrid/SubGridViewComponent";
import ConsoleHelper from "../utils/ConsoleHelper";
import LocUtils from "../utils/LocUtils";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class GridViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('GridViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.editService = new EditService();
        this.dataGridStore = new DataGridStore();
        this.subGridView = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
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
            modifyEditData: false,
            editData: null,
            kindView: 'View'
        };
        this.viewTypeChange = this.viewTypeChange.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.onTabsSelectionChanged = this.onTabsSelectionChanged.bind(this);
    }

    componentDidMount() {
        ConsoleHelper('GridViewContainer::componentDidMount -> path ', window.location.pathname);
        this._isMounted = true;
        const id = this.props.id;
        const subViewId = this.props.subViewId;
        const recordId = this.props.recordId;
        const filterId = this.props.filterId;
        const viewType = this.props.viewType;
        ConsoleHelper(`GridGridViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`);
        this.setState({
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
    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, recordId, subviewId, filterId, viewType) {
        ConsoleHelper(
            `GridGridViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}, viewType=${viewType}`
        );
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode && viewType !== 'dashboard') {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;
                    if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                        this.showErrorMessages(LocUtils.loc(this.props.labels, 'No_Subview', 'Brak podwidoków - niepoprawna konfiguracja!'));
                        window.history.back();
                        this.unblockUi();
                        return;
                    } else {
                        let subViewsTabs = [];
                        subViewResponse.subViews.forEach((subView, i) => {
                            subViewsTabs.push({id: subView.id, text: subView.label, icon: subView.icon});
                            if (subView.id === parseInt(elementSubViewId)) {
                                this.setState({subViewTabIndex: i});
                            }
                        });
                        subViewResponse.subViewsTabs = subViewsTabs;
                    }
                    this.setState(
                        {
                            subView: subViewResponse,
                            elementSubViewId: elementSubViewId,
                        },
                        () => {
                            this.unblockUi();
                            this.getViewById(elementSubViewId, recordId, filterId, viewType, subviewMode);
                        }
                    );
                })
                .catch((err) => {
                    this.showErrorMessages(err);
                    window.history.back();
                    this.unblockUi();
                });

            return;
        } else {
            this.setState({subView: null});
        }
        this.getViewById(viewId, recordId, filterId, viewType, subviewMode);
    }

    //@override
    getViewById(viewId, recordId, filterId, viewType, subviewMode) {
        this.setState({loading: true,},
            () => {
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
                            // ConsoleHelper('GridViewContainer -> fetch columns: ', gridViewColumnsTmp);
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
                                        let subViewId = UrlUtils.getURLParameter('subview');
                                        let recordId = UrlUtils.getURLParameter('recordId');
                                        if (subviewMode) {
                                            ConsoleHelper(
                                                `Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                            );
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${e.item?.id}`
                                            );
                                        } else {
                                            ConsoleHelper(
                                                `Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                            );
                                            if (!!e.item?.id) {
                                                const filterId = parseInt(e.item?.id)
                                                window.location.href = AppPrefixUtils.locationHrefUrl(
                                                    `/#/grid-view/${this.state.elementId}/?filterId=${filterId}`
                                                );
                                            }
                                        }
                                    },
                                });
                            }
                            let viewInfoTypesTmp = [];
                            let viewButton = GridViewUtils.containsOperationButton(
                                responseView.operations,
                                'OP_GRIDVIEW'
                            );
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
                                            this.state.subView == null
                                                ? this.state.elementId
                                                : this.state.elementSubViewId,
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
                                            },
                                        );
                                        this.setState({
                                            loading: false,
                                            parsedGridViewData: res
                                        });
                                    });
                                }
                            );
                        }
                    })
                    .catch((err) => {
                        console.error('Error getView in GridView. Exception = ', err);
                        this.setState({loading: false,}, () => {
                                this.showErrorMessages(err);
                            }
                        );
                    });
            }
        );
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
                    <EditRowComponent
                        visibleEditPanel={this.state.visibleEditPanel}
                        editData={this.state.editData}
                        onChange={this.handleEditRowChange}
                        onBlur={this.handleEditRowBlur}
                        onSave={this.handleEditRowSave}
                        onAutoFill={this.handleAutoFillRowChange}
                        onEditList={this.handleEditListRowChange}
                        onCancel={this.handleCancelRowChange}
                        validator={this.validator}
                        onHide={(e) => !!this.state.modifyEditData ? confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => this.setState({visibleEditPanel: e}),
                            reject: () => undefined,
                        }) : this.setState({visibleEditPanel: e})}
                        onError={(e) => this.showErrorMessage(e)}
                    />
                </React.Fragment>
            </React.Fragment>);
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <div id='left-header-panel' className='float-left pt-2'/>
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        let opADD = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_ADD');
        return (
            <React.Fragment>
                <ActionButton rendered={opADD} label={opADD?.label}/>
            </React.Fragment>
        );
    }

    //override
    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} maxShortcutButtons={5}/>
            </React.Fragment>
        );
    }

    leftHeadPanelContent = () => {
        let centerElementStyle = 'mr-1 ';
        let opBatches = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_BATCH');
        let opDocuments = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_DOCUMENTS');
        let opPlugins = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_PLUGINS');
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
    }

    //override
    renderHeadPanel = () => {
        const viewId = this.getRealViewId();
        return (
            <React.Fragment>
                <HeadPanel
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => {
                        ConsoleHelper('handleDelete');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Delete_Label', 'Czy na pewno chcesz usunąć zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                this.editService.delete(viewId, this.state.selectedRowKeys)
                                    .then((deleteResponse) => {
                                        this.unselectedDataGrid();
                                        this.refreshDataGrid();
                                        const msg = deleteResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!deleteResponse.error) {
                                            this.showResponseErrorMessage(deleteResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleRestore={() => {
                        ConsoleHelper('handleRestore');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Restore_Label', 'Czy na pewno chcesz przywrócić zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                this.editService.restore(viewId, this.state.selectedRowKeys)
                                    .then((restoreResponse) => {
                                        this.unselectedDataGrid();
                                        this.refreshDataGrid();
                                        const msg = restoreResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!restoreResponse.error) {
                                            this.showResponseErrorMessage(restoreResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleCopy={() => {
                        ConsoleHelper('handleCopy');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Copy_Label', 'Czy na pewno chcesz zkopiować zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                this.editService.copy(viewId, parentId, this.state.selectedRowKeys)
                                    .then((copyResponse) => {
                                        this.unselectedDataGrid();
                                        this.refreshDataGrid();
                                        const msg = copyResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!copyResponse.error) {
                                            this.showResponseErrorMessage(copyResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleArchive={() => {
                        ConsoleHelper('handleArchive');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Archive_Label', 'Czy na pewno chcesz przenieść do archiwum zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                this.editService.archive(viewId, parentId, this.state.selectedRowKeys)
                                    .then((archiveResponse) => {
                                        this.unselectedDataGrid();
                                        this.refreshDataGrid();
                                        const msg = archiveResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!archiveResponse.error) {
                                            this.showResponseErrorMessage(archiveResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                />
            </React.Fragment>
        );
    }

    unselectedDataGrid() {
        this.getRefGridView().instance.deselectAll();
        this.setState({
            selectedRowKeys: {}
        });
    }

    //override
    renderHeaderContent() {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment/>
        }
        const {labels} = this.props;
        return (
            <React.Fragment>
                <SubGridViewComponent
                    handleOnInitialized={(ref) => this.subGridView = ref}
                    subView={this.state.subView}
                    labels={labels}
                    handleOnEditClick={(e) => {
                        this.blockUi();
                        this.editService
                            .getEdit(e.viewId, e.recordId, e.kindView)
                            .then((editDataResponse) => {
                                this.setState({
                                    visibleEditPanel: true,
                                    editData: editDataResponse
                                });
                                this.unblockUi();
                            })
                            .catch((err) => {
                                this.showErrorMessages(err);
                                this.unblockUi();
                            });
                    }}/>
                {/*Zakładki podwidoków*/}
                <div id='subviews-panel'>
                    {this.state.subView != null &&
                    this.state.subView.subViews != null &&
                    this.state.subView.subViews.length > 0 ? (
                        <Tabs
                            dataSource={this.state.subView.subViewsTabs}
                            selectedIndex={this.state.subViewTabIndex}
                            onOptionChanged={this.onTabsSelectionChanged}
                            scrollByContent={true}
                            itemRender={this.renderTabItem}
                            showNavButtons={true}
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }

    //override
    renderTabItem = (itemData) => {
        const viewInfoId = this.state.subView.viewInfo?.id;
        const subViewId = itemData.id;
        const recordId = this.state.elementRecordId;
        return (
            <a
                href={AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}`
                )}
                className='subview-tab-item-href'
            >
                {itemData.text}
            </a>
        );
    }

    //override
    onTabsSelectionChanged(args) {
        if (args.name === 'selectedItem') {
            if (args.value?.id && args.previousValue !== null && args.value?.id !== args.previousValue?.id) {
                this.state.subView.subViewsTabs.forEach((subView, i) => {
                    if (subView.id === args.value.id) {
                        this.setState({subViewTabIndex: i});
                    }
                });
                const viewInfoId = this.state.subView.viewInfo?.id;
                const subViewId = args.value.id;
                const recordId = this.state.elementRecordId;
                window.location.href = AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}`
                );
            }
        }
    }

    //override
    render() {
        return (
            <React.Fragment>
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
            this.showErrorMessages(err)
            return true;
        }
    }

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        <GridViewComponent
                            id={this.props.id}
                            elementSubViewId={this.state.elementSubViewId}
                            handleOnDataGrid={(ref) => this.refDataGrid = ref}
                            parsedGridView={this.state.parsedGridView}
                            parsedGridViewData={this.state.parsedGridViewData}
                            gridViewColumns={this.state.gridViewColumns}
                            selectedRowKeys={this.state.selectedRowKeys}
                            handleBlockUi={() => {
                                return this.blockUi();
                            }}
                            handleUnblockUi={() => {
                                return this.unblockUi();
                            }}
                            showErrorMessages={(err) => {
                                return this.showErrorMessages(err)
                            }}
                            packageRows={this.state.packageRows}
                            handleShowEditPanel={(editDataResponse) => {
                                this.setState({
                                    visibleEditPanel: true,
                                    modifyEditData: false,
                                    editData: editDataResponse
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
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }

    static defaultProps =
        {
            viewMode: 'VIEW',
            showColumnLines: true,
            showRowLines: true,
            showBorders: true,
            showColumnHeaders: true,
            showFilterRow: true,
            showSelection: true,
        }

    static propTypes =
        {
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
            dataGridHeight: PropTypes.number
        }
}


import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../../baseContainers/BaseContainer';
import ActionButton from '../../components/ActionButton';
import ActionButtonWithMenu from '../../components/prolab/ActionButtonWithMenu';
import EditRowComponent from '../../components/prolab/EditRowComponent';
import HeadPanel from '../../components/prolab/HeadPanel';
import ShortcutsButton from '../../components/prolab/ShortcutsButton';
import EditService from '../../services/EditService';
import ViewService from '../../services/ViewService';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import {GridViewUtils} from '../../utils/GridViewUtils';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import UrlUtils from '../../utils/UrlUtils';
import DataGridStore from '../dao/DataGridStore';
import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";
import GridViewComponent from "../dataGrid/GridViewComponent";
import ConsoleHelper from "../../utils/ConsoleHelper";
import LocUtils from "../../utils/LocUtils";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class DashboardGridViewComponent extends BaseContainer {
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
        this.getViewById(viewId, recordId, filterId, viewType, null);
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
                                            const filterId = parseInt(e.item?.id)
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${this.state.elementId}/?filterId=${filterId}`
                                            );
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
                                this.showGlobalErrorMessage(err);
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
                            appendTo: document.body,
                            message: LocUtils.loc(this.props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => this.setState({visibleEditPanel: e}),
                            reject: () => undefined,
                        }) : this.setState({visibleEditPanel: e})}
                        onError={(e) => this.showErrorMessage(e)}
                        labels={this.props.labels}
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
        return (
            <React.Fragment>
                <HeadPanel
                    labels={this.props.labels}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => this.delete()}
                    handleRestore={() => this.restore()}
                    handleCopy={() => this.copy()}
                    handleArchive={() => this.archive()}
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
                            handleDeleteRow={(id) => this.delete(id)}
                            handleRestoreRow={(id) => this.restore(id)}
                            handleCopyRow={(id) => this.copy(id)}
                            handleArchiveRow={(id) => this.archive(id)}
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
            dataGridHeight: PropTypes.number,
            labels: PropTypes.object.isRequired,
        }
}


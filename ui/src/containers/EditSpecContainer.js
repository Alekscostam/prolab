import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import Constants from '../utils/Constants';
import ConsoleHelper from '../utils/ConsoleHelper';
import DataTreeStore from './dao/DataTreeStore';
import TreeViewComponent from './treeGrid/TreeViewComponent';
import {SelectBox} from 'devextreme-react';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import ActionButtonWithMenuUtils from '../utils/ActionButtonWithMenuUtils';
import {AddSpecContainer} from './AddSpecContainer';
import SubGridViewComponent from './dataGrid/SubGridViewComponent';
import {TreeListUtils} from '../utils/component/TreeListUtils';
import {ConfirmationEditQuitDialog} from '../components/prolab/ConfirmationEditQuitDialog';
import EditSpecService from '../services/EditSpecService';
import {OperationType} from '../model/OperationType';
import LocUtils from '../utils/LocUtils';
import {StringUtils} from '../utils/StringUtils';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
// TODO: zrobic SpecSerivice

export let operationClicked = false;

export class EditSpecContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('EditSpecContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.editSpecService = new EditSpecService();
        this.crudService = new CrudService();
        this.dataTreeStore = new DataTreeStore();
        this.refTreeList = React.createRef();
        this.messages = React.createRef();
        this.state = {
            loading: true,
            expandAll: undefined,
            levelId: undefined,
            visibleAddSpec: false,
            renderConfirmationEditQuitDialog: false,
            elementParentId: null,
            elementRecordId: null,
            elementFilterId: null,
            parsedData: null,
            columns: [],
            selectedRowKeys: [],
        };
        this.getViewById = this.getViewById.bind(this);
        this.showAddSpecDialog = this.showAddSpecDialog.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.unselectAllDataGrid = this.unselectAllDataGrid.bind(this);
        this.getMaxViewid = this.getMaxViewid.bind(this);
        this.blockUi();
    }

    componentDidMount() {
        this._isMounted = true;
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        this.props.handleRenderNoRefreshContent(false);
        const parentId = UrlUtils.getURLParameter('parentId');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        ConsoleHelper(
            `EditSpecContainer::componentDidMount -> id=${id}, parentId = ${parentId} recordId = ${recordId} filterId = ${filterId}`
        );
        this.setState({
            elementParentId: parentId,
            elementRecordId: recordId,
            elementFilterId: filterId,
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const parentId = UrlUtils.getURLParameter('parentId');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const s1 = !DataGridUtils.equalNumbers(this.state.elementId, id);
        const s2 = !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !DataGridUtils.equalString(this.state.elementRecordId, recordId);

        const updatePage = s1 || s2 || s3;
        ConsoleHelper(
            'EditSpecContainer::componentDidUpdate -> updateData={%s} updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}',
            updatePage,
            prevProps.id,
            this.props.id,
            s1,
            s2,
            s3
        );
        if (updatePage) {
            this.setState(
                {
                    elementId: id,
                    elementParentId: parentId,
                    elementRecordId: recordId,
                    elementFilterId: filterId, //z dashboardu
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementParentId,
                        this.state.elementRecordId,
                        this.state.elementFilterId,
                        true
                    );
                }
            );
        } else {
            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, parentId, recordId, filterId, expandAll) {
        if (!window.location.href.includes('grid-view')) {
            ConsoleHelper(
                `EditSpecContainer::downloadData: viewId=${viewId}, parentId=${parentId}, recordId=${recordId}, filterId=${filterId} expandAll=${expandAll}`
            );
            this.getViewById(viewId, parentId, recordId, filterId, expandAll);
        }
    }

    getViewById(viewId, parentId, recordId, filterId, expandAll) {
        this.setState({loading: true}, () => {
            this.editSpecService
                .getView(viewId, parentId)
                .then((responseView) => {
                    let refactorResponseView = {
                        ...responseView,

                        viewInfo: {
                            id: responseView.editInfo.viewId,
                            name: responseView.editInfo.viewName,
                            parentId: responseView.editInfo.parentId,
                            type: 'gridView',
                            kindView: 'ViewSpec',
                        },
                        gridColumns: [
                            {
                                groupName: '',
                                freeze: '',
                                columns: responseView.listColumns,
                            },
                        ],
                        gridOptions: responseView.listOptions,
                        editInfo: undefined,
                        listColumns: undefined,
                        listOptions: undefined,
                    };
                    this.processingViewResponse(refactorResponseView, parentId, recordId, expandAll);
                })
                .catch((err) => {
                    console.error('Error getViewSpec in EditSpec. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                })
                .finally(() => {
                    this.unblockUi();
                });
        });
    }

    processingViewResponse(responseView, parentId, recordId, expandAll) {
        if (this._isMounted) {
            ViewValidatorUtils.validation(responseView);
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            Breadcrumb.updateView(responseView.viewInfo, id, recordId);
            let columnsTmp = [];
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
                        columnsTmp.push(column);
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
            Breadcrumb.currentBreadcrumbAsUrlParam();
            for (let filter in responseView?.filtersList) {
                filtersListTmp.push({
                    id: responseView?.filtersList[filter].id,
                    label: responseView?.filtersList[filter].label,
                });
            }
            this.setState(
                () => ({
                    parsedView: responseView,
                    columns: columnsTmp,
                    pluginsList: pluginsListTmp,
                    documentsList: documentsListTmp,
                    batchesList: batchesListTmp,
                    filtersList: filtersListTmp,
                    expandAll: expandAll,
                }),
                () => {
                    const dataPackageSize = responseView.viewInfo?.packageCount;
                    const viewIdArg = this.state.elementId;
                    const parentIdArg = this.state.elementParentId;
                    const recordIdArg = this.state.elementRecordId;
                    const packageCount =
                        !!dataPackageSize || dataPackageSize === 0
                            ? Constants.DEFAULT_DATA_PACKAGE_COUNT
                            : dataPackageSize;
                    this.dataTreeStore
                        .getDataTreeStoreDirect(viewIdArg, parentIdArg, recordIdArg, packageCount)
                        .then((res) => {
                            const data = TreeListUtils.paintDatas(res.data);
                            this.setState({
                                loading: false,
                                parsedData: data,
                            });
                        });
                }
            );
        }
    }

    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case OperationType.OP_FILTER:
                    return (
                        <React.Fragment>
                            {this.state.filtersList?.length > 0 ? (
                                <SelectBox
                                    id={`combo_filters` + index}
                                    items={this.state.filtersList}
                                    className={`filter-combo ${margin}`}
                                    wrapItemText={true}
                                    displayExpr='label'
                                    valueExpr='id'
                                    value={parseInt(
                                        this.state.elementFilterId || this.state.parsedView?.viewInfo?.filterdId
                                    )}
                                    onValueChanged={(e) => {
                                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                        if (!!e.value && e.value !== e.previousValue) {
                                            const filterId = parseInt(e.value);
                                            const parentId =
                                                UrlUtils.getURLParameter('parentId') || this.state.elementParentId;
                                            const recordId =
                                                UrlUtils.getURLParameter('recordId') || this.state.elementRecordId;
                                            const breadCrumbs = UrlUtils.getURLParameter('bc');
                                            if (!breadCrumbs) return;
                                            ConsoleHelper(
                                                `Redirect -> Id =  ${this.state.elementId} ParentId = ${parentId} RecordId = ${recordId} FilterId = ${filterId}`
                                            );
                                            if (filterId) {
                                                window.location.href = AppPrefixUtils.locationHrefUrl(
                                                    `/#/edit-spec/${this.state.elementId}/?parentId=${parentId}&recordId=${recordId}&filterId=${filterId}${currentBreadcrumb}`
                                                );
                                            }
                                        }
                                    }}
                                    stylingMode='underlined'
                                />
                            ) : null}
                        </React.Fragment>
                    );
                case OperationType.OP_BATCH:
                    return (
                        <React.Fragment>
                            {/*{this.state.batchesList?.length > 0 ? (*/}
                            <ActionButtonWithMenu
                                id={`button_batches_` + index}
                                className={`${margin}`}
                                iconName={operation?.iconCode || 'mdi-cogs'}
                                items={this.state.batchesList}
                                title={operation?.label}
                            />
                            {/*) : null}*/}
                        </React.Fragment>
                    );
                case OperationType.OP_DOCUMENTS:
                    return (
                        <React.Fragment>
                            {/*{this.state.documentsList?.length > 0 ? (*/}
                            <ActionButtonWithMenu
                                id={`button_documents` + index}
                                className={`${margin}`}
                                iconName={operation?.iconCode || 'mdi-file-document'}
                                items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                    this.state.documentsList,
                                    undefined,
                                    this.handleRightHeadPanelContent,
                                    operation.type?.toUpperCase()
                                )}
                                title={operation?.label}
                            />
                            {/*) : null}*/}
                        </React.Fragment>
                    );
                case OperationType.OP_PLUGINS:
                    return (
                        <React.Fragment>
                            {this.state.pluginsList?.length > 0 ? (
                                <ActionButtonWithMenu
                                    id={`button_plugins` + index}
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-puzzle'}
                                    items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                        this.state.pluginsList,
                                        undefined,
                                        this.handleRightHeadPanelContent,
                                        operation.type?.toUpperCase()
                                    )}
                                    title={operation?.label}
                                />
                            ) : null}
                        </React.Fragment>
                    );
                case OperationType.OP_FORMULA:
                    return (
                        <React.Fragment>
                            <ActionButtonWithMenu
                                id={`button_formula_` + index}
                                className={`${margin}`}
                                customEventClick={() => this.prepareCalculateFormula()}
                                iconName={operation?.iconCode || 'mdi-cogs'}
                                title={operation?.label}
                            />{' '}
                        </React.Fragment>
                    );
                default:
                    return null;
            }
        }
    }

    // //override
    renderGlobalTop() {
        return <React.Fragment></React.Fragment>;
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <DivContainer id='header-left'>
                    {Breadcrumb.render(this.props.labels)}
                    <div className='font-medium mb-4'>{this.state.parsedView?.viewInfo?.name}</div>
                </DivContainer>
            </React.Fragment>
        );
    }

    showAddSpecDialog(recordId) {
        this.unselectAllDataGrid();
        this.setState({visibleAddSpec: true, levelId: recordId});
    }
    addButton() {
        return (
            <ActionButton
                rendered={true}
                label={LocUtils.loc(this.props.labels, 'Add_button', 'Dodaj')}
                handleClick={(e) => {
                    this.showAddSpecDialog();
                }}
            />
        );
    }
    //override
    renderHeaderRight() {
        const operations = [];

        operations.push({type: 'OP_SAVE', label: 'Zapisz'});
        operations.push({type: 'OP_ADD_SPEC', label: 'Dodaj'});
        operations.push({type: 'OP_CANCEL', label: 'Anuluj'});

        const opSave = DataGridUtils.containsOperationsButton(operations, 'OP_SAVE');
        const opCancel = DataGridUtils.containsOperationsButton(operations, 'OP_CANCEL');

        return (
            <React.Fragment>
                <div id='global-top-components'>
                    <ActionButton
                        rendered={!!opSave}
                        label={opSave?.label}
                        className='ml-2'
                        handleClick={() => {
                            const viewIdArg = this.state.elementId;
                            const parentIdArg = this.state.elementParentId;
                            const globalComponents = document.getElementById('global-top-components');
                            globalComponents.click();
                            this.handleEditSpecSave(viewIdArg, parentIdArg, () => {
                                const prevUrl = sessionStorage.getItem('prevUrl');
                                sessionStorage.removeItem('prevUrl');
                                if (prevUrl) {
                                    window.location.href = prevUrl;
                                } else {
                                    this.refreshView();
                                    this.refreshTable();
                                }
                            });
                        }}
                    />
                    <ActionButton
                        rendered={!!opCancel}
                        label={opCancel?.label}
                        className='ml-2 inverse'
                        handleClick={() => {
                            this.setState({
                                renderConfirmationEditQuitDialog: true,
                            });
                        }}
                    />
                </div>
            </React.Fragment>
        );
    }

    handleAddElements = (elements) => {
        const addParsedView = (this.state.parsedData || []).concat(elements);
        this.setState(
            {
                parsedData: addParsedView,
            },
            this.refreshTable()
        );
    };

    handleEditSpecSave(viewId, parentId, fncRedirect) {
        this.blockUi();
        ConsoleHelper(`handleEditSpecSave: viewId = ${viewId} parentId = ${parentId}`);
        const saveElement = this.createObjectToSave(this.state.parsedData);
        ConsoleHelper(`handleEditSpecSave: element to save = ${JSON.stringify(saveElement)}`);
        this.specSave(viewId, parentId, saveElement, false, fncRedirect);
    }
    booleanShouldBeZero(row, el) {
        return row[el] === '0' || row[el] === 0 || row[el] === undefined || row[el] === null || row[el] === false;
    }
    //override
    createObjectToSave(rowArray) {
        const booleanLogicColumns = this.state.columns.filter((el) => el.type === 'L');
        const booleanNumberColumns = this.state.columns.filter((el) => el.type === 'B');
        let arrayTmp = [];
        for (let row of rowArray) {
            Object.keys(row).forEach((el) => {
                booleanLogicColumns.forEach((bool) => {
                    if (bool.fieldName === el) {
                        row[el] ? (row[el] = 'T') : (row[el] = 'N');
                    }
                });
            });
            Object.keys(row).forEach((el) => {
                booleanNumberColumns.forEach((bool) => {
                    if (bool.fieldName === el) {
                        row[el] = this.booleanShouldBeZero(row, el) ? 0 : 1;
                    }
                });
            });
            let rowArray = [];
            for (let field in row) {
                rowArray.push({fieldName: field, value: row[field]});
            }
            arrayTmp.push(rowArray);
        }
        return arrayTmp;
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
    //override
    renderHeaderContent() {
        const {parsedView} = this.state;
        if (!parsedView) {
            return;
        }
        if (!parsedView?.headerData) {
            return;
        }
        const subView = {
            headerData: parsedView?.headerData,
            viewInfo: parsedView?.viewInfo,
            headerOperations: [],
            headerColumns: parsedView?.headerColumns,
        };
        return (
            <div style={{marginLeft: '2px'}}>
                <SubGridViewComponent
                    key={'sub'}
                    handleOnInitialized={(ref) => (this.selectedDataGrid = ref)}
                    subView={subView}
                    minHeight={'110px'}
                    getRef={() => {
                        return this.selectedDataGrid;
                    }}
                    handleRightHeadPanelContent={(e) => {
                        this.viewContainer?.current?.handleRightHeadPanelContent(e);
                    }}
                    handleOnEditClick={(e) => {
                        this.viewContainer?.current?.editSubView(e);
                    }}
                />
            </div>
        );
    }

    //override
    renderHeadPanel = () => {
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={
                        this.state.elementRecordId ? this.state.elementRecordId : UrlUtils.getBatchIdParam()
                    }
                    elementSubViewId={null}
                    elementKindView={this.state.elementKindView}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedView?.operations}
                    labels={this.props.labels}
                    leftContent={
                        <React.Fragment>
                            {this.state.parsedView?.operations.map((operation, index) => {
                                return <div key={index}>{this.renderButton(operation, index)}</div>;
                            })}
                        </React.Fragment>
                    }
                    rightContent={
                        <React.Fragment>
                            <ShortcutsButton items={this.state.parsedView?.shortcutButtons} maxShortcutButtons={5} />
                        </React.Fragment>
                    }
                    handleDelete={() => this.delete()}
                    handleFormula={(e) => {
                        this.prepareCalculateFormula();
                    }}
                    handleAddLevel={() => this.publish()}
                    handleUp={() => this.up()}
                    handleDown={() => this.down()}
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

    //override
    delete(id) {
        // this.blockUi();
        let data = this.getData();
        this.refTreeList?.instance?.beginCustomLoading();
        if (!!id) {
            data = this.deleteSingleRow(id, data);
        } else {
            this.state.selectedRowKeys.forEach((id) => {
                data = this.deleteSingleRow(id, data);
            });
        }
        if (data != null) {
            this.updateData(data, () => {
                this.refreshTable();
            });
        }

        this.refTreeList?.instance?.endCustomLoading();
    }

    //usunięcie pojedyńczego rekordu
    deleteSingleRow(id, data) {
        let el = data.find((x) => x._ID === id);
        if (el._STATUS === 'inserted') {
            const index = data.findIndex((x) => x._ID === id);
            if (index !== undefined) {
                data.splice(index, 1);
            }
        } else {
            el._STATUS = 'deleted';
        }
        let elements = data.filter((x) => x._ID_PARENT === el._ID);

        elements.forEach((e) => {
            this.delete(e._ID);
        });
        if (elements.length === 0) {
            return data;
        }
        return null;
    }

    //metoda przenosi rekord o poziom wyżej
    up(id) {
        this.moveItem(id, -1);
    }

    //metoda przenosi rekord o poziom niżej
    down(id) {
        this.moveItem(id, 1);
    }

    moveItem(id, shiftNumber) {
        this.refTreeList?.instance?.beginCustomLoading();
        let data = this.getData().sort((a, b) => a._ORDER - b._ORDER);
        const index = data.findIndex((x) => x._ID === id);
        const currentElement = data.find((el) => el._ID === id);
        const prevElement = data[index + shiftNumber];
        if (prevElement) {
            if (index !== undefined) {
                if (!this.isChildOfElement(currentElement, prevElement)) {
                    const currentOrder = currentElement._ORDER;
                    const prevOrder = prevElement._ORDER;
                    currentElement._ORDER = prevOrder;
                    prevElement._ORDER = currentOrder;
                    this.move(data, index, index + shiftNumber);
                    this.updateData(data, () => {
                        this.disableAllSort();
                        this.refreshTable();
                    });
                }
            }
        }
        this.refTreeList?.instance?.endCustomLoading();
    }
    isChildOfElement(child, parent) {
        return child._ID_PARENT === parent._ID;
    }
    updateData(dataToUpdate, callbackAction) {
        this.setState({parsedData: dataToUpdate}, () => {
            if (!!callbackAction) callbackAction();
        });
    }
    getMaxViewid() {}

    disableAllSort() {
        this.refTreeList?.instance?.clearSorting();
    }

    getData() {
        return this.state.parsedData;
    }

    getLastId() {
        return this.state.parsedData.length === 0 ? 0 : Math.max(...this.state.parsedData.map((el) => el._ID));
    }

    refreshTable(callbackAction) {
        this.refTreeList?.instance?.refresh();
        if (!!callbackAction) callbackAction();
    }

    move(array, currentIndex, nextIndex) {
        return array.splice(nextIndex, 0, array.splice(currentIndex, 1)[0]);
    }
    //override
    renderContent = () => {
        let parsedData = this.state?.parsedData?.filter((el) => el._STATUS !== 'deleted');
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.renderConfirmationEditQuitDialog && (
                            <ConfirmationEditQuitDialog
                                onHide={() => {
                                    this.setState({
                                        renderConfirmationEditQuitDialog: false,
                                    });
                                }}
                                visible={this.state.renderConfirmationEditQuitDialog}
                                labels={this.props.labels}
                                onAccept={() => {
                                    this.cancelSpec();
                                }}
                            />
                        )}

                        <div id='spec-edit'>
                            <TreeViewComponent
                                id={this.props.id}
                                onHideEditorCallback={() => {
                                    this.forceUpdate();
                                }}
                                addButton={() => this.addButton()}
                                elementParentId={this.state.elementParentId}
                                elementRecordId={this.state.elementRecordId}
                                handleOnTreeList={(ref) => (this.refTreeList = ref)}
                                parsedGridView={this.state.parsedView}
                                focusedRowEnabled={true}
                                hoverStateEnabled={true}
                                parsedGridViewData={parsedData}
                                modifyParsedGridViewData={(newCopyRow) => {
                                    const replacedParsedData = [];
                                    parsedData.forEach((el) => {
                                        if (el._ID === newCopyRow._ID) {
                                            el = newCopyRow;
                                        }
                                        replacedParsedData.push(el);
                                    });
                                    this.setState({
                                        parsedData: replacedParsedData,
                                    });
                                }}
                                onCloseEditList={() => {
                                    this.forceUpdate();
                                }}
                                allowUpdating={true}
                                gridViewColumns={this.state.columns}
                                selectedRowKeys={this.state.selectedRowKeys}
                                onChange={(type, e, rowId, info) => {
                                    this.handleEditRowChange(type, e, rowId, info);
                                }}
                                handleUnselectAll={() => {
                                    this.unselectAllDataGrid();
                                }}
                                handleBlockUi={() => {
                                    this.blockUi();
                                    return true;
                                }}
                                handleUnblockUi={() => this.unblockUi()}
                                handleShowEditPanel={(editDataResponse) => this.handleShowEditPanel(editDataResponse)}
                                handleSelectedRowKeys={(e) => {
                                    // this.blockUi();
                                    this.setState(
                                        {
                                            selectedRowKeys: e,
                                        },
                                        () => {
                                            // this.unblockUi();
                                        }
                                    );
                                }}
                                handleDeleteRow={(id) => this.delete(id)}
                                handleFormulaRow={(id) => this.prepareCalculateFormula(id)}
                                handleDownload={(id) => {
                                    this.props.handleDownloadRow(id);
                                }}
                                handleAttachments={(id) => {
                                    this.props.handleAttachmentRow(id);
                                }}
                                handleAddLevel={(id) => {
                                    this.showAddSpecDialog(id);
                                }}
                                handleUp={(id) => this.up(id)}
                                handleDown={(id) => this.down(id)}
                                handleRestoreRow={(id) => this.restore(id)}
                                handleCopyRow={(id) => this.copyEntry(id)}
                                handleDocumentsRow={(id) => {
                                    this.generate(id);
                                }}
                                handlePluginsRow={(id) => {
                                    this.plugin(id);
                                }}
                                handleDownloadRow={(id) => this.downloadAttachment(id)}
                                handleAttachmentRow={(id) => this.attachment(id)}
                                handleArchiveRow={(id) => this.archive(id)}
                                handlePublishRow={(id) => this.publishEntry(id)}
                                showErrorMessages={(err) => this.showErrorMessages(err)}
                                labels={this.props.labels}
                            />
                        </div>
                        {this.state.visibleAddSpec ? (
                            <AddSpecContainer
                                parsedGridViewData={parsedData}
                                lastId={this.getLastId()}
                                id={this.props.id}
                                createObjectToSave={() => {
                                    return this.createObjectToSave(parsedData);
                                }}
                                visibleAddSpec={this.state.visibleAddSpec}
                                levelId={this.state.levelId}
                                handleAddElements={(el) => this.handleAddElements(el)}
                                onHide={() =>
                                    this.setState({
                                        visibleAddSpec: false,
                                    })
                                }
                                collapsed={this.props.collapsed}
                            />
                        ) : null}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };
    findSelectedRowFromPrevGrid() {
        const elements = this.state.parsedData
            .filter((el) => !StringUtils.isBlank(el.ID))
            .filter((el) => el._ID_PARENT === 0);
        if (elements.length === 1) {
            return elements[0];
        }
        return null;
    }
    cancelSpec = () => {
        this.blockUi();
        const viewIdArg = this.state.elementId;
        const parentIdArg = this.state.elementParentId;
        const ids = this.state.parsedData.map((el) => el._ID);
        this.setState({
            renderConfirmationEditQuitDialog: false,
        });
        this.editSpecService
            .cancel(viewIdArg, parentIdArg, ids)
            .then(() => {
                let prevUrl = window.location.href;
                prevUrl = prevUrl.replace('edit-spec', 'grid-view');
                prevUrl = UrlUtils.removeAndAddParam('parentId', UrlUtils.getURLParameter('prevParentId'), prevUrl);
                prevUrl = UrlUtils.removeAndAddParam('recordId', UrlUtils.getURLParameter('parentId'), prevUrl);
                prevUrl = UrlUtils.removeAndAddParam('bc', UrlUtils.getURLParameter('bc'), prevUrl);
                prevUrl = UrlUtils.deleteParameterFromURL(prevUrl, 'prevParentId');
                const selectedElementFromPrevGrid = this.findSelectedRowFromPrevGrid();
                if (selectedElementFromPrevGrid) {
                    prevUrl = UrlUtils.addParameterToURL(
                        prevUrl,
                        'selectedFromPrevGrid',
                        selectedElementFromPrevGrid.ID
                    );
                }
                window.location.href = prevUrl;
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    };

    handleEditRowChange(inputType, event, rowId, info) {}

    handleEditRowBlur(inputType, event, groupName, viewInfo, field) {
        ConsoleHelper(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        this.handleEditRowChange(inputType, event, groupName, viewInfo, field);
    }

    getMessages() {
        return this.messages;
    }
}

EditSpecContainer.defaultProps = {
    viewMode: 'VIEW',
};

EditSpecContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
};

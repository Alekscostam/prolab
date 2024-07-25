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
import TreeViewComponent from './treeGridView/TreeViewComponent';
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
import {StringUtils} from '../utils/StringUtils';
import ActionShortcutWithoutMenu from '../components/prolab/ActionShortcutWithoutMenu';
import SelectedElements from '../components/SelectedElements';
import { ResponseUtils } from '../utils/ResponseUtils';

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
            totalCounts: undefined,
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
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
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
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
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
                    const resView = {
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
                    this.processingViewResponse(resView, parentId, recordId, expandAll);
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
            const pluginsListTmp = ResponseUtils.pluginListCreate(responseView);
            const documentsListTmp = ResponseUtils.documentListCreate(responseView);
            const batchesListTmp = ResponseUtils.batchListCreate(responseView);
            const filtersListTmp = ResponseUtils.filtersListCreate(responseView);
            Breadcrumb.currentBreadcrumbAsUrlParam();
            this.setState(
                () => ({
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
                            TreeListUtils.createSelectionColumn(responseView.gridColumns[0].columns, data);
                            const columnsTmp = ResponseUtils.columnsFromGroupCreate(responseView);
                            this.setState(
                                {
                                    parsedView: responseView,
                                    viewInfo: responseView.viewInfo,
                                    columns: columnsTmp,
                                    totalCounts: res?.totalCount
                                },
                                () =>
                                    this.setState({
                                        loading: false,
                                        parsedData: data,
                                    })
                            );
                        })
                        .catch((ex) => {
                            this.showErrorMessages(ex);
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
                                            const parentId = UrlUtils.getParentId() || this.state.elementParentId;
                                            const recordId = UrlUtils.getRecordId() || this.state.elementRecordId;
                                            const breadCrumbs = UrlUtils.getBc();
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
                            <ActionButtonWithMenu
                                id={`button_batches_` + index}
                                className={`${margin}`}
                                iconName={operation?.iconCode || 'mdi-cogs'}
                                items={this.state.batchesList}
                                title={operation?.label}
                            />
                        </React.Fragment>
                    );
                case OperationType.OP_DOCUMENTS:
                    return (
                        <React.Fragment>
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
                case OperationType.OP_ADD_SPEC:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionShortcutWithoutMenu
                                    id='button_add_spec'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    operationType={OperationType.OP_ADD_SPEC}
                                    customEventClick={() => this.showAddSpecDialog()}
                                    title={operation?.label}
                                />
                            )}
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

    //override
    renderHeaderRight() {
        const operations = this.state?.parsedView?.operations;
        const opSave = DataGridUtils.getOpButton(operations, OperationType.OP_SAVE);
        const opCancel = DataGridUtils.getOpButton(operations, OperationType.OP_CANCEL);
        return (
            <React.Fragment>
                <div id='global-top-components'>
                    <ActionButton
                        rendered={!!opSave}
                        label={opSave?.label}
                        className='ml-2'
                        handleClick={() => {
                            this.handleSaveAction();
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
    handleSaveAction() {
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
    }
    handleAddElements = (elements) => {
        const addParsedView = (this.state.parsedData || []).concat(elements);
        TreeListUtils.removeLineColorGradient(addParsedView);
        TreeListUtils.paintDatas(addParsedView);
        this.setState(
            {
                parsedData: addParsedView,
                totalCounts: addParsedView.length
                 
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
        const operations = this.state?.parsedView?.operations || [];
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
                    operations={operations}
                    labels={this.props.labels}
                    leftContent={
                        <React.Fragment>
                            {operations.map((operation, index) => {
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
        let data = this.state?.parsedData;
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
        const el = data.find((x) => x._ID === id);
        if (el._STATUS === 'inserted') {
            const index = data.findIndex((x) => x._ID === id);
            if (index !== undefined) {
                data.splice(index, 1);
            }
        } else {
            el._STATUS = 'deleted';
        }
        data.filter((x) => x._ID_PARENT === el._ID).forEach((e) => {
            this.delete(e._ID);
        });
        return data;
    }
    //metoda przenosi rekord o poziom wyżej
    up(id) {
        const ref = this.refTreeList?.instance;
        let data = ref.getVisibleRows().map((el) => el.data);
        const currentIndex = data.findIndex((x) => x._ID === id);
        const currentElement = data.find((el) => el._ID === id);
        const cuttedArray = data.slice(0, currentIndex);
        let nextElement = undefined;
        for (let index = cuttedArray.length; index >= 0; index--) {
            const element = cuttedArray[index];
            if (this.haveTheSameParents(currentElement, element)) {
                nextElement = element;
                break;
            }
        }
        this.moveItem(id, currentElement, nextElement, data);
    }
    down(id) {
        const ref = this.refTreeList?.instance;
        let data = ref.getVisibleRows().map((el) => el.data);
        const currentIndex = data.findIndex((x) => x._ID === id);
        const currentElement = data.find((el) => el._ID === id);
        const cuttedArray = data.slice(currentIndex + 1);
        let nextElement = undefined;
        for (let index = 0; index < cuttedArray.length; index++) {
            const element = cuttedArray[index];
            if (this.haveTheSameParents(currentElement, element)) {
                nextElement = element;
                break;
            }
        }
        this.moveItem(id, currentElement, nextElement, data);
    }
    isTheSameElement(foundedElement, currentElement) {
        return foundedElement?._ID === currentElement?._ID;
    }
    moveItem(id, currentElement, nextElement, data) {
        if (nextElement) {
            if (!this.isTheSameElement(nextElement, currentElement)) {
                const currentIndex = data.findIndex((d) => d._ID === id);
                const currentOrder = currentElement._ORDER;
                const prevOrder = nextElement._ORDER;
                currentElement._ORDER = prevOrder;
                nextElement._ORDER = currentOrder;
                const prevIndex = data.findIndex((x) => x._ID === nextElement._ID);
                this.switchPositionOfElements(data, currentIndex, prevIndex);
                let concatData = [...new Set([...data, ...this.state.parsedData])];

                this.updateData(concatData, () => {
                    this.disableAllSort();
                    this.refreshTable();
                });
            }
        }
    }
    switchPositionOfElements(data, indexFirst, indexSecond) {
        const elementFirst = data[indexFirst];
        const elementSecond = data[indexSecond];
        data[indexFirst] = elementSecond;
        data[indexSecond] = elementFirst;
    }

    haveTheSameParents(child, parent) {
        return child?._ID_PARENT === parent?._ID_PARENT;
    }

    updateData(dataToUpdate, callbackAction) {
        this.setState({parsedData: dataToUpdate, totalCounts:dataToUpdate.filter(el=>el._STATUS !== "deleted").length}, () => {
            if (!!callbackAction) callbackAction();
        });
    }
    getMaxViewid() {}

    disableAllSort() {
        this.refTreeList?.instance?.clearSorting();
    }

    getLastId() {
        return this.state.parsedData.length === 0 ? 0 : Math.max(...this.state.parsedData.map((el) => el._ID));
    }

    refreshTable(callbackAction) {
        this.refTreeList?.instance?.refresh();
        if (!!callbackAction) callbackAction();
    }
    //override
    renderContent = () => {
        const parsedData = this.state?.parsedData?.filter((el) => el._STATUS !== 'deleted');
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
                                altAndLeftClickEnabled={true}
                                id={this.props.id}
                                onHideEditorCallback={() => this.forceUpdate()}
                                viewInfo={this.state.viewInfo}
                                handleSaveAction={() => this.handleSaveAction()}
                                addButtonFunction={() => this.showAddSpecDialog()}
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
                                onCloseEditList={() => this.forceUpdate()}
                                allowUpdating={true}
                                gridViewColumns={this.state.columns}
                                selectedRowKeys={this.state.selectedRowKeys}
                                onChange={(type, e, rowId, info) => this.handleEditRowChange(type, e, rowId, info)}
                                handleUnselectAll={() => this.unselectAllDataGrid()}
                                handleBlockUi={() => {
                                    this.blockUi();
                                    return true;
                                }}
                                handleUnblockUi={() => this.unblockUi()}
                                handleShowEditPanel={(editDataResponse) => this.handleShowEditPanel(editDataResponse)}
                                handleSelectedRowKeys={(e) => {
                                    this.setState({
                                        selectedRowKeys: e,
                                    });
                                }}
                                handleDeleteRow={(id) => this.delete(id)}
                                handleFormulaRow={(id) => this.prepareCalculateFormula(id)}
                                handleDownload={(id) => this.props.handleDownloadRow(id)}
                                handleAttachments={(id) => this.props.handleAttachmentRow(id)}
                                handleAddLevel={(id) => this.showAddSpecDialog(id)}
                                handleUp={(id) => this.up(id)}
                                handleDown={(id) => this.down(id)}
                                handleRestoreRow={(id) => this.restore(id)}
                                handleCopyRow={(id) => this.copyEntry(id)}
                                handleDocumentsRow={(id) => this.generate(id)}
                                handlePluginsRow={(id) => this.plugin(id)}
                                handleDownloadRow={(id) => this.downloadAttachment(id)}
                                handleAttachmentRow={(id) => this.attachment(id)}
                                handleArchiveRow={(id) => this.archive(id)}
                                handlePublishRow={(id) => this.publishEntry(id)}
                                showErrorMessages={(err) => this.showErrorMessages(err)}
                                labels={this.props.labels}
                            />
                            
                            <SelectedElements selectedRowKeys={this.state.selectedRowKeys} totalCounts={this.state.totalCounts}/>

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
                                onHide={() =>{
                                    this.setState({
                                        visibleAddSpec: false,
                                        levelId:undefined
                                    })}
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
        let elements = this.state?.parsedData || [];
        elements = this.state?.parsedData
            .filter((el) => !StringUtils.isBlank(el.ID))
            .filter((el) => el._ID_PARENT === 0);
        if (elements.length === 1) {
            return elements[0];
        }
        if (this.state?.elementParentId) {
            return {ID: this.state.elementParentId};
        }

        return null;
    }
    selectedFromPrevGridFnc = (prevUrl) => {
        const selectedElementFromPrevGrid = this.findSelectedRowFromPrevGrid();
        if (selectedElementFromPrevGrid) {
            return UrlUtils.addParameterToURL(prevUrl, 'selectedFromPrevGrid', selectedElementFromPrevGrid.ID);
        }
        return prevUrl;
    };
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
                if (!StringUtils.isBlank(UrlUtils.getPrevParentId())) {
                    prevUrl = UrlUtils.removeAndAddParam('parentId', UrlUtils.getPrevParentId(), prevUrl);
                    prevUrl = UrlUtils.removeAndAddParam('recordId', UrlUtils.getParentId(), prevUrl);
                    prevUrl = UrlUtils.removeAndAddParam('bc', UrlUtils.getBc(), prevUrl);
                    prevUrl = UrlUtils.deleteParameterFromURL(prevUrl, 'prevParentId');
                    prevUrl = this.selectedFromPrevGridFnc(prevUrl);
                } else {
                    prevUrl = this.selectedFromPrevGridFnc(prevUrl);
                    prevUrl = UrlUtils.deleteParameterFromURL(prevUrl, 'parentId');
                    prevUrl = UrlUtils.deleteParameterFromURL(prevUrl, 'recordId');
                    prevUrl = UrlUtils.deleteParameterFromURL(prevUrl, 'bc');
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

import React from 'react';
import PropTypes from 'prop-types';
import CrudService from '../../services/CrudService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import {TextBox, TreeList} from 'devextreme-react';
import {
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
    KeyboardNavigation,
    LoadPanel,
    Paging,
    Scrolling,
    Selection,
    Sorting,
} from 'devextreme-react/tree-list';
import {RemoteOperations} from 'devextreme-react/data-grid';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import ReactDOM from 'react-dom';
import OperationsButtons from '../../components/prolab/OperationsButtons';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import EditListDataStore from '../dao/DataEditListStore';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string';
import CellEditComponent from '../CellEditComponent';
import {StringUtils} from '../../utils/StringUtils';
import Image from '../../components/Image';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons';
import LocUtils from '../../utils/LocUtils';
import ActionButton from '../../components/ActionButton';
import {ColumnType} from '../../enum/ColumnType';
import {OperationType} from '../../enum/OperationType';
import {HtmlUtils} from '../../utils/HtmlUtils';
import {ViewDataCompUtils} from '../../utils/component/ViewDataCompUtils';
import UrlUtils from '../../utils/UrlUtils';
import {TranslationUtils} from '../../utils/TranslationUtils';
import {SelectedRowKeysUtils} from '../../utils/SelectedRowKeysUtils';
import {handleEdit} from '../../utils/handler/EditHandler';
import {cellRenderSpecial} from './TreeViewTemplate';

let clearSelection = false;

class TreeViewComponent extends CellEditComponent {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        this.selectionClicked = React.createRef(false);
        this.selectionCheckboxClicked = React.createRef(false);
        this.ref = React.createRef();
        this.menuRef = React.createRef();
        this.refDateTime = React.createRef();
        this.clickedPosition = React.createRef();
        this.modelRef = React.createRef([]);
        this.selectedRecordIdRef = React.createRef();
        this.editListDataStore = new EditListDataStore();
        this.sort = {
            field: '_ORDER',
            order: 'asc',
        };
        this.viewInfo = {
            headerId: undefined,
            type: undefined,
        };
        this.state = {
            editListVisible: false,
            editorDialogVisisble: false,
            groupExpandAll: this.props.parsedGridView?.gridOptions?.groupExpandAll || false,
            editListRecordId: null,
            expandedRowKeys: [],
            mode: 'cell',
            parsedGridView: {},
            operationsPPM: this.props.parsedGridView.operationsPPM || [],
            operations: this.props.parsedGridView.operations || [],
            parsedGridViewData: {},
            rowRenderingMode: 'standard',
            gridViewColumns: [],
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preInitializedColumns: [],
        };
        this.getSort = () => {
            return this.sort;
        };
        this.reInitilizedExpandAll = () => {
            this.expandRows();
        };
    }
    componentDidMount() {
        super.componentDidMount();
        this.manageKeydownEvent('remove');
        this.manageKeydownEvent('add');
        this.expandRows();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        return prevProps.id !== prevState.id && prevProps.elementRecordId !== prevState.elementRecordId;
    }
    shouldComponentUpdate() {
        const quitEditDialog = document.getElementById('quitEditDialog');
        if (quitEditDialog) {
            return false;
        }
        return true;
    }

    mergeKeysWithRecordId = (id) => {
        const selectedRowsKeys = SelectedRowKeysUtils.mergeKeysWithRecordId(
            id,
            this.ref.instance.getSelectedRowsData(),
            false,
            '_ID'
        );
        this.ref.instance.selectRows(selectedRowsKeys.map((el) => el._ID));
    };

    manageKeydownEvent(action) {
        const specEdit = document.getElementById('spec-edit');
        const allSpecEdit = document.querySelectorAll('#spec-edit');
        if (specEdit) {
            const method = action === 'add' ? 'addEventListener' : 'removeEventListener';
            if (this.props.isAddSpec) {
                if (allSpecEdit.length === 3) {
                    allSpecEdit[2][method]('mousedown', this.handleAltAndLeftClickFunction);
                } else if (UrlUtils.isGrid() && allSpecEdit.length === 1) {
                    allSpecEdit[0][method]('mousedown', this.handleAltAndLeftClickFunction);
                }
            } else {
                specEdit[method]('mousedown', this.handleAltAndLeftClickFunction);
            }
        }
    }

    componentWillUnmount() {
        clearSelection = false;
        this.viewInfo = {
            headerId: undefined,
            type: undefined,
        };
        this.manageKeydownEvent('remove');
    }
    findRowDataById(recordId) {
        const editData = this.props.parsedGridViewData.filter((item) => {
            return item._ID === recordId;
        });
        return editData[0];
    }
    currentEditListRow(recordId) {
        const currentEditListRow = this.props.parsedGridViewData.filter((item) => {
            return item._ID === recordId;
        });
        return currentEditListRow;
    }
    refreshComponent() {
        this.ref.instance.refresh();
    }
    isSpecialCell(columnDefinition) {
        const type = columnDefinition?.type;
        const validationEdit = columnDefinition?.validationEdit;
        if (!this.props.isAddSpec && !columnDefinition?.edit) {
            return true;
        }
        try {
            switch (type) {
                case ColumnType.H:
                case ColumnType.C:
                    if (this.showHintListButtons()) {
                        return true;
                    }
                    const isSpecial = !!validationEdit;
                    return isSpecial;
                case ColumnType.O:
                case ColumnType.I:
                case ColumnType.IM:
                    return true;
                default:
                    return false;
            }
        } catch (ex) {}
        return false;
    }

    onKeyDown = (e) => {
        if (e.event.key === 'ArrowUp' || e.event.key === 'ArrowDown') {
            e.component.closeEditCell();
            e.component.cancelEditData();
        }
    };
    // TODO: naprawic w liscie podpwoiedzi klik jak jestsmy na dole
    render() {
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = multiSelect === undefined || multiSelect === null || !!multiSelect;
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataTreeHeight = this.props.dataTreeHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = selectAll === undefined || selectAll === null || !!selectAll;
        const selectedRowKeys = this.props.selectedRowKeys;
        const kindView = this.props.elementKindView;
        const parentId = this.props.elementRecordId;
        const subViewId = this.props.elementSubViewId;
        const viewId = TreeListUtils.getRealViewId(subViewId, this.props.id);
        return (
            <React.Fragment>
                {this.state.editListVisible && this.editListComponent()}
                {this.editorComponent()}
                {this.imageViewerComponent()}
                <TreeList
                    id='spec-edit'
                    onContextMenuPreparing={(e) => {
                        if (this.props.showSelection && e?.row?.data?._ID) {
                            this.mergeKeysWithRecordId(e.row.data._ID);
                        }
                        this.selectedRecordIdRef.current = e?.row?.data?._ID;
                    }}
                    keyExpr='_ID'
                    className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                    ref={(ref) => {
                        this.ref = ref;
                        this.props.handleOnTreeList(this.ref);
                    }}
                    onKeyDown={(e) => {
                        this.onKeyDown(e);
                    }}
                    onExpandedRowKeysChange={(e) => this.setState({expandedRowKeys: e})}
                    expandedRowKeys={this.state.expandedRowKeys}
                    focusedRowEnabled={true}
                    hoverStateEnabled={this.props.hoverStateEnabled}
                    autoNavigateToFocusedRow={false}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this.postCustomizeColumns}
                    wordWrapEnabled={rowAutoHeight}
                    columnAutoWidth={columnAutoWidth}
                    columnResizingMode='widget'
                    repaintChangesOnly={true}
                    onOptionChanged={(e) => {
                        if (e.fullName.includes('filterValue') && e.name === 'columns') {
                            if (this.ref) {
                                this.ref.instance.clearSelection();
                                clearSelection = true;
                            }
                        }
                        if (e.fullName.includes('sortOrder') && e.name === 'columns') {
                            const colNumber = e.fullName.replace(/\D/g, '');
                            const column = this.props.gridViewColumns[colNumber];
                            this.sort = {
                                field: column.fieldName,
                                order: e.value,
                            };
                        }
                    }}
                    onRowClick={(e) => {
                        this.currentClickedCell.current = e.data.ID;
                    }}
                    onFocusedRowChanging={(e) => {
                        if (e.rows[e.newRowIndex]?.data) {
                            this.currentClickedCell.current = e.rows[e.newRowIndex].data._ID;
                        }
                    }}
                    onContentReady={(e) => {
                        const editListDialog = document.getElementById('editListDialog');
                        if (!editListDialog) {
                            this.rerenderRows(e);
                            return;
                        }
                        if (editListDialog.classList.contains('p-dialog-exit-active')) {
                            this.rerenderRows(e);
                            return;
                        }
                        if (editListDialog.classList.contains('p-dialog-enter-done')) {
                            this.rerenderRows(e);
                            return;
                        }
                    }}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    showColumnLines={showColumnLines}
                    showRowLines={showRowLines}
                    showBorders={showBorders}
                    showColumnHeaders={showColumnHeaders}
                    columnHidingEnabled={false}
                    height={dataTreeHeight ? dataTreeHeight + 'px' : '100%'}
                    width={columnAutoWidth ? '100%' : undefined}
                    rowAlternationEnabled={false}
                    selectedRowKeys={selectedRowKeys}
                    onSelectionChanged={(e) => {
                        this.props.handleSelectedRowKeys(e.selectedRowKeys, this.rerenderColorCheckboxIfPossible());
                    }}
                    renderAsync={true}
                    selectAsync={false}
                    cacheEnabled={true}
                    rootValue={0}
                    parentIdExpr='_ID_PARENT'
                    onCellClick={(e) => {
                        if (e?.column?.ownOnlySelectList) {
                            if (!StringUtils.isBlank(e.data._ID)) {
                                this.editListVisible(e.data._ID, e.column.ownFieldId);
                            }
                        }
                    }}
                >
                    <KeyboardNavigation
                        editOnKeyPress={true}
                        enterKeyAction={'moveFocus'}
                        enterKeyDirection={'column'}
                    />
                    <Editing allowUpdating={this.props.allowUpdating} mode={this.state.mode} />
                    <RemoteOperations
                        filtering={false}
                        summary={false}
                        sorting={false}
                        paging={false}
                        grouping={false}
                        groupPaging={false}
                    />
                    <Paging enabled={true} defaultPageSize={25} defaultPageIndex={0} />
                    <FilterRow visible={showFilterRow} applyFilter={true} />
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />
                    <Sorting mode='multiple' />
                    <Selection
                        mode={showSelection ? (multiSelection ? 'multiple' : 'single') : 'none'}
                        selectAllMode='allPages'
                        showCheckBoxesMode='always'
                        allowSelectAll={allowSelectAll}
                    />
                    <Scrolling
                        mode='virtual'
                        useNative={false}
                        scrollByContent={true}
                        scrollByThumb={true}
                        showScrollbar='always'
                        visible={true}
                        rowRenderingMode={this.props.rowRenderingMode}
                        preloadEnabled={this.props.preloadEnabled}
                    />
                    <Selection
                        mode={'multiple'}
                        selectAllMode='allPages'
                        showCheckBoxesMode='always'
                        allowSelectAll={allowSelectAll}
                        deferred={this.props.selectionDeferred}
                    />
                    <LoadPanel
                        enabled={this.props.isAddSpec ? true : false}
                        showIndicator={this.props.isAddSpec ? true : false}
                        shadingColor='rgba(0,0,0,0.4)'
                        showPane={false}
                        position='absolute'
                    />
                    {this.preGenerateColumnsDefinition()}
                </TreeList>
                {this.props.parsedGridView?.operationsPPM && this.props.parsedGridView.operationsPPM.length !== 0 && (
                    <MenuWithButtons
                        target='.dx-row.dx-data-row.dx-row-lines.dx-column-lines'
                        menuRef={this.menuRef}
                        gridView={this.props.parsedGridView}
                        handlePlugins={(e) => this.preOperationAction(e, () => this.props.handlePluginRow(e.id))}
                        handleDocuments={(e) => this.preOperationAction(e, () => this.props.handleDocumentRow(e.id))}
                        handleSaveAction={(e) => this.preOperationAction(e, () => this.props.handleSaveAction())}
                        handleAddSpecCount={(e) => this.props.handleAddSpecCount()}
                        handleAddSpecSpec={(e) => this.props.handleAddSpecSpec(this.selectedRecordIdRef.current)}
                        handleExecSpec={(e) => this.preOperationAction(e, () => this.props.handleExecSpec())}
                        handleAddSpec={() => this.props.addButtonFunction()}
                        handleHrefSubview={() => this.handleHrefSubview(viewId, this.selectedRecordIdRef.current)}
                        handleEdit={(e) =>
                            this.preOperationAction(e, () =>
                                this.handleEdit(viewId, parentId, kindView, this.selectedRecordIdRef.current)
                            )
                        }
                        handlePreview={(e) =>
                            this.preOperationAction(e, () =>
                                this.handlePreview(viewId, parentId, kindView, this.selectedRecordIdRef.current)
                            )
                        }
                        handleEditSpec={() => this.handleEditSpec(viewId, parentId, this.selectedRecordIdRef.current)}
                        handleCopy={(e) => this.preOperationAction(e, () => this.props.handleCopyRow())}
                        handleArchive={(e) => this.preOperationAction(e, () => this.props.handleArchiveRow())}
                        handlePublish={(e) => this.preOperationAction(e, () => this.props.handlePublishRow())}
                        handleDownload={(e) => this.preOperationAction(e, () => this.props.handleDownloadRow())}
                        handleAttachments={(e) => this.preOperationAction(e, () => this.props.handleAttachmentRow())}
                        handleDelete={(e) => this.preOperationAction(e, () => this.props.handleDeleteRow())}
                        handleRestore={(e) => this.preOperationAction(e, () => this.props.handleRestoreRow())}
                        handleFormula={(e) => this.preOperationAction(e, () => this.props.handleFormulaRow())}
                        handleHistory={(e) => this.preOperationAction(e, () => this.props.handleHistoryLogRow())}
                        handleFill={(e) => this.preOperationAction(e, () => this.props.handleFillRow())}
                        handleExpand={(e) => this.preOperationAction(e, () => this.handleExpand())}
                        handleCollapse={(e) => this.preOperationAction(e, () => this.handleCollapse())}
                        handleCheck={(e) => this.preOperationAction(e, () => this.handleCheck())}
                        handleUncheck={(e) => this.preOperationAction(e, () => this.handleUncheck())}
                        handleUp={(e) => this.preOperationAction(e, () => this.props.handleUp())}
                        handleDown={(e) => this.preOperationAction(e, () => this.props.handleDown())}
                        handleAddLevel={(e) =>
                            this.preOperationAction(e, () =>
                                this.props.handleAddLevel(this.selectedRecordIdRef.current)
                            )
                        }
                        operationList={this.props.parsedGridView.operationsPPM}
                    />
                )}
            </React.Fragment>
        );
    }

    preOperationAction = (operation, callback, recordId = this.selectedRecordIdRef.current) => {
        const refInstance = this.ref.instance;
        if (refInstance) {
            refInstance.closeEditCell();
            refInstance.cancelEditData();
        }
        const onlyOneRecord = operation?.onlyOneRecord;
        if (onlyOneRecord) {
            if (this.props.handleSelectedRowKeys) {
                this.props.handleSelectedRowKeys([recordId], () => {
                    if (callback) {
                        callback();
                    }
                });
            }
        } else callback();
    };

    handleExpand(recordId) {
        const parentId = recordId === undefined ? this.selectedRecordIdRef.current : recordId;
        const rowKeysToExpand = TreeListUtils.findAllDescendants(this.props.parsedGridViewData, parentId).map(
            (el) => el._ID
        );
        rowKeysToExpand.push(parentId);
        const concatData = [...new Set([...rowKeysToExpand, ...this.state.expandedRowKeys])];
        this.setState({
            expandedRowKeys: concatData,
        });
    }
    handleCollapse(recordId) {
        const parentId = recordId === undefined ? this.selectedRecordIdRef.current : recordId;
        const rowKeysToCollapse = TreeListUtils.findAllDescendants(this.props.parsedGridViewData, parentId).map(
            (el) => el._ID
        );
        rowKeysToCollapse.push(parentId);
        const concatData = this.state.expandedRowKeys.filter((element) => !rowKeysToCollapse.includes(element));
        this.setState({
            expandedRowKeys: concatData,
        });
    }
    expandRows = () => {
        if (this.state.groupExpandAll) {
            const expandedRowKeys = this.props.parsedGridViewData.map((el) => el._ID);
            this.setState(
                {
                    expandedRowKeys: expandedRowKeys,
                },
                () => {
                    this.rerenderColorCheckboxIfPossible();
                }
            );
        }
    };
    handleAltAndLeftClickFunction = (event) => {
        if (this.props.altAndLeftClickEnabled && event.button === 0 && event.altKey) {
            setTimeout(() => {
                if (this.currentClickedCell.current) {
                    if (HtmlUtils.clickedInsideComponent(event, 'spec-edit')) {
                        if (this.ref) {
                            const clickedCell = parseInt(this.currentClickedCell.current);
                            const treeRef = this.ref.instance;
                            let selectedRows = this.ref.instance.getSelectedRowsData().map((selectedRow) => {
                                return {ID: parseInt(selectedRow.ID)};
                            });
                            if (selectedRows.find((row) => row.ID === clickedCell))
                                selectedRows = selectedRows.filter((selectedRow) => selectedRow.ID !== clickedCell);
                            else selectedRows.push({ID: clickedCell});
                            treeRef.selectRows(selectedRows.map((el) => el.ID));
                        }
                    }
                }
            }, 0);
        }
    };

    handleCheck(recordId) {
        const parentId = recordId === undefined ? this.selectedRecordIdRef.current : recordId;
        const tree = this.props.parsedGridViewData;
        const descendants = TreeListUtils.findAllDescendants(tree, parentId);
        const selectedRowsData = this.ref.instance.getSelectedRowsData();
        descendants.push(tree.find((el) => el._ID === parentId));
        descendants.forEach((item2) => {
            if (!selectedRowsData.some((item1) => item1._ID === item2._ID)) {
                selectedRowsData.push(item2);
            }
        });
        this.ref.instance.selectRows(selectedRowsData.map((el) => el._ID));
    }
    handleUncheck(recordId) {
        const parentId = recordId === undefined ? this.selectedRecordIdRef.current : recordId;
        const tree = this.props.parsedGridViewData;
        const descendants = TreeListUtils.findAllDescendants(tree, parentId);
        let selectedRowsData = this.ref.instance.getSelectedRowsData();
        descendants.push(tree.find((el) => el._ID === parentId));
        const isParentAlreadySelected = selectedRowsData.find((el) => {
            return el._ID === parentId;
        });
        if (isParentAlreadySelected) {
            descendants.forEach((item2) => {
                if (selectedRowsData.some((item1) => item1._ID === item2._ID)) {
                    selectedRowsData = selectedRowsData.filter((item) => item._ID !== item2._ID);
                }
            });
        }
        this.ref.instance.selectRows(selectedRowsData.map((el) => el._ID));
    }
    handleHrefSubview(viewId, recordId) {
        const parentId = StringUtils.isBlank(this.props.elementRecordId) ? 0 : this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const result = this.props.handleBlockUi();
        if (result) {
            let newUrl = AppPrefixUtils.locationHrefUrl(
                `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}&parentId=${parentId}${
                    !!currentBreadcrumb ? currentBreadcrumb : ``
                }`
            );
            window.location.assign(newUrl);
        }
    }
    handlePreview(viewId, parentId, kindView, recordId) {
        handleEdit(viewId, parentId, kindView, recordId, true);
    }
    handleEdit(viewId, parentId, recordId, kindView, readOnly = false) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
            TreeListUtils.openEditSpec(
                viewId,
                parentId,
                [recordId],
                () => this.props.handleUnblockUi(),
                (err) => this.props.showErrorMessages(err)
            );
        } else {
            let result = this.props.handleBlockUi();
            if (result) {
                handleEdit(
                    this.crudService,
                    viewId,
                    recordId,
                    parentId,
                    kindView,
                    (editDataResponse) =>
                        this.setState({editData: editDataResponse}, () =>
                            this.props.handleShowEditPanel(editDataResponse)
                        ),
                    this.props.handleUnblockUi,
                    this.props.showErrorMessages,
                    readOnly
                );
            }
        }
    }
    handleEditSpec(viewId, parentId, recordId) {
        const prevUrl = window.location.href;
        sessionStorage.setItem('prevUrl', prevUrl);
        TreeListUtils.openEditSpec(
            viewId,
            parentId,
            [recordId],
            () => this.props.handleUnblockUi(),
            (err) => this.props.showErrorMessages(err)
        );
    }
    rerenderRows(e) {
        const rowDatas = e.component.getVisibleRows();
        this.paintLineIfPossible(rowDatas);
        if (clearSelection) {
            this.props.handleUnselectAll();
            clearSelection = false;
        }
    }
    shouldBeRepainting = () => {
        const {info} = this.props.parsedGridView;
        return this.props.isAddSpec && info?.header === false;
    };
    rerenderColorCheckboxIfPossible = () => {
        if (this.shouldBeRepainting()) {
            setTimeout(() => {
                if (this.ref?.instance) {
                    const rowDatas = this.ref.instance.getVisibleRows();
                    this.paintLineIfPossible(rowDatas);
                }
            }, 10);
        }
    };

    // ovverated
    afterValidatorExecute(cellValidator, value, withMessage) {
        if (this.props.afterFinishEditCell) {
            this.props.afterFinishEditCell(cellValidator, value, withMessage);
        }
    }

    postCustomizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            columns
                .filter((column) => column.visible === true || column?.name === '_ORDER')
                ?.forEach((column) => {
                    if (column.name === '_ROWNUMBER') {
                        column.visible = false;
                    } else {
                        const columnDefinition = this.matchColumnDefinitionByFieldName(column.dataField);
                        if (columnDefinition) {
                            column.visible = columnDefinition?.visible;
                            column.allowFiltering = columnDefinition?.isFilter;
                            column.allowFixing = true;
                            column.allowGrouping = columnDefinition?.isGroup;
                            column.allowReordering = true;
                            column.allowResizing = true;
                            column.allowSorting = columnDefinition?.isSort;
                            column.visibleIndex = columnDefinition?.columnOrder;
                            if (columnDefinition.disabledEditing) {
                                column.allowEditing = false;
                            }
                            this.fillOrderColumn(column, columnDefinition);
                            column.headerId =
                                'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                            column.width = this.getColumnWidth(columnDefinition);
                            column.name = columnDefinition?.fieldName;
                            column.caption = columnDefinition?.label;
                            column.dataType = TreeListUtils.specifyColumnType(columnDefinition?.type);
                            column.format = TreeListUtils.specifyColumnFormat(columnDefinition?.type);
                            column.fixed =
                                columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
                                    ? columnDefinition?.freeze?.toLowerCase() === 'left' ||
                                      columnDefinition?.freeze?.toLowerCase() === 'right'
                                    : false;
                            column.fixedPosition = !!columnDefinition.freeze
                                ? columnDefinition.freeze?.toLowerCase()
                                : null;
                            column.renderAsync = false;
                            column.ownType = columnDefinition?.type;
                            column.ownFieldId = columnDefinition?.id;
                            column.ownFieldName = columnDefinition?.fieldName;
                            column.ownOnlySelectList =
                                columnDefinition?.edit === false && columnDefinition?.selectionList === true;
                            INDEX_COLUMN++;
                        } else {
                            column.visible = false;
                        }
                    }
                });
            let operationsRecord = this.props.parsedGridView?.operationsRecord;
            let operationsRecordList = this.props.parsedGridView?.operationsRecordList;
            if (!(operationsRecord instanceof Array)) {
                operationsRecord = [];
                operationsRecord.push(this.props.parsedGridView?.operationsRecord);
            }
            if (operationsRecord[0] || (operationsRecordList instanceof Array && operationsRecordList.length > 0)) {
                if (
                    operationsRecord instanceof Array &&
                    (operationsRecord.length > 0 || operationsRecordList.length > 0)
                ) {
                    columns?.push({
                        id: 'OP_COLUMN',
                        caption: '',
                        fixed: true,
                        headerCellTemplate: (element) => {
                            element.offsetParent.style.alignItems = 'center';
                            element.offsetParent.style.justifyContent = 'center';
                            element.offsetParent.style.display = 'flex';
                            if (this.props?.addButtonFunction) {
                                ReactDOM.render(this.addButton(), element);
                            }
                            return;
                        },
                        width: this.props.isAddSpec
                            ? 43
                            : ViewDataCompUtils.operationsColumnLength(
                                  operationsRecord,
                                  operationsRecordList,
                                  this.addButtonExists()
                              ),
                        fixedPosition: 'right',
                        cellTemplate: (element, info) => {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            const subViewId = this.props.elementSubViewId;
                            const kindView = this.props.elementKindView;
                            const recordId = info.row?.data?._ID;
                            const parentId = this.props.elementRecordId;
                            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                            let viewId = this.props.id;
                            viewId = TreeListUtils.getRealViewId(subViewId, viewId);
                            ReactDOM.render(
                                <div style={{textAlign: 'center', display: 'flex', maxWidth: '20px!important'}}>
                                    <OperationsButtons
                                        labels={this.labels}
                                        operations={operationsRecord}
                                        operationList={operationsRecordList}
                                        info={info}
                                        handleEdit={(e) => {
                                            this.preOperationAction(
                                                e,
                                                () => this.handleEdit(viewId, parentId, recordId, kindView),
                                                recordId
                                            );
                                        }}
                                        handlePreview={(e) => {
                                            this.preOperationAction(
                                                e,
                                                () => this.handlePreview(viewId, parentId, recordId, kindView),
                                                recordId
                                            );
                                        }}
                                        handleEditSpec={() => {
                                            this.handleEditSpec(viewId, parentId, recordId);
                                        }}
                                        hrefSubview={AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${
                                                !!currentBreadcrumb ? currentBreadcrumb : ``
                                            }`
                                        )}
                                        hrefSpecView={EditSpecUtils.editSpecUrl(viewId, parentId, compress([recordId]))}
                                        handleHrefSubview={(e) => this.handleHrefSubview(viewId, recordId)}
                                        handleAddSpecSpec={(e) => this.props.handleAddSpecSpec(recordId)}
                                        handleArchive={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleArchiveRow(recordId),
                                                recordId
                                            )
                                        }
                                        handlePublish={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handlePublish(recordId),
                                                recordId
                                            )
                                        }
                                        handleDownload={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDownloadRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleAttachments={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleAttachmentRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleCopy={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleCopyRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleDelete={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDeleteRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleRestore={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleRestoreRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleDocuments={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDocumentRow(e.id, recordId),
                                                recordId
                                            )
                                        }
                                        handlePlugins={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handlePluginRow(e.id, recordId),
                                                recordId
                                            )
                                        }
                                        handleFormula={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleFormulaRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleHistory={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleHistoryLogRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleUp={(e) =>
                                            this.preOperationAction(e, () => this.props.handleUp(recordId), recordId)
                                        }
                                        handleDown={(e) =>
                                            this.preOperationAction(e, () => this.props.handleDown(recordId), recordId)
                                        }
                                        handleAddLevel={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleAddLevel(recordId),
                                                recordId
                                            )
                                        }
                                        handleExpand={(e) =>
                                            this.preOperationAction(e, () => this.handleExpand(recordId), recordId)
                                        }
                                        handleCollapse={(e) =>
                                            this.preOperationAction(e, () => this.handleCollapse(recordId), recordId)
                                        }
                                        handleCheck={(e) =>
                                            this.preOperationAction(e, () => this.handleCheck(recordId), recordId)
                                        }
                                        handleUncheck={(e) =>
                                            this.preOperationAction(e, () => this.handleUncheck(recordId), recordId)
                                        }
                                        handleBlockUi={(e) => this.props.handleBlockUi()}
                                    />
                                </div>,
                                element
                            );
                        },
                    });
                }
            }
        } else {
            //when no data
            this.props.gridViewColumns.forEach((columnDefinition) => {
                if (columnDefinition.visible === true) {
                    let column = {};
                    column.allowFiltering = false;
                    column.allowFixing = false;
                    column.allowGrouping = false;
                    column.allowSorting = false;
                    column.width = columnDefinition?.width;
                    column.name = columnDefinition?.fieldName;
                    column.caption = columnDefinition?.label;
                    columns.push(column);
                }
            });
        }
    };

    fillOrderColumn = (column, columnDefinition) => {
        if (column?.name === '_ORDER') {
            column.sortOrder = columnDefinition.sortOrder;
            column.sortIndex = columnDefinition.sortIndex;
            column.visible = columnDefinition.visible;
        }
    };

    getColumnWidth = (columnDefinition) => {
        const downFill = columnDefinition?.downFill ? 45 : 0;
        const selectionList = columnDefinition?.selectionList ? 45 : 0;
        let width = columnDefinition?.width || 100;
        if (this.showHintListButtons()) {
            width = parseInt(width) + downFill + selectionList;
        }
        return width;
    };
    addButton() {
        return (
            this.addButtonExists() && (
                <ActionButton
                    rendered={true}
                    label={LocUtils.locFromStoreWithDefault('Add_button', 'Dodaj')}
                    handleClick={(e) => {
                        this.props.addButtonFunction();
                    }}
                />
            )
        );
    }
    addButtonExists() {
        const operations = this.state.operations;
        const opAddFile = !!TranslationUtils.getOpButton(operations, OperationType.OP_ADD_SPEC_BUTTON);
        return !!opAddFile;
    }
    onHideImageCallBack() {
        const rowDatas = this.ref.instance.getVisibleRows();
        this.paintLineIfPossible(rowDatas);
    }
    onHideEditorCallback() {
        if (this.props.onHideEditorCallback) {
            this.props.onHideEditorCallback();
        }
    }
    isWart(dataField) {
        if (dataField) {
            return dataField.toUpperCase() === 'WART';
        }
        return false;
    }

    preGenerateColumnsDefinition() {
        let columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            const editable = columnDefinition?.edit;
            columns.push(
                <Column
                    key={INDEX_COLUMN}
                    sortOrder={sortOrder}
                    allowReordering={true}
                    dataField={columnDefinition?.fieldName}
                    sortIndex={columnDefinition?.sortIndex}
                    allowEditing={editable || columnDefinition?.selectionList}
                    cellRender={
                        this.isSpecialCell(columnDefinition)
                            ? (cellInfo, cd) =>
                                  cellRenderSpecial(
                                      cellInfo,
                                      columnDefinition,
                                      this.props.keyExistsInInvalidCellKeys,
                                      () => this.onOperationCellClick(cellInfo, columnDefinition)
                                  )
                            : undefined
                    }
                    editCellRender={(cellInfo) =>
                        this.editCellRender(cellInfo, columnDefinition, () => {
                            this.onOperationCellClick(cellInfo, columnDefinition);
                        })
                    }
                />
            );
        });
        return columns;
    }

    onOperationCellClick = (cellInfo, columnDefinition) => {
        switch (columnDefinition.type) {
            case ColumnType.C:
                this.editListVisible(cellInfo.row?.data?._ID, columnDefinition.id);
                break;
            case ColumnType.L:
            case ColumnType.B:
                this.forceUpdate();
                break;
            default:
                break;
        }
    };

    cColumnTypeRender(cellInfo, fontColorFinal, bgColorFinal, className) {
        const keyExistsInInvalidCellKeys = this.props.keyExistsInInvalidCellKeys
            ? this.props.keyExistsInInvalidCellKeys(cellInfo.key, cellInfo?.column?.dataField)
            : false;
        if (!keyExistsInInvalidCellKeys) {
            try {
                return (
                    <div
                        className={this.isWart(cellInfo?.column?.dataField) ? 'WART' : className}
                        style={{
                            color: fontColorFinal,
                            background: bgColorFinal,
                        }}
                        dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                    />
                );
            } catch (err) {
                ConsoleHelper('Error render htmloutput. Exception=', err);
            }
        } else {
            try {
                return (
                    <TextBox
                        className='tex-box-view-field-invalid'
                        mode={'text'}
                        isValid={false}
                        validationMessagePosition='left'
                        defaultValue={cellInfo?.text}
                        stylingMode={'filled'}
                        valueChangeEvent={'keyup'}
                    ></TextBox>
                );
            } catch (err) {
                ConsoleHelper('Error render htmloutput. Exception=', err);
            }
        }
    }

    waitForSuccess() {
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    matchColumnDefinitionByFieldName(columnDataField) {
        const columnDefinitionArray = this.props.gridViewColumns?.filter(
            (value) => value.fieldName?.toUpperCase() === columnDataField?.toUpperCase()
        );
        return columnDefinitionArray[0];
    }
    // doklejamy style
    paintLineIfPossible = (datas) => {
        const elements = Array.from(document.querySelectorAll('td[aria-describedby=column_0_selection-fixed]')).filter(
            (el) => el.className !== 'dx-editor-cell'
        );
        if (elements.length - datas.length) {
            const differenceInLength = elements.length - datas.length;
            for (let index = 0; index < differenceInLength; index++) {
                elements.shift();
            }
        }
        Array.from(elements).forEach((row, elementIndex) => {
            datas.forEach((idata, dataIndex) => {
                if (elementIndex === dataIndex) {
                    const gradients = idata.data?._LINE_COLOR_GRADIENT;
                    if (gradients) {
                        if (!(row.children.length > gradients.length + 1)) {
                            if (gradients.length !== 1) {
                                gradients.forEach((el) => {
                                    const divElement = document.createElement('div');
                                    const classLine = 'line-treelist-' + el;
                                    divElement.classList.add(classLine);
                                    divElement.classList.add('line-treelist');
                                    row.appendChild(divElement);
                                });
                            }
                        }
                    }
                }
            });
        });
    };
}

TreeViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    focusedRowEnabled: false,
    rowRenderingMode: 'standard',
    hoverStateEnabled: false,
    preloadEnabled: true,
    showFilterRow: true,
    showSelection: true,
    isAddSpec: false,
    allowUpdating: false,
    allowSelectAll: true,
    addButton: undefined,
};

TreeViewComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    elementParentId: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    elementRecordId: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    parsedGridView: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    parsedGridViewData: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    gridViewColumns: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    selectedRowKeys: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    onChange: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    onBlur: PropTypes.func,
    handleOnTreeList: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    handleSelectedRowKeys: PropTypes.func,
    addButton: PropTypes.object,
    handleArchiveRow: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    handleDownloadRow: PropTypes.func.isRequired,
    handleAttachmentRow: PropTypes.func.isRequired,
    handleAttachments: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired, //other
    handleAddLevel: PropTypes.func.isRequired,
    handleUp: PropTypes.func.isRequired,
    handleDown: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    handleAddSpecSpec: PropTypes.func,
    keyExistsInInvalidCellKeys: PropTypes.func,
    afterFinishEditCell: PropTypes.func,
    handleUnselectAll: PropTypes.func,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    preloadEnabled: PropTypes.bool,
    rowRenderingMode: PropTypes.string,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
    isAddSpec: PropTypes.bool,
    dataTreeHeight: PropTypes.number,
    allowSelectAll: PropTypes.bool,
    allowUpdating: PropTypes.bool,
};

export default TreeViewComponent;

import React from 'react';
import PropTypes from 'prop-types';
import CrudService from '../../services/CrudService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import {TreeList} from 'devextreme-react';
import {
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
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
import EntryResponseUtils from '../../utils/EntryResponseUtils';
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
import {ColumnType} from '../../model/ColumnType';
import {OperationType} from '../../model/OperationType';
import {DataGridUtils} from '../../utils/component/DataGridUtils';

let clearSelection = false;

class TreeViewComponent extends CellEditComponent {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        this.selectionClicked = React.createRef(false);
        this.selectionCheckboxClicked = React.createRef(false);
        this.ref = React.createRef();
        this.refDateTime = React.createRef();
        this.menu = React.createRef();
        this.modelRef = React.createRef([]);
        this.selectedRecordIdRef = React.createRef();
        this.editListDataStore = new EditListDataStore();
        this.viewInfo = {
            headerId: undefined,
            type: undefined,
        };
        this.state = {
            initializedExpandAll: this.props?.initializedExpandAll,
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
            rowRenderingMode: this.props.parsedGridView?.gridOptions?.groupExpandAll ? 'standard' : 'virtual',
            gridViewColumns: [],
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preInitializedColumns: [],
        };
        this.reInitilizedExpandAll = () => {
            this.setState(
                {
                    initializedExpandAll: false,
                },
                () => this.expandRows()
            );
        };
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('update --> treelist');
        return prevProps.id !== prevState.id && prevProps.elementRecordId !== prevState.elementRecordId;
    }
    shouldComponentUpdate() {
        const quitEditDialog = document.getElementById('quitEditDialog');
        if (quitEditDialog) {
            return false;
        }
        return true;
    }

    showMenu(e) {
        const menu = this.menu.current;
        if (menu !== null && e.row.rowType === 'data' && !!e?.row?.data?._ID) {
            const mouseX = e.event.clientX;
            const mouseY = e.event.clientY;
            e.event.stopPropagation();
            e.event.preventDefault();
            this.selectedRecordIdRef.current = e.row.data._ID;
            menu.show(e.event);
            const menuWithButtons = document.getElementById('menu-with-buttons');
            if (menuWithButtons) {
                menuWithButtons.style.left = mouseX + 'px';
                menuWithButtons.style.top = mouseY + 'px';
            }
        } else if (menu !== null && e.row.rowType === 'data') {
            menu.hide(e.event);
        }
    }

    componentWillUnmount() {
        clearSelection = false;
        this.viewInfo = {
            headerId: undefined,
            type: undefined,
        };
    }
    findRowDataById(recordId) {
        let editData = this.props.parsedGridViewData.filter((item) => {
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
    isSpecialCell(columnDefinition) {
        const type = columnDefinition?.type;

        try {
            switch (type) {
                case ColumnType.H:
                case ColumnType.C:
                    return columnDefinition.fieldName.toUpperCase() === 'WART';
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
    getAllRowsId() {
        return this.props.parsedGridViewData.map((el) => el._ID);
    }

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
        //myk zeby nie pojawiałą sie ramka tabelki przy wczytywaniu
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataTreeHeight = this.props.dataTreeHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = selectAll === undefined || selectAll === null || !!selectAll;
        const selectedRowKeys = this.props.selectedRowKeys;

        const kindView = this.props.elementKindView;
        const parentId = this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        let viewId = this.props.id;
        const subViewId = this.props.elementSubViewId;
        viewId = TreeListUtils.getRealViewId(subViewId, viewId);
        const selectedRecordId = this.selectedRecordIdRef.current;

        return (
            <React.Fragment>
                {this.state.editListVisible && this.editListComponent()}
                {this.state.editorDialogVisisble && this.editorComponent()}
                {this.imageViewerComponent()}
                <TreeList
                    id='spec-edit'
                    onContextMenuPreparing={(e) => {
                        this.showMenu(e);
                    }}
                    keyExpr='_ID'
                    className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                    ref={(ref) => {
                        this.ref = ref;
                        this.props.handleOnTreeList(this.ref);
                    }}
                    onExpandedRowKeysChange={(e) => this.setState({expandedRowKeys: e})}
                    expandedRowKeys={this.state.expandedRowKeys}
                    focusedRowEnabled={false}
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
                    }}
                    onContentReady={(e) => {
                        const editListDialog = document.getElementById('editListDialog');
                        this.expandRows();
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
                    onCellPrepared={(e) => {
                        if (e.rowType === 'data') {
                            let preInitializedColumns = this.state.preInitializedColumns.find(
                                (el) => el.columnIndex === e.columnIndex && el.editable === false
                            );
                            if (preInitializedColumns) {
                                e.cellElement.classList.add('disabled-background');
                            }
                        }
                    }}
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
                    <Editing allowUpdating={this.props.allowUpdating} mode={this.state.mode} />
                    <RemoteOperations
                        filtering={false}
                        summary={false}
                        sorting={false}
                        paging={false}
                        grouping={false}
                        groupPaging={false}
                    />
                    <Paging enabled={true} defaultPageSize={25} defaultPageIndex={1} />
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
                        showPane={this.props.isAddSpec ? true : false}
                        position='absolute'
                    />
                    {this.preGenerateColumnsDefinition()}
                </TreeList>
                {this.props.parsedGridView?.operationsPPM && this.props.parsedGridView.operationsPPM.length !== 0 && (
                    <MenuWithButtons
                        handleSaveAction={() => this.props.handleSaveAction()}
                        handleAddSpecCount={() => this.props.handleAddSpecCount()}
                        handleAddSpecSpec={() => this.props.handleAddSpecSpec(selectedRecordId)}
                        handleExecSpec={() => this.props.handleExecSpec()}
                        handleAddSpec={() => this.props.addButtonFunction()}
                        handleHrefSubview={() => this.handleHrefSubview(viewId, selectedRecordId, currentBreadcrumb)}
                        handleEdit={() =>
                            this.handleEdit(viewId, parentId, kindView, selectedRecordId, currentBreadcrumb)
                        }
                        handleEditSpec={() =>
                            this.handleEditSpec(viewId, parentId, selectedRecordId, currentBreadcrumb)
                        }
                        handleCopy={() => this.props.handleCopyRow(selectedRecordId)}
                        handleArchive={() => this.props.handleArchiveRow(selectedRecordId)}
                        handlePublish={() => this.props.handlePublishRow(selectedRecordId)}
                        handleDocumentsSk={(el) => this.props.handleDocumentRow(el.id)}
                        handleDocuments={() => this.props.handleDocumentRow(selectedRecordId)}
                        handlePluginsSk={(el) => this.props.handlePluginRow(el.id)}
                        handlePlugins={() => this.props.handlePluginRow(selectedRecordId)}
                        handleDownload={() => this.props.handleDownloadRow(selectedRecordId)}
                        handleAttachments={() => this.props.handleAttachmentRow(selectedRecordId)}
                        handleDelete={() => this.props.handleDeleteRow(selectedRecordId)}
                        handleRestore={() => this.props.handleRestoreRow(selectedRecordId)}
                        handleFormula={() => this.props.handleFormulaRow(selectedRecordId)}
                        handleHistory={() => this.props.handleHistoryLogRow(selectedRecordId)}
                        handleFill={() => this.props.handleFillRow(selectedRecordId)}
                        handleExpand={() => this.handleExpand()}
                        handleCollapse={() => this.handleCollapse()}
                        handleCheck={() => this.handleCheck()}
                        handleUncheck={() => this.handleUncheck()}
                        handleUp={() => {
                            this.forceUpdate();
                            this.props.handleUp(selectedRecordId);
                        }}
                        handleDown={() => {
                            this.forceUpdate();
                            this.props.handleDown(selectedRecordId);
                        }}
                        handleAddLevel={() => this.props.handleAddLevel(selectedRecordId)}
                        operationList={this.props.parsedGridView.operationsPPM}
                        menu={this.menu}
                    />
                )}
            </React.Fragment>
        );
    }
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
        if (
            this.state.groupExpandAll &&
            !this.state.initializedExpandAll &&
            this.props.parsedGridViewData.length !== 0
        ) {
            const expandedRowKeys = this.props.parsedGridViewData.map((el) => el._ID);
            this.setState(
                {
                    expandedRowKeys: expandedRowKeys,
                    initializedExpandAll: true,
                },
                () => {
                    this.rerenderColorCheckboxIfPossible();
                }
            );
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
    handleHrefSubview(viewId, recordId, currentBreadcrumb) {
        let result = this.props.handleBlockUi();
        if (result) {
            let newUrl = AppPrefixUtils.locationHrefUrl(
                `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${
                    !!currentBreadcrumb ? currentBreadcrumb : ``
                }`
            );
            window.location.assign(newUrl);
        }
    }
    handleEdit(viewId, parentId, recordId, currentBreadcrumb, kindView) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
            TreeListUtils.openEditSpec(
                viewId,
                parentId,
                [recordId],
                currentBreadcrumb,
                () => this.props.handleUnblockUi(),
                (err) => this.props.showErrorMessages(err)
            );
        } else {
            let result = this.props.handleBlockUi();
            if (result) {
                this.crudService
                    .editEntry(viewId, recordId, parentId, kindView, '')
                    .then((entryResponse) => {
                        EntryResponseUtils.run(
                            entryResponse,
                            () => {
                                if (!!entryResponse.next) {
                                    this.crudService
                                        .edit(viewId, recordId, parentId, kindView)
                                        .then((editDataResponse) => {
                                            this.setState(
                                                {
                                                    editData: editDataResponse,
                                                },
                                                () => {
                                                    this.props.handleShowEditPanel(editDataResponse);
                                                }
                                            );
                                        })
                                        .catch((err) => {
                                            this.props.showErrorMessages(err);
                                        });
                                } else {
                                    this.props.handleUnblockUi();
                                }
                            },
                            () => this.props.handleUnblockUi(),
                            () => this.props.handleUnblockUi()
                        );
                    })
                    .catch((err) => {
                        this.props.showErrorMessages(err);
                    });
            }
        }
    }
    handleEditSpec(viewId, parentId, recordId, currentBreadcrumb) {
        const prevUrl = window.location.href;
        sessionStorage.setItem('prevUrl', prevUrl);
        TreeListUtils.openEditSpec(
            viewId,
            parentId,
            [recordId],
            currentBreadcrumb,
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

    preColumnDefinition(editable, INDEX_COLUMN) {
        if (INDEX_COLUMN !== 0) {
            const preInitializedColumns = this.state.preInitializedColumns;
            const foundedelement = preInitializedColumns.find((el) => el.columnIndex === INDEX_COLUMN);
            if (!foundedelement) {
                const column = {
                    columnIndex: INDEX_COLUMN,
                    editable: editable,
                };
                preInitializedColumns.push(column);
                this.setState({
                    preInitializedColumns,
                });
            }
        }
    }

    preGenerateColumnsDefinition() {
        let columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            const editable = columnDefinition?.edit;
            this.preColumnDefinition(editable, INDEX_COLUMN);
            columns.push(
                <Column
                    key={INDEX_COLUMN}
                    sortOrder={sortOrder}
                    dataField={columnDefinition?.fieldName}
                    sortIndex={columnDefinition?.sortIndex}
                    allowEditing={editable || columnDefinition?.selectionList}
                    cellRender={
                        this.isSpecialCell(columnDefinition)
                            ? (cellInfo, columnDefinition) => this.cellRenderSpecial(cellInfo, columnDefinition)
                            : undefined
                    }
                    editCellRender={(cellInfo) =>
                        this.editCellRender(cellInfo, columnDefinition, () => {
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
                        })
                    }
                />
            );
        });
        return columns;
    }

    postCustomizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            columns
                .filter((column) => column.visible === true)
                ?.forEach((column) => {
                    if (column.name === '_ROWNUMBER') {
                        //rule -> hide row with autonumber
                        column.visible = false;
                    } else {
                        //match column by field name from view and viewData service
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
                            column.headerId =
                                'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                            column.width = columnDefinition?.width || 100;
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
                        caption: '',
                        fixed: true,
                        headerCellTemplate: (element) => {
                            if (this.props?.addButtonFunction) {
                                ReactDOM.render(this.addButton(), element);
                            }
                            return;
                        },
                        width: 10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0)),
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
                                        handleEdit={() => {
                                            this.handleEdit(viewId, parentId, recordId, currentBreadcrumb, kindView);
                                        }}
                                        handleEditSpec={() => {
                                            this.handleEditSpec(viewId, parentId, recordId, currentBreadcrumb);
                                        }}
                                        hrefSubview={AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${
                                                !!currentBreadcrumb ? currentBreadcrumb : ``
                                            }`
                                        )}
                                        hrefSpecView={EditSpecUtils.editSpecUrl(
                                            viewId,
                                            parentId,
                                            compress([recordId]),
                                            currentBreadcrumb
                                        )}
                                        handleHrefSubview={() => {
                                            this.handleHrefSubview(viewId, recordId, currentBreadcrumb);
                                        }}
                                        handleAddSpecSpec={() => {
                                            this.props.handleAddSpecSpec(recordId);
                                        }}
                                        handleArchive={() => this.props.handleArchiveRow(recordId)}
                                        handlePublish={() => this.props.handlePublish(recordId)}
                                        handleDownload={() => this.props.handleDownloadRow(recordId)}
                                        handleAttachments={() => this.props.handleAttachmentRow(recordId)}
                                        handleCopy={() => this.props.handleCopyRow(recordId)}
                                        handleDelete={() => this.props.handleDeleteRow(recordId)}
                                        handleRestore={() => this.props.handleRestoreRow(recordId)}
                                        handleDocuments={(el) => this.props.handleDocumentRow(el.id)}
                                        handlePlugins={(el) => this.props.handlePluginRow(el.id)}
                                        handleFormula={() => this.props.handleFormulaRow(recordId)}
                                        handleHistory={() => alert('TODO')}
                                        handleBlockUi={() => this.props.handleBlockUi()}
                                        handleUp={() => this.props.handleUp(recordId)}
                                        handleDown={() => this.props.handleDown(recordId)}
                                        handleAddLevel={() => this.props.handleAddLevel(recordId)}
                                        handleExpand={() => this.handleExpand(recordId)}
                                        handleCollapse={() => this.handleCollapse(recordId)}
                                        handleCheck={() => this.handleCheck(recordId)}
                                        handleUncheck={() => this.handleUncheck(recordId)}
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
    addButton() {
        const operations = this.state.operations;
        const opAddFile = !!DataGridUtils.getOpButton(operations, OperationType.OP_ADD_SPEC_BUTTON);
        return (
            opAddFile && (
                <ActionButton
                    rendered={true}
                    label={LocUtils.loc(this.props.labels, 'Add_button', 'Dodaj')}
                    handleClick={(e) => {
                        this.props.addButtonFunction();
                    }}
                />
            )
        );
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
    cellRenderSpecial(cellInfo) {
        try {
            let _bgColor;
            if (cellInfo.data?.FORMULA && cellInfo.column.dataField.toUpperCase() === 'WART') {
                const elements = Array.from(
                    document.querySelectorAll('td[aria-describedby="' + cellInfo.column.headerId + '"]')
                ).filter((el) => {
                    return !el.ariaLabel;
                });
                const element = elements[cellInfo.rowIndex];
                if (element.parentNode.rowIndex === cellInfo.rowIndex) {
                    element.classList.add('calculated-cell-bakcground');
                }
            } else {
                _bgColor = cellInfo.data['_BGCOLOR'];
            }
            let bgColorFinal = 'white';
            const specialBgColor = cellInfo.data['_BGCOLOR_' + cellInfo.column?.dataField];
            if (!!specialBgColor) {
                bgColorFinal = specialBgColor;
            } else {
                if (!!_bgColor) {
                    bgColorFinal = _bgColor;
                }
            }
            const _fontcolor = cellInfo.data['_FONTCOLOR'];
            let fontColorFinal = 'black';
            const specialFontColor = cellInfo.data['_FONTCOLOR_' + cellInfo.column?.dataField];
            if (!!specialFontColor) {
                fontColorFinal = specialFontColor;
            } else {
                if (!!_fontcolor) {
                    fontColorFinal = _fontcolor;
                }
            }
            switch (cellInfo.column.ownType) {
                case ColumnType.H:
                    try {
                        return (
                            <a
                                style={{
                                    display: 'contents',
                                    color: fontColorFinal,
                                    background: bgColorFinal,
                                }}
                                href={cellInfo?.text}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                {cellInfo?.text}
                            </a>
                        );
                    } catch (err) {
                        ConsoleHelper('Error render hyperlink. Exception=', err);
                    }
                    break;
                case ColumnType.O:
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                }}
                            >
                                {StringUtils.textFromHtmlString(cellInfo?.text)}{' '}
                            </span>
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case ColumnType.C:
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                }}
                                dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                            />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case ColumnType.N:
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                }}
                                dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                            />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case ColumnType.IM:
                    try {
                        return !!cellInfo?.text ? (
                            <img alt={''} height={100} src={`data:image/jpeg;base64,${cellInfo?.text}`} />
                        ) : (
                            <div />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render single-image. Exception=', err);
                    }
                    break;
                case ColumnType.I:
                    try {
                        return !!cellInfo?.text ? (
                            cellInfo?.text?.split(',').map(() => {
                                return (
                                    <div>
                                        <Image
                                            onRemove={(e) => {
                                                this.trashClicked.current = true;
                                                setTimeout(function () {
                                                    document.getElementById('trash-button').click();
                                                    setTimeout(function () {
                                                        document.getElementById('grid-selection-panel').click();
                                                    }, 0);
                                                }, 0);
                                            }}
                                            canRemove={cellInfo?.text.length > 0}
                                            base64={cellInfo?.text}
                                        ></Image>
                                    </div>
                                );
                            })
                        ) : (
                            <div />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render multi-image. Exception=', err);
                    }
                    break;
                default:
                    return undefined;
            }
        } catch (err) {
            ConsoleHelper('Error global cell render. Exception=', err);
        }
    }

    waitForSuccess() {
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    matchColumnDefinitionByFieldName(columnDataField) {
        let columnDefinitionArray = this.props.gridViewColumns?.filter(
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
    initializedExpandAll: false,
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
    handleUnselectAll: PropTypes.func,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    preloadEnabled: PropTypes.bool,
    initializedExpandAll: PropTypes.bool,
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

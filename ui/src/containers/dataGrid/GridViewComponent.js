import React from 'react';
import PropTypes from 'prop-types';
import DataGrid, {
    Column,
    Editing,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    KeyboardNavigation,
    LoadPanel,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting,
    StateStoring,
} from 'devextreme-react/data-grid';
import Constants from '../../utils/Constants';
import CrudService from '../../services/CrudService';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import ReactDOM from 'react-dom/client';
import OperationsButtons from '../../components/prolab/OperationsButtons';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string/src';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import {StringUtils} from '../../utils/StringUtils';
import CellEditComponent from '../CellEditComponent';
import UrlUtils from '../../utils/UrlUtils';
import EditSpecService from '../../services/EditSpecService';
import ActionButton from '../../components/ActionButton';
import LocUtils from '../../utils/LocUtils';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons';
import {saveObjToCookieGlobal} from '../../utils/Cookie';
import {ColumnType} from '../../enum/ColumnType';
import OperationCell from '../../enum/OperationCell';
import {OperationType} from '../../enum/OperationType';
import {HtmlUtils} from '../../utils/HtmlUtils';
import {ViewDataCompUtils} from '../../utils/component/ViewDataCompUtils';
import EntryResponseHelper from '../../utils/helper/EntryResponseHelper';
import {TranslationUtils} from '../../utils/TranslationUtils';
import {handleEdit} from '../../utils/handler/EditHandler';
import {SessionStoreUtils} from '../../utils/SessionStoreUtils';
import {ResponseUtils} from '../../utils/ResponseUtils';
import {ColumnUtils} from '../../utils/ColumnUtils';
import FilterClear from '../../components/prolab/FilterClear';
import useStore from '../../store';
import {ArrayUtils} from '../../utils/ArrayUtils';
import {getStore} from '../../utils/helper/StoreHelper';
import {MouseDragScroller} from '../../utils/MouseDragScroller';

class GridViewComponent extends CellEditComponent {
    _filterClearRoot = null;

    constructor(props) {
        super(props);
        this.mouseDragScroller = undefined;
        this.dataGrid = null;
        this.crudService = new CrudService();
        this.menuRef = React.createRef();
        this.canApplyFilter = React.createRef();
        this.switchRef = React.createRef();
        this.refDateTime = React.createRef();
        this.clickedPosition = React.createRef();
        this.focusedRowKey = React.createRef();
        this.keyDownClicked = React.createRef(false);
        this.firstLoadDone = React.createRef(false);
        this.editSpecService = new EditSpecService();
        this.mergedColumns = this.props.gridViewColumns.filter((e) => e.isMerge);
        this.state = {
            gridViewColumns: this.props.gridViewColumns,
            allRowsShow: false,
            packageCount: this.getDefaultPackageCount(),
            keyDownClicked: false,
            focusedRowKey: UrlUtils.getURLParameter('selectedFromPrevGrid')
                ? parseInt(UrlUtils.getURLParameter('selectedFromPrevGrid'))
                : undefined,
            editListVisible: false,
            imageViewer: {
                imageViewDialogVisible: false,
                editable: false,
                imageBase64: undefined,
                header: undefined,
            },
            editorViewer: {
                visible: false,
                editable: false,
                value: undefined,
                header: undefined,
                type: undefined,
            },
            selectedRecordId: undefined,
        };
        this.allowWrapping = this.props.parsedGridView?.gridOptions?.rowAutoHeight;
        this.hasResized = false;
        this.rowRenderingMode = UrlUtils.isBatch() ? 'standard' : 'virtual';
    }

    selectRowKeys = (selectedRows, callback) => {
        if (this.props.handleSelectRows) {
            this.getInstance().selectRows(selectedRows.map((el) => el.ID));
            this.props.handleSelectRows(selectedRows, () => {
                if (callback) {
                    callback();
                }
            });
        }
    };

    ifSelectAllEvent(e) {
        return this.isSelectColumn(e) && e?.rowType === 'header';
    }

    ifSelectEvent(e) {
        return this.isSelectColumn(e) && e?.rowType === 'data';
    }

    isSelectColumn = (e) => {
        return e.column?.type === 'selection' && e.column?.command === 'select';
    };

    hasSelectClass = (e) => {
        return e.cellElement?.className?.includes('dx-command-select');
    };

    selectAllEvent = (e) => {
        const value = e?.cellElement?.children[0]?.children[0]?.value;
        return value === 'true' || value === true;
    };

    groupCellTemplate = (element, data) => {
        const span = document.createElement('span');
        span.innerHTML = data.column.caption + ': ' + data.text;
        element.append(span);
    };

    getScrollableContainer() {
        const gridRef = this.getInstance();
        const scrollableContainer = gridRef?.element()?.querySelector('.dx-scrollable-container');
        return scrollableContainer;
    }

    componentDidMount() {
        if (SessionStoreUtils.canApplyStore()) {
            this.canApplyFilter.current = true;
        }
        super.componentDidMount();
        this.unregisterKeydownEvent();
        this.registerKeydownEvent();
    }

    canBeGridDraggable = () => {
        return getStore().draggableGridEnabled && !UrlUtils.isBatch();
    };

    registerMouseEvent = (scrollContainer) => {
        if (this.canBeGridDraggable() && StringUtils.isBlank(this.mouseDragScroller)) {
            if (scrollContainer) {
                this.mouseDragScroller = new MouseDragScroller(scrollContainer);
                this.mouseDragScroller.init();
                return;
            }
            setTimeout(() => {
                scrollContainer = this.getScrollableContainer();
                this.mouseDragScroller = new MouseDragScroller(scrollContainer);
                this.mouseDragScroller.init();
            }, 5000);
        }
    };

    unregisterMouseEvent = () => {
        if (this.canBeGridDraggable()) {
            this.mouseDragScroller?.destroy();
            this.mouseDragScroller = undefined;
        }
    };

    componentWillUnmount() {
        this.unregisterKeydownEvent();
        this.unregisterMouseEvent();
    }
    registerKeydownEvent() {
        const gridContainer = document.getElementById('grid-container');
        if (gridContainer) {
            gridContainer.addEventListener('mousedown', this.handleAltAndLeftClickFunction);
        }
    }
    unregisterKeydownEvent() {
        const gridContainer = document.getElementById('grid-container');
        if (gridContainer) {
            gridContainer.removeEventListener('mousedown', this.handleAltAndLeftClickFunction);
        }
    }
    handleAltAndLeftClickFunction = (event) => {
        if (this.props.altAndLeftClickEnabled && event.button === 0 && event.altKey) {
            const isOnGrid = HtmlUtils.clickedInsideComponent(event, 'grid-container');
            if (this.currentClickedCell.current && this.props?.getRef() && isOnGrid) {
                const dxStateHovers = document.getElementsByClassName('dx-state-hover');
                if (!ArrayUtils.isEmpty(dxStateHovers)) {
                    dxStateHovers[1].children[0].children[0].click();
                }
            }
        }
    };
    waitForSuccess() {
        return this.props.dataGridStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    isGroupModeEnabled = () => {
        return document.getElementsByClassName('dx-group-panel-item').length !== 0;
    };
    getPackageCount = () => {
        const result =
            StringUtils.isBlank(this.props.packageRows) || this.props.packageRows === 0
                ? this.getDefaultPackageCount()
                : this.props.packageRows;
        if (this.props.cellModeEnabled && this.state.allRowsShow) {
            return this.props.packageRows;
        }
        return result;
        // return 70;
    };
    findRowDataById(recordId) {
        const editData = this.props.parsedGridViewData.filter((item) => {
            return item.ID === recordId;
        });
        return editData[0];
    }
    currentEditListRow(recordId) {
        const currentEditListRow = this.props.parsedGridViewData.filter((item) => {
            return item.ID === recordId;
        });
        return currentEditListRow;
    }
    addButton() {
        return (
            this.addButtonExist() && (
                <React.Fragment>
                    <ActionButton
                        rendered={true}
                        label={LocUtils.locFromStoreWithDefault('Add_button', 'Dodaj')}
                        handleClick={(e) => {
                            this.props.addButtonFunction(e);
                        }}
                    />
                </React.Fragment>
            )
        );
    }
    addButtonExist() {
        const opAdd = !!TranslationUtils.getOpButton(
            this.props.parsedGridView?.operations,
            OperationType.OP_ADD_BUTTON
        );
        const opAddFile = !!TranslationUtils.getOpButton(
            this.props.parsedGridView?.operations,
            OperationType.OP_ADD_FILE_BUTTON
        );
        const opAddSpec = !!TranslationUtils.getOpButton(
            this.props.parsedGridView?.operations,
            OperationType.OP_ADD_SPEC_BUTTON
        );
        return !UrlUtils.isBatch() && (opAdd || opAddSpec || opAddFile);
    }

    onKeyDown = (e) => {
        if (e.event.key === 'ArrowUp' || e.event.key === 'ArrowDown') {
            e.component.closeEditCell();
            e.component.cancelEditData();
        }
    };

    renderClearFilter = () => {
        const clearFilter = document.getElementById('clear-filter-outside');
        if (this._filterClearRoot && !clearFilter) {
            this._filterClearRoot.render(
                <FilterClear
                    clearFnc={() => {
                        this.getInstance().clearFilter();
                    }}
                    filters={window?.dataGrid?.getCombinedFilter()}
                />
            );
        }
    };

    onGroupIndexChange = (e) => {
        if (e?.fullName?.includes('groupIndex')) {
            const match = e?.fullName.match(/columns\[(\d+)\]\.groupIndex/);
            if (match && this.props.handleOnGroupIndexChange) {
                const columnIndex = match[1];
                const value = StringUtils.isBlank(e.value) ? e.previousValue : e.value;
                this.props.handleOnGroupIndexChange(columnIndex, value);
            }
        }
    };

    onFilterChange = (e) => {
        if (e?.fullName?.includes('filterValue') && e?.name === 'columns') {
            if (this.props?.handleOnFilterChange) {
                this.props.handleOnFilterChange();
            }
            if (this.props?.getRef) {
                this.getInstance().clearSelection();
                this.getInstance().deselectAll();
                if (this.props?.handleUnselectAll) {
                    this.props.handleUnselectAll();
                }
            }
        }
    };

    render() {
        const showGroupPanel = this.props.gridFromDashboard
            ? false
            : this.props.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataGridHeight = this.props.dataGridHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = selectAll === undefined || selectAll === null || !!selectAll;
        const defaultSelectedRowKeys = this.props.defaultSelectedRowKeys;
        const selectedRowKeys = this.props.selectedRowKeys;
        const kindView = this.props.elementKindView;
        const subViewId = this.props.elementSubViewId;
        const selectedRecordId = this.state.selectedRecordId;
        const parentId = this.props.elementRecordId;
        const viewId = DataGridUtils.getRealViewId(subViewId, this.props.id);
        return (
            <React.Fragment>
                {this.state.editListVisible && this.editListComponent()}
                {this.state.editorViewer.visible && this.editorComponent(UrlUtils.isBatch(), this.state.editorViewer)}
                {this.imageViewerComponent()}
                <DataGrid
                    onContextMenuPreparing={(e) => {
                        if (this.props.ppmEnabled) {
                            if (e?.row?.data?.ID) {
                                if (this.selectionMode() === 'multiple') {
                                    const isAlreadySelected = this.props.selectedRows.find(
                                        (el) => el.ID === String(e?.row?.data?.ID)
                                    );
                                    if (!isAlreadySelected) e.row.cells[0]?.cellElement?.firstChild?.click();
                                }
                                setTimeout(() => {
                                    this.setState({selectedRecordId: e.row.data.ID});
                                }, 0);
                            }
                        }
                    }}
                    onKeyDown={(e) => {
                        if (UrlUtils.isBatch()) this.onKeyDown(e);
                        this.keyDownClicked.current = true;
                    }}
                    id={`grid-container`}
                    defaultFocusedRowKey={this.state.focusedRowKey}
                    keyExpr='ID'
                    className={`${this.props?.isAttachment ? 'attachment ' : 'grid'} ${
                        this.props.ppmEnabled ? 'ppm-enabled' : ''
                    } ${this.props?.className ? this.props?.className : ''} grid-container${
                        headerAutoHeight ? ' grid-header-auto-height' : ''
                    } ${this.canRenderAdditionalOperationCol() ? 'grid-with-opperations' : ''} `}
                    ref={(ref) => {
                        this.props.handleOnDataGrid(ref);
                    }}
                    onRowClick={(e) => {
                        this.currentClickedCell.current = e.data.ID;
                    }}
                    onFocusedRowChanging={(e) => {
                        if (e.rows[e.newRowIndex]?.data) {
                            this.currentClickedCell.current = e.rows[e.newRowIndex].data.ID;
                        }
                    }}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this?.postCustomizeColumns}
                    wordWrapEnabled={headerAutoHeight}
                    columnAutoWidth={columnAutoWidth}
                    focusedRowEnabled={true}
                    hoverStateEnabled={this.props.hoverStateEnabled}
                    autoNavigateToFocusedRow={false}
                    columnResizingMode='widget'
                    allowColumnReordering={true}
                    onOptionChanged={(e) => {
                        this.onFilterChange(e);
                        this.onGroupIndexChange(e);
                    }}
                    onContentReady={(e) => {
                        this.highlightRow(e);
                        this.renderClearFilter();
                        if (this.props.onContentReady) {
                            this.props.onContentReady(e);
                        }
                        this.resizeAfterDelay(e);
                    }}
                    repaintChangesOnly={this.repaintChangesOnly()}
                    allowColumnResizing={true}
                    showColumnLines={showColumnLines}
                    showRowLines={showRowLines}
                    showBorders={showBorders}
                    showColumnHeaders={showColumnHeaders}
                    columnHidingEnabled={false}
                    height={dataGridHeight ? dataGridHeight + 'px' : '100%'}
                    width={columnAutoWidth ? '100%' : undefined}
                    rowAlternationEnabled={false}
                    selectedRowKeys={defaultSelectedRowKeys || selectedRowKeys}
                    onSelectionChanged={(e) => {
                        if (!!this.props.handleSelectedRowKeys) {
                            this.props.handleSelectedRowKeys(e);
                            return;
                        }
                        if (!!this.props.handleSelectAll && this.keyDownClicked.current) {
                            this.onKeyDownSelectRows();
                            return;
                        }
                    }}
                    renderAsync={true}
                    selectAsync={false}
                    cacheEnabled={false}
                    onCellClick={(e) => {
                        if (!!this.props.handleSelectAll) {
                            if (this.ifSelectAllEvent(e)) {
                                let event = this.selectAllEvent(e);
                                this.props.handleSelectAll(event);
                            } else if (this.ifSelectEvent(e)) {
                                this.props.handleSelectAll(null, e?.data);
                            } else if (this.hasSelectClass(e)) {
                                // global dla mobile
                                this.props.handleSelectAll(null, e?.data);
                            }
                            this.keyDownClicked.current = false;
                        }
                    }}
                    onInitialized={(ref) => {
                        if (ref?.component) {
                            this.registerMouseEvent(this.getScrollableContainer());
                        }
                        if (!!this.props.handleOnInitialized) this.props.handleOnInitialized(ref);
                    }}
                >
                    {this.props.cellModeEnabled ? (
                        <Editing mode='cell' allowUpdating={true} />
                    ) : (
                        <RemoteOperations
                            filtering={true}
                            summary={true}
                            sorting={true}
                            paging={true}
                            grouping={true}
                            groupPaging={true}
                        />
                    )}
                    {UrlUtils.isBatch() && (
                        <KeyboardNavigation
                            editOnKeyPress={true}
                            enterKeyAction={'moveFocus'}
                            enterKeyDirection={'column'}
                        />
                    )}
                    <FilterRow visible={showFilterRow} applyFilter={true} />
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />
                    <Grouping autoExpandAll={groupExpandAll} allowCollapsing={true} contextMenuEnabled={true} />
                    <GroupPanel visible={showGroupPanel} />
                    <Sorting mode='multiple' />
                    <Selection
                        mode={this.selectionMode()}
                        selectAllMode='page'
                        showCheckBoxesMode='always'
                        allowSelectAll={allowSelectAll}
                        deferred={this.props.selectionDeferred}
                    />
                    <Scrolling
                        mode='virtual'
                        rowRenderingMode={this.rowRenderingMode}
                        preloadEnabled={false}
                        useNative={this.isGroupModeEnabled()}
                    />
                    <Paging
                        defaultPageSize={this.state.packageCount}
                        pageSize={this.state.packageCount}
                        defaultPageIndex={0}
                    />
                    <LoadPanel
                        enabled={true}
                        showIndicator={true}
                        shadingColor='rgba(0,0,0,0.4)'
                        showPane={false}
                        position='absolute'
                    />
                    <StateStoring
                        enabled={true}
                        type='custom'
                        customLoad={(e) => {
                            if (this.canApplyFilter.current) {
                                const si = SessionStoreUtils.getStoreInformation();
                                SessionStoreUtils.clearStoreInformation();
                                this.canApplyFilter.current = false;
                                return si.store;
                            }
                            return null;
                        }}
                        customSave={(state) => {
                            getStore().setGridStateStore(state);
                        }}
                    />

                    {this.preGenerateColumnsDefinition()}
                </DataGrid>

                {this.props.parsedGridView?.operationsPPM && this.props.parsedGridView.operationsPPM.length !== 0 && (
                    <MenuWithButtons
                        menuRef={this.menuRef}
                        target={this.props.targetContextMenu}
                        gridView={this.props.parsedGridView}
                        handlePlugins={(e) => this.preAction(e, () => this.props.handlePluginRow(e.id))}
                        handleDocuments={(e) => {
                            this.preAction(e, () => this.props.handleDocumentRow(e.id));
                        }}
                        handleSaveAction={(e) => this.props.handleSaveAction()}
                        handleHrefSubview={(e) => {
                            this.handleHrefSubview(viewId, selectedRecordId);
                        }}
                        hrefSpecView={this.subViewHref(viewId, selectedRecordId)}
                        handleEdit={(e) => {
                            this.preAction(e, () => this.handleEdit(viewId, parentId, kindView, selectedRecordId));
                        }}
                        handlePreview={(e) => {
                            this.preAction(e, () => this.handlePreview(viewId, parentId, kindView, selectedRecordId));
                        }}
                        handleEditSpec={(e) => this.handleEditSpec(viewId, parentId, selectedRecordId)}
                        handleCopy={(e) => this.preAction(e, () => this.props.handleCopyRow(selectedRecordId))}
                        handleArchive={(e) => this.preAction(e, () => this.props.handleArchiveRow(selectedRecordId))}
                        handlePublish={(e) => this.preAction(e, () => this.props.handlePublishRow(selectedRecordId))}
                        handleBatch={(e) => this.preAction(e, () => this.handleBatch(e.id, viewId, parentId))}
                        handleAdd={(e) => this.preAction(e, () => this.props.addButtonFunction())}
                        handleAddSpec={(e) => this.preAction(e, () => this.props.addButtonFunction())}
                        handleDownload={(e) => this.preAction(e, () => this.props.handleDownloadRow(selectedRecordId))}
                        handleAttachments={(e) =>
                            this.preAction(e, () => this.props.handleAttachmentRow(selectedRecordId))
                        }
                        handleDelete={(e) => this.preAction(e, () => this.props.handleDeleteRow(selectedRecordId))}
                        handleRestore={(e) => this.preAction(e, () => this.props.handleRestoreRow(selectedRecordId))}
                        handleFormula={(e) => this.preAction(e, () => this.props.handleFormulaRow(selectedRecordId))}
                        handleHistory={(e) => {
                            this.preAction(e, () => this.props.handleHistoryLogRow(selectedRecordId));
                        }}
                        handleFill={(e) => this.preAction(e, () => this.props.handleFillRow(selectedRecordId))}
                        operationList={this.props.parsedGridView.operationsPPM}
                    />
                )}
            </React.Fragment>
        );
    }
    highlightRow = (e) => {
        const clickedRowFromView = SessionStoreUtils.getClickedRowFromView();
        if (clickedRowFromView) {
            if (clickedRowFromView.view.id !== UrlUtils.getIdFromUrl()) {
                SessionStoreUtils.clearClickedRowFromView();
                return;
            }
            const visibleRow = e.component.getVisibleRows()?.find((row) => row.data?.ID === clickedRowFromView.row?.id);
            const element = visibleRow?.cells?.[1];
            const cellElement = element?.cellElement;
            if (cellElement && !StringUtils.isBlank(cellElement)) {
                const tr = cellElement.parentNode;
                if (tr instanceof HTMLElement) {
                    tr.classList.add('highlight-row');
                    SessionStoreUtils.clearClickedRowFromView();
                }
            }
        }
    };
    preAction = (operation, callback, recordId = this.state.selectedRecordId) => {
        const onlyOneRecord = operation?.onlyOneRecord;
        if (this.props.handleSelectRows) {
            if (onlyOneRecord) {
                this.selectRowKeys([{ID: recordId}], () => callback());
                return;
            }
        }
        callback();
    };
    selectionMode = () => {
        if (this.props.cellModeEnabled) {
            return 'none';
        }
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = multiSelect === undefined || multiSelect === null || !!multiSelect;
        return showSelection ? (multiSelection ? 'multiple' : 'single') : 'none';
    };
    repaintChangesOnly() {
        return this.props.cellModeEnabled; // musi byc ze wzgledu na delete and restore
    }
    onKeyDownSelectRows() {
        const dxRowFocused = document.getElementsByClassName('dx-row-focused')[0];
        if (dxRowFocused) {
            dxRowFocused.children[0].click();
        }
        this.keyDownClicked.current = false;
    }
    canRenderAdditionalOperationCol() {
        const operationsRecord = this.props.parsedGridView?.operationsRecord;
        const operationsRecordList = this.props.parsedGridView?.operationsRecordList;
        if (!(operationsRecordList instanceof Array)) {
            return false;
        }
        if (!(operationsRecord instanceof Array)) {
            return false;
        }
        if (operationsRecordList.length > 0 || operationsRecord.length > 0) {
            return true;
        }
        return false;
    }
    removeElementFromArray(columnDefinitionArray, column) {
        const index = columnDefinitionArray?.findIndex(
            (value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase()
        );
        if (index !== -1) {
            const [element] = columnDefinitionArray.splice(index, 1);
            return element;
        }
        return null;
    }
    getDefaultPackageCount = () => {
        let viewportHeight = window.innerHeight - 120;
        const showGroupPanel = this.props.gridFromDashboard
            ? false
            : this.props.parsedGridView?.gridOptions?.showGroupPanel || false;
        if (showGroupPanel) {
            viewportHeight = viewportHeight - 40;
        }
        if (UrlUtils.parentIdParamExist() && UrlUtils.recordIdParamExist()) {
            const fetchRows = (viewportHeight / 100) * 4;
            return Math.round(fetchRows);
        }
        const fetchRows = (viewportHeight / 100) * 5;
        return Math.round(fetchRows);
    };
    getClonedGridViewColumns() {
        if (this.props.multiLevelHeaders) {
            return structuredClone(ResponseUtils.flattenColumns(this.props.gridViewColumns));
        }
        return structuredClone(this.props.gridViewColumns);
    }
    getInstance = () => {
        const ref = this.props?.getRef();
        if (ref?.current === null) {
            return null;
        }
        if (typeof ref?.instance !== 'function') {
            return null;
        }
        return this.props?.getRef()?.instance();
    };
    fillHeightForGrid = (element) => {
        try {
            const headerAutoHeight = this.props?.parsedGridView?.gridOptions?.headerAutoHeight || false;
            if (!headerAutoHeight || !element) return;
            const table = element.closest('.dx-datagrid-headers.dx-bordered-top-view');
            const headerChild = element.parentNode;
            if (!table || !headerChild || !table.parentElement) return;
            const headerParent = table?.children?.[1]?.children?.[0]?.children?.[1]?.children?.[0];
            const parentHeight = headerParent?.clientHeight;
            if (parentHeight && headerChild.offsetHeight !== parentHeight) {
                headerChild.style.height = `${parentHeight}px`;
            }
        } catch (error) {
            console.warn('fillHeightForGrid error:', error);
        }
    };

    postCustomizeColumns = (columns) => {
        const columnDefinitionArray = this.getClonedGridViewColumns();
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            const visibleColumns = columns
                .filter((column) => !column.isBand)
                .filter((column) => column.visible === true);
            visibleColumns?.forEach((column, index) => {
                if (column.name === '_ROWNUMBER') {
                    column.visible = false;
                } else {
                    const isLast = index === visibleColumns.length - 1; // <-- tutaj sprawdzenie ostatniego
                    if (columnDefinitionArray) {
                        const columnDefinition = this.removeElementFromArray(columnDefinitionArray, column);
                        if (columnDefinition) {
                            const editable = columnDefinition?.edit || columnDefinition?.selectionList;
                            column.allowEditing = editable;
                            column.visible = columnDefinition?.visible;
                            column.allowFiltering = columnDefinition?.isFilter;
                            column.allowFixing = true;
                            column.allowGrouping = columnDefinition?.isGroup;
                            column.allowReordering = true;
                            column.allowResizing = true;
                            column.allowSorting = columnDefinition?.isSort;
                            column.allowWrapping = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
                            column.visibleIndex = columnDefinition?.columnOrder;
                            column.headerId =
                                'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                            column.width = columnDefinition?.width || 100;
                            column.name = columnDefinition?.fieldName;
                            column.caption = columnDefinition?.label;
                            if (columnDefinition.type === ColumnType.B || columnDefinition.type === ColumnType.L) {
                                column.showEditorAlways = false;
                            }
                            columnDefinition.isLast = isLast;
                            column.cellTemplate = this.getCellTemplate(columnDefinition);
                            column.dataType = DataGridUtils.specifyColumnType(columnDefinition?.type);
                            column.format = DataGridUtils.specifyColumnFormat(columnDefinition?.type);
                            column.fixed = ColumnUtils.getFixed(columnDefinition);
                            column.fixedPosition = ColumnUtils.getFixedPosition(columnDefinition);
                            if (!!columnDefinition.groupIndex && columnDefinition.groupIndex > 0) {
                                column.groupIndex = columnDefinition.groupIndex;
                            }
                            if (this.canReplaceFilterExpression(columnDefinition)) {
                                column.calculateFilterExpression = (value, selectedFilterOperations, target) =>
                                    DataGridUtils.calculateCustomFilterExpression(
                                        value,
                                        selectedFilterOperations,
                                        target,
                                        columnDefinition
                                    );
                            }
                            column.headerFilter = {groupInterval: null};
                            column.renderAsync = true;
                            INDEX_COLUMN++;
                        } else {
                            column.visible = false;
                        }
                    }
                }
            });
            // Bardzo ważne!!! clear pol bo w tym utilsie są parametry typu let
            DataGridUtils.clearProperties();

            let operationsRecord = this.props.parsedGridView?.operationsRecord;
            let operationsRecordList = this.props.parsedGridView?.operationsRecordList;
            if (!(operationsRecord instanceof Array)) {
                operationsRecord = [];
                operationsRecord.push(this.props.parsedGridView?.operationsRecord);
            }
            if (this.canRenderAdditionalOperationCol()) {
                columns?.push({
                    fixed: true,
                    cssClass: 'operation-column',
                    fixedPosition: 'right',
                    headerCellTemplate: (element) => {
                        if (this.props.showAddButton) {
                            element.parentNode.classList.add('header-button');
                            this.fillHeightForGrid(element);
                            const root = ReactDOM.createRoot(element);
                            root.render(this.addButton());
                            const filterLastRow = element?.parentNode?.parentNode?.parentNode?.lastChild?.lastChild;
                            if (!this.props?.isAttachment && useStore.getState()?.showFilterClear) {
                                this._filterClearRoot = ReactDOM.createRoot(filterLastRow);
                            }
                        }
                    },
                    width: ViewDataCompUtils.operationsColumnLength(
                        operationsRecord,
                        operationsRecordList,
                        this.addButtonExist()
                    ),
                    cellTemplate: (element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        const subViewId = this.props.elementSubViewId;
                        const kindView = this.props.elementKindView;
                        const rId = info.row?.data?.ID;
                        const parentId = this.props.elementRecordId;
                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                        let viewId = this.props.id;
                        viewId = DataGridUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.createRoot(element).render(
                            <div style={{textAlign: 'center'}}>
                                <OperationsButtons
                                    operations={operationsRecord}
                                    operationList={operationsRecordList}
                                    info={info}
                                    handleEdit={(e) =>
                                        this.preAction(e, () => this.handleEdit(viewId, parentId, kindView, rId), rId)
                                    }
                                    handlePreview={(e) =>
                                        this.preAction(
                                            e,
                                            () => this.handlePreview(viewId, parentId, kindView, rId),
                                            rId
                                        )
                                    }
                                    handleEditSpec={() => {
                                        this.handleEditSpec(viewId, parentId, rId);
                                    }}
                                    hrefSubview={this.subViewHref(viewId, rId)}
                                    hrefSpecView={EditSpecUtils.editSpecUrl(
                                        viewId,
                                        TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? parentId : rId,
                                        compress(TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? [rId] : []),
                                        currentBreadcrumb
                                    )}
                                    handleArchive={(e) =>
                                        this.preAction(e, () => this.props.handleArchiveRow(rId), rId)
                                    }
                                    handlePublish={(e) =>
                                        this.preAction(e, () => this.props.handlePublishRow(rId), rId)
                                    }
                                    handleCopy={(e) => this.preAction(e, () => this.props.handleCopyRow(rId), rId)}
                                    handleDocuments={(e) =>
                                        this.preAction(e, () => this.props.handleDocumentRow(e.id, rId), rId)
                                    }
                                    handlePlugins={(e) =>
                                        this.preAction(e, () => this.props.handlePluginRow(e.id, rId), rId)
                                    }
                                    handleDownload={(e) =>
                                        this.preAction(e, () => this.props.handleDownloadRow(rId), rId)
                                    }
                                    handleBatch={(e) =>
                                        this.preAction(e, () => this.handleBatch(e.id, viewId, parentId, rId), rId)
                                    }
                                    handleAttachments={(e) =>
                                        this.preAction(e, () => this.props.handleAttachmentRow(rId), rId)
                                    }
                                    handleDelete={(e) => this.preAction(e, () => this.props.handleDeleteRow(rId), rId)}
                                    handleRestore={(e) =>
                                        this.preAction(e, () => this.props.handleRestoreRow(rId), rId)
                                    }
                                    handleFormula={(e) =>
                                        this.preAction(e, () => this.props.handleFormulaRow(rId), rId)
                                    }
                                    handleHistory={(e) =>
                                        this.preAction(e, () => this.props.handleHistoryLogRow(rId), rId)
                                    }
                                    handleFill={(e) => this.preAction(e, () => this.props.handleFillRow(rId), rId)}
                                    handleBlockUi={(e) => this.props.handleBlockUi()}
                                />
                            </div>
                        );
                    },
                });
            }
        } else {
            //when no data
            this.props.gridViewColumns?.forEach((columnDefinition) => {
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
        const currentUrl = window.location.href;
        window.location.href = UrlUtils.deleteParameterFromURL(currentUrl, 'selectedFromPrevGrid');
    };

    resizeAfterDelay = (ref) => {
        if (this.allowWrapping && !this.hasResized && ref?.component) {
            this.hasResized = true;
            try {
                setTimeout(() => {
                    ref.component.resize();
                }, 1000);
            } catch (ex) {
                console.error(ex);
            }
        }
    };

    getCellTemplate(columnDefinition) {
        return DataGridUtils.cellTemplate(
            columnDefinition,
            this.isEditableCell(columnDefinition),
            (value, header) => {
                this.setState({
                    imageViewer: {
                        imageViewDialogVisible: true,
                        editable: this.isEditableCell(columnDefinition),
                        imageBase64: value,
                        header: header,
                    },
                });
            },
            (value, header, type) => {
                if (UrlUtils.isBatch()) {
                    return;
                }
                this.setState({
                    editorViewer: {
                        visible: true,
                        editable: false,
                        value: value,
                        header: header,
                        type: type,
                    },
                });
            }
        );
    }

    canReplaceFilterExpression(columnDefinition) {
        if (
            (columnDefinition?.type === ColumnType.L || columnDefinition?.type === ColumnType.B) &&
            UrlUtils.isBatch()
        ) {
            return true;
        }
        return (columnDefinition?.type === 'D' || columnDefinition?.type === 'E') && !UrlUtils.isBatch();
    }
    handleBatch(batchId, viewId, parentId, selectedRecordId) {
        let selectedRows = this.props.selectedRows;
        if (!StringUtils.isBlank(selectedRecordId)) {
            selectedRows = [
                {
                    ID: selectedRecordId,
                },
            ];
        }
        if (StringUtils.isBlank(parentId)) {
            parentId = 0;
        }
        const urlEditSpecBatch = AppPrefixUtils.locationHrefUrl(
            `/#/batch/${viewId}?batchId=${batchId}&parentId=${parentId}`
        );
        saveObjToCookieGlobal('selectedRowKeys', selectedRows);
        window.location.href = urlEditSpecBatch;
    }

    subViewHref = (viewId, recordId) => {
        const parentId = StringUtils.isBlank(this.props.elementRecordId) ? 0 : this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return AppPrefixUtils.locationHrefUrl(
            `/#/grid-view/${viewId}${
                !!recordId ? `?recordId=${recordId}` : ``
            }&parentId=${parentId}${currentBreadcrumb}`
        );
    };

    handleHrefSubview(viewId, recordId) {
        const result = this.props.handleBlockUi();
        if (result) {
            SessionStoreUtils.saveStore(getStore().gridStateStore);
            const newUrl = this.subViewHref(viewId, recordId);
            SessionStoreUtils.saveClickedRowFromView(recordId);
            window.location.assign(newUrl);
        }
    }
    handlePreview(viewId, parentId, kindView, recordId) {
        this.handleEdit(viewId, parentId, kindView, recordId, true);
    }
    handleEdit(viewId, parentId, kindView, recordId, readOnly = false) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
            this.editSpecService
                .getViewEntry(viewId, parentId, [recordId], kindView, null)
                .then((entryResponse) => {
                    EntryResponseHelper.run(
                        entryResponse,
                        () => {
                            if (!!entryResponse.next) {
                                const compressedRecordId = compress([recordId]);
                                EditSpecUtils.navToEditSpec(viewId, parentId, compressedRecordId);
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
        SessionStoreUtils.saveStore(getStore().gridStateStore);
        SessionStoreUtils.saveClickedRowFromView(recordId);
        TreeListUtils.openEditSpec(
            viewId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? parentId : recordId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? [recordId] : [],
            () => this.props.handleUnblockUi(),
            (err) => this.props.showErrorMessages(err)
        );
    }

    isEditableCell = (columnDefinition) => {
        return (
            this.isSpecialCell(columnDefinition) &&
            this.props.cellModeEnabled &&
            (columnDefinition?.edit || columnDefinition?.selectionList)
        );
    };

    preGenerateColumnsDefinition = () => {
        const multiLevelHeaders = this.props.multiLevelHeaders;
        const gridViewColumns = this.props.gridViewColumns;
        if (multiLevelHeaders) {
            return this.generateGroupColumns(gridViewColumns);
        }
        return this.generateColumns();
    };

    generateColumns() {
        const columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, keyIndex) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            columns.push(
                this.isEditableCell(columnDefinition) ? (
                    <Column
                        key={keyIndex}
                        dataField={columnDefinition.fieldName}
                        sortOrder={sortOrder}
                        sortIndex={columnDefinition?.sortIndex}
                        groupCellTemplate={this.groupCellTemplate}
                        editCellRender={(cellInfo) =>
                            this.editCellRender(cellInfo, columnDefinition, (operation) => {
                                if (columnDefinition.type === ColumnType.B || columnDefinition.type === ColumnType.L) {
                                    this.setState({rerenderFlag: !this.state?.rerenderFlag});
                                } else {
                                    switch (operation) {
                                        case OperationCell.EDIT_LIST:
                                            this.editListVisible(cellInfo.row?.data?.ID, columnDefinition.id);
                                            break;
                                        case OperationCell.FILL_DOWN:
                                            this.downFill(cellInfo, columnDefinition);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            })
                        }
                    />
                ) : (
                    <Column
                        key={keyIndex}
                        dataField={columnDefinition.fieldName}
                        sortOrder={sortOrder}
                        sortIndex={columnDefinition?.sortIndex}
                        groupCellTemplate={this.groupCellTemplate}
                    />
                )
            );
        });
        return columns;
    }

    generateGroupColumns() {
        const renderColumns = (groupDefinition, keyPrefix = '') => {
            if (groupDefinition.isBand && Array.isArray(groupDefinition.columns)) {
                return (
                    <Column
                        visible={groupDefinition.visible}
                        alignment='center'
                        fixed={ColumnUtils.getFixed(groupDefinition)}
                        fixedPosition={ColumnUtils.getFixedPosition(groupDefinition)}
                        key={keyPrefix + '-column-group'}
                        caption={groupDefinition.caption}
                        isBand={true}
                    >
                        {groupDefinition.columns.map((child, idx) => renderColumns(child, keyPrefix + '-' + idx))}
                    </Column>
                );
            } else {
                let sortOrder;
                if (!!groupDefinition?.sortIndex && groupDefinition?.sortIndex > 0 && !!groupDefinition?.sortOrder) {
                    sortOrder = groupDefinition?.sortOrder?.toLowerCase();
                }
                return (
                    <Column
                        visible={groupDefinition.visible}
                        key={keyPrefix + '-column'}
                        dataField={groupDefinition.fieldName}
                        sortOrder={sortOrder}
                        sortIndex={groupDefinition?.sortIndex}
                        groupCellTemplate={this.groupCellTemplate}
                    />
                );
            }
        };
        const columns = this.props.gridViewColumns.map((group, index) => renderColumns(group, 'col-' + index));
        return columns;
    }

    isSpecialCell = (columnDefinition) => {
        const type = columnDefinition?.type;
        try {
            switch (type) {
                case ColumnType.H:
                case ColumnType.B:
                case ColumnType.E:
                case ColumnType.D:
                case ColumnType.T:
                case ColumnType.L:
                case ColumnType.C:
                case ColumnType.O:
                case ColumnType.OH:
                case ColumnType.I:
                case ColumnType.IM:
                    return true;
                default:
                    return false;
            }
        } catch (ex) {}
        return false;
    };

    downFill(ci, cd) {
        this.props.handleBlockUi();
        const {value, rowIndex} = ci;
        const {fieldName} = cd;
        if (this.props.handleMaxPackageCount) {
            this.props.handleMaxPackageCount();
            this.setState(
                {
                    allRowsShow: true,
                },
                () => {
                    this.getInstance().getDataSource().reload();
                    setTimeout(() => {
                        this.dawnFillParsedData(rowIndex, fieldName, value);
                    }, 100);
                }
            );
        }
    }

    dawnFillParsedData = (selectedRowIndex, fieldName, value) => {
        const elementRowsToEdit = [];
        this.props.parsedGridViewData.forEach((row) => {
            const key = row.ID;
            const rIndex = this.getInstance().getRowIndexByKey(key);
            if (rIndex > selectedRowIndex) {
                row[fieldName] = value;
            }
            if (key) elementRowsToEdit.push(row);
        });
        this.props.handleFillDownParsedData(elementRowsToEdit);
        this.setState(
            {
                allRowsShow: false,
            },
            () => {
                this.props.handleUnblockUi();
                this.getInstance().getDataSource().reload();
            }
        );
    };
}

GridViewComponent.defaultProps = {
    showRenderingViewMode: true,
    parsedGridView: [],
    selectedRowKeys: [],
    packageRows: Constants.DEFAULT_DATA_PACKAGE_COUNT,
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    gridFromDashboard: false,
    multiLevelHeaders: false,
    showSelection: true,
    targetContextMenu: '.ppm-enabled .dx-row.dx-data-row.dx-row-lines.dx-column-lines',
    dataGridStoreSuccess: true,
    showAddButton: true,
    altAndLeftClickEnabled: false,
    ppmEnabled: false,
    focusedRowEnabled: false,
    hoverStateEnabled: false,
    cellModeEnabled: false,
    allowSelectAll: true,
    selectionDeferred: false,
};

GridViewComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired, PropTypes.func.isRequired]),
    elementSubViewId: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    elementRecordId: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    elementKindView: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    parsedGridView: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    parsedGridViewData: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    gridViewColumns: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    packageRows: PropTypes.number,
    handleOnDataGrid: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    showRenderingViewMode: PropTypes.bool,
    handleShowEditPanel: PropTypes.func,

    //selection
    selectedRowKeys: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    handleSelectedRowKeys: PropTypes.func,
    handleSelectAll: PropTypes.func,
    selectionDeferred: PropTypes.bool,
    cellModeEnabled: PropTypes.bool,

    altAndLeftClickEnabled: PropTypes.bool,

    multiLevelHeaders: PropTypes.bool,

    //buttons
    handleArchiveRow: PropTypes.func,
    handleAttachmentRow: PropTypes.func,
    handleDocumentRow: PropTypes.func,
    handleCopyRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleFormulaRow: PropTypes.func,
    handleDownloadRow: PropTypes.func,
    handleRestoreRow: PropTypes.func,
    handlePublishRow: PropTypes.func,
    handleHistoryLogRow: PropTypes.func,
    handleFillRow: PropTypes.func,
    //other
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    ppmEnabled: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showAddButton: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
    dataGridHeight: PropTypes.number,
    dataGridStoreSuccess: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    allowSelectAll: PropTypes.bool,
    handleMaxPackageCount: PropTypes.func,
    handleFillDownParsedData: PropTypes.func,
    handleOnGroupIndexChange: PropTypes.func,
    handleOnFilterChange: PropTypes.func,

    gridFromDashboard: PropTypes.bool,
};

export default GridViewComponent;

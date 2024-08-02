import React from 'react';
import PropTypes from 'prop-types';
import DataGrid, {
    Column,
    Editing,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    LoadPanel,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting,
} from 'devextreme-react/data-grid';
import Constants from '../../utils/Constants';
import ConsoleHelper from '../../utils/ConsoleHelper';
import CrudService from '../../services/CrudService';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import ReactDOM from 'react-dom';
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
import {ColumnType} from '../../model/ColumnType';
import OperationCell from '../../model/OperationCell';
import {OperationType} from '../../model/OperationType';
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils';
import { HtmlUtils } from '../../utils/HtmlUtils';
import { ViewDataCompUtils } from '../../utils/component/ViewDataCompUtils';
import EntryResponseHelper from '../../utils/helper/EntryResponseHelper';

class GridViewComponent extends CellEditComponent {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.crudService = new CrudService();
        this.menu = React.createRef();
        this.clickedPosition = React.createRef();
        this.focusedRowKey = React.createRef();
        this.keyDownClicked = React.createRef(false);
        this.editSpecService = new EditSpecService();
        this.state = {
            allRowsShow: false,
            keyDownClicked: false,
            focusedRowKey: UrlUtils.getURLParameter('selectedFromPrevGrid')
                ? parseInt(UrlUtils.getURLParameter('selectedFromPrevGrid'))
                : undefined,
            editListVisible: false,
            imageViewer: {
                imageViewDialogVisisble: false,
                editable: false,
                imageBase64: undefined,
                header: undefined,
            },
            editorViewer: {
                editorDialogVisisble: false,
                editable: false,
                value: undefined,
                header: undefined,
            },
            selectedRecordId: undefined,
        };
        this.rowRenderingMode = UrlUtils.isBatch() ? 'standard' : 'virtual';
        ConsoleHelper('GridViewComponent -> constructor');
    }
    showMenu(e) {
        const menu = this.menu.current;
        ActionButtonWithMenuUtils.hideActionButtonWithMenuPopup();
        if (menu !== null && e.row.rowType === 'data' && !!e?.row?.data?.ID) {
            const mouseX = e.event.clientX;
            const mouseY = e.event.clientY;
            e.event.stopPropagation();
            e.event.preventDefault();
            menu.show(e.event);
            this.setState({selectedRecordId: e.row.data.ID}, () => {
                const menu = document.getElementById('menu-with-buttons');
                const menuHeight = menu.clientHeight + 50;
                const browserHeight = window.innerHeight;
                let heighY = mouseY;
                if (browserHeight < menuHeight + mouseY - 50) {
                    heighY = mouseY - menuHeight + 50;
                }
                menu.style.left = mouseX + 'px';
                menu.style.top = heighY + 'px';
                this.clickedPosition.current = {
                    x:mouseX +"px",
                    y:mouseY + 'px'
                }
            });
        } else if (menu !== null && e.row.rowType === 'data') {
            menu.hide(e.event);
        }
    }
    ifSelectAllEvent(e) {
        return e.cellElement?.className?.includes(
            'dx-command-select dx-cell-focus-disabled dx-editor-cell dx-editor-inline-block'
        );
    }

    ifSelectEvent(e) {
        return e.cellElement?.className?.includes(
            'dx-command-select dx-editor-cell dx-editor-inline-block dx-cell-focus-disabled'
        );
    }

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

    componentDidMount(){
        super.componentDidMount();     
        this.unregisterKeydownEvent()
        this.registerKeydownEvent();
    }
    componentWillUnmount(){
        this.unregisterKeydownEvent()
    }
    registerKeydownEvent() {
       const gridContainer =  document.getElementById("grid-container");
       if(gridContainer){
           gridContainer.addEventListener('mousedown', this.handleAltAndLeftClickFunction);
       }
    }
    unregisterKeydownEvent() {
        const gridContainer =  document.getElementById("grid-container");
        if(gridContainer){
            gridContainer.removeEventListener('mousedown', this.handleAltAndLeftClickFunction);
        }
    }
    handleSpaceClickFunction = (event) =>{ 
        if (event.code === 'Space' || event.keyCode === 32) {
            const gridRef = this.props?.getRef()?._instance;
            if(gridRef){
                const dxStateHovers =  Array.from(document.getElementsByClassName("dx-state-hover"));
                if(dxStateHovers.length>0){
                const currentHoveredRowIndex =  dxStateHovers[0].rowIndex;
                let selectedRows = this.props.selectedRows;
                    const element = {
                        ID: `${this.props.getRef().instance.getKeyByRowIndex(currentHoveredRowIndex)}`,
                    };
                    if (selectedRows.find((row) => row.ID === element.ID)) {
                        selectedRows = selectedRows.filter((selectedRow) => selectedRow.ID !== element.ID);
                    } else {
                        selectedRows.push(element);
                    }
                    const gridRef = this.props.getRef()._instance;
                    gridRef.selectRows(selectedRows.map(el=>el.ID))
                    this.props.handleSelectRows(selectedRows);
            }
           }
        }
    }
    handleAltAndLeftClickFunction = (event) => {
        if (this.props.altAndLeftClickEnabled && event.button === 0 && event.altKey) {
            setTimeout(()=>{ 
                const isOnGrid = HtmlUtils.clickedInsideComponent(event, "grid-container");
            if (this.currentClickedCell.current && this.props?.getRef() && isOnGrid) {
                        const clickedCell = parseInt(this.currentClickedCell.current);
                        const gridRef = this.props.getRef()._instance;
                        let selectedRows = this.props.selectedRows.map(selectedRow => {return{ID: parseInt(selectedRow.ID)}});
                        if (selectedRows.find((row) => row.ID  === clickedCell)) {
                            selectedRows = selectedRows.filter((selectedRow) => selectedRow.ID !== clickedCell);
                        } else {
                             selectedRows.push({ID:clickedCell});
                        }
                         gridRef.selectRows(selectedRows.map(el=>el.ID))
                         this.props.handleSelectRows(selectedRows);
                }},0)
           
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
            !!this.props.packageRows || this.props.packageRows === 0
                ? Constants.DEFAULT_DATA_PACKAGE_COUNT
                : this.props.packageRows;
        if (this.props.cellModeEnabled && this.state.allRowsShow) {
            return this.props.packageRows;
        }
        return result;
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
                <ActionButton
                    rendered={true}
                    label={LocUtils.loc(this.props.labels, 'Add_button', 'Dodaj')}
                    handleClick={(e) => {
                        this.props.addButtonFunction(e);
                    }}
                />
            )
        );
    }

    addButtonExist(){
        const opAdd = !!DataGridUtils.getOpButton(this.props.parsedGridView?.operations, OperationType.OP_ADD_BUTTON);
        const opAddFile = !!DataGridUtils.getOpButton(
            this.props.parsedGridView?.operations,
            OperationType.OP_ADD_FILE_BUTTON
        );
        const opAddSpec = !!DataGridUtils.getOpButton(
            this.props.parsedGridView?.operations,
            OperationType.OP_ADD_SPEC_BUTTON
        );
        return !UrlUtils.isBatch() && (opAdd || opAddSpec || opAddFile);
    }

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
        const packageCount = this.getPackageCount();
        const kindView = this.props.elementKindView;
        const subViewId = this.props.elementSubViewId;
        const selectedRecordId = this.state.selectedRecordId;
        const parentId = this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const viewId = DataGridUtils.getRealViewId(subViewId, this.props.id);
        return (
            <React.Fragment>
                {this.state.editListVisible && this.editListComponent()}
                {this.state.editorViewer.editorDialogVisisble &&
                    this.editorComponent(UrlUtils.isBatch(), this.state.editorViewer)}
                {this.imageViewerComponent()}
                <DataGrid
                    onContextMenuPreparing={(e) => {
                        this.showMenu(e);
                    }}
                    onKeyDown={(e) => {
                        this.keyDownClicked.current = true;
                       
                    }}
                    id={`grid-container`}
                    defaultFocusedRowKey={this.state.focusedRowKey}
                    keyExpr='ID'
                    className={`${this.props?.isAttachement ? 'attachement ' : 'grid'} ${this.props?.className ? this.props?.className : ''} grid-container${
                        headerAutoHeight ? ' grid-header-auto-height' : ''
                    } ${this.canRenderAdditionalOperationCol() ? 'grid-with-opperations' : ''}`}
                    ref={(ref) => {
                        this.props.handleOnDataGrid(ref);
                    }}  
                    onRowClick={(e) => {
                        this.currentClickedCell.current = e.data.ID;
                    }}
                    onFocusedRowChanging={(e)=>{
                        if(e.rows[e.newRowIndex]?.data){
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
                        if (e.fullName.includes('filterValue') && e.name === 'columns') {
                            if (this.labels?.getRef) {
                                this.labels.getRef().instance.clearSelection();
                                if (this.props?.handleUnselectAll) {
                                    this.props.handleUnselectAll();
                                }
                            }
                        }
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
                        }if (!!this.props.handleSelectAll && this.keyDownClicked.current) {
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
                                this.props.handleSelectAll(null);
                            } else if (this.hasSelectClass(e)) {
                                // global dla mobile
                                this.props.handleSelectAll(null);
                            }
                            this.keyDownClicked.current = false;
                        }
                    }}
                    onInitialized={(ref) => {
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
                    <FilterRow visible={showFilterRow} applyFilter={true} />
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />
                    <Grouping autoExpandAll={groupExpandAll} allowCollapsing={true} contextMenuEnabled={true} />
                    <GroupPanel visible={showGroupPanel} />
                    <Sorting mode='multiple' />
                    <Selection
                        mode={this.selectionMode()}
                        selectAllMode='allPages'
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
                    <Paging defaultPageSize={packageCount} pageSize={packageCount} />
                    <LoadPanel
                        enabled={true}
                        showIndicator={false}
                        shadingColor='rgba(0,0,0,0.4)'
                        showPane={false}
                        position='absolute'
                    />
                    {this.preGenerateColumnsDefinition()}
                </DataGrid>
                {this.props.parsedGridView?.operationsPPM && this.props.parsedGridView.operationsPPM.length !== 0 && (
                    <MenuWithButtons
                        gridView={this.props.parsedGridView}
                        clickedPosition={this.clickedPosition}
                        handlePlugins={(e) =>  
                            this.props.handlePluginRow(e.id, selectedRecordId)
                        }
                        handleDocuments={(e) => {
                            this.props.handleDocumentRow(e.id, selectedRecordId)
                        }}
                        handleSaveAction={() => this.props.handleSaveAction()}
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
                        handleDocumentsSk={(el) => {
                            this.props.handleDocumentRow(el.id)}}
                       
                        handlePluginsSk={(el) => {
                            this.props.handlePluginRow(el.id)}}
                       
                        handleBatch={(e) => this.handleBatch(e.id, viewId, parentId, selectedRecordId) }
                        handleAdd={() => this.props.addButtonFunction()}
                        handleAddSpec={()=>this.props.addButtonFunction()}
                        handleDownload={() => this.props.handleDownloadRow(selectedRecordId)}
                        handleAttachments={() => this.props.handleAttachmentRow(selectedRecordId)}
                        handleDelete={() => this.props.handleDeleteRow(selectedRecordId)}
                        handleRestore={() => this.props.handleRestoreRow(selectedRecordId)}
                        handleFormula={() => this.props.handleFormulaRow(selectedRecordId)}
                        handleHistory={() => this.props.handleHistoryLogRow(selectedRecordId)}
                        handleFill={() => this.props.handleFillRow(selectedRecordId)}
                        operationList={this.props.parsedGridView.operationsPPM}
                        menu={this.menu}
                    />
                )}                

            </React.Fragment>
        );
    }
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
        if(dxRowFocused){
            let selectedRows = this.props.selectedRows;
            const currentSelectedRowIndex = dxRowFocused.rowIndex;
            const element = {
                ID: `${this.props.getRef().instance.getKeyByRowIndex(currentSelectedRowIndex)}`,
            };
            if (selectedRows.find((row) => parseInt(row.ID)  === parseInt(element.ID))) {
                selectedRows = selectedRows.filter((selectedRow) => parseInt(selectedRow.ID) !== parseInt(element.ID));
            } else {
                selectedRows.push(element);
            }
            this.props.handleSelectRows(selectedRows);
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
    postCustomizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            columns
                .filter((column) => column.visible === true)
                ?.forEach((column) => {
                    if (column.name === '_ROWNUMBER') {
                        column.visible = false;
                    } else {
                        let columnDefinitionArray = this.props.gridViewColumns?.filter(
                            (value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase()
                        );
                        if (columnDefinitionArray) {
                            const columnDefinition = columnDefinitionArray[0];
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
                                if (columnDefinition.type === 'B' || columnDefinition.type === 'L') {
                                    column.showEditorAlways = false;
                                }
                                column.cellTemplate = this.getCellTemplate(columnDefinition);
                                column.dataType = DataGridUtils.specifyColumnType(columnDefinition?.type);
                                column.format = DataGridUtils.specifyColumnFormat(columnDefinition?.type);
                                column.fixed = this.getFixed(columnDefinition);
                                column.fixedPosition = this.getFixedPosition(columnDefinition);
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
                    caption: '',
                    fixed: true,
                    headerCellTemplate: (element) => {
                        element.parentNode.classList.add('header-button');
                        ReactDOM.render(this.addButton(), element);
                    },
                    width: ViewDataCompUtils.operationsColumnLength(operationsRecord, operationsRecordList, this.addButtonExist()),
                    fixedPosition: 'right',
                    cellTemplate: (element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        const subViewId = this.props.elementSubViewId;
                        const kindView = this.props.elementKindView;
                        const recordId = info.row?.data?.ID;
                        const parentId = this.props.elementRecordId;
                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                        let viewId = this.props.id;
                        viewId = DataGridUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.render(
                            <div style={{textAlign: 'center', display: 'flex'}}>
                                <OperationsButtons
                                    labels={this.labels}
                                    operations={operationsRecord}
                                    operationList={operationsRecordList}
                                    info={info}
                                    handleEdit={() =>
                                        this.handleEdit(viewId, parentId, kindView, recordId, currentBreadcrumb)
                                    }
                                    handleEditSpec={() => {
                                        this.handleEditSpec(viewId, parentId, recordId, currentBreadcrumb);
                                    }}
                                    hrefSubview={AppPrefixUtils.locationHrefUrl(
                                        this.subViewHref(viewId, recordId, parentId, currentBreadcrumb)
                                    )}
                                    hrefSpecView={() => {
                                        return EditSpecUtils.editSpecUrl(
                                            viewId,
                                            TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                ? parentId
                                                : recordId,
                                            compress(
                                                TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                    ? [recordId]
                                                    : []
                                            ),
                                            currentBreadcrumb
                                        );
                                    }}
                                    handleHrefSubview={() =>
                                        this.handleHrefSubview(viewId, recordId, currentBreadcrumb)
                                    }
                                    handleArchive={() => this.props.handleArchiveRow(recordId)}
                                    handlePublish={() => this.props.handlePublishRow(recordId)}
                                    handleCopy={() => this.props.handleCopyRow(recordId)}
                                    handleDocuments={(el) => this.props.handleDocumentRow(el.id)}
                                    handlePlugins={(el) => this.props.handlePluginRow(el.id)}
                                    handleDownload={() => this.props.handleDownloadRow(recordId)}
                                    handleBatch={(batch) => this.handleBatch(batch.id, viewId, parentId, recordId)}
                                    handleAttachments={() => this.props.handleAttachmentRow(recordId)}
                                    handleDelete={() => this.props.handleDeleteRow(recordId)}
                                    handleRestore={() => this.props.handleRestoreRow(recordId)}
                                    handleFormula={() => this.props.handleFormulaRow(recordId)}
                                    handleHistory={() => this.props.handleHistoryLogRow(recordId)}
                                    handleFill={() => this.props.handleFillRow(recordId)}
                                    handleBlockUi={() => this.props.handleBlockUi()}
                                />
                            </div>,
                            element
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
    getCellTemplate(columnDefinition) {
        return DataGridUtils.cellTemplate(
            columnDefinition,
            this.isEditableCell(columnDefinition),
            (value, header) => {
                this.setState({
                    imageViewer: {
                        imageViewDialogVisisble: true,
                        editable: this.isEditableCell(columnDefinition),
                        imageBase64: value,
                        header: header,
                    },
                });
            },
            (value, header) => {
                if (UrlUtils.isBatch()) {
                    return;
                }
                this.setState({
                    editorViewer: {
                        editorDialogVisisble: true,
                        editable: false,
                        value: value,
                        header: header,
                    },
                });
            }
        );
    }
    getFixed(columnDefinition) {
        return columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
            ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right'
            : false;
    }
    getFixedPosition(columnDefinition) {
        return !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
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
        const selectedRowKeys = [
            {
                ID: selectedRecordId,
            },
        ];
        if (StringUtils.isBlank(parentId)) {
            parentId = 0;
        }
        const urlEditSpecBatch = AppPrefixUtils.locationHrefUrl(
            `/#/batch/${viewId}?batchId=${batchId}&parentId=${parentId}`
        );
        saveObjToCookieGlobal('selectedRowKeys', selectedRowKeys);
        window.location.href = urlEditSpecBatch;
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
    handleEdit(viewId, parentId, kindView, recordId, currentBreadcrumb) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
            this.editSpecService
                .getViewEntry(viewId, parentId, [recordId], kindView, null)
                .then((entryResponse) => {
                    EntryResponseHelper.run(
                        entryResponse,
                        () => {
                            if (!!entryResponse.next) {
                                const compressedRecordId = compress([recordId]);
                                EditSpecUtils.navToEditSpec(viewId, parentId, compressedRecordId, currentBreadcrumb);
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
                this.crudService
                    .editEntry(viewId, recordId, parentId, kindView, '')
                    .then((entryResponse) => {
                        EntryResponseHelper.run(
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
        let prevUrl = window.location.href;
        sessionStorage.setItem('prevUrl', prevUrl);
        TreeListUtils.openEditSpec(
            viewId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? parentId : recordId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? [recordId] : [],
            currentBreadcrumb,
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

    subViewHref = (viewId, recordId, parentId, currentBreadcrumb) => {
        parentId = StringUtils.isBlank(parentId) ? 0 : parentId;
        return `/#/grid-view/${viewId}${
            !!recordId ? `?recordId=${recordId}` : ``
        }&parentId=${parentId}${currentBreadcrumb}`;
    };

    preGenerateColumnsDefinition = () => {
        const columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            columns.push(this.generateCustomizeColumn(INDEX_COLUMN, sortOrder, columnDefinition));
        });

        return columns;
    };
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
        this.props.handleMaxPackgeCount();
        this.setState(
            {
                allRowsShow: true,
            },
            () => {
                const refGrid = this.props.getRef();
                refGrid.instance.getDataSource().reload();
                setTimeout(() => {
                    this.dawnFillParsedData(rowIndex, fieldName, value);
                }, 100);
            }
        );
    }

    dawnFillParsedData = (selectedRowIndex, fieldName, value) => {
        const refGrid = this.props.getRef();
        const elementRowsToEdit = [];
        this.props.parsedGridViewData.forEach((row) => {
            const key = row.ID; 
            const rIndex = refGrid.instance.getRowIndexByKey(key);
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
                refGrid.instance.getDataSource().reload();
            }
        );
    };

    generateCustomizeColumn = (keyIndex, sortOrder, columnDefinition) => {
        return this.isEditableCell(columnDefinition) ? (
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
    showSelection: true,
    dataGridStoreSuccess: true,
    altAndLeftClickEnabled: false,
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
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
    dataGridHeight: PropTypes.number,
    dataGridStoreSuccess: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    allowSelectAll: PropTypes.bool,
    handleMaxPackgeCount: PropTypes.func,
    handleFillDownParsedData: PropTypes.func,

    gridFromDashboard: PropTypes.bool,
};

export default GridViewComponent;

import React from 'react';
import PropTypes from "prop-types";
import DataGrid, {
    Column,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    LoadPanel,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting
} from "devextreme-react/data-grid";
import Constants from "../../utils/Constants";
import ConsoleHelper from "../../utils/ConsoleHelper";
import BaseViewComponent from "../common/BaseViewComponent";
import CrudService from "../../services/CrudService";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
class GridViewComponent extends BaseViewComponent  {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.crudService = new CrudService();
        ConsoleHelper('GridViewComponent -> constructor');
    }

    ifSelectAllEvent(e) {
        return e.cellElement?.className?.includes('dx-command-select dx-cell-focus-disabled dx-editor-cell dx-editor-inline-block');
    }

    ifSelectEvent(e) {
        return e.cellElement?.className?.includes('dx-command-select dx-editor-cell dx-editor-inline-block dx-cell-focus-disabled');
    }

    selectAllEvent(e) {
        const value = e?.cellElement?.children[0]?.children[0]?.value;
        return value === 'true' || value === true;
    }

    preGenerateColumnsDefinition() {
        let columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            columns.push(<Column
                key={INDEX_COLUMN}
                dataField={columnDefinition.fieldName}
                sortOrder={sortOrder}
                sortIndex={columnDefinition?.sortIndex}
            />);
        })
        return columns;
    }

    waitForSuccess() {
        return this.props.dataGridStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    render() {
        const showGroupPanel = this.props.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        //odkomentowac dla mock
        //const multiSelect = true;
        //multiSelect dla podpowiedzi
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = (multiSelect === undefined || multiSelect === null || !!multiSelect);
        const packageCount = (!!this.props.packageRows || this.props.packageRows === 0) ? Constants.DEFAULT_DATA_PACKAGE_COUNT : this.props.packageRows;
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        //myk zeby nie pojawiałą sie ramka tabelki przy wczytywaniu
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataGridHeight = this.props.dataGridHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = (selectAll === undefined || selectAll === null || !!selectAll);
        const defaultSelectedRowKeys = this.props.defaultSelectedRowKeys;
        const selectedRowKeys = this.props.selectedRowKeys;
        return (
            <React.Fragment>
                <DataGrid
                    id='grid-container'
                    keyExpr='ID'
                    className={`grid-container${headerAutoHeight ? ' grid-header-auto-height' : ''}`}
                    ref={(ref) => {
                        this.props.handleOnDataGrid(ref)
                    }}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this.postCustomizeColumns}
                    wordWrapEnabled={rowAutoHeight}
                    columnAutoWidth={columnAutoWidth}
                    columnResizingMode='widget'
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    showColumnLines={showColumnLines}
                    showRowLines={showRowLines}
                    showBorders={showBorders}
                    showColumnHeaders={showColumnHeaders}
                    columnHidingEnabled={false}
                    height={dataGridHeight ? (dataGridHeight + 'px') : '100%'}
                    width={columnAutoWidth ? '100%' : undefined}
                    rowAlternationEnabled={false}
                    selectedRowKeys={defaultSelectedRowKeys || selectedRowKeys}
                    onSelectionChanged={this.props.handleSelectedRowKeys}
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
                            }
                        }
                    }}
                    onInitialized={(ref) => {
                        if (!!this.props.handleOnInitialized)
                            this.props.handleOnInitialized(ref)
                    }}
                    onContentReady={(e) => {
                        //myczek na rozjezdzajace sie linie wierszy w dataGrid
                        // $(document).ready(function () {
                        e.component.resize();
                        // });
                    }}
                >
                    <RemoteOperations
                        filtering={true}
                        summary={true}
                        sorting={true}
                        paging={true}
                        grouping={true}
                        groupPaging={true}
                    />

                    <FilterRow visible={showFilterRow} applyFilter={true}/>
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

                    <Grouping autoExpandAll={groupExpandAll} allowCollapsing={true} contextMenuEnabled={true}/>
                    <GroupPanel visible={showGroupPanel}/>

                    <Sorting mode='multiple'/>

                    <Selection mode={showSelection ? (multiSelection ? 'multiple' : 'single') : 'none'}
                               selectAllMode='allPages'
                               showCheckBoxesMode='always'
                               allowSelectAll={allowSelectAll}
                               deferred={this.props.selectionDeferred}
                    />

                    <Scrolling mode="virtual" rowRenderingMode="virtual" preloadEnabled={false}/>
                    <Paging defaultPageSize={packageCount} pageSize={packageCount}/>

                    <LoadPanel enabled={true}
                               showIndicator={true}
                               shadingColor="rgba(0,0,0,0.4)"
                               showPane={false}
                               position="absolute"/>
                    {this.preGenerateColumnsDefinition()}
                </DataGrid>
            </React.Fragment>
        );
    }
}

GridViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    packageRows: Constants.DEFAULT_DATA_PACKAGE_COUNT,
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true,
    dataGridStoreSuccess: true,
    allowSelectAll: true,
    selectionDeferred: false
};

GridViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    elementSubViewId: PropTypes.number,
    elementRecordId: PropTypes.number,
    elementKindView: PropTypes.string,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    packageRows: PropTypes.number,
    handleOnDataGrid: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    handleShowEditPanel: PropTypes.func,
    //selection
    selectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowKeys: PropTypes.func,
    handleSelectAll: PropTypes.func,
    selectionDeferred: PropTypes.bool,
    //buttons
    handleArchiveRow: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired,
    handlePublishRow: PropTypes.func.isRequired,
    //other
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showInfoMessages: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
    dataGridHeight: PropTypes.number,
    dataGridStoreSuccess: PropTypes.bool,
    allowSelectAll: PropTypes.bool
};


export default GridViewComponent;

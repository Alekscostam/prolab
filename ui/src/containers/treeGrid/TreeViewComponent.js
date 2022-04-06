import React from 'react';
import PropTypes from "prop-types";
import CrudService from "../../services/CrudService";
import Constants from "../../utils/Constants";
import ConsoleHelper from "../../utils/ConsoleHelper";
import {TreeList} from "devextreme-react";
import {
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
    LoadPanel,
    Scrolling,
    Selection,
    Sorting
} from "devextreme-react/tree-list";
import BaseViewComponent from "../common/BaseViewComponent";
import {RemoteOperations} from "devextreme-react/data-grid";
//
//    https://js.devexpress.com/Documentation/Guide/UI_Components/TreeList/Getting_Started_with_TreeList/
//
class TreeViewComponent extends BaseViewComponent {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        ConsoleHelper('TreeViewComponent -> constructor');
    }

    render() {
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        //odkomentowac dla mock
        //const multiSelect = true;
        //multiSelect dla podpowiedzi
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = (multiSelect === undefined || multiSelect === null || !!multiSelect);
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        //myk zeby nie pojawiałą sie ramka tabelki przy wczytywaniu
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataTreeHeight = this.props.dataTreeHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = (selectAll === undefined || selectAll === null || !!selectAll);
        const selectedRowKeys = this.props.selectedRowKeys;
        return (<React.Fragment>
            <TreeList
                id='tree-container'
                keyExpr='ID'
                className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                ref={(ref) => {
                    this.props.handleOnDataTree(ref)
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
                height={dataTreeHeight ? (dataTreeHeight + 'px') : '100%'}
                width={columnAutoWidth ? '100%' : undefined}
                rowAlternationEnabled={false}
                selectedRowKeys={selectedRowKeys}
                onSelectionChanged={(e) => this.props.handleSelectedRowKeys(e.selectedRowKeys)}
                renderAsync={true}
                selectAsync={false}
                cacheEnabled={false}
                onInitialized={(ref) => {
                    if (!!this.props.handleOnInitialized) this.props.handleOnInitialized(ref)
                }}
                onContentReady={(e) => {
                    //myczek na rozjezdzajace sie linie wierszy w dataTree
                    // $(document).ready(function () {
                    e.component.resize();
                    // });
                }}
                rootValue={0}
                parentIdExpr="_ID_PARENT"
            >
                <RemoteOperations
                    filtering={false}
                    summary={false}
                    sorting={false}
                    paging={false}
                    grouping={false}
                    groupPaging={false}
                />

                <Editing
                    allowAdding={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    mode="cell" />

                <FilterRow visible={showFilterRow} applyFilter={true}/>

                <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

                <Sorting mode='multiple'/>

                <Selection mode={showSelection ? (multiSelection ? 'multiple' : 'single') : 'none'}
                           selectAllMode='allPages'
                           showCheckBoxesMode='always'
                           allowSelectAll={allowSelectAll}
                />

                <Scrolling mode="virtual" rowRenderingMode="virtual" preloadEnabled={false}/>

                <LoadPanel enabled={true}
                           showIndicator={true}
                           shadingColor="rgba(0,0,0,0.4)"
                           showPane={false}
                           position="absolute"/>
                {this.preGenerateColumnsDefinition()}
            </TreeList>
        </React.Fragment>);
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
}

TreeViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true,
    allowSelectAll: true
};

TreeViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    handleOnDataTree: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    selectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowKeys: PropTypes.func,
    handleArchiveRow: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired, //other
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
    dataTreeHeight: PropTypes.number,
    allowSelectAll: PropTypes.bool
};

export default TreeViewComponent;

import React from 'react';
import PropTypes from "prop-types";

import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import {GridViewUtils} from "../../utils/GridViewUtils";
import ReactDOM from "react-dom";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import AddEditService from "../../services/AddEditService";
import moment from "moment";
import Constants from "../../utils/Constants";
import ConsoleHelper from "../../utils/ConsoleHelper";
import OperationRecordButtons from "../../components/prolab/OperationRecordButtons";
import {EntryResponseUtils} from "../../utils/EntryResponseUtils";
import {TreeList} from "devextreme-react";
import {
    Column, ColumnChooser,
    FilterRow,
    HeaderFilter,
    LoadPanel,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting
} from "devextreme-react/tree-list";
//
//    https://js.devexpress.com/Documentation/Guide/UI_Components/TreeList/Getting_Started_with_TreeList/
//
class TreeViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataTree = null;
        this.editService = new AddEditService();
        ConsoleHelper('TreeViewComponent -> constructor');
    }

    calculateCustomFilterExpression(value, operations, target, columnDefinition) {
        ConsoleHelper('calculateFilterExpression:: value: %s operations: %s target: %s columnDefinition: %s', value, operations, target, JSON.stringify(columnDefinition))
        try {
            if (!!columnDefinition) {
                if (operations === "between") {
                    let dateFormatted1 = this.formatDateFilterExpression(columnDefinition.type, value[0]);
                    let dateFormatted2 = this.formatDateFilterExpression(columnDefinition.type, value[1]);
                    return this.customFilterExpression(operations, columnDefinition.fieldName, [dateFormatted1, dateFormatted2]);
                } else {
                    const dateFormatted = this.formatDateFilterExpression(columnDefinition.type, value);
                    return this.customFilterExpression(operations, columnDefinition.fieldName, dateFormatted);
                }
            }
        } catch (err) {
            return undefined;
        }
    }

    formatDateFilterExpression(type, value) {
        const dateMoment = moment(value);
        if (type === "D") {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_FORMAT_MOMENT)
        } else if (type === "E") {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_TIME_FORMAT_MOMENT)
        } else {
            throw new Error('BAD_TYPE');
        }
    }

    customFilterExpression(operations, fieldName, dateFormatted) {
        switch (operations) {
            case '=':
                return [[fieldName, '=', dateFormatted]];
            case '<>':
                return [[fieldName, '<>', dateFormatted]];
            case '<':
                return [[fieldName, '<', dateFormatted]];
            case '>':
                return [[fieldName, '>', dateFormatted]];
            case '<=':
                return [[fieldName, '<=', dateFormatted]];
            case '>=':
                return [[fieldName, '>=', dateFormatted]];
            case 'between':
                return [[fieldName, '>=', dateFormatted[0]], 'and', [fieldName, '<=', dateFormatted[1]]];
            default:
                return undefined;
        }
    }

    menuWidth(showButton, widthTmp) {
        if (showButton) {
            widthTmp += 35;
        } else {
            widthTmp += 5;
        }
        return widthTmp;
    }

    postCustomizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            //when viewData respond a lot of data

            columns.filter((column) => column.visible === true)?.forEach((column) => {
                if (column.name === '_ROWNUMBER') {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinitionArray = this.props.gridViewColumns?.filter((value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase());
                    const columnDefinition = columnDefinitionArray[0];
                    if (columnDefinition) {
                        column.visible = columnDefinition?.visible;
                        column.allowFiltering = columnDefinition?.isFilter;
                        column.allowFixing = true;
                        column.allowGrouping = columnDefinition?.isGroup;
                        column.allowReordering = true;
                        column.allowResizing = true;
                        column.allowSorting = columnDefinition?.isSort;
                        column.visibleIndex = columnDefinition?.columnOrder;
                        column.headerId = 'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                        //TODO zmienić
                        column.width = columnDefinition?.width || 100;
                        column.name = columnDefinition?.fieldName;
                        column.caption = columnDefinition?.label;
                        column.dataType = GridViewUtils.specifyColumnType(columnDefinition?.type);
                        column.format = GridViewUtils.specifyColumnFormat(columnDefinition?.type);
                        // column.editorOptions = GridViewUtils.specifyEditorOptions(columnDefinition?.type);
                        column.cellTemplate = GridViewUtils.cellTemplate(columnDefinition);
                        column.fixed = columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right' : false;
                        column.fixedPosition = !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
                        if (!!columnDefinition.groupIndex && columnDefinition.groupIndex > 0) {
                            column.groupIndex = columnDefinition.groupIndex;
                        }
                        if (columnDefinition?.type === 'D' || columnDefinition?.type === 'E') {
                            column.calculateFilterExpression = (value, selectedFilterOperations, target) => this.calculateCustomFilterExpression(value, selectedFilterOperations, target, columnDefinition)
                        }
                        column.headerFilter = {groupInterval: null}
                        column.renderAsync = true;
                        INDEX_COLUMN++;
                    } else {
                        column.visible = false;
                    }
                }
            });
            let operationRecord = this.props.parsedGridView?.operationRecord;
            let operationsRecordList = this.props.parsedGridView?.operationsRecordList;
            if (!(operationRecord instanceof Array)) {
                operationRecord = [];
                operationRecord.push(this.props.parsedGridView?.operationRecord)
            }
            if (operationRecord instanceof Array && operationRecord.length > 0) {
                columns?.push({
                    caption: '',
                    fixed: true,
                    width: 10 + (33 * operationRecord.length + (operationsRecordList?.length > 0 ? 33 : 0)),
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
                        viewId = GridViewUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.render(<div style={{textAlign: 'center', display: 'flex'}}>
                            <OperationRecordButtons labels={this.labels}
                                                    operation={operationRecord}
                                                    operationList={operationsRecordList}
                                                    info={info}
                                                    handleEdit={() => {
                                                        let result = this.props.handleBlockUi();
                                                        if (result) {
                                                            this.editService
                                                                .editEntry(viewId, recordId, parentId, kindView, '')
                                                                .then((entryResponse) => {
                                                                    EntryResponseUtils.run(entryResponse, () => {
                                                                        if (!!entryResponse.next) {
                                                                            this.editService
                                                                                .edit(viewId, recordId, parentId, kindView)
                                                                                .then((editDataResponse) => {
                                                                                    this.setState({
                                                                                        editData: editDataResponse
                                                                                    }, () => {
                                                                                        this.props.handleShowEditPanel(editDataResponse);
                                                                                    });
                                                                                })
                                                                                .catch((err) => {
                                                                                    this.props.showErrorMessages(err);
                                                                                });
                                                                        } else {
                                                                            this.props.handleUnblockUi();
                                                                        }
                                                                    }, () => this.props.handleUnblockUi());
                                                                }).catch((err) => {
                                                                this.props.showErrorMessages(err);
                                                            });
                                                        }
                                                    }}
                                                    hrefSubview={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`)}
                                                    handleHrefSubview={() => {
                                                        let newUrl = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${!!currentBreadcrumb ? currentBreadcrumb : ``}`);
                                                        window.location.assign(newUrl);
                                                    }}
                                                    handleArchive={() => {
                                                        this.props.handleArchiveRow(recordId)
                                                    }}
                                                    handleCopy={() => {
                                                        this.props.handleCopyRow(recordId)
                                                    }}
                                                    handleDelete={() => {
                                                        this.props.handleDeleteRow(recordId)
                                                    }}
                                                    handleRestore={() => {
                                                        this.props.handleRestoreRow(recordId)
                                                    }}/>
                        </div>, element);
                    },
                });
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

    ifSelectAllEvent(e) {
        return e.cellElement?.className?.includes('dx-treelist-action dx-cell-focus-disabled dx-treelist-select-all dx-editor-inline-block dx-treelist-drag-action');
    }

    ifSelectEvent(e) {
        return e.cellElement?.className?.includes('dx-treelist-cell-expandable dx-cell-focus-disabled');
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
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
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
        const packageCount = (!!this.props.packageRows || this.props.packageRows === 0) ? Constants.DEFAULT_DATA_PACKAGE_COUNT : this.props.packageRows;
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
        const defaultSelectedRowKeys = this.props.defaultSelectedRowKeys;
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
                <FilterRow visible={showFilterRow} applyFilter={true}/>
                <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

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
            </TreeList>
        </React.Fragment>);
    }
}

TreeViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    packageRows: Constants.DEFAULT_DATA_PACKAGE_COUNT,
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true,
    dataTreeStoreSuccess: true,
    allowSelectAll: true,
    selectionDeferred: false
};

TreeViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    elementSubViewId: PropTypes.number,
    elementRecordId: PropTypes.number,
    elementKindView: PropTypes.string,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    packageRows: PropTypes.number,
    handleOnDataTree: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    handleShowEditPanel: PropTypes.func, //selection
    selectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowKeys: PropTypes.func,
    handleSelectAll: PropTypes.func,
    selectionDeferred: PropTypes.bool, //buttons
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
    dataTreeStoreSuccess: PropTypes.bool,
    allowSelectAll: PropTypes.bool
};


export default TreeViewComponent;

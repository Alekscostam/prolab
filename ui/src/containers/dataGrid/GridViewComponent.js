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
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import {GridViewUtils} from "../../utils/GridViewUtils";
import ReactDOM from "react-dom";
import ShortcutButton from "../../components/prolab/ShortcutButton";
import ActionButtonWithMenu from "../../components/prolab/ActionButtonWithMenu";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import EditService from "../../services/EditService";
import moment from "moment";
import Constants from "../../utils/Constants";
import ConsoleHelper from "../../utils/ConsoleHelper";
import $ from "jquery";

class GridViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.editService = new EditService();
        ConsoleHelper('GridViewComponent -> constructor');
    }

    calculateCustomFilterExpression(value, operations, target, columnDefinition) {
        ConsoleHelper('calculateFilterExpression:: value: %s operations: %s target: %s columnDefinition: %s',
            value, operations, target, JSON.stringify(columnDefinition))
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
            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
            columns.filter((column) => column.visible === true)?.forEach((column) => {
                if (column.name === '_ROWNUMBER') {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinitionArray = this.props.gridViewColumns?.filter(
                        (value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase()
                    );
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
                        column.fixed =
                            columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
                                ? columnDefinition?.freeze?.toLowerCase() === 'left' ||
                                columnDefinition?.freeze?.toLowerCase() === 'right'
                                : false;
                        column.fixedPosition = !!columnDefinition.freeze
                            ? columnDefinition.freeze?.toLowerCase()
                            : null;
                        if (!!columnDefinition.groupIndex && columnDefinition.groupIndex > 0) {
                            column.groupIndex = columnDefinition.groupIndex;
                        }
                        if (columnDefinition?.type === 'D' || columnDefinition?.type === 'E') {
                            column.calculateFilterExpression
                                = (value, selectedFilterOperations, target) => this.calculateCustomFilterExpression(value, selectedFilterOperations, target, columnDefinition)
                        }
                        column.headerFilter = {groupInterval: null}
                        column.renderAsync = true;
                        INDEX_COLUMN++;
                    } else {
                        column.visible = false;
                    }
                }
            });
            if (this.props.parsedGridView?.operations) {
                let showEditButton = false;
                let showSubviewButton = false;
                let menuItems = [];
                this.props.parsedGridView?.operations.forEach((operation) => {
                    showEditButton = showEditButton || operation.type === 'OP_EDIT';
                    //OP_SUBVIEWS
                    showSubviewButton = showSubviewButton || operation.type === 'OP_SUBVIEWS';
                    if (operation.type === 'OP_PUBLIC' ||
                        operation.type === 'OP_HISTORY' ||
                        operation.type === 'OP_ATTACHMENTS') {
                        menuItems.push(operation);
                    }
                });
                let showMenu = menuItems.length > 0;
                let widthTmp = 0;
                widthTmp = this.menuWidth(showMenu, widthTmp);
                widthTmp = this.menuWidth(showEditButton, widthTmp);
                widthTmp = this.menuWidth(showSubviewButton, widthTmp);
                if (showEditButton || showMenu || showSubviewButton) {
                    columns?.push({
                        caption: '',
                        width: widthTmp,
                        fixed: true,
                        fixedPosition: 'right',
                        cellTemplate: (element, info) => {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            const subViewId = this.props.elementSubViewId;
                            const kindView = this.props.elementKindView;
                            const recordId = info.row?.data?.ID;
                            const parentId = this.props.elementRecordId;
                            let viewId = this.props.id;
                            viewId = GridViewUtils.getRealViewId(subViewId, viewId);
                            ReactDOM.render(
                                <div style={{textAlign: 'center'}}>
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu`}
                                        iconName={'mdi-pencil'}
                                        title={GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_EDIT')?.label}
                                        handleClick={() => {
                                            let result = this.props.handleBlockUi();
                                            if (result) {
                                                this.editService
                                                    .getEdit(viewId, recordId, parentId, kindView)
                                                    .then((editDataResponse) => {
                                                        this.props.handleShowEditPanel(editDataResponse);
                                                    })
                                                    .catch((err) => {
                                                        this.props.showErrorMessages(err);
                                                    });
                                            }
                                        }}
                                        rendered={showEditButton}
                                    />
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu`}
                                        iconName={'mdi-playlist-plus '}
                                        title={GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_SUBVIEWS')?.label}
                                        href={AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`
                                        )}
                                        rendered={showSubviewButton}
                                    />
                                    <ActionButtonWithMenu
                                        id='more_shortcut'
                                        iconName='mdi-dots-vertical'
                                        className={``}
                                        items={menuItems}
                                        title={this.labels['View_AdditionalOptions']}
                                        rendered={showMenu}
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
                    //myczek na rozjezdzajace sie linie wierszy w dataGrid
                    onContentReady={(e) => {
                        $(document).ready(function () {
                            e.component.resize();
                        });
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
    dataGridStoreSuccess: PropTypes.bool,
    allowSelectAll: PropTypes.bool
};


export default GridViewComponent;

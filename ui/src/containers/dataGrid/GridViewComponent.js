import React from 'react';
import PropTypes from "prop-types";
import DataGrid, {
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
    Sorting
} from "devextreme-react/data-grid";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import {GridViewUtils} from "../../utils/GridViewUtils";
import ReactDOM from "react-dom";
import ShortcutButton from "../../components/ShortcutButton";
import ActionButtonWithMenu from "../../components/ActionButtonWithMenu";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import EditService from "../../services/EditService";
import moment from "moment";
import Constants from "../../utils/Constants";

class GridViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.editService = new EditService();
        console.log('GridViewComponent -> constructor');
    }

    calculateCustomFilterExpression(value, operations, target, columnDefinition) {
        console.log('calculateFilterExpression:: value: %s operations: %s target: %s columnDefinition: %s',
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

    customizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
            columns?.forEach((column) => {
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
                        column.onCellPrepared = GridViewUtils.onCellPrepared(columnDefinition);
                        column.fixed =
                            columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
                                ? columnDefinition?.freeze?.toLowerCase() === 'left' ||
                                columnDefinition?.freeze?.toLowerCase() === 'right'
                                : false;
                        column.fixedPosition = !!columnDefinition.freeze
                            ? columnDefinition.freeze?.toLowerCase()
                            : null;
                        if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                            column.sortIndex = columnDefinition?.sortIndex;
                            column.sortOrder = columnDefinition?.sortOrder?.toLowerCase();
                        }
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
                            const elementSubViewId = this.props.elementSubViewId;
                            const elementId = this.props.id;
                            const viewId = GridViewUtils.getRealViewId(elementSubViewId, elementId);
                            const recordId = info.row?.data?.ID;
                            const subviewId = elementSubViewId ? elementId : undefined;
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
                                                    .getEdit(viewId, recordId, subviewId)
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
                                    <ActionButtonWithMenu
                                        id='more_shortcut'
                                        iconName='mdi-dots-vertical'
                                        className={``}
                                        items={menuItems}
                                        title={this.labels['View_AdditionalOptions']}
                                        rendered={showMenu}
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
        return e.column.command === 'select' && e.column.visible === true && e.columnIndex === 0 && e.rowType === 'header';
    }

    render() {
        const showGroupPanel = this.props.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        const packageCount = this.props.packageRows;
        const showSelection = this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        const showBorders = this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        return (
            <React.Fragment>
                <DataGrid
                    id='grid-container'
                    className={`grid-container${headerAutoHeight ? ' grid-header-auto-height' : ''}`}
                    keyExpr='ID'
                    key='ID'
                    ref={(ref) => this.props.handleOnInitialized(ref)}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this.customizeColumns}
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
                    height='100%'
                    rowAlternationEnabled={false}
                    onSelectionChanged={(e) => this.props.handleSelectedRowKeys(e)}
                    renderAsync={true}
                    selectAsync={true}
                    onCellClick={(e) => {
                        if (!!this.props.handleSelectAll) {
                            if (this.ifSelectAllEvent(e)) {
                                this.props.handleSelectAll(true);
                            } else {
                                this.props.handleSelectAll(false);
                            }
                        }
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

                    <FilterRow visible={showFilterRow}/>
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

                    <Grouping autoExpandAll={groupExpandAll} allowCollapsing={true}/>
                    <GroupPanel visible={showGroupPanel}/>

                    <Sorting mode='multiple'/>

                    <Selection mode={showSelection ? 'multiple' : 'none'} selectAllMode='allPages'
                               showCheckBoxesMode='always' allowSelectAll={true}/>

                    <Scrolling mode="virtual" rowRenderingMode="virtual"/>
                    <Paging defaultPageSize={packageCount}/>

                    <LoadPanel enabled={false}
                               showIndicator={true}
                               shadingColor="rgba(0,0,0,0.4)"
                               showPane={false}
                               position="absolute"/>
                    <Editing mode='cell'/>
                </DataGrid>
            </React.Fragment>
        );
    }
}

GridViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    packageRows: 30,
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true
};

GridViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    elementSubViewId: PropTypes.number.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    selectedRowKeys: PropTypes.object.isRequired,
    packageRows: PropTypes.number,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleSelectedRowKeys: PropTypes.func.isRequired,
    handleSelectAll: PropTypes.func,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
};


export default GridViewComponent;

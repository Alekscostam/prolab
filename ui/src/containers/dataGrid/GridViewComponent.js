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

class GridViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.editService = new EditService();
        console.log('GridViewComponent -> constructor');
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
                        column.cellTemplate = GridViewUtils.cellTemplate(columnDefinition);
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
                    if (
                        operation.type === 'OP_PUBLIC' ||
                        operation.type === 'OP_HISTORY' ||
                        operation.type === 'OP_ATTACHMENTS'
                    ) {
                        menuItems.push(operation);
                    }
                });
                let showMenu = menuItems.length > 0;
                let widthTmp = 0;
                if (showMenu) {
                    widthTmp += 35;
                } else {
                    widthTmp += 5;
                }
                if (showEditButton) {
                    widthTmp += 35;
                } else {
                    widthTmp += 5;
                }
                if (showSubviewButton) {
                    widthTmp += 35;
                } else {
                    widthTmp += 5;
                }
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
                            let oppEdit = GridViewUtils.containsOperationButton(
                                this.props.parsedGridView?.operations,
                                'OP_EDIT'
                            );
                            let oppSubview = GridViewUtils.containsOperationButton(
                                this.props.parsedGridView?.operations,
                                'OP_SUBVIEWS'
                            );
                            //TODO utils
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
                                        title={oppEdit?.label}
                                        handleClick={() => {
                                            this.props.handleBlockUi();
                                            this.editService
                                                .getEdit(viewId, recordId, subviewId)
                                                .then((editDataResponse) => {
                                                    this.props.handleShowEditPanel(editDataResponse);
                                                })
                                                .catch((err) => {
                                                    this.props.showErrorMessages(err);
                                                });
                                        }}
                                        rendered={showEditButton && oppEdit}
                                    />
                                    <ActionButtonWithMenu
                                        id='more_shortcut'
                                        iconName='mdi-dots-vertical'
                                        className={``}
                                        items={menuItems}
                                        remdered={showMenu}
                                        title={this.labels['View_AdditionalOptions']}
                                    />
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu`}
                                        iconName={'mdi-playlist-plus '}
                                        title={oppSubview?.label}
                                        //rendered={oppSubview}
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

    render() {
        const showGroupPanel = this.props.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        return (
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
                showColumnLines={true}
                showRowLines={true}
                showBorders={true}
                columnHidingEnabled={false}
                height='100%'
                rowAlternationEnabled={false}
                onSelectionChanged={(e) => this.props.handleSelectedRowKeys(e)}
            >
                <RemoteOperations
                    filtering={true}
                    summary={true}
                    sorting={true}
                    paging={true}
                />

                <FilterRow visible={true}/>
                <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

                <Grouping autoExpandAll={groupExpandAll}/>
                <GroupPanel visible={showGroupPanel}/>

                <Sorting mode='multiple'/>
                <Selection mode='multiple' selectAllMode='allPages' showCheckBoxesMode='always'/>

                <Scrolling mode="virtual" rowRenderingMode="virtual"/>
                <Paging defaultPageSize={50}/>

                <LoadPanel enabled={false}/>
                <Editing mode='cell'/>
            </DataGrid>
        );
    }
}

GridViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
};

GridViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    elementSubViewId: PropTypes.number.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    selectedRowKeys: PropTypes.object.isRequired,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleSelectedRowKeys: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
};

export default GridViewComponent;

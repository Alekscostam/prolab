import React from 'react';
import PropTypes from 'prop-types';
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
import {EntryResponseUtils} from '../../utils/EntryResponseUtils';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string/src';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import {StringUtils} from '../../utils/StringUtils';
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
class GridViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;

        this.crudService = new CrudService();
        ConsoleHelper('GridViewComponent -> constructor');
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

    selectAllEvent(e) {
        const value = e?.cellElement?.children[0]?.children[0]?.value;
        return value === 'true' || value === true;
    }

    groupCellTemplate(element, data) {
        var span = document.createElement('span');
        span.innerHTML = data.column.caption + ': ' + data.text;
        element.append(span);
    }

    waitForSuccess() {
        return this.props.dataGridStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    render() {
        const showGroupPanel = this.props.gridFromDashboard
            ? false
            : this.props.parsedGridView?.gridOptions?.showGroupPanel || false;

        const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        //odkomentowac dla mock
        //const multiSelect = true;
        //multiSelect dla podpowiedzi
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = multiSelect === undefined || multiSelect === null || !!multiSelect;
        const packageCount =
            !!this.props.packageRows || this.props.packageRows === 0
                ? Constants.DEFAULT_DATA_PACKAGE_COUNT
                : this.props.packageRows;
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        //myk zeby nie pojawiałą sie ramka tabelki przy wczytywaniu
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataGridHeight = this.props.dataGridHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = selectAll === undefined || selectAll === null || !!selectAll;
        const defaultSelectedRowKeys = this.props.defaultSelectedRowKeys;
        const selectedRowKeys = this.props.selectedRowKeys;

        return (
            <React.Fragment>
                {/* <div className='dx-container'> */}
                <DataGrid
                    id='grid-container'
                    keyExpr='ID'
                    className={`grid-container${headerAutoHeight ? ' grid-header-auto-height' : ''}`}
                    ref={(ref) => {
                        this.props.handleOnDataGrid(ref);
                    }}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this?.postCustomizeColumns}
                    wordWrapEnabled={rowAutoHeight}
                    columnAutoWidth={columnAutoWidth}
                    focusedRowEnabled={this.props.focusedRowEnabled}
                    hoverStateEnabled={this.props.hoverStateEnabled}
                    autoNavigateToFocusedRow={false}
                    columnResizingMode='widget'
                    allowColumnReordering={true}
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
                        if (!!this.props.handleOnInitialized) this.props.handleOnInitialized(ref);
                    }}
                    onContentReady={(e) => {
                        //myczek na rozjezdzajace sie linie wierszy w dataGrid
                        // $(document).ready(function () {
                        if (e.component.shouldSkipNextReady) {
                            e.component.shouldSkipNextReady = false;
                        } else {
                            e.component.shouldSkipNextReady = true;
                            e.component.columnOption('command:select', 'width', 30);
                            e.component.updateDimensions();
                        }
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

                    <FilterRow visible={showFilterRow} applyFilter={true} />
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />

                    <Grouping autoExpandAll={groupExpandAll} allowCollapsing={true} contextMenuEnabled={true} />
                    <GroupPanel visible={showGroupPanel} />

                    <Sorting mode='multiple' />

                    <Selection
                        mode={showSelection ? (multiSelection ? 'multiple' : 'single') : 'none'}
                        selectAllMode='allPages'
                        showCheckBoxesMode='always'
                        allowSelectAll={allowSelectAll}
                        deferred={this.props.selectionDeferred}
                    />

                    {/*  byc moze moze byc sam standard mode bo i tak jest tutaj paginacja */}
                    {/* 
                    <Scrolling
                        mode='virtual'
                        rowRenderingMode={this.props.showRenderingViewMode === true ? 'virtual' : 'standard'}
                        preloadEnabled={false}
                    />
                     */}
                    <Scrolling mode='virtual' rowRenderingMode={'standard'} preloadEnabled={false} />

                    <Paging defaultPageSize={packageCount} pageSize={packageCount} />

                    <LoadPanel
                        enabled={true}
                        showIndicator={true}
                        shadingColor='rgba(0,0,0,0.4)'
                        showPane={false}
                        position='absolute'
                    />
                    {this.preGenerateColumnsDefinition()}
                </DataGrid>
                {/* </div> */}
            </React.Fragment>
        );
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
                        //match column after field name from view and viewData service
                        let columnDefinitionArray = this.props.gridViewColumns?.filter(
                            (value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase()
                        );
                        if (columnDefinitionArray) {
                            const columnDefinition = columnDefinitionArray[0];
                            if (columnDefinition) {
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
                                //TODO zmienić
                                column.width = columnDefinition?.width || 100;
                                column.name = columnDefinition?.fieldName;
                                column.caption = columnDefinition?.label;
                                column.dataType = DataGridUtils.specifyColumnType(columnDefinition?.type);
                                column.format = DataGridUtils.specifyColumnFormat(columnDefinition?.type);
                                // column.editorOptions = DataGridUtils.specifyEditorOptions(columnDefinition?.type);
                                column.cellTemplate = DataGridUtils.cellTemplate(columnDefinition);
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
            if (operationsRecord[0]) {
                if (operationsRecord instanceof Array && operationsRecord.length > 0) {
                    columns?.push({
                        caption: '',
                        fixed: true,
                        width: 10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0)),
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
                                        handleEdit={() => {
                                            if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
                                                this.crudService
                                                    .saveSpecEntry(viewId, parentId, [recordId], kindView, null)
                                                    .then((entryResponse) => {
                                                        EntryResponseUtils.run(
                                                            entryResponse,
                                                            () => {
                                                                if (!!entryResponse.next) {
                                                                    const compressedRecordId = compress([recordId]);
                                                                    EditSpecUtils.navToEditSpec(
                                                                        viewId,
                                                                        parentId,
                                                                        compressedRecordId,
                                                                        currentBreadcrumb
                                                                    );
                                                                } else {
                                                                    this.props.handleUnblockUi();
                                                                }
                                                            },
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
                                                                                        this.props.handleShowEditPanel(
                                                                                            editDataResponse
                                                                                        );
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
                                                                () => this.props.handleUnblockUi()
                                                            );
                                                        })
                                                        .catch((err) => {
                                                            this.props.showErrorMessages(err);
                                                        });
                                                }
                                            }
                                        }}
                                        handleEditSpec={() => {
                                            //edycja pojedynczego rekordu lub
                                            //edycja dla wszystkich rekordów, wywoływana krok wcześniej
                                            let prevUrl = window.location.href;
                                            sessionStorage.setItem('prevUrl', prevUrl);
                                            TreeListUtils.openEditSpec(
                                                viewId,
                                                TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                    ? parentId
                                                    : recordId,
                                                TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                    ? [recordId]
                                                    : [],
                                                currentBreadcrumb,
                                                () => this.props.handleUnblockUi(),
                                                (err) => this.props.showErrorMessages(err)
                                            );
                                        }}
                                        hrefSubview={AppPrefixUtils.locationHrefUrl(
                                            this.subViewHref(viewId, recordId, parentId, currentBreadcrumb)
                                        )}
                                        hrefSpecView={EditSpecUtils.editSpecUrl(
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
                                        )}
                                        handleHrefSubview={() => {
                                            let result = this.props.handleBlockUi();
                                            if (result) {
                                                let newUrl = AppPrefixUtils.locationHrefUrl(
                                                    `/#/grid-view/${viewId}${
                                                        !!recordId ? `?recordId=${recordId}` : ``
                                                    }${!!currentBreadcrumb ? currentBreadcrumb : ``}`
                                                );
                                                window.location.assign(newUrl);
                                            }
                                        }}
                                        handleArchive={() => {
                                            this.props.handleArchiveRow(recordId);
                                        }}
                                        handlePublish={() => {
                                            this.props.handlePublishRow(recordId);
                                        }}
                                        handleCopy={() => {
                                            this.props.handleCopyRow(recordId);
                                        }}
                                        handleDocuments={(el) => {
                                            this.props.handleDocumentRow(el.id);
                                        }}
                                        handlePlugins={(el) => {
                                            this.props.handlePluginRow(el.id);
                                        }}
                                        handleDownload={() => {
                                            this.props.handleDownloadRow(recordId);
                                        }}
                                        handleAttachments={() => {
                                            this.props.handleAttachmentRow(recordId);
                                        }}
                                        handleDelete={() => {
                                            this.props.handleDeleteRow(recordId);
                                        }}
                                        handleRestore={() => {
                                            this.props.handleRestoreRow(recordId);
                                        }}
                                        handleFormula={() => {
                                            this.props.handleFormulaRow(recordId);
                                        }}
                                        handleHistory={() => {
                                            alert('TODO');
                                        }}
                                        handleBlockUi={() => {
                                            this.props.handleBlockUi();
                                        }}
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
    };

    subViewHref(viewId, recordId, parentId, currentBreadcrumb) {
        parentId = StringUtils.isBlank(parentId) ? 0 : parentId;
        return `/#/grid-view/${viewId}${
            !!recordId ? `?recordId=${recordId}` : ``
        }&parentId=${parentId}${currentBreadcrumb}`;
    }

    preGenerateColumnsDefinition() {
        let columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            columns.push(
                <Column
                    key={INDEX_COLUMN}
                    dataField={columnDefinition.fieldName}
                    sortOrder={sortOrder}
                    sortIndex={columnDefinition?.sortIndex}
                    groupCellTemplate={this.groupCellTemplate}
                />
            );
        });
        return columns;
    }
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
    focusedRowEnabled: false,
    hoverStateEnabled: false,
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

    gridFromDashboard: PropTypes.bool,
};

export default GridViewComponent;

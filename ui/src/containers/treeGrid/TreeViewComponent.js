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
import {EntryResponseUtils} from '../../utils/EntryResponseUtils';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import EditListDataStore from '../dao/EditListDataStore';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string';
import CellEditComponent from '../CellEditComponent';
import {StringUtils} from '../../utils/StringUtils';

//
//    https://js.devexpress.com/Documentation/Guide/UI_Components/TreeList/Getting_Started_with_TreeList/
//
let clearSelection = false;
class TreeViewComponent extends CellEditComponent {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        this.ref = React.createRef();
        this.refDateTime = React.createRef();
        this.editListDataStore = new EditListDataStore();
        ConsoleHelper('TreeViewComponent -> constructor');
        this.state = {
            editListVisible: false,
            editorDialogVisisble: false,
            groupExpandAll: undefined,
            editListRecordId: null,
            mode: 'cell',
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preInitializedColumns: [],
        };
    }
    // TODO tworzy zla kolejnosc dlatego kolumny sa w złem kolejnosci!!!
    createFakeColumn() {
        const gridViewColumns = this.props.gridViewColumns;
        if (!gridViewColumns[0]) {
            return;
        }
        if (gridViewColumns[0].id !== undefined && gridViewColumns[0].id !== null) {
            gridViewColumns.unshift({width: '60'});
        }
    }
    componentDidMount() {
        this.createFakeColumn();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        return prevProps.id !== prevState.id && prevProps.elementRecordId !== prevState.elementRecordId;
    }

    findRowDataById(recordId) {
        let editData = this.props.parsedGridViewData.filter((item) => {
            return item.ID === recordId;
        });
        return editData[0];
    }
    componentWillUnmount() {
        clearSelection = false;
    }
    isSpecialCell(columnDefinition) {
        const type = columnDefinition?.type;
        try {
            switch (type) {
                case 'H':
                case 'C':
                    return columnDefinition.fieldName.toUpperCase() === 'WART';
                case 'O':
                case 'I':
                case 'IM':
                    return true;
                default:
                    return false;
            }
        } catch (ex) {}
        return false;
    }

    render() {
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        // const groupExpandAll = this.props.parsedGridView?.gridOptions?.groupExpandAll || false;
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
        return (
            <React.Fragment>
                {this.state.editListVisible && this.editListComponent()}
                {this.state.editorDialogVisisble && this.editorComponent()}
                <TreeList
                    id='spec-edit'
                    keyExpr='ID'
                    className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                    ref={(ref) => {
                        this.ref = ref;
                        this.props.handleOnTreeList(this.ref);
                    }}
                    focusedRowEnabled={this.props.focusedRowEnabled}
                    hoverStateEnabled={this.props.hoverStateEnabled}
                    autoNavigateToFocusedRow={false}
                    dataSource={this.props.parsedGridViewData}
                    customizeColumns={this.postCustomizeColumns}
                    wordWrapEnabled={rowAutoHeight}
                    columnAutoWidth={columnAutoWidth}
                    columnResizingMode='widget'
                    onOptionChanged={(e) => {
                        if (e.fullName.includes('filterValue') && e.name === 'columns') {
                            if (this.ref) {
                                this.ref.instance.clearSelection();
                                clearSelection = true;
                            }
                        }
                    }}
                    onContentReady={(e) => {
                        if (this.shouldBeExpanded()) {
                            this.setState({expandAll: false});
                            this.props.handleIsChanged(false);
                            const treeList = this.ref.instance;
                            const data = this.props.parsedGridViewData;
                            setTimeout(function () {
                                data.forEach((el) => treeList.expandRow(el.ID));
                            }, 0);
                        }

                        const editListDialog = document.getElementById('editListDialog');
                        // ze wzgledów optymalizacyjnych
                        // TODO: EditRowList zamyka kolory drzewek!!!
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
                        this.props.handleSelectedRowKeys(e.selectedRowKeys, this.rerenderColorAfterClickCheckbox());
                    }}
                    renderAsync={true}
                    selectAsync={false}
                    cacheEnabled={true}
                    rootValue={0}
                    parentIdExpr='_ID_PARENT'
                    onCellClick={(e) => {
                        // return;
                        if (e?.column?.ownOnlySelectList) {
                            // this.setState({editListVisible: true});
                            this.editListVisible(e.data.ID, e.column.ownFieldId);
                        }
                    }}
                >
                    <Editing allowUpdating={this.props.allowUpdating} mode='cell' />
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
                    {/*- virtual działa szybko ale wyżera heap przeglądarki
                        - normal długo wczytuje ale heap jest stabilniejszy
                    */}

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
                        enabled={true}
                        showIndicator={true}
                        shadingColor='rgba(0,0,0,0.4)'
                        showPane={false}
                        position='absolute'
                    />
                    {this.preGenerateColumnsDefinition()}
                </TreeList>
            </React.Fragment>
        );
    }

    shouldBeExpanded() {
        return (
            ((this.props.expandAll || this.state.expandAll) &&
                this.props.parsedGridView?.gridOptions?.groupExpandAll) ||
            (this.props.expandAll && !this.props.isAddSpec && this.props.parsedGridView?.gridOptions?.groupExpandAll)
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
    rerenderColorAfterClickCheckbox = () => {
        if (this.shouldBeRepainting()) {
            setTimeout(() => {
                const rowDatas = this.ref.instance.getVisibleRows();
                this.paintLineIfPossible(rowDatas);
            }, 0);
        }
    };

    preColumnDefinition(editable, INDEX_COLUMN) {
        if (INDEX_COLUMN !== 0) {
            let preInitializedColumns = this.state.preInitializedColumns;
            let foundedelement = preInitializedColumns.find((el) => el.columnIndex === INDEX_COLUMN);
            if (!foundedelement) {
                let column = {
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
        this.createFakeColumn();
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
                            this.editListVisible(cellInfo.row?.data?.ID, columnDefinition.id);
                        })
                    }
                />
            );
        });
        return columns;
    }

    isFakeColumnWithoutIndex(columnDefinition) {
        return (
            columnDefinition?.fieldName === undefined &&
            columnDefinition.index === undefined &&
            columnDefinition?.label === undefined
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
                            column.headerId =
                                'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                            column.width = columnDefinition?.width || 100;
                            column.name = columnDefinition?.fieldName;
                            column.caption = columnDefinition?.label;
                            column.dataType = TreeListUtils.specifyColumnType(columnDefinition?.type);
                            column.format = TreeListUtils.specifyColumnFormat(columnDefinition?.type);
                            if (this.isFakeColumnWithoutIndex(columnDefinition)) {
                                column.index = 0;
                            }
                            if (column.index === 0) {
                                column.fixed = true;
                                column.fixedPosition = 'left';
                            } else {
                                column.fixed =
                                    columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
                                        ? columnDefinition?.freeze?.toLowerCase() === 'left' ||
                                          columnDefinition?.freeze?.toLowerCase() === 'right'
                                        : false;
                                column.fixedPosition = !!columnDefinition.freeze
                                    ? columnDefinition.freeze?.toLowerCase()
                                    : null;
                            }
                            column.renderAsync = false;
                            //own properties
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
                            viewId = TreeListUtils.getRealViewId(subViewId, viewId);
                            ReactDOM.render(
                                <div style={{textAlign: 'center', display: 'flex', maxWidth: '20px!important'}}>
                                    <OperationsButtons
                                        labels={this.labels}
                                        operations={operationsRecord}
                                        operationList={operationsRecordList}
                                        info={info}
                                        handleEdit={() => {
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
                                            let prevUrl = window.location.href;
                                            sessionStorage.setItem('prevUrl', prevUrl);
                                            TreeListUtils.openEditSpec(
                                                viewId,
                                                parentId,
                                                [recordId],
                                                currentBreadcrumb,
                                                () => this.props.handleUnblockUi(),
                                                (err) => this.props.showErrorMessages(err)
                                            );
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
                                        handleAddSpecSpec={() => {
                                            if (this.props?.handleChaningTab) {
                                                this.setState({expandAll: true});
                                                this.props?.handleChaningTab();
                                            }
                                            this.props.handleAddSpecSpec(recordId);
                                        }}
                                        handleArchive={() => {
                                            this.props.handleArchiveRow(recordId);
                                        }}
                                        handlePublish={() => {
                                            this.props.handlePublish(recordId);
                                        }}
                                        handleDownload={() => {
                                            this.props.handleDownloadRow(recordId);
                                        }}
                                        handleAttachments={() => {
                                            this.props.handleAttachmentRow(recordId);
                                        }}
                                        handleCopy={() => {
                                            this.props.handleCopyRow(recordId);
                                        }}
                                        handleDelete={() => {
                                            this.props.handleDeleteRow(recordId);
                                        }}
                                        handleRestore={() => {
                                            this.props.handleRestoreRow(recordId);
                                        }}
                                        handleDocuments={(el) => {
                                            this.props.handleDocumentRow(el.id);
                                        }}
                                        handlePlugins={(el) => {
                                            this.props.handlePluginRow(el.id);
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
                                        handleUp={() => {
                                            this.props.handleUp(recordId);
                                        }}
                                        handleDown={() => {
                                            this.props.handleDown(recordId);
                                        }}
                                        handleAddLevel={() => {
                                            this.props.handleAddLevel(recordId);
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
                    element.style.backgroundColor = 'yellow';
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
                case 'H':
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
                case 'O':
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                    // background: bgColorFinal,
                                }}
                                // eslint-disable-next-line
                                // dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                            >
                                {StringUtils.textFromHtmlString(cellInfo?.text)}{' '}
                            </span>
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case 'C':
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                    // background: _bgColor,
                                }}
                                // eslint-disable-next-line
                                dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                            />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case 'N':
                    try {
                        return (
                            <span
                                style={{
                                    color: fontColorFinal,
                                    // background: bgColorFinal,
                                }}
                                // eslint-disable-next-line
                                dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                            />
                        );
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err);
                    }
                    break;
                case 'IM':
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
                case 'I':
                    try {
                        return !!cellInfo?.text ? (
                            cellInfo?.text?.split(',').map((img) => {
                                return (
                                    <div>
                                        <div>
                                            <img
                                                alt={''}
                                                height={100}
                                                src={`data:image/jpeg;base64,${img}`}
                                                className='mb-1'
                                            />
                                        </div>
                                        <div>
                                            <i
                                                onClick={(el) => {
                                                    setTimeout(function () {
                                                        document.getElementById('trash-button').click();
                                                        setTimeout(function () {
                                                            document.getElementById('grid-selection-panel').click();
                                                        }, 0);
                                                    }, 0);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: '25px',
                                                }}
                                                className='icon mdi mdi-trash-can mdi-trash-background trash-icon-treeview'
                                            ></i>
                                        </div>
                                    </div>
                                );
                                // return ;
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
        Array.from(document.querySelectorAll('td[aria-describedby=column_0_undefined-fixed]')).forEach((row) => {
            const rowIndex = row.parentNode.rowIndex;
            datas.forEach((idata) => {
                if (idata.rowIndex === rowIndex) {
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
    rowRenderingMode: 'standard',
    hoverStateEnabled: false,
    preloadEnabled: true,
    showFilterRow: true,
    showSelection: true,
    isAddSpec: false,
    allowUpdating: false,
    allowSelectAll: true,
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
    handleArchiveRow: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    handleDownloadRow: PropTypes.func.isRequired,
    handleAttachmentRow: PropTypes.func.isRequired,
    handleAttachments: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleChaningTab: PropTypes.func,
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

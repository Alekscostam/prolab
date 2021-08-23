import React from 'react';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import DataGrid, {
    Editing,
    FilterPanel,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    LoadPanel,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting,
} from 'devextreme-react/data-grid';
import ButtonGroup from 'devextreme-react/button-group';
import ViewService from '../../services/ViewService';
import BaseContainer from '../../baseContainers/BaseContainer';
import ViewDataService from '../../services/ViewDataService';
import DataGridStore from './DataGridStore';
import PropTypes from 'prop-types';
import ShortcutsButton from '../../components/ShortcutsButton';
import ActionButton from '../../components/ActionButton';
import ActionButtonWithMenu from '../../components/ActionButtonWithMenu';
import HeadPanel from '../../components/HeadPanel';
import {GridViewUtils} from '../../utils/GridViewUtils';
import Constants from '../../utils/constants';
import ReactDOM from 'react-dom';
import ShortcutButton from '../../components/ShortcutButton';
import SubViewSelectionRow from "../../components/SubViewSelectionRow";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class GridViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        console.log('GridViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.viewDataService = new ViewDataService();
        this.dataGridStore = new DataGridStore();
        this.dataGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
            elementFilterId: null,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: [],
            gridViewType: 'gridView',
            subView: null,
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.gridViewTypeChange = this.gridViewTypeChange.bind(this);
        this.customizeTileColumns = this.customizeTileColumns.bind(this);
        this.viewInfoTypes = [
            {
                icon: 'contentlayout',
                type: 'gridView',
                hint: 'Tabela',
            },
            {
                icon: 'mediumiconslayout',
                type: 'cardView',
                hint: 'Kafelki',
            },
        ];
    }

    componentDidMount() {
        console.log('GridViewContainer -> componentDidMount');
        console.log(window.location.pathname);
        this._isMounted = true;
        let subViewId = GridViewUtils.getURLParameters('subview');
        let recordId = GridViewUtils.getURLParameters('recordId');
        let filterId = GridViewUtils.getURLParameters('filterId');
        const id = this.props.id;
        console.log("Id = " + id);
        console.log("SubViewId = " + subViewId);
        console.log("RecordId = " + recordId);
        console.log("FilterId = " + filterId);
        this.setState({elementSubViewId: subViewId, elementRecordId: recordId, elementFilterId: filterId}, () => {
            this.downloadData(id, this.state.elementRecordId, this.state.elementSubViewId, this.state.elementFilterId);
        });

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('GridViewContainer -> componentDidUpdate prevProps id={%s} id={%s}', prevProps.id, this.props.id);
        let subViewId = GridViewUtils.getURLParameters('subview');
        let recordId = GridViewUtils.getURLParameters('recordId');
        let filterId = GridViewUtils.getURLParameters('filterId');
        const id = this.props.id;
        console.log("Id = " + id);
        console.log("SubViewId = " + subViewId);
        console.log("RecordId = " + recordId);
        console.log("FilterId = " + filterId);
        if (prevProps.id !== this.props.id
            || this.state.elementSubViewId !== subViewId
            || this.state.elementFilterId !== filterId) {
            this.setState({elementSubViewId: subViewId, elementRecordId: recordId, elementFilterId: filterId}, () => {
                this.downloadData(id, this.state.elementRecordId, this.state.elementSubViewId, this.state.elementFilterId);
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, recordId, subviewId, filterId) {
        let subviewMode = !!recordId && !!subviewId;
        if (subviewMode) {
            this.viewService.getSubView(viewId, recordId).then(subViewResponse => {
                this.setState({subView: subViewResponse},
                    () => {
                        this.unblockUi();
                    });
            }).catch((err) => {
                this.handleGetDetailsError(err);
                this.unblockUi();
            });
            viewId = subviewId;
        } else {
            this.setState({subView: null})
        }
        this.setState(
            {
                loading: true,
            },
            () => {
                this.viewService
                    .getView(viewId)
                    .then((responseView) => {
                        if (this._isMounted) {
                            ViewValidatorUtils.validation(responseView);
                            console.log('GridViewContainer -> fetch data: ', responseView);
                            let gridViewColumnsTmp = [];
                            let pluginsListTmp = [];
                            let documentsListTmp = [];
                            let batchesListTmp = [];
                            let filtersListTmp = [];
                            let oppAddButtonTmp = GridViewUtils.containsOperationButton(
                                responseView.operations,
                                'OP_ADD'
                            );
                            new Array(responseView.gridColumns).forEach((gridColumns) => {
                                gridColumns?.forEach((group) => {
                                    group.columns?.forEach((column) => {
                                        column.groupName = group.groupName;
                                        column.freeze = group.freeze;
                                        gridViewColumnsTmp.push(column);
                                    });
                                });
                            });
                            console.log('GridViewContainer -> fetch columns: ', gridViewColumnsTmp);
                            for (let plugin in responseView?.pluginsList) {
                                pluginsListTmp.push({
                                    id: responseView?.pluginsList[plugin].id,
                                    label: responseView?.pluginsList[plugin].label,
                                    /*    command:(e) => {
                                alert(e)
                            } */
                                });
                            }
                            for (let document in responseView?.documentsList) {
                                documentsListTmp.push({
                                    id: responseView?.documentsList[document].id,
                                    label: responseView?.documentsList[document].label,
                                    /*    command:(e) => {
                                alert(e)
                            } */
                                });
                            }
                            for (let batch in responseView?.batchesList) {
                                batchesListTmp.push({
                                    id: responseView?.batchesList[batch].id,
                                    label: responseView?.batchesList[batch].label,
                                });
                            }
                            for (let filter in responseView?.filtersList) {
                                filtersListTmp.push({
                                    id: responseView?.filtersList[filter].id,
                                    label: responseView?.filtersList[filter].label,
                                    command: (e) => {
                                        window.location.href = `/#/grid-view/${this.state.elementId}/?filterId=${e.item?.id}`;
                                    }
                                });
                            }
                            this.setState(
                                {
                                    loading: false,
                                    elementId: this.props.id,
                                    parsedGridView: responseView,
                                    gridViewColumns: gridViewColumnsTmp,
                                    oppAddButton: oppAddButtonTmp,
                                    pluginsList: pluginsListTmp,
                                    documentsList: documentsListTmp,
                                    batchesList: batchesListTmp,
                                    filtersList: filtersListTmp,
                                    selectedRowKeys: [],
                                },
                                () => {
                                    this.setState({loading: false});
                                }
                            );
                        }
                    })
                    .catch((err) => {
                        console.error('Error getView in GridView. Exception = ', err);
                        this.setState(
                            {
                                loading: false,
                            },
                            () => {
                                this.showErrorMessage('Nie udało się pobrać danych strony o id: ' + viewId);
                            }
                        );
                    });
            }
        );
    }

    getDefaultSortOrder(value) {
        if (value !== undefined && value !== null) {
            switch (value.toUpperCase()) {
                case true:
                    return 'asc';
                case false:
                    return 'desc';
                default:
                    return null;
            }
        }
        return null;
    }

    //override
    getBreadcrumbsName() {
        return this.getViewInfoName() || 'Unnamed';
    }

    //override
    getViewInfoName() {
        return this.state.parsedGridView?.viewInfo?.name;
    }

    onSelectionChanged({selectedRowKeys}) {
        this.setState({
            selectedRowKeys: selectedRowKeys,
        });
    }

    renderMyCommand() {
        return (
            <a href='#' onClick={this.logMyCommandClick}>
                My command
            </a>
        );
    }

    //TODO dopracować
    /*
    Typ kolumny:
        C – Znakowy
        N – Numeryczny/Liczbowy
        B – Logiczny (0/1)
        L – Logiczny (T/N)
        D – Data
        E – Data + czas
        T – Czas
        O – Opisowe
        I – Obrazek
        IM – Obrazek multi
        H - Hyperlink
     */
    specifyColumnType(type) {
        if (type) {
            switch (type) {
                case 'C':
                    return 'string';
                case 'N':
                    return 'number';
                case 'B':
                    return 'boolean';
                case 'L':
                    return 'boolean';
                case 'D':
                    return 'datetime';
                case 'E':
                    return 'datetime';
                case 'T':
                    return 'datetime';
                case 'O':
                case 'H':
                    return 'string';
            }
        }
        return undefined;
    }

    //TODO dopracować
    specifyColumnFormat(format) {
        if (format) {
            switch (format) {
                case 'D':
                    return Constants.DATE_FORMAT.DATE_FORMAT;
                case 'E':
                    return Constants.DATE_FORMAT.DATE_TIME_FORMAT;
                case 'T':
                    return Constants.DATE_FORMAT.TIME_FORMAT;
            }
        }
        return undefined;
    }

    specifyCellTemplate(template) {
        if (template) {
            switch (template) {
                case 'I':
                    return function (element, info) {
                        let srcFromBase64 = 'data:image/png;base64' + info.text + '"';
                        ReactDOM.render(
                            <div>
                                <img src={srcFromBase64} style="display: block; width: 100%;"/>
                            </div>,
                            element
                        );
                    };
                case 'IM':
                    return function (element, info) {
                        ReactDOM.render(
                            <div>
                                {info.text}
                            </div>,
                            element
                        );
                    };
            }
        }
        return undefined;
    }

    renderGridCell(data) {
        return (
            <a href={data.text} target='_blank' rel='noopener noreferrer'>
                Website
            </a>
        );
    }

    gridViewTypeChange(e) {
        console.log('gridViewTypeChange', e);
        this.setState({gridViewType: e.itemData.type});
    }

    customizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        let elementId = this.props.id;
        let viewService = this.viewService;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            columns?.forEach((column) => {
                if (column.name === '_ROWNUMBER') {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinition = this.state.gridViewColumns?.filter(
                        (value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase()
                    );
                    const columnTmp = columnDefinition[0];
                    if (columnTmp) {
                        column.visible = columnTmp?.visible;
                        //column.allowCollapsing = true;
                        //column.allowEditing = false;
                        //column.allowExporting = false;
                        column.allowFiltering = columnTmp?.isFilter;
                        column.allowFixing = true;
                        column.allowGrouping = columnTmp?.isGroup;
                        //column.allowHiding = true;
                        column.allowReordering = true;
                        column.allowResizing = true;
                        column.allowSorting = columnTmp?.isSort;
                        //column.autoExpandGroup = true;
                        //showInColumnChooser: true
                        //trueText: "prawda"
                        //encodeHtml: true
                        //falseText: "false"
                        //filterOperations: undefined
                        column.headerId = 'column_' + INDEX_COLUMN + '_' + columnTmp?.fieldName?.toLowerCase();
                        //column.parseValue: ƒ parseValue(text)
                        //defaultCalculateCellValue: ƒ calculateCellValue(data, skipDeserialization)
                        //defaultCalculateFilterExpression: ƒ ()
                        //defaultCreateFilterExpression: ƒ (filterValue)
                        //defaultParseValue: ƒ parseValue(text)
                        //defaultSetCellValue: ƒ defaultSetCellValue(data, value)
                        //calculateCellValue: ƒ calculateCellValue(data, skipDeserialization)
                        //calculateFilterExpression: ƒ ()
                        //createFilterExpression: ƒ (filterValue)
                        //TODO zmienić
                        column.width = columnTmp?.width || 100;
                        column.name = columnTmp?.fieldName;
                        column.caption = columnTmp?.label;
                        column.dataType = this.specifyColumnType(columnTmp?.type);
                        column.format = this.specifyColumnFormat(columnTmp?.type);
                        column.cellTemplate = columnTmp?.type === 'I' || columnTmp?.type === 'IM' ? function (element, info) {
                            if (!!info.text) {
                                if (Array.isArray(info.text) && info.text?.length > 0) {
                                    let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                                    ReactDOM.render(
                                        <div>
                                            {info.text?.map((i) => {
                                                return <img style={{width: '100%'}} src={srcFromBase64}></img>
                                            })}
                                        </div>,
                                        element
                                    );
                                } else {
                                    let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                                    ReactDOM.render(
                                        <div>
                                            <img style={{width: '100%'}} src={srcFromBase64}></img>
                                        </div>,
                                        element
                                    );
                                }
                            }
                        } : undefined;
                        column.fixed =
                            columnTmp.freeze !== undefined && columnTmp.freeze !== null
                                ? columnTmp.freeze?.toLowerCase() === 'left' ||
                                columnTmp.freeze?.toLowerCase() === 'right'
                                : false;
                        column.fixedPosition = !!columnTmp.freeze ? columnTmp.freeze?.toLowerCase() : null;
                        INDEX_COLUMN++;
                    } else {
                        column.visible = false;
                    }
                }
            });
            if (this.state.parsedGridView?.operations) {
                let showEditButton = false;
                let showSubviewButton = false;
                let menuItems = [];
                this.state.parsedGridView?.operations.forEach((operation) => {
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
                    widthTmp += 45;
                }
                if (showEditButton) {
                    widthTmp += 45;
                }
                if (showSubviewButton) {
                    widthTmp += 45;
                }
                if (showEditButton || showMenu || showSubviewButton) {
                    columns?.push({
                        caption: 'Akcje',
                        width: widthTmp,
                        fixed: true,
                        fixedPosition: 'right',
                        cellTemplate: (element, info) => {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            ReactDOM.render(
                                <div style={{textAlign: 'center'}}>
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu mr-1`}
                                        iconName={'mdi-pencil'}
                                        label={''}
                                        title={'Edycja'}
                                        rendered={showEditButton}
                                    />
                                    <ActionButtonWithMenu
                                        id='more_shortcut'
                                        iconName='mdi-dots-horizontal'
                                        className={`mr-1`}
                                        items={menuItems}
                                        remdered={showMenu}
                                        title={'Dodatkowe opcje'}
                                    />
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu mr-1`}
                                        iconName={'mdi-playlist-plus '}
                                        label={''}
                                        title={'Podwidoki'}
                                        handleClick={(e) => {
                                            //TODO redundantion
                                            viewService.getSubView(elementId, info.row?.data?.id).then(subViewResponse => {
                                                this.setState({subView: subViewResponse},
                                                    () => {
                                                        let viewInfoId = this.state.subView.viewInfo?.id;
                                                        let subViewId = this.state.subView.subViews[0]?.id;
                                                        let recordId = info.row?.data?.id;
                                                        window.location.href = `/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}`;
                                                        this.unblockUi();
                                                    });
                                            }).catch((err) => {
                                                this.handleGetDetailsError(err);
                                                this.unblockUi();
                                            });
                                        }}
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
            this.state.gridViewColumns.forEach((columnDefinition) => {
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

    customizeTileColumns = (columns) => {
        let INDEX_COLUMN = 0;
        let backupColumns = columns;
        columns = [];
        if (this.state.gridViewColumns?.length > 0) {
            columns.push({
                caption: '',
                cellTemplate: function (element, info) {
                    let el = document.createElement('div');
                    el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                    element.append(el);
                    ReactDOM.render(<div>Jakieś magiczne sklejanie danych</div>, element);
                },
            });
            if (this.state.parsedGridView?.operations) {
                let showEditButton = false;
                let menuItems = [];
                this.state.parsedGridView?.operations.forEach((operation) => {
                    showEditButton = showEditButton || operation.type === 'OP_EDIT';
                    if (
                        operation.type === 'OP_PUBLIC' ||
                        operation.type === 'OP_HISTORY' ||
                        operation.type === 'OP_ATTACHMENTS'
                    ) {
                        menuItems.push(operation);
                    }
                });
                let showMenu = menuItems.length > 0;
                if (showEditButton || showMenu) {
                    columns.push({
                        caption: 'Akcje',
                        width: showMenu && showEditButton ? 105 : 50,
                        cellTemplate: function (element, info) {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            ReactDOM.render(
                                <div>
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu mr-1`}
                                        iconName={'mdi-pencil'}
                                        label={''}
                                        title={''}
                                        rendered={showEditButton}
                                    />
                                    <ActionButtonWithMenu
                                        id='more_shortcut'
                                        iconName='mdi-dots-horizontal'
                                        items={menuItems}
                                        remdered={showMenu}
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
        }
    };

    showHeaderButtons() {
        return this.state.oppAddButton !== null;
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <div id="left-header-panel" className="float-left pt-2"></div>
            </React.Fragment>
        );
    }

//override
    renderHeaderRight() {
        return (<React.Fragment>
            {this.state.oppAddButton === null ? null : (
                <ActionButton
                    label={this.state.oppAddButton?.label}
                />
            )}
        </React.Fragment>);
    }

    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons}/>
            </React.Fragment>
        )
    }

    leftHeadPanelContent = () => {
        let centerElementStyle = 'mb-1 mt-1 mr-1 '
        return (
            <React.Fragment>
                {this.state.filtersList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_filters'
                        className={`button-with-menu-filter ${centerElementStyle}`}
                        iconName='mdi-filter-variant'
                        iconColor='black'
                        items={this.state.filtersList}
                        title='Filtry'
                    />
                ) : null}

                <ButtonGroup
                    className={`${centerElementStyle}`}
                    items={this.viewInfoTypes}
                    keyExpr='type'
                    stylingMode='outlined'
                    selectedItemKeys={this.state.gridViewType}
                    onItemClick={this.gridViewTypeChange}
                />

                {this.state.documentsList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_documents'
                        className={`${centerElementStyle}`}
                        iconName='mdi-file-document'
                        items={this.state.documentsList}
                        title='Dokumenty'
                    />
                ) : null}

                {this.state.pluginsList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_plugins'
                        className={`${centerElementStyle}`}
                        iconName='mdi-puzzle'
                        items={this.state.pluginsList}
                        title='Pluginy'
                    />
                ) : null}

                {this.state.batchesList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='batches_plugins'
                        className={`${centerElementStyle}`}
                        iconName='mdi-cogs'
                        items={this.state.batchesList}
                        title='Batches'
                    />
                ) : null}
            </React.Fragment>
        )
    }

    //override
    renderHeadPanel = () => {
        return (<React.Fragment>
            <HeadPanel
                selectedRowKeys={this.state.selectedRowKeys}
                operations={this.state.parsedGridView?.operations}
                leftContent={this.leftHeadPanelContent()}
                rightContent={this.rightHeadPanelContent()}
                handleDelete={() => {
                    //TODO
                    console.log('handleDelete');
                }}
                handleRestore={() => {
                    //TODO
                    console.log('handleRestore');
                }}
                handleCopy={() => {
                    //TODO
                    console.log('handleCopy');
                }}
                handleArchive={() => {
                    //TODO
                    console.log('handleArchive');
                }}
            />
        </React.Fragment>)
    }

    //override
    renderHeaderContent() {
        let subViewMode = !!this.state.subView;
        let selectedRow = [];
        let operations = [];
        if (subViewMode) {
            selectedRow = this.state.subView?.headerColumns?.filter((value) => value.visible === true);
            operations = this.state.subView?.headerOperations;
        }
        let elementSubViewId = this.state.elementSubViewId;
        return <React.Fragment>
            {subViewMode ? <div id="selection-row" className="float-left width-100">
                <SubViewSelectionRow selectedRow={selectedRow} operations={operations}/>
            </div> : null}
            {/*Zakładki podwidoków*/}
            <div id="subviews-panel" className="float-left">
                {this.state.subView != null
                && this.state.subView.subViews != null
                && this.state.subView.subViews.length > 0
                && this.state.subView.subViews?.map((subView, index) => {
                    return <div className="float-left">
                        <ShortcutButton id={`subview_${index}`}
                                        className="mt-2 mb-2 mr-1"
                                        label={subView.label}
                                        active={subView.id == elementSubViewId}
                                        handleClick={() => {
                                            let viewInfoId = this.state.subView.viewInfo?.id;
                                            let subViewId = subView.id;
                                            let recordId = this.state.elementRecordId;
                                            window.location.href = `/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}`;
                                        }}/>
                    </div>
                })}
            </div>
        </React.Fragment>;
    }

    //override
    renderContent = () => {
        const showGroupPanel = this.state.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.state.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.state.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.state.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const allowedPageSizes = [5, 10, 50, 100, 'all'];
        //TODO headerAutoHeight
        const headerAutoHeight = this.state.parsedGridView?.gridOptions?.headerAutoHeight || false;
        const dataGridStore = this.dataGridStore.getDataGridStore(this.props.id, this.state.gridViewType, this.state.elementRecordId, this.state.elementFilterId);
        const customizedColumns = this.customizeColumns;
        const customizedTileColumns = this.customizeTileColumns;
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.gridViewType === 'gridView' ? (
                            <DataGrid
                                id='grid-container'
                                className='grid-container'
                                keyExpr='id'
                                ref={(ref) => (this.dataGrid = ref)}
                                dataSource={dataGridStore}
                                customizeColumns={customizedColumns}
                                wordWrapEnabled={rowAutoHeight}
                                columnAutoWidth={columnAutoWidth}
                                remoteOperations={true}
                                allowColumnReordering={true}
                                allowColumnResizing={true}
                                showColumnLines={true}
                                showRowLines={true}
                                showBorders={true}
                                columnHidingEnabled={false}
                                width='100%'
                                rowAlternationEnabled={false}
                                onSelectionChanged={(selectedRowKeys) => {
                                    this.setState({
                                        selectedRowKeys: selectedRowKeys?.selectedRowKeys,
                                    });
                                }}
                            >
                                <RemoteOperations
                                    groupPaging={true}
                                    filtering={true}
                                    summary={true}
                                    sorting={true}
                                    paging={true}
                                />

                                <FilterRow visible={true}/>
                                <FilterPanel visible={true}/>
                                <HeaderFilter visible={true} allowSearch={true}/>

                                <Grouping autoExpandAll={groupExpandAll}/>
                                <GroupPanel visible={showGroupPanel}/>

                                <Sorting mode='multiple'/>

                                <Selection mode='multiple' selectAllMode='allPages' showCheckBoxesMode='always'/>

                                <Scrolling mode="virtual" rowRenderingMode="virtual"/>
                                <LoadPanel enabled={true}/>

                                {/* domyślnie infinite scrolling
                                    <Paging defaultPageSize={10} />
                                    <Pager
                                        visible={true}
                                        allowedPageSizes={allowedPageSizes}
                                        displayMode={this.state.displayMode}
                                        showPageSizeSelector={this.state.showPageSizeSelector}
                                        showInfo={this.state.showInfo}
                                        showNavigationButtons={this.state.showNavButtons}
                                    />
                                    */}

                                <Editing mode='cell'/>
                            </DataGrid>
                        ) : this.state.gridViewType === 'tiles' ? (
                                'TODO'
                            ) : // <DataGrid
                            // 	id='grid-container'
                            // 	className='grid-container'
                            // 	keyExpr='id'
                            // 	ref={(ref) => (this.dataGrid = ref)}
                            // 	dataSource={dataGridStore}
                            // 	customizeColumns={customizedTileColumns}
                            // 	wordWrapEnabled={rowAutoHeight}
                            // 	columnAutoWidth={columnAutoWidth}
                            // 	remoteOperations={true}
                            // 	allowColumnReordering={true}
                            // 	allowColumnResizing={true}
                            // 	showColumnLines={true}
                            // 	showRowLines={true}
                            // 	showBorders={true}
                            // 	columnHidingEnabled={false}
                            // 	width='100%'
                            // 	rowAlternationEnabled={false}
                            // 	onSelectionChanged={(selectedRowKeys) => {
                            // 		this.setState({
                            // 			selectedRowKeys: selectedRowKeys?.selectedRowKeys,
                            // 		});
                            // 	}}>
                            // 	<RemoteOperations
                            // 		groupPaging={true}
                            // 		filtering={true}
                            // 		summary={true}
                            // 		sorting={true}
                            // 		paging={true}
                            // 	/>

                            // 	{/* <FilterRow visible={true} /> */}
                            // 	{/* <FilterPanel visible={true} /> */}
                            // 	{/* <HeaderFilter visible={true} allowSearch={true} /> */}

                            // 	{/* <Grouping autoExpandAll={groupExpandAll} /> */}
                            // 	{/* <GroupPanel visible={showGroupPanel} /> */}

                            // 	<Sorting mode='multiple' />

                            // 	<Selection mode='multiple' selectAllMode='allPages' showCheckBoxesMode='onClick' />

                            // 	<Paging defaultPageSize={10} />
                            // 	<Pager
                            // 		visible={true}
                            // 		allowedPageSizes={allowedPageSizes}
                            // 		displayMode={this.state.displayMode}
                            // 		showPageSizeSelector={this.state.showPageSizeSelector}
                            // 		showInfo={this.state.showInfo}
                            // 		showNavigationButtons={this.state.showNavButtons}
                            // 	/>

                            // 	<Editing mode='cell' />
                            // </DataGrid>
                            null}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

GridViewContainer.defaultProps = {
    viewMode: 'VIEW',
};

GridViewContainer.propTypes = {
    id: PropTypes.number.isRequired,
    backendUrl: PropTypes.string.isRequired,
};

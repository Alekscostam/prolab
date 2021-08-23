import React from 'react';
import { ViewValidatorUtils } from '../../utils/parser/ViewValidatorUtils';
import DataGrid, {
    Button,
    Column,
    Editing,
    FilterPanel,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    LoadPanel,
    Pager,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting,
} from 'devextreme-react/data-grid';
import TileView from 'devextreme-react/tile-view';
import ButtonGroup from 'devextreme-react/button-group';
import ViewService from '../../services/ViewService';
import BaseContainer from '../../baseContainers/BaseContainer';
import ViewDataService from '../../services/ViewDataService';
import DataGridStore from './DataGridStore';
import PropTypes from 'prop-types';
import ShortcutsButton from '../../components/ShortcutsButton';
import HeaderButton from '../../components/HeaderButton';
import ActionButton from '../../components/ActionButton';
import DivContainer from '../../components/DivContainer';
import ActionButtonWithMenu from '../../components/ActionButtonWithMenu';
import SelectionPanel from '../../components/SelectionPanel';
import { GridViewUtils } from '../../utils/GridViewUtils';
import Constants from '../../utils/constants';
import ReactDOM from 'react-dom';
import ShortcutButton from '../../components/ShortcutButton';
import Image from '../../components/Image';
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
        this.cardGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: [],
            parsedCardViewData: [],
            gridViewType: ['listView'],
            subView: null,
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.gridViewTypeChange = this.gridViewTypeChange.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.tableViewItems = [
            {
                icon: 'contentlayout',
                type: 'listView',
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
        this._isMounted = true;
        this.downloadData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('GridViewContainer -> componentDidUpdate prevProps id={%s} id={%s}', prevProps.id, this.props.id);
        if (prevProps.id !== this.props.id || prevState.gridViewType !== this.state.gridViewType) {
            this.downloadData(this.state.gridViewType[0]);
            this.setState({ subView: null });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewType) {
        const id = this.props.id;
        this.setState(
            {
                loading: true,
            },
            () => {
                this.viewService
                    .getView(id, viewType)
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
                                        window.location.href = `/#/grid-view/${e.item?.id}`;
                                    },
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
                                    if (this.state.gridViewType[0] === 'cardView') {
                                        this.dataGridStore
                                            .getDataForCard(this.props.id, {
                                                skip: 0,
                                                take: 20,
                                                requireTotalCount: true,
                                            })
                                            .then((res) => {
                                                console.log('getDataForCard', res);
                                                let parsedCardViewData = res.data.map(function (item) {
                                                    for (var key in item) {
                                                        var upper = key.toUpperCase();
                                                        // check if it already wasn't uppercase
                                                        if (upper !== key) {
                                                            item[upper] = item[key];
                                                            delete item[key];
                                                        }
                                                    }
                                                    return item;
                                                });
                                                this.setState({ parsedCardViewData });
                                            });
                                    }
                                    this.setState({ loading: false });
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
                                this.showErrorMessage('Nie udało się pobrać danych strony o id: ' + id);
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

    onSelectionChanged({ selectedRowKeys }) {
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
                                <img src={srcFromBase64} style='display: block; width: 100%;' />
                            </div>,
                            element
                        );
                    };
                case 'IM':
                    return function (element, info) {
                        ReactDOM.render(<div>{info.text}</div>, element);
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
        this.setState({ gridViewType: [e.itemData.type] });
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
                        column.cellTemplate =
                            columnTmp?.type === 'I' || columnTmp?.type === 'IM'
                                ? function (element, info) {
                                      if (!!info.text) {
                                          if (Array.isArray(info.text) && info.text?.length > 0) {
                                              let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                                              ReactDOM.render(
                                                  <div>
                                                      {info.text?.map((i) => {
                                                          return (
                                                              <img style={{ width: '100%' }} src={srcFromBase64}></img>
                                                          );
                                                      })}
                                                  </div>,
                                                  element
                                              );
                                          } else {
                                              let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                                              ReactDOM.render(
                                                  <div>
                                                      <img style={{ width: '100%' }} src={srcFromBase64}></img>
                                                  </div>,
                                                  element
                                              );
                                          }
                                      }
                                  }
                                : undefined;
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
                    widthTmp += 55;
                }
                if (showEditButton) {
                    widthTmp += 55;
                }
                if (showSubviewButton) {
                    widthTmp += 55;
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
                                <div style={{ textAlign: 'center' }}>
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
                                            viewService
                                                .getSubView(elementId)
                                                .then((subViewResponse) => {
                                                    this.setState({ subView: subViewResponse });
                                                })
                                                .catch((err) => {
                                                    this.handleGetDetailsError(err);
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

    showHeaderButtons() {
        return this.state.oppAddButton !== null;
    }

    //override
    renderHeaderButtonsLeft() {
        return (
            <React.Fragment>
                <div id='left-panel-buttons' className='float-left  pt-2'>
                    {this.state.documentsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_documents'
                            className='mr-1 mt-2 mb-2'
                            iconName='mdi-file-document'
                            items={this.state.documentsList}
                            title='Pluginy'
                        />
                    ) : null}
                    {this.state.pluginsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_plugins'
                            className='mr-1 mt-2 mb-2'
                            iconName='mdi-puzzle'
                            items={this.state.pluginsList}
                            title='Dokumenty'
                        />
                    ) : null}
                    {this.state.subView != null &&
                        this.state.subView.subViews != null &&
                        this.state.subView.subViews.length > 0 &&
                        this.state.subView.subViews?.map((subView, index) => {
                            return (
                                <div className='float-left'>
                                    <ShortcutButton
                                        id={`subview_${index}`}
                                        className='mt-2 mb-2 mr-1'
                                        label={subView.label}
                                        handleClick={() => {
                                            let subViewId = subView.id;
                                            window.location.href = `/#/grid-view/${subViewId}`;
                                        }}
                                    />
                                </div>
                            );
                        })}
                </div>
            </React.Fragment>
        );
    }

    //override
    renderHeaderButtonsRight() {
        return (
            <React.Fragment>
                {' '}
                {this.showHeaderButtons() ? (
                    <HeaderButton>
                        {' '}
                        {this.state.oppAddButton === null ? null : (
                            <ActionButton label={this.state.oppAddButton?.label} className='float-right'></ActionButton>
                        )}
                    </HeaderButton>
                ) : null}
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} />
            </React.Fragment>
        );
    }

    renderCard(rowData) {
        const { cardBody, cardHeader, cardImage, cardFooter } = this.state.parsedGridView;
        let showEditButton = false;
        let showMenu = false;
        let menuItems = [];
        if (this.state.parsedGridView?.operations) {
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
            showMenu = menuItems.length > 0;
        }
        return (
            <div className='dx-tile-image'>
                <div className='row'>
                    <div className='card-grid-header'>
                        {cardHeader.visible ? (
                            <span className='card-grid-header-title'>{rowData[cardHeader.fieldName]}</span>
                        ) : null}
                        {showEditButton || showMenu ? (
                            <div className='float-right'>
                                <ShortcutButton
                                    id={`${rowData.id}_menu_button`}
                                    className={`action-button-with-menu mr-1`}
                                    iconName={'mdi-pencil'}
                                    label={''}
                                    title={''}
                                    rendered={showEditButton}
                                />
                                <ActionButtonWithMenu
                                    id={`${rowData.id}_more_shortcut`}
                                    iconName='mdi-dots-horizontal'
                                    items={menuItems}
                                    remdered={showMenu}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className='card-grid-body'>
                        <div className='row'>
                            {cardImage?.visible ? (
                                <div className={cardBody.visible ? 'col-3' : 'col-12'}>
                                    <Image
                                        alt={rowData[cardImage.title]}
                                        className='card-grid-body-image'
                                        base64={rowData[cardImage.fieldName]}
                                        style={{ display: 'block', width: '100%' }}
                                    />
                                </div>
                            ) : null}
                            {cardBody.visible ? (
                                <div className={cardImage.visible ? 'col-9' : 'col-12'}>
                                    <span className='card-grid-body-content'>{rowData[cardBody.fieldName]}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className='card-grid-footer'>
                        {cardFooter.visible ? (
                            <span className='card-grid-footer-content'>{rowData[cardFooter.fieldName]}</span>
                        ) : null}
                    </div>
                </div>
            </div>
        );
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
        const dataGridStore = this.dataGridStore.getDataGridStore(this.props.id);
        const customizedColumns = this.customizeColumns;
        console.log('this.state.gridViewType[0]', this.state.gridViewType[0], this.cardGrid);
        let cardWidth = 250;
        let cardHeight = 200;
        if (
            this.state.gridViewType[0] === 'cardView' &&
            this.cardGrid !== null &&
            this.cardGrid._element !== undefined
        ) {
            console.log('this.cardGrid', this.cardGrid._element, this.cardGrid._element.clientHeight);
            cardWidth = (this.cardGrid._element.clientWidth - 70) / 4;
            // cardHeight = this.cardGrid._element.clientHeight / 3;
        }
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        <DivContainer>
                            <SelectionPanel
                                selectedRowKeys={this.state.selectedRowKeys}
                                operations={this.state.parsedGridView?.operations}
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

                            {this.state.filtersList?.length > 0 ? (
                                <ActionButtonWithMenu
                                    id='button_filters'
                                    className='button-with-menu-filter mb-2 mt-2 mr-1'
                                    iconName='mdi-filter-variant'
                                    items={this.state.filtersList}
                                    title='Filtry'
                                />
                            ) : null}
                            <ButtonGroup
                                className='mb-2 mt-2'
                                items={this.tableViewItems}
                                keyExpr='type'
                                stylingMode='outlined'
                                selectedItemKeys={this.state.gridViewType}
                                onItemClick={this.gridViewTypeChange}
                            />
                            {this.state.gridViewType[0] === 'listView' ? (
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

                                    <FilterRow visible={true} />
                                    <FilterPanel visible={true} />
                                    <HeaderFilter visible={true} allowSearch={true} />

                                    <Grouping autoExpandAll={groupExpandAll} />
                                    <GroupPanel visible={showGroupPanel} />

                                    <Sorting mode='multiple' />

                                    <Selection mode='multiple' selectAllMode='allPages' showCheckBoxesMode='always' />

                                    <Scrolling mode='virtual' rowRenderingMode='virtual' />
                                    <LoadPanel enabled={true} />

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

                                    <Editing mode='cell' />

                                    {/* tak nie działa :(
                            {this.state.gridViewColumns.map((c) => {
                                if (c.visible)
                                    return <React.Fragment>
                                        <Column id={`data_grid_id_${c.id}`}
                                                key={`data_grid_key_${c.id}`}
                                                name={c.label}
                                                dataField={c.fieldName.toString().toLowerCase()}
                                                visible={c.visible}
                                                allowSorting={c.isSort}
                                                allowGrouping={c.isSort}
                                                allowFiltering={c.isFilter}
                                                width={columnAutoWidth ? undefined : c.width}
                                                sortIndex={c.sortIndex}
                                                defaultSortOrder={this.getDefaultSortOrder(c.sortOrder)}

                                        >
                                            <HeaderFilter visible={c.isFilter} groupInterval={10000}/>
                                        </Column>
                                    </React.Fragment>
                                return null;
                            })}
                         */}
                                </DataGrid>
                            ) : this.state.gridViewType[0] === 'cardView' ? (
                                <TileView
                                    className='card-grid'
                                    ref={(ref) => (this.cardGrid = ref)}
                                    id='aaa'
                                    items={this.state.parsedCardViewData}
                                    itemRender={this.renderCard}
                                    height='100%'
                                    baseItemHeight={cardHeight}
                                    baseItemWidth={cardWidth}
                                    itemMargin={10}
                                    direction='vertical'
                                />
                            ) : null}
                        </DivContainer>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };
}

GridViewContainer.defaultProps = {
    viewMode: 'VIEW',
};

GridViewContainer.propTypes = {
    id: PropTypes.string.isRequired,
};

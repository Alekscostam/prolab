import ButtonGroup from 'devextreme-react/button-group';
import DataGrid, {
    Column,
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
import TileView from 'devextreme-react/tile-view';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import BaseContainer from '../../baseContainers/BaseContainer';
import ActionButton from '../../components/ActionButton';
import ActionButtonWithMenu from '../../components/ActionButtonWithMenu';
import HeadPanel from '../../components/HeadPanel';
import Image from '../../components/Image';
import ShortcutButton from '../../components/ShortcutButton';
import ShortcutsButton from '../../components/ShortcutsButton';
import ViewDataService from '../../services/ViewDataService';
import ViewService from '../../services/ViewService';
import {GridViewUtils} from '../../utils/GridViewUtils';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import DataGridStore from './DataGridStore';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
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
            elementSubViewId: null,
            elementRecordId: null,
            elementFilterId: null,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: [],
            parsedCardViewData: [],
            batchesList: [],
            gridViewType: ['gridView'],
            subView: null,
            viewInfoTypes: []
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.gridViewTypeChange = this.gridViewTypeChange.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
    }

    componentDidMount() {
        console.log('**** GridViewContainer -> componentDidMount');
        console.log(window.location.pathname);
        this._isMounted = true;
        let subViewId = GridViewUtils.getURLParameters('subview');
        let recordId = GridViewUtils.getURLParameters('recordId');
        let filterId = GridViewUtils.getURLParameters('filterId');
        //const id = this.props.id;
        let id = GridViewUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id
        }
        console.log(`Read from param -> Id =  ${id} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`);
        this.setState(
            {
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId,
                gridViewType: ['gridView'],
            },
            () => {
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId
                );
            }
        );
    }

    equalNumbers(n1, n2) {
        if ((n1 === null || n1 === undefined || n1 === 'undefined') && (n2 === null || n2 === undefined || n2 === 'undefined') ) {
            //console.log('equalNumbers: result=' + true + ' {' + n1 + ', ' + n2 + '}' );
            return true;
        }
        let num1, num2;
        if (typeof n1 === 'number') {
            num1 = n1;
        } else {
            num1 = parseInt(n1);
        }
        if (typeof n2 === 'number') {
            num2 = n2;
        } else {
            num2 = parseInt(n2);
        }
        const result = num1 === num2;
        //console.log('equalNumbers: result=' + result + ' [' + n1 + ', ' + n2 + '] [' + typeof n1 + ', ' + typeof n2 + ']' );
        return result;

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('**** GridViewContainer -> componentDidUpdate prevProps id={%s} id={%s}', prevProps.id, this.props.id);
        let id = GridViewUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const subViewId = GridViewUtils.getURLParameters('subview');
        const recordId = GridViewUtils.getURLParameters('recordId');
        const filterId = GridViewUtils.getURLParameters('filterId');

        const firstSubViewMode = !!recordId && !!id && !!!subViewId;
        console.log('**** GridViewContainer -> componentDidUpdate: firstSubViewMode=' + firstSubViewMode);
        let gridViewType = this.state.gridViewType;

        console.log(`componentDidUpdate: Read from param -> Id =  ${id} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`);
        console.log(`componentDidUpdate: Read from state -> Id =  ${prevProps.id} ${this.state.elementId} SubViewId = ${this.state.elementSubViewId} RecordId = ${this.state.elementRecordId} FilterId = ${this.state.elementFilterId}`);
        if (prevProps.id !== this.props.id || this.state.elementSubViewId !== subViewId) {
            gridViewType = ['gridView'];
        }
        if (
            !this.equalNumbers(this.state.elementId, id) ||
            (!firstSubViewMode && !this.equalNumbers(this.state.elementSubViewId, subViewId)) ||
            !this.equalNumbers(this.state.elementFilterId, filterId) ||
            !this.equalNumbers(this.state.elementRecordId, recordId) ||
            prevState.gridViewType.toString() !== this.state.gridViewType.toString()            
        ) { 

            //alert('updating...');
            console.log('@@@@@@@@@ GridViewContainer => updating....')
            this.setState(
                {
                    elementId: id, 
                    elementSubViewId: subViewId,
                    elementRecordId: recordId,
                    elementFilterId: filterId,
                    gridViewType,
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementRecordId,
                        this.state.elementSubViewId,
                        this.state.elementFilterId,
                        this.state.gridViewType[0]
                    );
                }
            );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    downloadData(viewId, recordId, subviewId, filterId, viewType) {
        console.log(`GridViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}`)
        let subviewMode = (!!recordId && !!viewId);
        if (subviewMode) {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                        this.handleGetDetailsError('Brak podwidoków - niepoprawna konfiguracja!');
                        window.history.back();
                        this.unblockUi();
                        return;
                    }
                    const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;                    
                    this.setState({
                        subView: subViewResponse,
                        elementSubViewId: elementSubViewId,
                    }, () => {
                        this.unblockUi();                        
                        this.getViewById(elementSubViewId, viewType, subviewMode);
                        return;
                    });                    
                })
                .catch((err) => {
                    this.handleGetDetailsError(err);
                    this.unblockUi();
                });
            
            return;
        } else {
            this.setState({subView: null});
        }
        this.getViewById(viewId, viewType, subviewMode);
    }


    getViewById(viewId, viewType, subviewMode) {
        this.setState(
            {
                loading: true,
            },
            () => {
                this.viewService
                    .getView(viewId, viewType)
                    .then((responseView) => {
                        if (this._isMounted) {
                            ViewValidatorUtils.validation(responseView);
                            //console.log('GridViewContainer -> fetch data: ', responseView);
                            let gridViewColumnsTmp = [];
                            let pluginsListTmp = [];
                            let documentsListTmp = [];
                            let batchesListTmp = [];
                            let filtersListTmp = [];
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
                                        let subViewId = GridViewUtils.getURLParameters('subview');
                                        let recordId = GridViewUtils.getURLParameters('recordId');
                                        if (subviewMode) {                                            
                                            console.log(`Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${e.item?.id}`);
                                            window.location.href
                                                = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${e.item?.id}`);
                                        } else {
                                            console.log(`Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${e.item?.id}`);
                                            window.location.href
                                                = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}/?filterId=${e.item?.id}`);
                                        }
                                    },
                                });
                            }
                            let viewInfoTypesTmp = [];
                            let cardButton = GridViewUtils.containsOperationButton(responseView.operations, 'OP_CARDVIEW');
                            if (cardButton) {
                                viewInfoTypesTmp.push({
                                    icon: 'mediumiconslayout',
                                    type: 'cardView',
                                    hint: cardButton?.label
                                });
                            }
                            let viewButton = GridViewUtils.containsOperationButton(responseView.operations, 'OP_GRIDVIEW');
                            if (viewButton) {
                                viewInfoTypesTmp.push({
                                    icon: 'contentlayout',
                                    type: 'gridView',
                                    hint: viewButton?.label
                                });
                            }
                            this.setState(
                                {
                                    loading: false,
                                    //elementId: this.props.id,
                                    parsedGridView: responseView,
                                    gridViewColumns: gridViewColumnsTmp,
                                    pluginsList: pluginsListTmp,
                                    documentsList: documentsListTmp,
                                    batchesList: batchesListTmp,
                                    filtersList: filtersListTmp,
                                    selectedRowKeys: [],
                                    viewInfoTypes: viewInfoTypesTmp
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
                                                this.setState({parsedCardViewData});
                                            });
                                    }
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

    renderGridCell(data) {
        return (
            <a href={data.text} target='_blank' rel='noopener noreferrer'>
                Website
            </a>
        );
    }

    gridViewTypeChange(e) {
        this.setState({gridViewType: [e.itemData.type]});
    }

    customizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        let elementId = this.state.elementId; //this.props.id;
        let viewService = this.viewService;
        const { elementSubViewId } = this.state;
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
                        column.dataType = GridViewUtils.specifyColumnType(columnTmp?.type);
                        column.format = GridViewUtils.specifyColumnFormat(columnTmp?.type);
                        column.cellTemplate = GridViewUtils.cellTemplate(columnTmp);
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
                        caption: '',
                        width: widthTmp,
                        fixed: true,
                        fixedPosition: 'right',
                        cellTemplate: (element, info) => {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            let oppEdit = GridViewUtils.containsOperationButton(
                                this.state.parsedGridView?.operations,
                                'OP_EDIT'
                            );
                            let oppSubview = GridViewUtils.containsOperationButton(
                                this.state.parsedGridView?.operations,
                                'OP_SUBVIEWS'
                            );
                            const viewId = elementSubViewId ? elementSubViewId : elementId;
                            const recordId = info.row?.data?.ID;
                            ReactDOM.render(
                                <div style={{textAlign: 'center'}}>
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu mr-1`}
                                        iconName={'mdi-pencil'}
                                        title={oppEdit?.label}
                                        rendered={showEditButton && oppEdit}
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
                                        title={oppSubview?.label}
                                        //rendered={oppSubview}
                                        href={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}?recordId=${recordId}`)}                                        
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

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <div id='left-header-panel' className='float-left pt-2'></div>
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        let opADD = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_ADD');
        return (
            <React.Fragment>
                <ActionButton
                    rendered={opADD}
                    label={opADD?.label}/>
            </React.Fragment>
        );
    }

    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} />
            </React.Fragment>
        );
    };

    leftHeadPanelContent = () => {
        let centerElementStyle = 'mb-1 mt-1 mr-1 ';
        let opFilter = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_FILTER');
        let opBatches = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_BATCH');
        let opDocuments = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_DOCUMENTS');
        let opPlugins = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_PLUGINS');
        return (
            <React.Fragment>
                {opFilter && this.state.filtersList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_filters'
                        className={`button-with-menu-filter ${centerElementStyle}`}
                        iconName='mdi-filter-variant'
                        iconColor='black'
                        items={this.state.filtersList}
                        title={opFilter?.label}
                    />
                ) : null}

                <ButtonGroup
                    className={`${centerElementStyle}`}
                    items={this.state.viewInfoTypes}
                    keyExpr='type'
                    stylingMode='outlined'
                    selectedItemKeys={this.state.gridViewType}
                    onItemClick={this.gridViewTypeChange}
                />

                {opDocuments && this.state.documentsList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_documents'
                        className={`${centerElementStyle}`}
                        iconName='mdi-file-document'
                        items={this.state.documentsList}
                        title={opDocuments?.label}
                    />
                ) : null}

                {opPlugins && this.state.pluginsList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_plugins'
                        className={`${centerElementStyle}`}
                        iconName='mdi-puzzle'
                        items={this.state.pluginsList}
                        title={opPlugins?.label}
                    />
                ) : null}

                {opBatches && this.state.batchesList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='batches_plugins'
                        className={`${centerElementStyle}`}
                        iconName='mdi-cogs'
                        items={this.state.batchesList}
                        title={opBatches?.label}
                    />
                ) : null}

            </React.Fragment>
        );
    };

    //override
    renderHeadPanel = () => {
        return (
            <React.Fragment>
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
            </React.Fragment>
        );
    };

    //override
    renderHeaderContent() {
        let subViewMode = !!this.state.subView;
        let elementSubViewId = this.state.elementSubViewId;
        let showEditButton = false;
        let menuItems = [];
        this.state.subView?.headerOperations.forEach((operation) => {
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
        let widthTmp = 0;
        if (showMenu) {
            widthTmp += 45;
        }
        if (showEditButton) {
            widthTmp += 45;
        }
        return (
            <React.Fragment>
                {subViewMode ? (
                    <div id='selection-row' className='float-left width-100'>
                        <DataGrid
                            id='selection-data-grid'
                            keyExpr='ID'
                            ref={(ref) => (this.selectionDataGrid = ref)}
                            dataSource={this.state.subView?.headerData}
                            wordWrapEnabled={true}
                            columnAutoWidth={true}
                            allowColumnReordering={true}
                            allowColumnResizing={true}
                            columnHidingEnabled={false}
                            onSelectionChanged={(selectedRowKeys) => {
                                this.setState({
                                    selectedRowKeys: selectedRowKeys?.selectedRowKeys,
                                });
                            }}
                        >
                            {this.state.subView?.headerColumns
                                ?.filter((c) => c.visible === true)
                                .map((c) => {
                                    return (
                                        <Column
                                            allowFixing={true}
                                            caption={c.label}
                                            dataType={GridViewUtils.specifyColumnType(c?.type)}
                                            format={GridViewUtils.specifyColumnFormat(c?.type)}
                                            cellTemplate={GridViewUtils.cellTemplate(c)}
                                            dataField={c.fieldName}
                                        />
                                    );
                                })}

                            {showEditButton || showMenu ? (
                                <Column
                                    allowFixing={true}
                                    caption='Akcje'
                                    width={widthTmp}
                                    fixed={true}
                                    fixedPosition='right'
                                    cellTemplate={(element, info) => {
                                        ReactDOM.render(
                                            <div>
                                                <ShortcutButton
                                                    id={`${info.column.headerId}_menu_button`}
                                                    className={`action-button-with-menu mr-1`}
                                                    iconName={'mdi-pencil'}
                                                    label={''}
                                                    title={'Edycja'}
                                                    rendered={true}
                                                />
                                                <ActionButtonWithMenu
                                                    id='more_shortcut'
                                                    iconName='mdi-dots-horizontal'
                                                    className={`mr-1`}
                                                    items={menuItems}
                                                    remdered={true}
                                                    title={'Dodatkowe opcje'}
                                                />
                                            </div>,
                                            element
                                        );
                                    }}
                                ></Column>
                            ) : null}
                        </DataGrid>
                    </div>
                ) : null}
                {/*Zakładki podwidoków*/}
                <div id='subviews-panel' className='float-left'>
                    {this.state.subView != null &&
                        this.state.subView.subViews != null &&
                        this.state.subView.subViews.length > 0 &&
                        this.state.subView.subViews?.map((subView, index) => {
                            return (
                                <div className='float-left'>
                                    <ShortcutButton
                                        id={`subview_${index}`}
                                        className='mt-2 mb-2 mr-2'
                                        label={subView.label}
                                        active={subView.id == elementSubViewId}
                                        linkViewMode={true}
                                        handleClick={() => {
                                            let viewInfoId = this.state.subView.viewInfo?.id;
                                            let subViewId = subView.id;
                                            let recordId = this.state.elementRecordId;
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}`
                                            );
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
    renderCard(rowData) {
        const {cardBody, cardHeader, cardImage, cardFooter} = this.state.parsedGridView;
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
            <div
                className={`dx-tile-image ${
                    this.state.selectedRowKeys.includes(rowData.ID) ? 'card-grid-selected' : ''
                }`}
                style={{backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR}}
            >
                <div className='row'>
                    <div className='card-grid-header'>
                        {cardHeader?.visible ? (
                            <span
                                style={{
                                    backgroundColor: rowData[`_BGCOLOR_${cardHeader.fieldName.toUpperCase()}`],
                                    color: rowData[`_FONTCOLOR_${cardHeader.fieldName.toUpperCase()}`],
                                }}
                                className='card-grid-header-title'
                            >
                                {rowData[cardHeader.fieldName]}
                            </span>
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
                            {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName] ? (
                                <div className={cardBody?.visible ? 'col-3' : 'col-12'}>
                                    <Image
                                        alt={rowData[cardImage.title]}
                                        className='card-grid-body-image'
                                        base64={rowData[cardImage.fieldName]}
                                        style={{display: 'block', width: '100%'}}
                                    />
                                </div>
                            ) : null}
                            {cardBody?.visible ? (
                                <div className={cardImage?.visible ? 'col-9' : 'col-12'}>
                                    <span
                                        style={{
                                            backgroundColor: rowData[`_BGCOLOR_${cardBody.fieldName.toUpperCase()}`],
                                            color: rowData[`_FONTCOLOR_${cardBody.fieldName.toUpperCase()}`],
                                        }}
                                        className='card-grid-body-content'
                                    >
                                        {rowData[cardBody.fieldName]}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className='card-grid-footer'>
                        {cardFooter?.visible ? (
                            <span
                                style={{
                                    backgroundColor: rowData[`_BGCOLOR_${cardFooter.fieldName.toUpperCase()}`],
                                    color: rowData[`_FONTCOLOR_${cardFooter.fieldName.toUpperCase()}`],
                                }}
                                className='card-grid-footer-content'
                            >
                                {rowData[cardFooter.fieldName]}
                            </span>
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
        const dataGridStore = this.dataGridStore.getDataGridStore(
            this.state.subView == null ? this.state.elementId : this.state.elementSubViewId,
            this.state.gridViewType,
            this.state.subView == null ? null : this.state.elementRecordId,
            this.state.elementFilterId
        );
        const customizedColumns = this.customizeColumns;
        let cardWidth = 300;
        let cardHeight = 200;
        if (
            this.state.gridViewType[0] === 'cardView' &&
            this.cardGrid !== null &&
            this.cardGrid._element !== undefined
        ) {
            // cardWidth = (this.cardGrid._element.clientWidth - 70) / 4;
            // cardHeight = this.cardGrid._element.clientHeight / 3;
        }
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.gridViewType[0] === 'gridView' ? (
                            <DataGrid
                                id='grid-container'
                                className='grid-container'
                                keyExpr='ID'
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
                                onSelectionChanged={(e) => {
                                    console.log('onSelectionChanged', e);  
                                    if (e.selectedRowKeys && e.component) {
                                        e.selectedRowKeys.forEach(id => e.component.repaintRows(e.component.getRowIndexByKey(id)));
                                    }
                                    if (e.currentDeselectedRowKeys && e.component) {
                                        e.currentDeselectedRowKeys.forEach(id => e.component.repaintRows(e.component.getRowIndexByKey(id)));
                                    }
                                    this.setState({
                                        selectedRowKeys: e?.selectedRowKeys,
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
                            </DataGrid>
                        ) : this.state.gridViewType[0] === 'cardView' ? (
                            <TileView
                                className='card-grid'
                                ref={(ref) => (this.cardGrid = ref)}
                                items={this.state.parsedCardViewData}
                                itemRender={this.renderCard}
                                height='635px'
                                baseItemHeight={cardHeight}
                                baseItemWidth={cardWidth}
                                itemMargin={10}
                                direction='vertical'
                                onItemClick={(item) => {
                                    let selectedRowKeys = this.state.selectedRowKeys;
                                    var index = selectedRowKeys.indexOf(item.itemData.ID);
                                    if (index !== -1) {
                                        selectedRowKeys.splice(index, 1);
                                    } else {
                                        selectedRowKeys.push(item.itemData.ID);
                                    }
                                    this.setState({
                                        selectedRowKeys: selectedRowKeys,
                                    });
                                }}
                            />
                        ) : null}
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

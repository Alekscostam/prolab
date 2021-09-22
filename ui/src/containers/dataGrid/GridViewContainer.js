import {SelectBox, Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import DataGrid, {
    Column,
    Editing,
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
import {Sidebar} from 'primereact/sidebar';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import BaseContainer from '../../baseContainers/BaseContainer';
import ActionButton from '../../components/ActionButton';
import ActionButtonWithMenu from '../../components/ActionButtonWithMenu';
import EditRowComponent from '../../components/EditRowComponent';
import HeadPanel from '../../components/HeadPanel';
import Image from '../../components/Image';
import ShortcutButton from '../../components/ShortcutButton';
import ShortcutsButton from '../../components/ShortcutsButton';
import EditService from '../../services/EditService';
import ViewDataService from '../../services/ViewDataService';
import ViewService from '../../services/ViewService';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import {GridViewUtils} from '../../utils/GridViewUtils';
import {CardViewUtils} from '../../utils/CardViewUtils';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import UrlUtils from '../../utils/UrlUtils';
import DataGridStore from './DataGridStore';
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
        this.editService = new EditService();
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
            gridViewTypes: [],
            gridViewType: null,
            subView: null,
            viewInfoTypes: [],
            cardSkip: 0,
            cardTake: 20,
            cardTotalRows: 0,
            cardScrollLoading: false,
            visibleEditPanel: false,
            editData: null,
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.gridViewTypeChange = this.gridViewTypeChange.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.onTabsSelectionChanged = this.onTabsSelectionChanged.bind(this);
        this.onFilterChanged = this.onFilterChanged.bind(this);
        this.handleEditRowChange = this.handleEditRowChange.bind(this);
        this.customizedColumns = this.customizeColumns;
    }

    componentDidMount() {
        console.log('**** GridViewContainer -> componentDidMount');
        console.log(window.location.pathname);
        this._isMounted = true;
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const viewType = UrlUtils.getURLParameter('viewType');
        //const id = this.props.id;
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        console.log(
            `GridViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`
        );
        const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
        window.history.replaceState('', '', newUrl);
        this.setState(
            {
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId,
                gridViewType: viewType,
            },
            () => {
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId,
                    viewType
                );
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(
            '**** GridViewContainer -> componentDidUpdate prevProps id={%s} id={%s}',
            prevProps.id,
            this.props.id
        );
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const gridViewType = UrlUtils.getURLParameter('viewType');
        const force = UrlUtils.getURLParameter('force');

        const firstSubViewMode = !!recordId && !!id && !!!subViewId;
        console.log('**** GridViewContainer -> componentDidUpdate: firstSubViewMode=' + firstSubViewMode);

        console.log(
            `componentDidUpdate: Read from param -> Id =  ${id} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`
        );
        console.log(
            `componentDidUpdate: this.state.elementId=${this.state.elementId}, id=${id}; 
            firstSubViewMode=${firstSubViewMode}, this.state.elementSubViewId=${this.state.elementSubViewId}, subViewId=${subViewId}; 
            this.state.elementRecordId=${this.state.elementRecordId}, recordId=${recordId};
            prevState.gridViewType=${this.state.gridViewType}, gridViewType=${gridViewType}`,
            this.state.subView
        );
        // if (!this.equalNumbers(prevProps.id, id) || (!firstSubViewMode && !this.equalNumbers(this.state.elementSubViewId, subViewId))) {
        //     gridViewType = null;
        // }

        const fromSubviewToFirstSubView =
            firstSubViewMode &&
            this.state.elementSubViewId &&
            this.state.subView &&
            this.state.subView.subViews &&
            this.state.subView.subViews.length > 0 &&
            this.state.elementSubViewId !== this.state.subView.subViews[0].id;

        console.log('@@@@@@@@@ GridViewContainer => ' + prevState.gridViewType + '::' + this.state.gridViewType);
        if (
            !!force ||
            !GridViewUtils.equalNumbers(this.state.elementId, id) ||
            (!firstSubViewMode && !GridViewUtils.equalNumbers(this.state.elementSubViewId, subViewId)) ||
            fromSubviewToFirstSubView ||
            !GridViewUtils.equalNumbers(this.state.elementFilterId, filterId) ||
            !GridViewUtils.equalNumbers(this.state.elementRecordId, recordId)
        ) {
            const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
            window.history.replaceState('', '', newUrl);
            console.log('@@@@@@@@@ GridViewContainer:componentDidUpdate => updating....');
            console.log(
                '@@@@@@@@@ GridViewContainer:componentDidUpdate => ' +
                    prevState.gridViewType +
                    '::' +
                    this.state.gridViewType +
                    '::' +
                    gridViewType
            );
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
                        gridViewType
                    );
                }
            );
        } else {
            console.log('@@@@@@@@@ GridViewContainer:componentDidUpdate => do not download view data!');
        }
        if (this.state.gridViewType === 'cardView' && this.cardGrid !== null) {
            this.cardGrid._scrollView.on('scroll', (e) => {
                if (
                    e.reachedBottom &&
                    !this.state.cardScrollLoading &&
                    this.state.gridViewType === 'cardView' &&
                    this.state.parsedCardViewData.length < this.state.cardTotalRows
                ) {
                    this.setState(
                        {cardScrollLoading: true, cardSkip: this.state.cardSkip + this.state.cardTake},
                        () => {
                            console.log('datasource', this.cardGrid.getDataSource());
                            this.cardGrid.beginUpdate();
                            this.dataGridStore
                                .getDataForCard(this.props.id, {
                                    skip: this.state.cardSkip,
                                    take: this.state.cardTake,
                                    requireTotalCount: true,
                                    filterId: filterId ? parseInt(filterId) : undefined,
                                    parentId: recordId ? parseInt(recordId) : undefined,
                                })
                                .then((res) => {
                                    let parsedCardViewData = this.state.parsedCardViewData;
                                    res.data.forEach((item) => {
                                        for (var key in item) {
                                            var upper = key.toUpperCase();
                                            // check if it already wasn't uppercase
                                            if (upper !== key) {
                                                item[upper] = item[key];
                                                delete item[key];
                                            }
                                        }
                                        parsedCardViewData.push(item);
                                    });
                                    this.setState(
                                        {
                                            parsedCardViewData,
                                            cardScrollLoading: false,
                                            cardTotalRows: res.totalCount,
                                        },
                                        () => {
                                            this.cardGrid.endUpdate();
                                            this.cardGrid.repaint();
                                        }
                                    );
                                });
                        }
                    );
                }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    trackScrolling() {
        const wrappedElement = document.getElementById('header');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            document.removeEventListener('scroll', this.trackScrolling);
        }
    }

    downloadData(viewId, recordId, subviewId, filterId, viewType) {
        console.log(
            `GridViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}, viewType=${viewType}`
        );
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode) {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    Breadcrumb.updateSubView(subViewResponse, recordId);
                    const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;
                    if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                        this.showErrorMessage('Brak podwidoków - niepoprawna konfiguracja!');
                        window.history.back();
                        this.unblockUi();
                        return;
                    } else {
                        let subViewsTabs = [];
                        subViewResponse.subViews.forEach((subView, i) => {
                            subViewsTabs.push({id: subView.id, text: subView.label, icon: subView.icon});
                            if (subView.id === parseInt(elementSubViewId)) {
                                this.setState({subViewTabIndex: i});
                            }
                        });
                        subViewResponse.subViewsTabs = subViewsTabs;
                    }
                    this.setState(
                        {
                            subView: subViewResponse,
                            elementSubViewId: elementSubViewId,
                        },
                        () => {
                            this.unblockUi();
                            this.getViewById(elementSubViewId, recordId, filterId, viewType, subviewMode);
                            return;
                        }
                    );
                })
                .catch((err) => {
                    this.showErrorMessage(err);
                    window.history.back();
                    this.unblockUi();
                });

            return;
        } else {
            this.setState({subView: null});
        }
        this.getViewById(viewId, recordId, filterId, viewType, subviewMode);
    }

    getViewById(viewId, recordId, filterId, viewType, subviewMode) {
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
                            let id = UrlUtils.getViewIdFromURL();
                            if (id === undefined) {
                                id = this.props.id;
                            }
                            Breadcrumb.updateView(responseView.viewInfo, id, recordId);
                            let gridViewColumnsTmp = [];
                            let pluginsListTmp = [];
                            let documentsListTmp = [];
                            let batchesListTmp = [];
                            let filtersListTmp = [];
                            let columnOrderCounter = 0;
                            new Array(responseView.gridColumns).forEach((gridColumns) => {
                                gridColumns?.forEach((group) => {
                                    group.columns?.forEach((column) => {
                                        column.groupName = group.groupName;
                                        column.freeze = group.freeze;
                                        column.columnOrder = columnOrderCounter++;
                                        gridViewColumnsTmp.push(column);
                                    });
                                });
                            });
                            console.log('GridViewContainer -> fetch columns: ', gridViewColumnsTmp);
                            for (let plugin in responseView?.pluginsList) {
                                pluginsListTmp.push({
                                    id: responseView?.pluginsList[plugin].id,
                                    label: responseView?.pluginsList[plugin].label,
                                });
                            }
                            for (let document in responseView?.documentsList) {
                                documentsListTmp.push({
                                    id: responseView?.documentsList[document].id,
                                    label: responseView?.documentsList[document].label,
                                });
                            }
                            for (let batch in responseView?.batchesList) {
                                batchesListTmp.push({
                                    id: responseView?.batchesList[batch].id,
                                    label: responseView?.batchesList[batch].label,
                                });
                            }
                            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                            for (let filter in responseView?.filtersList) {
                                filtersListTmp.push({
                                    id: responseView?.filtersList[filter].id,
                                    label: responseView?.filtersList[filter].label,
                                    command: (e) => {
                                        let subViewId = UrlUtils.getURLParameter('subview');
                                        let recordId = UrlUtils.getURLParameter('recordId');
                                        if (subviewMode) {
                                            console.log(
                                                `Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                            );
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${e.item?.id}${currentBreadcrumb}`
                                            );
                                        } else {
                                            console.log(
                                                `Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                            );
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${this.state.elementId}/?filterId=${e.item?.id}${currentBreadcrumb}`
                                            );
                                        }
                                    },
                                });
                            }
                            let viewInfoTypesTmp = [];
                            let cardButton = GridViewUtils.containsOperationButton(
                                responseView.operations,
                                'OP_CARDVIEW'
                            );
                            if (cardButton) {
                                viewInfoTypesTmp.push({
                                    icon: 'mediumiconslayout',
                                    type: 'cardView',
                                    hint: cardButton?.label,
                                });
                            }
                            let viewButton = GridViewUtils.containsOperationButton(
                                responseView.operations,
                                'OP_GRIDVIEW'
                            );
                            if (viewButton) {
                                viewInfoTypesTmp.push({
                                    icon: 'contentlayout',
                                    type: 'gridView',
                                    hint: viewButton?.label,
                                });
                            }
                            this.setState(
                                (prevState) => ({
                                    loading: false,
                                    //elementId: this.props.id,
                                    gridViewType: responseView?.viewInfo?.type,
                                    parsedGridView: responseView,
                                    gridViewColumns: gridViewColumnsTmp,
                                    pluginsList: pluginsListTmp,
                                    documentsList: documentsListTmp,
                                    batchesList: batchesListTmp,
                                    filtersList: filtersListTmp,
                                    selectedRowKeys: [],
                                    viewInfoTypes: viewInfoTypesTmp,
                                }),
                                () => {
                                    if (this.state.gridViewType === 'cardView') {
                                        this.setState({loading: true, cardSkip: 0}, () =>
                                            this.dataGridStore
                                                .getDataForCard(viewId, {
                                                    skip: this.state.cardSkip,
                                                    take: this.state.cardTake,
                                                    requireTotalCount: true,
                                                    filterId: filterId ? parseInt(filterId) : undefined,
                                                    parentId: recordId ? parseInt(recordId) : undefined,
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
                                                    this.setState({
                                                        parsedCardViewData,
                                                        loading: false,
                                                        cardTotalRows: res.totalCount,
                                                    });
                                                })
                                        );
                                    } else {
                                        this.setState({loading: true}, () => {
                                            let res = this.dataGridStore.getDataGridStore(
                                                this.state.subView == null
                                                    ? this.state.elementId
                                                    : this.state.elementSubViewId,
                                                //TODO blad u Romcia, powinno być this.state.gridViewType ale nie działa
                                                null,
                                                this.state.subView == null ? null : this.state.elementRecordId,
                                                this.state.elementFilterId,
                                                (err) => {
                                                    this.showErrorMessage(err);
                                                }
                                            );

                                            this.setState({
                                                parsedGridViewData: res,
                                                loading: false,
                                            });
                                        });
                                    }
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
                                this.showErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
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
        let newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), 'viewType', e.itemData.type);
        window.history.replaceState('', '', newUrl);
        this.setState({gridViewType: e.itemData.type}, () => {
            this.downloadData(
                this.state.elementId,
                this.state.elementRecordId,
                this.state.elementSubViewId,
                this.state.elementFilterId,
                this.state.gridViewType
            );
        });
    }

    customizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        let elementId = this.state.elementId; //this.props.id;
        const {elementSubViewId} = this.state;
        const {labels} = this.props;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
            columns?.forEach((column) => {
                if (column.name === '_ROWNUMBER') {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinitionArray = this.state.gridViewColumns?.filter(
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
                        column.visibleIndex = columnDefinition.columnOrder;
                        column.headerId = 'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                        //TODO zmienić
                        column.width = columnDefinition?.width || 100;
                        column.name = columnDefinition?.fieldName;
                        column.caption = columnDefinition?.label;
                        column.dataType = GridViewUtils.specifyColumnType(columnDefinition?.type);
                        column.format = GridViewUtils.specifyColumnFormat(columnDefinition?.type);
                        column.cellTemplate = GridViewUtils.cellTemplate(columnDefinition);
                        column.fixed =
                            columnDefinition.freeze !== undefined && columnDefinition.freeze !== null
                                ? columnDefinition.freeze?.toLowerCase() === 'left' ||
                                  columnDefinition.freeze?.toLowerCase() === 'right'
                                : false;
                        column.fixedPosition = !!columnDefinition.freeze
                            ? columnDefinition.freeze?.toLowerCase()
                            : null;
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
                console.log('szerokosc akcje', widthTmp);
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
                            const subviewId = elementSubViewId ? elementId : undefined;
                            ReactDOM.render(
                                <div style={{textAlign: 'center'}}>
                                    <ShortcutButton
                                        id={`${info.column.headerId}_menu_button`}
                                        className={`action-button-with-menu`}
                                        iconName={'mdi-pencil'}
                                        title={oppEdit?.label}
                                        handleClick={() => {
                                            this.blockUi();
                                            this.editService
                                                .getEdit(viewId, recordId, subviewId)
                                                .then((editDataResponse) => {
                                                    this.setState({visibleEditPanel: true, editData: editDataResponse});
                                                    this.unblockUi();
                                                })
                                                .catch((err) => {
                                                    this.showErrorMessage(err);
                                                    this.unblockUi();
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
                                        title={labels['View_AdditionalOptions']}
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
    renderGlobalTop() {
        return (
            <React.Fragment>
                <Sidebar
                    id='right-sidebar'
                    visible={this.state.visibleEditPanel}
                    modal={true}
                    style={{width: '45%'}}
                    position='right'
                    onHide={() => this.setState({visibleEditPanel: false})}
                >
                    <React.Fragment>
                        <EditRowComponent
                            editData={this.state.editData}
                            onChange={this.handleEditRowChange}
                            validator={this.validator}
                        />
                    </React.Fragment>
                </Sidebar>
            </React.Fragment>
        );
    }

    handleEditRowChange(inputType, event, groupName) {
        console.log('handleEditRowChange', inputType, groupName);
        let editData = this.state.editData;
        let groupData = editData.editFields.filter((obj) => {
            return obj.groupName === groupName;
        });
        let varName;
        let varValue;
        if (event !== undefined) {
            switch (inputType) {
                case 'NUMBER':
                    varName = event.originalEvent.target.name;
                    varValue = isNaN(parseFloat(event.value)) ? 0 : parseFloat(event.value);
                    break;
                case 'EDITOR':
                    varName = event.name;
                    varValue = event.value || event.value === '' ? event.value : undefined;
                    break;
                case 'IMAGE64':
                    varName = event == null ? null : event[0].fieldName;
                    varValue = event == null ? null : event[0].base64;
                    break;
                case 'TEXT':
                case 'AREA':
                default:
                    varName = event.target.name;
                    varValue = event.target.value || event.target.value === '' ? event.target.value : undefined;
                    break;
            }
            console.log('handleEditRowChange - ', inputType, varName, varValue);
            let field = groupData[0]?.fields.filter((obj) => {
                return obj.fieldName === varName;
            });
            if (!!field && !!field[0]) {
                field[0].value = varValue;
            }
            this.setState({editData: editData});
        } else {
            console.log('handleEditRowChange implementation error');
        }
    }

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
                <ActionButton rendered={opADD} label={opADD?.label} />
            </React.Fragment>
        );
    }

    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} maxShortcutButtons={5} />
            </React.Fragment>
        );
    };

    onFilterChanged(e) {
        console.log('onValueChanged', e);
        // this.setState({
        //     elementFilterId: e.value,
        // });
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        window.location.href = AppPrefixUtils.locationHrefUrl(
            `/#/grid-view/${this.state.elementId}/?filterId=${e.value}${currentBreadcrumb}`
        );
    }

    leftHeadPanelContent = () => {
        let centerElementStyle = 'mb-1 mt-1 mr-1 ';
        let opFilter = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_FILTER');
        let opBatches = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_BATCH');
        let opDocuments = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_DOCUMENTS');
        let opPlugins = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_PLUGINS');
        return (
            <React.Fragment>
                {opFilter && this.state.filtersList?.length > 0 ? (
                    <SelectBox
                        className='filter-combo mr-1 mt-1 mb-1'
                        id='combo_filters'
                        items={this.state.filtersList}
                        displayExpr='label'
                        valueExpr='id'
                        value={parseInt(this.state.elementFilterId)}
                        onValueChanged={this.onFilterChanged}
                    />
                ) : null}
                {/* {opFilter && this.state.filtersList?.length > 0 ? (
                    <ActionButtonWithMenu
                        id='button_filters'
                        className={`button-with-menu-filter ${centerElementStyle}`}
                        iconName='mdi-filter-variant'
                        iconColor='black'
                        items={this.state.filtersList}
                        title={opFilter?.label}
                    />
                ) : null} */}
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
        const {labels} = this.props;
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
            widthTmp += 38;
        }
        if (showEditButton) {
            widthTmp += 38;
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
                                    caption=''
                                    width={widthTmp}
                                    fixed={true}
                                    fixedPosition='right'
                                    cellTemplate={(element, info) => {
                                        ReactDOM.render(
                                            <div>
                                                <ShortcutButton
                                                    id={`${info.column.headerId}_menu_button`}
                                                    className={`action-button-with-menu`}
                                                    iconName={'mdi-pencil'}
                                                    handleClick={() => this.setState({visibleEditPanel: true})}
                                                    label={''}
                                                    title={'Edycja'}
                                                    rendered={true}
                                                />
                                                <ActionButtonWithMenu
                                                    id='more_shortcut'
                                                    iconName='mdi-dots-vertical'
                                                    className={``}
                                                    items={menuItems}
                                                    remdered={true}
                                                    title={labels['View_AdditionalOptions']}
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
                <div id='subviews-panel'>
                    {this.state.subView != null &&
                    this.state.subView.subViews != null &&
                    this.state.subView.subViews.length > 0 ? (
                        <Tabs
                            dataSource={this.state.subView.subViewsTabs}
                            selectedIndex={this.state.subViewTabIndex}
                            onOptionChanged={this.onTabsSelectionChanged}
                            scrollByContent={true}
                            itemRender={this.renderTabItem}
                            showNavButtons={true}
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }

    renderTabItem = (itemData) => {
        const viewInfoId = this.state.subView.viewInfo?.id;
        const subViewId = itemData.id;
        const recordId = this.state.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return (
            <a
                href={AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}${currentBreadcrumb}`
                )}
                className='subview-tab-item-href'
            >
                {itemData.text}
            </a>
        );
    };

    onTabsSelectionChanged(args) {
        if (args.name === 'selectedItem') {
            if (args.value?.id && args.previousValue !== null && args.value?.id !== args.previousValue?.id) {
                this.state.subView.subViewsTabs.forEach((subView, i) => {
                    if (subView.id === args.value.id) {
                        this.setState({subViewTabIndex: i});
                    }
                });
                const viewInfoId = this.state.subView.viewInfo?.id;
                const subViewId = args.value.id;
                const recordId = this.state.elementRecordId;
                const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                window.location.href = AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}${currentBreadcrumb}`
                );
            }
        }
    }

    //override
    renderCard(rowData) {
        const {cardBody, cardHeader, cardImage, cardFooter} = this.state.parsedGridView;
        const {elementSubViewId} = this.state;
        let elementId = this.props.id;
        let showEditButton = false;
        let showSubviewButton = false;
        let showMenu = false;
        let menuItems = [];
        if (this.state.parsedGridView?.operations) {
            this.state.parsedGridView?.operations.forEach((operation) => {
                showEditButton = showEditButton || operation.type === 'OP_EDIT';
                showSubviewButton = showSubviewButton || operation.type === 'OP_SUBVIEWS';
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
        let oppEdit = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_EDIT');
        let oppSubview = GridViewUtils.containsOperationButton(this.state.parsedGridView?.operations, 'OP_SUBVIEWS');
        const viewId = elementSubViewId ? elementSubViewId : elementId;
        const recordId = rowData.ID;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return (
            <div
                className={`dx-tile-image ${
                    this.state.selectedRowKeys.includes(rowData.ID) ? 'card-grid-selected' : ''
                }`}
                style={{backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR}}
            >
                <div className='row'>
                    <div className='card-grid-header'>
                        {cardHeader?.visible
                            ? CardViewUtils.cellTemplate(cardHeader, rowData, 'card-grid-header-title', 'HEADER')
                            : null}
                        {showEditButton || showMenu || showSubviewButton ? (
                            <div className='float-right'>
                                <ShortcutButton
                                    id={`${rowData.id}_menu_button`}
                                    className={`action-button-with-menu`}
                                    iconName={'mdi-pencil'}
                                    label={''}
                                    title={''}
                                    handleClick={() => this.setState({visibleEditPanel: true})}
                                    rendered={showEditButton && oppEdit}
                                />
                                <ActionButtonWithMenu
                                    id={`${rowData.id}_more_shortcut`}
                                    className={`action-button-with-menu`}
                                    iconName='mdi-dots-vertical'
                                    items={menuItems}
                                    remdered={showMenu}
                                />
                                <ShortcutButton
                                    id={`${rowData.id}_menu_button`}
                                    className={`action-button-with-menu`}
                                    iconName={'mdi-playlist-plus '}
                                    title={oppSubview?.label}
                                    rendered={oppSubview}
                                    href={AppPrefixUtils.locationHrefUrl(
                                        `/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`
                                    )}
                                />
                            </div>
                        ) : null}
                    </div>
                    <div className='card-grid-body'>
                        {/* <div className='row'> */}
                        {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                            ? // <div className={cardBody?.visible ? 'col-3' : 'col-12'}>
                              CardViewUtils.cellTemplate(cardImage, rowData, 'card-grid-body-image', 'IMG')
                            : // </div>
                              null}
                        {cardBody?.visible
                            ? // <div className={cardImage?.visible ? 'col-9' : 'col-12'}>
                              CardViewUtils.cellTemplate(
                                  cardBody,
                                  rowData,
                                  'card-grid-body-content',
                                  cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                                      ? 'BODY_WITH_IMG'
                                      : 'BODY'
                              )
                            : // </div>
                              null}
                        {/* </div> */}
                    </div>
                    <div className='card-grid-footer'>
                        {cardFooter?.visible
                            ? CardViewUtils.cellTemplate(cardFooter, rowData, 'card-grid-footer-content', 'FOOTER')
                            : null}
                    </div>
                </div>
            </div>
        );
    }

    //override
    render() {
        const {labels} = this.props;
        return (
            <React.Fragment>
                {Breadcrumb.render(labels)}
                {super.render()}
            </React.Fragment>
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
        let cardWidth = this.state.parsedGridView?.cardOptions?.width ?? 300;
        let cardHeight = this.state.parsedGridView?.cardOptions?.heigh ?? 200;
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.gridViewType === 'gridView' ? (
                            <DataGrid
                                id='grid-container'
                                className={`grid-container${headerAutoHeight ? ' grid-header-auto-height' : ''}`}
                                keyExpr='ID'
                                ref={(ref) => (this.dataGrid = ref)}
                                dataSource={this.state.parsedGridViewData}
                                customizeColumns={this.customizedColumns}
                                wordWrapEnabled={rowAutoHeight}
                                columnAutoWidth={columnAutoWidth}
                                columnResizingMode='widget'
                                allowColumnReordering={true}
                                allowColumnResizing={true}
                                showColumnLines={true}
                                showRowLines={true}
                                showBorders={true}
                                columnHidingEnabled={false}
                                width='min-content'
                                height='100%'
                                rowAlternationEnabled={false}
                                onSelectionChanged={(e) => {
                                    console.log('onSelectionChanged', e);
                                    if (e.selectedRowKeys && e.component) {
                                        e.selectedRowKeys.forEach((id) =>
                                            e.component.repaintRows(e.component.getRowIndexByKey(id))
                                        );
                                    }
                                    if (e.currentDeselectedRowKeys && e.component) {
                                        e.currentDeselectedRowKeys.forEach((id) =>
                                            e.component.repaintRows(e.component.getRowIndexByKey(id))
                                        );
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

                                <FilterRow visible={true} />
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
                        ) : this.state.gridViewType === 'cardView' ? (
                            <TileView
                                onInitialized={(e) => (this.cardGrid = e.component)}
                                className='card-grid'
                                items={this.state.parsedCardViewData}
                                itemRender={this.renderCard}
                                height='100%'
                                baseItemHeight={cardHeight}
                                baseItemWidth={cardWidth}
                                itemMargin={10}
                                showScrollbar
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

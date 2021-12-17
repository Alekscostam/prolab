import {SelectBox, Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import EditRowComponent from '../components/prolab/EditRowComponent';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutButton from '../components/prolab/ShortcutButton';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import EditService from '../services/EditService';
import ViewService from '../services/ViewService';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {CardViewUtils} from '../utils/CardViewUtils';
import {GridViewUtils} from '../utils/GridViewUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import DataGridStore from './dao/DataGridStore';
import {confirmDialog} from "primereact/confirmdialog";
import Constants from "../utils/Constants";
import $ from 'jquery';
import {localeOptions} from "primereact/api";
import CardViewComponent from "./cardView/CardViewComponent";
import GridViewComponent from "./dataGrid/GridViewComponent";
import DashboardContainer from "./DashboardContainer";
import ConsoleHelper from "../utils/ConsoleHelper";
import LocUtils from "../utils/LocUtils";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
let dataGrid;

export class ViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('ViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.editService = new EditService();
        this.dataGridStore = new DataGridStore();
        this.refDataGrid = null;
        this.cardGrid = null;
        this.selectedDataGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
            elementParentId: null,
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
            cardTotalRows: 0,
            cardScrollLoading: false,
            visibleEditPanel: false,
            modifyEditData: false,
            editData: null,
            select: false,
            selectAll: false,
            isSelectAll: false,
            totalSelectCount: null,
            dataGridStoreSuccess: false,
        };
        this.gridViewTypeChange = this.gridViewTypeChange.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.onTabsSelectionChanged = this.onTabsSelectionChanged.bind(this);
        this.onInitialize = this.onInitialize.bind(this);
    }

    getRefGridView() {
        return this.refDataGrid;
    }

    componentDidMount() {
        this._isMounted = true;
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const viewType = UrlUtils.getURLParameter('viewType');
        const parentId = UrlUtils.getURLParameter('parentId');
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        ConsoleHelper(`ViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`);
        const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
        window.history.replaceState('', '', newUrl);
        this.setState({
                gridViewType: viewType,
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId,
                elementParentId: parentId,
                dataGridStoreSuccess: false,
                select: false,
                selectAll: false,
                isSelectAll: false,
            },
            () => {
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId,
                    this.state.elementParentId,
                    viewType
                );
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        ConsoleHelper('ViewContainer::componentDidUpdate prevProps id={%s} id={%s}', prevProps.id, this.props.id);
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const gridViewType = UrlUtils.getURLParameter('viewType');
        const force = UrlUtils.getURLParameter('force');
        const parentId = UrlUtils.getURLParameter('parentId');
        const firstSubViewMode = !!recordId && !!id && !!!subViewId;
        ConsoleHelper('ViewContainer::componentDidUpdate: firstSubViewMode -> ' + firstSubViewMode);
        ConsoleHelper(`ViewContainer::componentDidUpdate: store params -> Id =  ${id} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`);
        ConsoleHelper(`ViewContainer::componentDidUpdate: elementId=${this.state.elementId}, id=${id}, 
            firstSubViewMode=${firstSubViewMode}, elementSubViewId=${this.state.elementSubViewId}, subViewId=${subViewId}, 
            elementRecordId=${this.state.elementRecordId}, recordId=${recordId},
            prevState.gridViewType=${this.state.gridViewType}, gridViewType=${gridViewType}`,
            this.state.subView
        );
        const fromSubviewToFirstSubView =
            firstSubViewMode &&
            this.state.elementSubViewId &&
            this.state.subView &&
            this.state.subView.subViews &&
            this.state.subView.subViews.length > 0 &&
            this.state.elementSubViewId !== this.state.subView.subViews[0].id;

        ConsoleHelper('ViewContainer::componentDidUpdate -> ' + prevState.gridViewType + '::' + this.state.gridViewType);
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
            ConsoleHelper('ViewContainer::componentDidUpdate -> updating....');
            ConsoleHelper('ViewContainer::componentDidUpdate -> ' + prevState.gridViewType + '::' + this.state.gridViewType + '::' + gridViewType);
            this.setState(
                {
                    elementId: id,
                    elementSubViewId: subViewId,
                    elementRecordId: recordId,
                    elementFilterId: filterId,
                    //z dashboardu
                    elementParentId: parentId,
                    gridViewType,
                    dataGridStoreSuccess: false
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementRecordId,
                        this.state.elementSubViewId,
                        this.state.elementFilterId,
                        this.state.elementParentId,
                        gridViewType
                    );
                }
            );
        } else {
            ConsoleHelper('ViewContainer::componentDidUpdate -> do not download view data!');
        }
        if (this.state.gridViewType === 'cardView' && this.cardGrid !== null) {
            this.cardGrid._scrollView.on('scroll', (e) => {
                if (
                    e.reachedBottom &&
                    !this.state.cardScrollLoading &&
                    this.state.gridViewType === 'cardView' &&
                    this.state.parsedCardViewData.length < this.state.cardTotalRows
                ) {
                    const dataPackageSize = this.state.parsedGridView?.viewInfo?.dataPackageSize;
                    const packageCount = (!!dataPackageSize || dataPackageSize === 0) ? 30 : dataPackageSize;
                    this.setState(
                        {cardScrollLoading: true, cardSkip: this.state.cardSkip + packageCount},
                        () => {
                            ConsoleHelper('Datasource', this.cardGrid.getDataSource());
                            this.cardGrid.beginUpdate();
                            const parentIdArg = this.state.subView == null ? parentId : this.state.elementRecordId;
                            const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : this.state.parsedGridView?.viewInfo?.filterdId;
                            this.dataGridStore
                                .getDataForCard(this.props.id, {
                                        skip: this.state.cardSkip,
                                        take: packageCount
                                    },
                                    parentIdArg,
                                    filterIdArg)
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
            // ConsoleHelper('Header bottom reached');
            document.removeEventListener('scroll', this.trackScrolling);
        }
    }

    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        ConsoleHelper(
            `ViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}, viewType=${viewType}, parentId=${parentId}`
        );
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode) {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    Breadcrumb.updateSubView(subViewResponse, recordId);
                    if (subViewResponse.viewInfo?.type === 'dashboard') {
                        this.setState({
                                subView: subViewResponse,
                                gridViewType: 'dashboard',
                                loading: false
                            },
                            () => {
                                this.props.handleSubView(subViewResponse);
                                this.unblockUi();
                            }
                        );
                    } else {
                        const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;
                        if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                            this.showErrorMessages(LocUtils.loc(this.props.labels, 'No_Subview', 'Brak podwidoków - niepoprawna konfiguracja!'));
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
                                this.props.handleSubView(subViewResponse);
                                this.getViewById(elementSubViewId, recordId, filterId, parentId, viewType, subviewMode);
                            }
                        );
                    }
                })
                .catch((err) => {
                    this.showErrorMessages(err);
                    window.history.back();
                    this.unblockUi();
                });
        } else {
            this.setState({subView: null}, () => {
                this.props.handleSubView(null);
                this.getViewById(viewId, recordId, filterId, parentId, viewType);
            });
        }
    }

    getViewById(viewId, recordId, filterId, parentId, viewType) {
        this.setState({loading: true,},
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
                            // ConsoleHelper('ViewContainer -> fetch columns: ', gridViewColumnsTmp);
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
                            Breadcrumb.currentBreadcrumbAsUrlParam();
                            for (let filter in responseView?.filtersList) {
                                filtersListTmp.push({
                                    id: responseView?.filtersList[filter].id,
                                    label: responseView?.filtersList[filter].label,
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
                                () => ({
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
                                    packageRows: responseView?.viewInfo?.dataPackageSize,
                                    select: false,
                                    selectAll: false,
                                    isSelectAll: false,
                                }),
                                () => {
                                    this.props.handleRenderNoRefreshContent(true);
                                    this.props.handleViewInfoName(this.state.parsedGridView?.viewInfo?.name);
                                    this.props.handleOperations(this.state.parsedGridView?.operations);
                                    this.props.handleShortcutButtons(this.state.parsedGridView?.shortcutButtons);
                                    const initFilterId = responseView?.viewInfo?.filterdId;
                                    const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
                                    const parentIdArg = this.state.subView == null ? parentId : this.state.elementRecordId;
                                    const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                                    if (this.state.gridViewType === 'cardView') {
                                        const dataPackageSize = this.state.parsedGridView?.viewInfo?.dataPackageSize;
                                        const packageCount = (!!dataPackageSize || dataPackageSize === 0) ? 30 : dataPackageSize;
                                        this.setState({loading: true, cardSkip: 0}, () =>
                                            this.dataGridStore
                                                .getDataForCard(viewIdArg,
                                                    {
                                                        skip: this.state.cardSkip,
                                                        take: packageCount
                                                    }, parentIdArg, filterIdArg)
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
                                            let res = this.dataGridStore.getDataGridStore(viewIdArg,
                                                'gridView',
                                                parentIdArg,
                                                filterIdArg,
                                                () => {
                                                    // this.blockUi();
                                                    return {
                                                        select: this.state.select,
                                                        selectAll: this.state.selectAll
                                                    };
                                                },
                                                () => {
                                                    this.setState({
                                                        select: false,
                                                        selectAll: false,
                                                        dataGridStoreSuccess: true,
                                                    }, () => {
                                                        this.unblockUi();
                                                    });
                                                },
                                                (err) => {
                                                    this.setState({
                                                        select: false,
                                                        selectAll: false,
                                                    }, () => {
                                                        this.unblockUi();
                                                        this.showErrorMessages(err);
                                                    });
                                                },
                                            );
                                            if (!!res) {
                                                this.setState({
                                                    loading: false,
                                                    parsedGridViewData: res
                                                });
                                            }
                                        });
                                    }
                                }
                            );
                        }
                    }).catch((err) => {
                    console.error('Error getView in GridView. Exception = ', err);
                    this.setState({loading: false,},
                        () => {
                            this.showErrorMessages(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                        }
                    );
                });
            }
        );
    }

    gridViewTypeChange(e) {
        let newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), 'viewType', e.itemData.type);
        window.history.replaceState('', '', newUrl);
        this.setState({gridViewType: e.itemData.type, dataGridStoreSuccess: false}, () => {
            this.downloadData(
                this.state.elementId,
                this.state.elementRecordId,
                this.state.elementSubViewId,
                this.state.elementFilterId,
                this.state.elementParentId,
                this.state.gridViewType
            );
        });
    }

    //override
    renderGlobalTop() {
        return (
            <React.Fragment>
                <React.Fragment>
                    <EditRowComponent
                        visibleEditPanel={this.state.visibleEditPanel}
                        editData={this.state.editData}
                        onChange={this.handleEditRowChange}
                        onBlur={this.handleEditRowBlur}
                        onSave={this.handleEditRowSave}
                        onAutoFill={this.handleAutoFillRowChange}
                        onEditList={this.handleEditListRowChange}
                        onCancel={this.handleCancelRowChange}
                        validator={this.validator}
                        onHide={(e) => !!this.state.modifyEditData ? confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => this.setState({visibleEditPanel: e}),
                            reject: () => undefined,
                        }) : this.setState({visibleEditPanel: e})}
                        onError={(e) => this.showErrorMessage(e)}
                    />
                </React.Fragment>
            </React.Fragment>);
    }

    //override
    renderHeaderLeft() {
        return <React.Fragment/>
    }

    //override
    renderHeaderRight() {
        return <React.Fragment/>
    }

    rightHeadPanelContent = () => {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment/>
        }
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} maxShortcutButtons={5}/>
            </React.Fragment>
        );
    }

    leftHeadPanelContent = () => {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment/>
        }
        let centerElementStyle = 'mr-1 ';
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
                        value={parseInt(this.state.elementFilterId || this.state.parsedGridView?.viewInfo?.filterdId)}
                        onValueChanged={(e) => {
                            ConsoleHelper('onValueChanged', e);
                            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                            if (!!e.value && e.value !== e.previousValue) {
                                const filterId = parseInt(e.value)
                                const subViewId = UrlUtils.getURLParameter('subview') || this.state.elementSubViewId;
                                const recordId = UrlUtils.getURLParameter('recordId') || this.state.elementRecordId;
                                const subviewMode = !!recordId && !!this.state.elementId;
                                const breadCrumbs = UrlUtils.getURLParameter('bc');
                                //myczek na błąd [FIX] Przełączanie między widokami a filtry
                                if (!breadCrumbs) {
                                    return;
                                }
                                if (subviewMode) {
                                    ConsoleHelper(
                                        `Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`
                                    );
                                    window.location.href = AppPrefixUtils.locationHrefUrl(
                                        `/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${filterId}${currentBreadcrumb}`
                                    );
                                } else {
                                    ConsoleHelper(
                                        `Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${filterId}`
                                    );
                                    if (filterId) {
                                        window.location.href = AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${this.state.elementId}/?filterId=${filterId}${currentBreadcrumb}`
                                        );
                                    }
                                }
                            }
                        }}
                        stylingMode='underlined'
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
                <div className={`${centerElementStyle} op-buttongroup`}>
                    {opDocuments && this.state.documentsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_documents'
                            iconName='mdi-file-document'
                            items={this.state.documentsList}
                            title={opDocuments?.label}
                        />
                    ) : null}

                    {opPlugins && this.state.pluginsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_plugins'
                            iconName='mdi-puzzle'
                            items={this.state.pluginsList}
                            title={opPlugins?.label}
                        />
                    ) : null}

                    {opBatches && this.state.batchesList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='batches_plugins'
                            iconName='mdi-cogs'
                            items={this.state.batchesList}
                            title={opBatches?.label}
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }

    onInitialize(e) {
        dataGrid = e.component;
        //umożliwa filrowanie po niepełniej dacie (która się nie parsuje) i naciśnięciu Enter
        $(document).keyup(event => {
            try {
                const keycode = event.keyCode || event.which;
                if (keycode == '13'
                    && event.target?.className === 'dx-texteditor-input'
                    && event.originalEvent?.path[8]?.className === 'dx-row dx-column-lines dx-datagrid-filter-row'
                    && event.originalEvent?.path[4]?.className?.includes('dx-datebox-calendar')) {
                    // let td = event.originalEvent?.path[7]
                    // let ariaDescribedby = td?.getAttribute("aria-describedby");
                    // let columnName = new String(ariaDescribedby)?.replace(new RegExp('column_[0-9]+_'), '')?.toUpperCase();
                    let inputValue = event.originalEvent?.path[0]?.value;
                    if (inputValue === undefined || inputValue === null || inputValue === '' || inputValue.includes("*")) {
                        this.setState({specialFilter: true}, () => {
                            let filterArray = [];
                            let tr = event.originalEvent?.path[8];
                            for (let child of tr.children) {
                                if (child.className !== 'dx-command-select') {
                                    if (child?.children[0]?.children[1]?.children[0]?.className?.includes('dx-datebox-calendar')) {
                                        let inputValue = child?.children[0]?.children[1]?.children[0]?.children[0]?.children[1]?.children[0]?.children[0]?.value;
                                        if (inputValue !== undefined && inputValue !== null && inputValue !== '') {
                                            let ariaDescribedby = child?.getAttribute("aria-describedby");
                                            let columnName = new String(ariaDescribedby)?.replace(new RegExp('column_[0-9]+_'), '')?.toUpperCase();
                                            if (filterArray.length > 0) {
                                                filterArray.push('and')
                                            }
                                            filterArray.push([columnName, '=', inputValue])
                                        }
                                    }
                                }
                            }
                            if (filterArray.length > 0) {
                                this.refDataGrid?.instance?.filter(filterArray);
                            } else {
                                this.refDataGrid?.instance?.clearFilter('dataSource');
                            }
                        });
                    }
                    // else if (inputValue === undefined || inputValue === null || inputValue === '') {
                    //     console.log('1')
                    //     if (this.state.specialFilter) {
                    //         console.log('2')
                    //         let combinedFilter = this.refDataGrid?.instance?.getCombinedFilter();
                    //         if (combinedFilter.length > 1) {
                    //             console.log('4')
                    //             if (combinedFilter[0] instanceof Array) {
                    //                 console.log('5')
                    //                 this.refDataGrid?.instance?.clearFilter('dataSource');
                    //             } else {
                    //                 console.log('6')
                    //                 this.refDataGrid?.instance?.clearFilter();
                    //             }
                    //         }
                    //         this.setState({specialFilter: false});
                    //     }
                    // }
                }
            } catch (err) {
                console.log(err)
            }
        });
    }

    //override
    renderHeadPanel = () => {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment/>
        }
        const viewId = this.getRealViewId();
        return (
            <React.Fragment>
                <HeadPanel
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => {
                        ConsoleHelper('handleDelete');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Delete_Label', 'Czy na pewno chcesz usunąć zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const selectedRowKeysIds = this.state.selectedRowKeys.map((e) => {
                                    return e.ID;
                                })
                                this.editService.delete(viewId, selectedRowKeysIds)
                                    .then((deleteResponse) => {
                                        this.unselectAllDataGrid();
                                        this.refreshDataGrid();
                                        const msg = deleteResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!deleteResponse.error) {
                                            this.showResponseErrorMessage(deleteResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleRestore={() => {
                        ConsoleHelper('handleRestore');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Restore_Label', 'Czy na pewno chcesz przywrócić zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const selectedRowKeysIds = this.state.selectedRowKeys.map((e) => {
                                    return e.ID;
                                })
                                this.editService.restore(viewId, selectedRowKeysIds)
                                    .then((restoreResponse) => {
                                        this.unselectAllDataGrid();
                                        this.refreshDataGrid();
                                        const msg = restoreResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!restoreResponse.error) {
                                            this.showResponseErrorMessage(restoreResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleCopy={() => {
                        ConsoleHelper('handleCopy');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Copy_Label', 'Czy na pewno chcesz zkopiować zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                const selectedRowKeysIds = this.state.selectedRowKeys.map((e) => {
                                    return e.ID;
                                })
                                this.editService.copy(viewId, parentId, selectedRowKeysIds)
                                    .then((copyResponse) => {
                                        this.unselectAllDataGrid();
                                        this.refreshDataGrid();
                                        const msg = copyResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!copyResponse.error) {
                                            this.showResponseErrorMessage(copyResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                    handleArchive={() => {
                        ConsoleHelper('handleArchive');
                        confirmDialog({
                            message: LocUtils.loc(this.props.labels, 'Question_Archive_Label', 'Czy na pewno chcesz przenieść do archiwum zaznaczone rekordy?'),
                            header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                const selectedRowKeysIds = this.state.selectedRowKeys.map((e) => {
                                    return e.ID;
                                })
                                this.editService.archive(viewId, parentId, selectedRowKeysIds)
                                    .then((archiveResponse) => {
                                        this.unselectAllDataGrid();
                                        this.refreshDataGrid();
                                        const msg = archiveResponse.message;
                                        if (!!msg) {
                                            this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title)
                                        } else if (!!archiveResponse.error) {
                                            this.showResponseErrorMessage(archiveResponse);
                                        }
                                        this.unblockUi();
                                    }).catch((err) => {
                                    if (!!err.error) {
                                        this.showResponseErrorMessage(err);
                                    } else {
                                        this.showErrorMessages(err);
                                    }
                                })
                            },
                            reject: () => undefined,
                        })
                    }}
                />
            </React.Fragment>
        );
    }

    refreshDataGrid() {
        this.refDataGrid.instance.getDataSource().reload();
    }

    selectAllDataGrid(selectionValue) {
        this.setState({
            selectAll: true,
            isSelectAll: selectionValue,
            select: false,
        }, () => {
            this.refDataGrid.instance.selectAll();
            this.dataGridStore.getSelectAllDataGridStore(
                this.state.subView == null
                    ? this.state.elementId
                    : this.state.elementSubViewId,
                'gridView',
                this.state.elementRecordId,
                this.state.elementFilterId,
                this.refDataGrid.instance.getCombinedFilter()
            ).then((result) => {
                this.setState({
                    selectAll: false,
                    select: false,
                    selectedRowKeys: result.data
                }, () => {
                    this.unblockUi();
                });
            }).catch((err) => {
                this.unblockUi();
                this.showErrorMessages(err);
            });
        });
    }

    unselectAllDataGrid(selectionValue) {
        this.setState({
            selectAll: true,
            isSelectAll: selectionValue,
            select: false
        }, () => {
            this.refDataGrid.instance.deselectAll();
            this.setState({
                selectAll: false,
                select: false,
                selectedRowKeys: []
            }, () => {
                this.unblockUi();
            });
        });
    }

    //override
    renderHeaderContent() {
        if (this.state.gridViewType === 'dashboard') {
            return <React.Fragment/>
        }
        return (
            <React.Fragment>
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

    editSubView(e) {
        this.blockUi();
        this.editService
            .getEdit(e.viewId, e.recordId)
            .then((editDataResponse) => {
                this.setState({
                    visibleEditPanel: true,
                    editData: editDataResponse
                });
                this.unblockUi();
            })
            .catch((err) => {
                this.showErrorMessages(err);
                this.unblockUi();
            });
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
    }

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

    getRealViewId() {
        const {elementSubViewId} = this.state;
        const elementId = this.props.id;
        return GridViewUtils.getRealViewId(elementSubViewId, elementId)
    }

    //override
    renderCard(rowData) {
        const {cardBody, cardHeader, cardImage, cardFooter} = this.state.parsedGridView;
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
        const viewId = this.getRealViewId();
        const recordId = rowData.ID;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        setTimeout(() => {
            const cardHeight = this.state.parsedGridView?.cardOptions?.heigh ?? 200;
            var p = $(`#${rowData.ID} .card-grid-body-content`);
            while ($(p).outerHeight() > cardHeight - 52) {
                $(p).text(function (index, text) {
                    return text.replace(/\W*\s(\S)*$/, '...');
                });
            }
        }, 10);
        return (
            <div
                id={rowData.ID}
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
                            <div className='card-grid-header-buttons'>
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
        return (
            <React.Fragment>
                {super.render()}
            </React.Fragment>
        );
    }

    //override
    renderContent = () => {
        const {labels} = this.props;
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.gridViewType === 'gridView' ? (
                            <React.Fragment>
                                {/*{JSON.stringify(this.state.selectedRowKeys.length)}<br/>*/}
                                {/*select: {JSON.stringify(this.state.select)}<br/>*/}
                                {/*isSelectAll: {JSON.stringify(this.state.isSelectAll)}<br/>*/}
                                {/*selectAll: {JSON.stringify(this.state.selectAll)}<br/>*/}
                                <GridViewComponent
                                    id={this.props.id}
                                    elementSubViewId={this.state.elementSubViewId}
                                    handleOnInitialized={this.onInitialize}
                                    handleOnDataGrid={(ref) => {
                                        this.refDataGrid = ref;
                                    }}
                                    parsedGridView={this.state.parsedGridView}
                                    parsedGridViewData={this.state.parsedGridViewData}
                                    gridViewColumns={this.state.gridViewColumns}
                                    handleBlockUi={() => {
                                        this.blockUi();
                                        return true;
                                    }}
                                    handleUnblockUi={() => this.unblockUi}
                                    showErrorMessages={(err) => this.showErrorMessages(err)}
                                    packageRows={this.state.packageRows}
                                    handleShowEditPanel={(editDataResponse) => {
                                        this.handleShowEditPanel(editDataResponse)
                                    }}
                                    handleSelectAll={(selectionValue) => {
                                        this.blockUi();
                                        if (selectionValue === null) {
                                            this.setState({
                                                selectAll: false,
                                                select: true
                                            });
                                            dataGrid.getSelectedRowsData().then((rowData) => {
                                                this.setState({selectedRowKeys: rowData}, () => {
                                                    this.unblockUi();
                                                })
                                            });
                                        } else {
                                            if (selectionValue) {
                                                this.selectAllDataGrid(selectionValue);
                                            } else {
                                                this.unselectAllDataGrid(selectionValue);
                                            }
                                        }
                                    }}
                                    dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                                    selectionDeferred={true}
                                />
                            </React.Fragment>
                        ) : this.state.gridViewType === 'cardView' ? (
                            <React.Fragment>
                                <CardViewComponent
                                    id={this.props.id}
                                    elementSubViewId={this.state.elementSubViewId}
                                    handleOnInitialized={(ref) => this.cardGrid = ref}
                                    parsedGridView={this.state.parsedGridView}
                                    parsedCardViewData={this.state.parsedCardViewData}
                                    handleShowEditPanel={(editDataResponse) => {
                                        this.handleShowEditPanel(editDataResponse)
                                    }}
                                    showErrorMessages={(err) => this.showErrorMessages(err)}
                                    handleBlockUi={() => {
                                        this.blockUi();
                                        return true;
                                    }}
                                    selectedRowKeys={this.state.selectedRowKeys}
                                    handleSelectedRowKeys={(e) => this.setState({selectedRowKeys: e})}/>
                            </React.Fragment>
                        ) : this.state.gridViewType === 'dashboard' ? (<React.Fragment>
                            {Breadcrumb.render(labels)}
                            <DashboardContainer dashboard={this.state.subView}
                                                handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                    this.props.handleRenderNoRefreshContent(renderNoRefreshContent)
                                                }}
                                                labels={labels}
                            />
                        </React.Fragment>) : null}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

ViewContainer.defaultProps =
    {
        viewMode: 'VIEW'
    }

ViewContainer.propTypes =
    {
        id: PropTypes.string.isRequired,
        labels: PropTypes.object.isRequired,
        handleRenderNoRefreshContent: PropTypes.bool.isRequired,
        handleViewInfoName: PropTypes.func.isRequired,
        handleSubView: PropTypes.func.isRequired,
        handleOperations: PropTypes.func.isRequired,
        handleShortcutButtons: PropTypes.func.isRequired,
    }

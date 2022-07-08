import {SelectBox, Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import EditRowComponent from '../components/prolab/EditRowComponent';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import DataGridStore from './dao/DataGridStore';
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import Constants from "../utils/Constants";
import $ from 'jquery';
import {localeOptions} from "primereact/api";
import CardViewInfiniteComponent from "./cardView/CardViewInfiniteComponent";
import GridViewComponent from "./dataGrid/GridViewComponent";
import DashboardContainer from "./dashboard/DashboardContainer";
import ConsoleHelper from "../utils/ConsoleHelper";
import LocUtils from "../utils/LocUtils";
import DataCardStore from "./dao/DataCardStore";
import {EntryResponseUtils} from "../utils/EntryResponseUtils";
import DataTreeStore from "./dao/DataTreeStore";
import GanttViewComponent from './gantView/GanttViewComponent';
import DataGanttStore from './dao/DataGanttStore';
import DataPluginStore from './dao/DataPluginStore';
import PluginListComponent from '../components/prolab/PluginListComponent';
import ActionButtonWithMenuUtils from '../utils/ActionButtonWithMenuUtils';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
let dataGrid;

export class ViewContainer extends BaseContainer {
    _isMounted = false;
    defaultKindView = 'View';
    integerJavaMaxValue = 2147483647;

    constructor(props) {
        ConsoleHelper('ViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.dataGridStore = new DataGridStore();
        this.dataCardStore = new DataCardStore();
        this.dataGanttStore = new DataGanttStore();
        this.dataPluginStore = new DataPluginStore();
        this.dataTreeStore = new DataTreeStore();
        this.refDataGrid = React.createRef();
        this.ganttRef = React.createRef();
        this.refCardGrid = React.createRef();
        this.messages = React.createRef();
        this.selectedDataGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
            elementParentId: null,
            elementKindView: this.defaultKindView,
            elementKindOperation: null,
            elementViewType: '',
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            parsedPluginViewData: {},
            pluginId:undefined,
            parsedPluginView:{},
            selectedRowKeys: [],
            parsedCardViewData: {},
            parsedGanttViewData: {},
            batchesList: [],
            gridViewType: null,
            gridViewTypes: [],
            subView: null,
            viewInfoTypes: [],
            visibleEditPanel: false,
            visiblePluginPanel: false,
            visibleMessagePluginPanel: false,
            modifyEditData: false,
            editData: null,
            select: false,
            selectAll: false,
            isSelectAll: false,
            isPluginFirstStep: true,
            dataGridStoreSuccess: false,
            dataPluginStoreSuccess: false,
        };
        this.onInitialize = this.onInitialize.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.handleRightHeadPanelContent = this.handleRightHeadPanelContent.bind(this);
        this.executePlugin = this.executePlugin.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.unselectAllDataGrid = this.unselectAllDataGrid.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const viewType = UrlUtils.getURLParameter('viewType');
        const parentId = UrlUtils.getURLParameter('parentId');
        const kindView = UrlUtils.getURLParameter('kindView');
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        ConsoleHelper(`ViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`);
        const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
        window.history.replaceState('', '', newUrl);
        this.setState({
            elementViewType: viewType,
            elementSubViewId: subViewId,
            elementRecordId: recordId,
            elementFilterId: filterId,
            elementParentId: parentId,
            elementKindView: kindView,
            dataGridStoreSuccess: false,
            select: false,
            selectAll: false,
            isSelectAll: false,
        }, () => {
            this.downloadData(id, this.state.elementRecordId, this.state.elementSubViewId, this.state.elementFilterId, this.state.elementParentId, this.state.elementViewType);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const subViewId = UrlUtils.getURLParameter('subview');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const viewType = UrlUtils.getURLParameter('viewType');
        const force = UrlUtils.getURLParameter('force');
        const parentId = UrlUtils.getURLParameter('parentId');
        const kindView = UrlUtils.getURLParameter('kindView');
        const firstSubViewMode = !!recordId && !!id && !!!subViewId;
        const fromSubviewToFirstSubView = firstSubViewMode && this.state.elementSubViewId && this.state.subView && this.state.subView.subViews && this.state.subView.subViews.length > 0 && this.state.elementSubViewId !== this.state.subView.subViews[0].id;
        const updatePage = !!force || !DataGridUtils.equalNumbers(this.state.elementId, id) || (!firstSubViewMode && !DataGridUtils.equalNumbers(this.state.elementSubViewId, subViewId)) || fromSubviewToFirstSubView || !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId) || !DataGridUtils.equalNumbers(this.state.elementRecordId, recordId)
        ConsoleHelper('ViewContainer::componentDidUpdate -> updatePage={%s id={%s} id={%s} type={%s} type={%s}', updatePage, prevProps.id, this.props.id, prevState.gridViewType, this.state.gridViewType);
        if (updatePage) {
            const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
            window.history.replaceState('', '', newUrl);
            this.setState({
                elementId: id,
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId, //z dashboardu
                elementParentId: parentId,
                elementKindView: kindView,
                elementViewType: viewType,
                dataGridStoreSuccess: false
            }, () => {
                this.downloadData(id, this.state.elementRecordId, this.state.elementSubViewId, this.state.elementFilterId, this.state.elementParentId, this.state.elementViewType);
            });
        } else {
            ConsoleHelper('ViewContainer::componentDidUpdate -> not updating !');
        }
    }


    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode) {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    Breadcrumb.updateSubView(subViewResponse, recordId);
                    if (subViewResponse.viewInfo?.type === 'dashboard') {
                        const kindView = subViewResponse.viewInfo.kindView;
                        ConsoleHelper(`ViewContainer::downloadDashboardData: viewId=${viewId}, recordId=${recordId},  parentId=${parentId}, viewType=${viewType}, kindView=${kindView}`);
                        this.setState({
                            subView: subViewResponse,
                            gridViewType: 'dashboard',
                            elementKindView: kindView,
                            loading: false
                        }, () => {
                            this.props.handleSubView(subViewResponse);
                            this.unblockUi();
                        });
                    } else {
                        ConsoleHelper(`ViewContainer::downloadSubViewData: viewId=${viewId}, subviewId=${subviewId}, recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`);
                        const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;
                        if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                            this.showErrorMessages(LocUtils.loc(this.props.labels, 'No_Subview', 'Brak podwidoków - niepoprawna konfiguracja!'));
                            window.history.back();
                            this.unblockUi();
                            return;
                        } else {
                            let subViewsTabs = [];
                            subViewResponse.subViews.forEach((subView, i) => {
                                subViewsTabs.push({
                                    id: subView.id, text: subView.label, icon: subView.icon, kindView: subView.kindView
                                });
                                if (subView.id === parseInt(elementSubViewId)) {
                                    this.setState({subViewTabIndex: i});
                                }
                            });
                            subViewResponse.subViewsTabs = subViewsTabs;
                        }
                        const currentSubView = subViewResponse.subViewsTabs?.filter(i => i.id === parseInt(elementSubViewId));
                        this.setState({
                            subView: subViewResponse,
                            elementKindView: !!currentSubView ? currentSubView[0].kindView : this.defaultKindView,
                            elementSubViewId: elementSubViewId,
                        }, () => {
                            this.props.handleSubView(subViewResponse);
                            this.getViewById(elementSubViewId, recordId, filterId, parentId, viewType, true);
                        });
                    }
                })
                .catch((err) => {
                    this.showGlobalErrorMessage(err);
                    window.history.back();
                });
        } else {
            ConsoleHelper(`ViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`);
            this.setState({subView: null}, () => {
                this.props.handleSubView(null);
                this.getViewById(viewId, recordId, filterId, parentId, viewType, false);
            });
        }
    }

    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        this.setState({loading: true}, () => {
            this.viewService
                .getView(viewId, viewType, recordId, this.state.elementKindView)
                .then((responseView) => {
                    this.processViewResponse(responseView, parentId, recordId, isSubView)
                }).catch((err) => {
                console.error('Error getView in GridView. Exception = ', err);
                this.setState({loading: false,}, () => {
                    this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                });
            });
        });
    }

    processViewResponse(responseView, parentId, recordId, isSubView) {
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
                    id: responseView?.batchesList[batch].id, label: responseView?.batchesList[batch].label,
                });
            }
            Breadcrumb.currentBreadcrumbAsUrlParam();
            for (let filter in responseView?.filtersList) {
                filtersListTmp.push({
                    id: responseView?.filtersList[filter].id,
                    label: responseView?.filtersList[filter].label
                });
            }
            let viewInfoTypesTmp = [];
            let cardButton = DataGridUtils.containsOperationsButton(responseView.operations, 'OP_CARDVIEW');
            if (cardButton) {
                viewInfoTypesTmp.push({
                    icon: 'mediumiconslayout', type: 'cardView', hint: cardButton?.label,
                });
            }
            let viewButton = DataGridUtils.containsOperationsButton(responseView.operations, 'OP_GRIDVIEW');
            if (viewButton) {
                viewInfoTypesTmp.push({
                    icon: 'contentlayout', type: 'gridView', hint: viewButton?.label,
                });
            }
            
            this.setState(() => ({
                loading: false, //elementId: this.props.id,
                gridViewType: responseView?.viewInfo?.type,
                kindView: responseView?.viewInfo?.kindView,
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
            }), () => {
                this.props.handleRenderNoRefreshContent(true);
                this.props.handleViewInfoName(isSubView ? this.state.subView?.viewInfo?.name : this.state.parsedGridView?.viewInfo?.name);
                this.props.handleOperations(this.state.parsedGridView?.operations);
                this.props.handleShortcutButtons(this.state.parsedGridView?.shortcutButtons);
                const initFilterId = responseView?.viewInfo?.filterdId;
                const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
                const parentIdArg = this.state.subView == null ? parentId : this.state.elementRecordId;
                const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                const kindViewArg = this.state.kindView;
                if (this.isCardView()) {
                    this.setState({loading: true}, () => {
                        const dataPackageSize = this.state.parsedGridView?.viewInfo?.dataPackageSize;
                        const packageCount = (!!dataPackageSize || dataPackageSize === 0) ? Constants.DEFAULT_DATA_PACKAGE_COUNT : dataPackageSize;
                        let res = this.dataCardStore.getDataCardStore(viewIdArg, {    
                            skip: 0, take: packageCount
                        }, 
                        
                        parentIdArg, filterIdArg, kindViewArg, () => {
                            return null;
                        }, () => {
                            this.setState({
                                dataGridStoreSuccess: true,
                            }, () => {
                                this.unblockUi();
                            });
                        }, (err) => {
                            this.unblockUi();
                            this.showErrorMessages(err);
                        },);
                        if (!!res) {
                            this.setState({
                                loading: false, parsedCardViewData: res
                            });
                        }
                        this.unblockUi();
                    });
                }
                else if(this.isGanttView()){
                   
                    this.setState({loading: true}, () => {
                        let res = this.dataGanttStore.getDataForGantt(viewIdArg, {skip: 0, take: this.integerJavaMaxValue}, parentIdArg, filterIdArg, kindViewArg);
                        if (!!res) {
                            this.setState({
                                loading: false, parsedGanttViewData: res
                            });
                        }
                        this.unblockUi();
                    });
                    

                }
                else{
                    this.setState({loading: true}, () => {
                        let res = this.dataGridStore.getDataGridStore(viewIdArg, 'gridView', parentIdArg, filterIdArg, kindViewArg, () => {
                            this.blockUi();
                            return {
                                select: this.state.select, selectAll: this.state.selectAll
                            };
                        }, () => {
                            this.setState({
                                select: false, selectAll: false, dataGridStoreSuccess: true,
                            }, () => {
                                this.unblockUi();
                            });
                        }, (err) => {
                            this.setState({
                                select: false, selectAll: false,
                            }, () => {
                                this.showErrorMessages(err);
                                this.unblockUi();
                            });
                        },);
                        if (!!res) {
                            this.setState({
                                loading: false, parsedGridViewData: res
                            });
                        }
                        this.unblockUi();
                    });
                }
            });
        }
    }

    /** Wybrana akcja po kliknieciu dowolnego elementu z RightHeadPanelContent */
    /** TODO: chwilowo tylko dla wtyczek - SK_PLUGIN oraz OP_PLUGINS */
    handleRightHeadPanelContent(element){
        const idRowKeys =  this.state.selectedRowKeys.map(el=>el.ID);
        const listId = {"listId": idRowKeys}
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const pluginId = `${element.id}`;
        const parentIdArg = this.state.subView == null ? UrlUtils.getURLParameter('parentId') : this.state.elementRecordId;
        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        
        switch (element.type) {
            case 'OP_PLUGINS' :
            case 'SK_PLUGIN' :
                this.crudService.getPluginColumnsDefnitions(viewIdArg,pluginId,listId)
                    .then((res)=>{  
                       
                        let parsedPluginViewData ;
                        if(res.info.kind==="GRID"){
                            visiblePluginPanel = true;
                            let datas = this.dataPluginStore.getPluginDataStore(
                                viewIdArg,
                                pluginId,
                                listId,
                                parentIdArg,
                                (err) => {this.props.showErrorMessages(err);},
                                () => {this.setState({dataPluginStoreSuccess: true});},
                                
                            )
                            parsedPluginViewData = datas
                        }else{
                            visibleMessagePluginPanel = true;
                        }
                        this.setState({
                            parsedPluginView: res,
                            parsedPluginViewData: parsedPluginViewData,
                            visiblePluginPanel: visiblePluginPanel,
                            visibleMessagePluginPanel: visibleMessagePluginPanel,
                            isPluginFirstStep: true,
                            pluginId: pluginId
                        }) 
                    }).catch((err)=>{
                        this.showErrorMessages(err);
                    })
                    // this.unblockUi();
                break;
            default:
                return null;
        
            }
    }

    /** Metoda już typowo pod plugin. executePlugin wykonuje się w momencie przejscia z pierwszego do drugiego kroku */
    executePlugin(pluginId,requestBody,refreshAll){
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.state.subView == null ? UrlUtils.getURLParameter('parentId') : this.state.elementRecordId;

        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        this.crudService.getPluginExecuteColumnsDefinitions(viewIdArg,pluginId,requestBody)
        .then((res)=>{ 
           let  parsedPluginViewData;
            if(res.info.kind==="GRID"){
                visiblePluginPanel = true;
                let datas = this.dataPluginStore.getPluginExecuteDataStore(
                    viewIdArg,
                    pluginId,
                    requestBody,
                    parentIdArg,
                    (err) => {this.props.showErrorMessages(err);},
                    () => {this.setState({dataPluginStoreSuccess: true});},
                    () => {return {selectAll: this.state.selectAll};},
                )
                 parsedPluginViewData = datas
            }else{
                visibleMessagePluginPanel = true;
            }
            this.setState({
                pluginId: pluginId,
                parsedPluginViewData: parsedPluginViewData,
                parsedPluginView: res,
                visiblePluginPanel: visiblePluginPanel,
                visibleMessagePluginPanel: visibleMessagePluginPanel,
                isPluginFirstStep:false
            })
          
            if(refreshAll){
                this.refreshView();
                this.unselectAllDataGrid(false);
            }

        }).catch((err)=>{
            this.showErrorMessages(err);
        })
     
    }

    //override
    renderGlobalTop() {
        return (<React.Fragment>
            <EditRowComponent
                visibleEditPanel={this.state.visibleEditPanel}
                editData={this.state.editData}
                kindView={this.state.elementKindView}
                onChange={this.handleEditRowChange}
                onBlur={this.handleEditRowBlur}
                onSave={this.handleEditRowSave}
                onAutoFill={this.handleAutoFillRowChange}
                onEditList={this.handleEditListRowChange}
                onCancel={this.handleCancelRowChange}
                validator={this.validator}
                onHide={(e, viewId, recordId, parentId) => !!this.state.modifyEditData ? confirmDialog({
                    appendTo: document.body,
                    message: LocUtils.loc(this.props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
                    header: LocUtils.loc(this.props.labels, 'Confirm_Label', 'Potwierdzenie'),
                    icon: 'pi pi-exclamation-triangle',
                    acceptLabel: localeOptions('accept'),
                    rejectLabel: localeOptions('reject'),
                    accept: () => {
                        this.handleCancelRowChange(viewId, recordId, parentId);
                        this.setState({visibleEditPanel: e});
                    },
                    reject: () => undefined,
                }) : this.setState({visibleEditPanel: e}, () => {
                    this.handleCancelRowChange(viewId, recordId, parentId);
                })}
                onError={(e) => this.showErrorMessage(e)}
                labels={this.props.labels}
                showErrorMessages={(err) => this.showErrorMessages(err)}
            />
            
            <PluginListComponent 
                               visible={this.state.visiblePluginPanel}
                               field={this.state.editListField}
                               parsedPluginView={this.state.parsedPluginView}
                               parsedPluginViewData={this.state.parsedPluginViewData}
                               onHide={() => this.setState({visiblePluginPanel: false})}
                               handleBlockUi={() => {
                                   this.blockUi();
                                   return true;
                               }}
                               pluginId={this.state.pluginId}
                               isPluginFirstStep={this.state.isPluginFirstStep}
                               executePlugin={this.executePlugin}
                               selectedRowKeys={this.state.selectedRowKeys}
                               handleUnblockUi={() => this.unblockUi}
                               showErrorMessages={(err) => this.props.showErrorMessages(err)}
                               dataGridStoreSuccess={this.state.dataPluginStoreSuccess}
                               selectedRowData={this.state.selectedRowData}
                               defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                               labels={this.props.labels}
            />

            
            {this.state.visibleMessagePluginPanel ? 
            <ConfirmDialog
                        acceptLabel={this.state.parsedPluginView.info.question ? 
                            LocUtils.loc(this.props.labels, 'Yes', 'Tak')  :
                            LocUtils.loc(this.props.labels, 'Ok', 'Ok')
                        }
                        rejectLabel={this.state.parsedPluginView.info.question ? 
                            LocUtils.loc(this.props.labels, 'No', 'Nie') :
                            LocUtils.loc(this.props.labels, 'Close', 'Zamknij')
                        }
                        /** Question jest nadrzedny tzn. jesli message i question !== null to bierze wartosci z question */
                        header={this.state.parsedPluginView.info.question  ? 
                            LocUtils.loc(this.props.labels, '', this.state.parsedPluginView.info.question?.title) : 
                            LocUtils.loc(this.props.labels, '', this.state.parsedPluginView.info.message?.title)  
                        }
                        visible={true}
                        onHide={() => this.setState({visibleMessagePluginPanel:false})}
                        message={this.state.parsedPluginView.info.question  ? 
                            LocUtils.loc(this.props.labels, '', this.state.parsedPluginView.info.question?.text) : 
                            LocUtils.loc(this.props.labels, '', this.state.parsedPluginView.info.message?.text)  
                        }
                        icon="pi pi-exclamation-triangle"
                        accept={() => {
                            const refreshAll = this.state.parsedPluginView?.viewOptions?.refreshAll;
                            if(this.state.isPluginFirstStep){
                                const isThereNextStep = this.state.parsedPluginView?.info?.next;
                                const idRowKeys =  this.state.selectedRowKeys.map(el=>el.ID);
                                const listId = {"listId": idRowKeys}
                                const pluginId = this.state.pluginId;
                                if(isThereNextStep)
                                    this.executePlugin(pluginId,listId,refreshAll);
                                else
                                    this.setState({visibleMessagePluginPanel:false});
                            }
                            if(refreshAll){
                                this.refreshView();
                                this.unselectAllDataGrid(false);
                            }
                            this.setState({visibleMessagePluginPanel:false});
                        }}
                        reject={() => this.setState({visibleMessagePluginPanel:false})}
                    />
                : null}


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
        
        if (this.isDashboard()) {
            return <React.Fragment/>
        }
        return (<React.Fragment>
            <ShortcutsButton 
                handleClick={(e)=>this.handleRightHeadPanelContent(e)}
                items={this.state.parsedGridView?.shortcutButtons} 
                maxShortcutButtons={5}/>
        </React.Fragment>);
    }

    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_FILTER':
                    return (<React.Fragment>
                        {this.state.filtersList?.length > 0 ? (<SelectBox
                            className={`filter-combo ${margin}`}
                            wrapItemText={true}
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
                                    const viewType = UrlUtils.getURLParameter('viewType');
                                    //myczek na błąd [FIX] Przełączanie między widokami a filtry
                                    if (!breadCrumbs) {
                                        return;
                                    }
                                    if (subviewMode) {
                                        ConsoleHelper(`Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`);
                                        window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${filterId}&viewType=${viewType}${currentBreadcrumb}`);
                                    } else {
                                        ConsoleHelper(`Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${filterId}`);
                                        if (filterId) {
                                            window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}/?filterId=${filterId}&viewType=${viewType}${currentBreadcrumb}`);
                                        }
                                    }
                                }
                            }}
                            stylingMode='underlined'
                        />) : null}
                    </React.Fragment>);
                case 'OP_BATCH':
                    return (<React.Fragment>
                        {/*{this.state.batchesList?.length > 0 ? (*/}
                        <ActionButtonWithMenu
                            id='button_batches'
                            className={`${margin}`}
                            iconName={operation?.iconCode || 'mdi-cogs'}
                            items={this.state.batchesList}
                            title={operation?.label}
                        />
                        {/*) : null}*/}
                    </React.Fragment>)
                case 'OP_DOCUMENTS':
                    return (<React.Fragment>
                        {/*{this.state.documentsList?.length > 0 ? (*/}
                        <ActionButtonWithMenu
                            id='button_documents'
                            className={`${margin}`}
                            iconName={operation?.iconCode || 'mdi-file-document'}
                            items={this.state.documentsList}
                            title={operation?.label}
                        />
                        {/*) : null}*/}
                    </React.Fragment>)
                case 'OP_PLUGINS':
                    return (<React.Fragment>
                        {this.state.pluginsList?.length > 0 ? (
                        <ActionButtonWithMenu
                            id='button_plugins'
                            className={`${margin}`}
                            iconName={operation?.iconCode || 'mdi-puzzle'}
                            items={ActionButtonWithMenuUtils.createItemsWithCommand(this.state.pluginsList,  undefined, this.handleRightHeadPanelContent, "OP_PLUGINS")}
                            title={operation?.label}
                            />         
                        ) : null}
                       
                    </React.Fragment>)
                case 'OP_CARDVIEW':
                case 'OP_GRIDVIEW':
                    let indexInArray = this.state.parsedGridView?.operations?.findIndex(o => o?.type?.toUpperCase() === 'OP_CARDVIEW' || o?.type?.toUpperCase() === 'OP_GRIDVIEW');
                    //condition for only one display
                    if (index > indexInArray) {
                        return (this.state.viewInfoTypes ? <React.Fragment>
                            
                            <ButtonGroup
                                className={`${margin}`}
                                items={this.state.viewInfoTypes}
                                keyExpr='type'
                                stylingMode='outlined'
                                selectedItemKeys={this.state.gridViewType}
                                onItemClick={(e) => {
                                    let newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), 'viewType', e.itemData.type);
                                    window.history.replaceState('', '', newUrl);
                                    this.setState({gridViewType: e.itemData.type, dataGridStoreSuccess: false}, () => {
                                        this.downloadData(this.state.elementId, this.state.elementRecordId, this.state.elementSubViewId, this.state.elementFilterId, this.state.elementParentId, this.state.gridViewType);
                                    });
                                }}
                            />
                        </React.Fragment> : null);
                    } else {
                        return null;
                    }
                default:
                    return null;
            }
        }
    }

    leftHeadPanelContent = () => {
        if (this.isDashboard()) {
            return <React.Fragment/>
        }
        return (<React.Fragment>
            {this.state.parsedGridView?.operations.map((operation, index) => {
                return <div key={index}>{this.renderButton(operation, index)}</div>;
            })}
        </React.Fragment>);
    }

    onInitialize(e) {
        dataGrid = e.component;
        //umożliwa filrowanie po niepełniej dacie (która się nie parsuje) i naciśnięciu Enter
        $(document).keyup(event => {
            try {
                const keycode = event.keyCode || event.which;
                if (keycode === 13 && event.target?.className === 'dx-texteditor-input' && event.originalEvent?.path[8]?.className === 'dx-row dx-column-lines dx-datagrid-filter-row' && event.originalEvent?.path[4]?.className?.includes('dx-datebox-calendar')) {
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
                                            let columnName = '' + ariaDescribedby?.replace(new RegExp('column_[0-9]+_'), '')?.toUpperCase();
                                            if (filterArray.length > 0) {
                                                filterArray.push('and')
                                            }
                                            filterArray.push([columnName, 'contains', inputValue])
                                        }
                                    }
                                }
                            }
                            if (filterArray.length > 0) {
                                this.getRefGridView()?.instance?.filter(filterArray);
                            } else {
                                this.getRefGridView()?.instance?.clearFilter('dataSource');
                            }
                        });
                    }
                }
            } catch (err) {
                this.showGlobalErrorMessage(err);
            }
        });
    }


    //override
    renderHeadPanel = () => {
        if (this.isDashboard()) {
            return <React.Fragment/>
        }
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={this.state.elementRecordId}
                    elementSubViewId={this.state.elementSubViewId}
                    elementKindView={this.state.elementKindView}
                    labels={this.props.labels}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => this.delete()}
                    handleRestore={() => this.restore()}
                    handleCopy={() => this.copy()}
                    handleArchive={() => this.archive()}
                    handlePublish={() => this.publish()}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                />
            </React.Fragment>
        );
    }

    selectAllDataGrid(selectionValue) {
        if (this.isGridView()) {
            this.setState({
                selectAll: true, isSelectAll: selectionValue, select: false,
            }, () => {
                this.getRefGridView().instance.selectAll();
                this.dataGridStore.getSelectAllDataGridStore(this.state.subView == null ? this.state.elementId : this.state.elementSubViewId, 'gridView', this.state.elementRecordId, this.state.elementFilterId, this.state.kindView, this.getRefGridView().instance.getCombinedFilter()).then((result) => {
                    this.setState({
                        selectAll: false, select: false, selectedRowKeys: result.data
                    }, () => {
                        this.unblockUi();
                    });
                }).catch((err) => {
                    this.showGlobalErrorMessage(err);
                });
            });
        }
    }

    unselectAllDataGrid(selectionValue) {
        if (this.isGridView()) {
            this.setState({
                selectAll: true, isSelectAll: selectionValue, select: false
            }, () => {
                this.getRefGridView().instance.deselectAll();
                this.setState({
                    selectAll: false, select: false, selectedRowKeys: []
                }, () => {
                    this.unblockUi();
                });
            });
        } else {
            this.setState({
                selectedRowKeys: []
            });
        } 
        
    }    


    //override
    renderHeaderContent() {
        if (this.isDashboard()) {
            return <React.Fragment/>
        }
        return (<React.Fragment>
            {/*Zakładki podwidoków*/}
            <div id='subviews-panel'>
                {this.state.subView != null && this.state.subView.subViews != null && this.state.subView.subViews.length > 0 ? (
                    <Tabs
                        dataSource={this.state.subView.subViewsTabs}
                        selectedIndex={this.state.subViewTabIndex}
                        onOptionChanged={(args) => {
                            if (args.name === 'selectedItem') {
                                if (args.value?.id && args.previousValue !== null && args.value?.id !== args.previousValue?.id) {
                                    this.state.subView.subViewsTabs.forEach((subView, i) => {
                                        if (subView.id === args.value.id) {
                                            this.setState({subViewTabIndex: i});
                                        }
                                    });
                                    const subViewId = args.value.id;
                                    const viewInfoId = this.state.subView.viewInfo.id;
                                    const recordId = this.state.elementRecordId
                                    const kindView = !!this.state.subView.viewInfo?.kindView ? this.state.subView.viewInfo?.kindView : this.defaultKindView;
                                    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                    window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}&kindView=${kindView}${currentBreadcrumb}`);
                                }
                            }
                        }}
                        scrollByContent={true}
                        itemRender={(itemData) => {
                            const viewInfoId = this.state.subView.viewInfo?.id;
                            const subViewId = itemData.id;
                            const recordId = this.state.elementRecordId;
                            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                            return (<a
                                href={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}${currentBreadcrumb}`)}
                                className='subview-tab-item-href'>
                                {itemData.text}
                            </a>);
                        }}
                        showNavButtons={true}
                    />) : null}
            </div>
        </React.Fragment>);
    }

    addView(e) {
        this.blockUi();
        const subViewId = this.state.elementSubViewId;
        const kindView = this.state.elementKindView;
        const parentId = this.state.elementRecordId;
        const recordId = undefined;
        let viewId = this.props.id;
        viewId = DataGridUtils.getRealViewId(subViewId, viewId);
        this.crudService
            .addEntry(viewId, e.recordId, parentId, kindView)
            .then((entryResponse) => {
                EntryResponseUtils.run(entryResponse, () => {
                    if (!!entryResponse.next) {
                        this.crudService
                            .add(viewId, recordId, parentId, kindView)
                            .then((editDataResponse) => {
                                this.setState({
                                    visibleEditPanel: true, editData: editDataResponse
                                });
                                this.unblockUi();
                            })
                            .catch((err) => {
                                this.showGlobalErrorMessage(err);
                            });
                    } else {
                        this.unblockUi();
                    }
                }, () => this.unblockUi());
            }).catch((err) => {
            this.showGlobalErrorMessage(err);
        });
    }

    editSubView(e) {
        this.blockUi();
        const parentId = this.state.elementRecordId;
        const kindView = this.state.elementKindView;
        this.crudService
            .edit(e.viewId, e.recordId, parentId, kindView)
            .then((editDataResponse) => {
                this.setState({
                    visibleEditPanel: true, editData: editDataResponse
                });
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    refreshGanttData(){
        const initFilterId = this.state.parsedGridView?.viewInfo?.filterdId;
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.state.subView == null ? null : this.state.elementRecordId;
        const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
        const kindViewArg = this.state.kindView;   
        this.setState({loading: true}, () => {
            let res = this.dataGanttStore.getDataForGantt(viewIdArg, {skip: 0, take: this.integerJavaMaxValue}, parentIdArg, filterIdArg, kindViewArg);
            if (!!res) {
                this.setState({
                    loading: false, parsedGanttViewData: res
                });
            }
            this.unblockUi();
        });
    }
    //override
    render() {
        return (<React.Fragment>

            {super.render()}
        </React.Fragment>);
    }

    //override
    renderContent = () => {
        const {labels} = this.props;
        const parentIdArg = this.state.subView == null ? UrlUtils.getURLParameter('parentId') : this.state.elementRecordId;
        const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : this.state.parsedGridView?.viewInfo?.filterdId;
        const kindViewArg = !!this.state.elementKindView ? this.state.elementKindView : UrlUtils.getURLParameter('kindView');
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        return (<React.Fragment>
            {this.state.loading ? null : (<React.Fragment>
                {this.isGridView() ? (<React.Fragment>
                        <GridViewComponent
                            id={this.props.id}
                            elementSubViewId={this.state.elementSubViewId}
                            elementKindView={this.state.elementKindView}
                            elementRecordId={this.state.elementRecordId}
                            handleOnInitialized={this.onInitialize}
                            handleOnDataGrid={(ref) => this.refDataGrid = ref}
                            parsedGridView={this.state.parsedGridView}
                            parsedGridViewData={this.state.parsedGridViewData}
                            gridViewColumns={this.state.gridViewColumns}
                            handleBlockUi={() => {
                                this.blockUi();
                                return true;
                            }}
                            handleUnblockUi={() => this.unblockUi()}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            packageRows={this.state.packageRows}
                            handleShowEditPanel={(editDataResponse) => {
                                this.handleShowEditPanel(editDataResponse)
                            }}
                            handleSelectAll={(selectionValue) => {
                                this.blockUi();
                                if (selectionValue === null) {
                                    this.setState({
                                        selectAll: false, select: true
                                    });
                                    dataGrid.getSelectedRowsData().then((rowData) => {
                                        this.setState({
                                            selectedRowKeys: rowData, selectAll: false, select: false
                                        }, () => {
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
                            handleDeleteRow={(id) => this.delete(id)}
                            handleRestoreRow={(id) => this.restore(id)}
                            handleCopyRow={(id) => this.copy(id)}
                            handleArchiveRow={(id) => this.archive(id)}
                            handlePublishRow={(id) => this.publish(id)}
                        />
                    </React.Fragment>)
                    : this.isCardView() ? (<React.Fragment>
                        <CardViewInfiniteComponent
                            id={viewIdArg}
                            ref={this.refCardGrid}
                            elementSubViewId={this.state.elementSubViewId}
                            elementKindView={this.state.elementKindView}
                            handleOnInitialized={(ref) => this.cardGrid = ref}
                            parsedCardView={this.state.parsedGridView}
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
                            handleSelectedRowKeys={(e) => this.setState({selectedRowKeys: e})}
                            collapsed={this.props.collapsed}
                            kindView={kindViewArg}
                            parentId={parentIdArg}
                            filterId={filterIdArg}
                            handleDeleteRow={(id) => this.delete(id)}
                            handleRestoreRow={(id) => this.restore(id)}
                            handleCopyRow={(id) => this.copy(id)}
                            handleArchiveRow={(id) => this.archive(id)}
                            handlePublishRow={(id) => this.publish(id)}
                        />
                    </React.Fragment>) :
                    
                    this.isGanttView() ? (<React.Fragment>
                        <GanttViewComponent
                            id={this.props.id}
                            elementSubViewId={this.state.elementSubViewId}
                            elementKindView={this.state.elementKindView}
                            elementRecordId={this.state.elementRecordId}
                            shortcutButtons={this.state.parsedGridView.shortcutButtons}
                            parsedGanttViewData={this.state.parsedGanttViewData}
                            selectedRowKeys={this.state.selectedRowKeys}
                            handleBlockUi={() => {
                                this.blockUi();
                                return true;
                            }}
                            handleUnBlockUi={() => {
                                this.unblockUi();
                                return true;
                            }}
                            ref={this.ganttRef}
                            handleSelectAll={(selectionValue,selectedRowKeys) => {
                                this.state.selectedRowKeys.length = 0;
                                    if (selectionValue) {
                                        this.setState({
                                            selectedRowKeys: selectedRowKeys
                                        });
                                    } else {
                                        this.setState({
                                            selectedRowKeys: this.state.selectedRowKeys
                                        });
                                    }
                            }}
                            handleRefreshData={()=> this.refreshGanttData()}
                            handleUp={() => this.up()}
                            handleDown={() => this.publish()}
                            parsedGanttView={this.state.parsedGridView}
                            gridViewColumns={this.state.ganttViewColumns}
                            dataGanttStoreSuccess={this.state.dataGanttStoreSuccess}
                            handleUnblockUi={() => this.unblockUi()}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            packageRows={this.state.packageRows}
                            handleShowEditPanel={(editDataResponse) => {
                                this.handleShowEditPanel(editDataResponse)
                            }}
                            handleSelectedRowKeys={(e)=> {this.setState({selectedRowKeys:e})}}
                            dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                            selectionDeferred={true}
                            handleDeleteRow={(id) => this.delete(id)}
                            handleRestoreRow={(id) => this.restore(id)}
                            handleCopyRow={(id) => this.copy(id)}
                            handleArchiveRow={(id) => this.archive(id)}
                            handlePublishRow={(id) => this.publish(id)}
                        />
                    </React.Fragment>):
                    
                    this.isDashboard() ? (<React.Fragment>
                        {Breadcrumb.render(labels)}
                        <DashboardContainer dashboard={this.state.subView}
                                            handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                this.props.handleRenderNoRefreshContent(renderNoRefreshContent)
                                            }}
                                            labels={labels}
                        />
                    </React.Fragment>) : null}
            </React.Fragment>)}
        </React.Fragment>);
    }

    getMessages() {
        return this.messages;
    }

}

ViewContainer.defaultProps = {
    viewMode: 'VIEW'
}

ViewContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
    handleRenderNoRefreshContent: PropTypes.bool.isRequired,
    handleViewInfoName: PropTypes.func.isRequired,
    handleSubView: PropTypes.func.isRequired,
    handleOperations: PropTypes.func.isRequired,
    handleShortcutButtons: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
}

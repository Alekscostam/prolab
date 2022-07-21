import React from 'react';
import PropTypes from "prop-types";

import Gantt, {
  Tasks, 
  Dependencies, 
  Resources, 
  ResourceAssignments, 
  ContextMenu,
  Column,
  Editing,
  HeaderFilter
} from 'devextreme-react/gantt';

import 'devextreme/dist/css/dx.light.css';
import 'devexpress-gantt/dist/dx-gantt.css'; 
import Constants from "../../utils/Constants";
import CrudService from "../../services/CrudService";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import ReactDOM from "react-dom";
import OperationsButtons from "../../components/prolab/OperationsButtons";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import {EntryResponseUtils} from "../../utils/EntryResponseUtils";
import {EditSpecUtils} from "../../utils/EditSpecUtils";
import {compress} from "int-compress-string/src";
import DataGanttStore from '../dao/DataGanttStore.js';
import { GanttUtils } from '../../utils/component/GanttUtils.js';
import "../../assets/css/gantt_container.scss";
import ParentModel from '../../model/ParentModel';
import {TreeListUtils} from "../../utils/component/TreeListUtils";


let _selectionClassName= "checkBoxSelection"

class GanttViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.crudService = new CrudService();
        this.ganttRef = React.createRef();
        this.dataGantt = null;
        this.dataGanttStore = new DataGanttStore();
        this.labels = this.props;
        this.pinterestRef = React.createRef();
        this.pinterestRef.current = [];
        
        this.state = {
            data:{},
            /**  zastosowany rowElementsStorage, bo expand click wymusza clearowanie pól checkbox. Dodatkowo onExpand - nie działa*/
             /** być może podbicie wersji mogłoby pomóc */
            rowElementsStorage: new Map(),
            allElementsSelector: false,
            columns: [],
            selectionColumnWidth: undefined,
            selectedRowKeys : [],
            tasks: [],
            dependencies: [],
            resources: [],
            resourceAssignments: [],
            columnCount: 1
        }
    
        this.repaint = () => {
            this.gantt.repaint();
        }

        /** Custom refresh, bo na gancie działa tylko .repaint() pomimo tego iż taka funkcja istnieje w dokumentacji dla tego komponentu */
        /** być może podbicie wersji mogłoby pomóc */
        this.refresh = () => {
            this.props.handleRefreshData();
            
        } 
    }

    /** Wylicza ilość parentów dla danych */
    setSelectionWidth(data){
        let allDatas = data.map(el=>new ParentModel(el.ID,el.ID_PARENT));
        let parents = allDatas.filter(el=> el.idParent===null);
        let childrens = allDatas.filter(el=> el.idParent!=null);
        let resultLength = 0 ;
        if(childrens.length===0){
            /** Default 75 */
            resultLength = 75;
        }else{
            for (let index = 0; index < parents.length; index++) {
                let duplicates = [];
                let result = this.countingParents(parents[index],childrens,allDatas,duplicates);
                result = new Set(result.map(el=>el.idParent));
                if(result.size > resultLength){
                    resultLength = result.size
                }
            }
            resultLength = ((resultLength + 1) * 21) 
        }

        this.setState({
            selectionColumnWidth :  resultLength
        })
    }

    countingParents(parent, childrens,allDatas,duplicates){
        for (let index = 0; index < allDatas.length; index++) {
            for (let index = 0; index < childrens.length; index++) {
                if(childrens[index].idParent === parent.id){
                    let save = childrens[index];
                    childrens = childrens.filter(el=> el.id !== save.id)
                    duplicates.push(save)
                    this.countingParents(save,childrens,allDatas,duplicates)
                }
            }
        }
       return duplicates;
    }

    componentDidMount() {
        if (typeof this.props.parsedGanttViewData === 'object' && typeof this.props.parsedGanttViewData.then === 'function') {
            this.props.parsedGanttViewData.then((value) => {
    
                this.setSelectionWidth(value.data);
                this.setState({
                    data: value
                })

                this.datasInitialization(value) ;
                this.repaint();
                this.generateColumns();
            })
        }
    }
   
    isSelectionEnabled() {
        return !!this.props.handleSelectedRowKeys && !!this.props.selectedRowKeys;
    }

    get gantt() {
        return this.ganttRef.current.instance;
    }
  
    
    datasInitialization(res){
        let rowElementsStorage = new Map()
        for (let index = 0; index < res.totalCount; index++) {
            
            let array=[{
                id:res.data[index].ID
            },{
                value:false
            }]
            rowElementsStorage.set(res.data[index].ID,array)
        }
        this.setState(({
            tasks: res.data,
            dependencies:res.dependenciesData,
            resources: res.resourcesData,
            resourceAssignments:res.resourcesAssigmentData,
            rowElementsStorage: rowElementsStorage,
            
        }));
    }

    datasRefreshSelector(store){
        this.setState({
            rowElementsStorage: store,
            tasks: this.state.tasks
        })
        this.repaint();
    }


    render() {
        const showRowLines = this.props.showRowLines;
        const showColumnHeaders = this.props.showColumnHeaders;
        // options
        const endDateRange = this.props?.parsedGanttView?.ganttOptions?.endDateRange;
        const startDateRange = this.props?.parsedGanttView?.ganttOptions?.startDateRange;
        const isDependencies = this.props?.parsedGanttView?.ganttOptions?.isDependencies;
        const scaleType = this.props?.parsedGanttView?.ganttOptions?.scaleType;
        const isResources = this.props?.parsedGanttView?.ganttOptions?.isResources;
        const isEditing = this.props?.parsedGanttView?.ganttOptions?.isEditing;
        const taskListWidth = this.props?.parsedGanttView?.ganttOptions?.taskListWidth;
        const taskTitlePosition = this.props?.parsedGanttView?.ganttOptions?.taskTitlePosition;
         // tasks
        const  keyTask="ID";
        const  parentIdTask=this.props.parsedGanttView?.taskFields?.parentId;        
        const  titleTask=this.props.parsedGanttView?.taskFields?.title;
        const  progressTask=this.props.parsedGanttView?.taskFields?.progress;
        const  startTask=this.props.parsedGanttView?.taskFields?.start;
        const  endTask=this.props.parsedGanttView?.taskFields?.end;
        const  colorTask=this.props.parsedGanttView?.taskFields?.color;
        // resource
        const  keyResource="ID";
        const  colorResource=this.props.parsedGanttView?.resourceFields?.color;
        const  textResource=this.props.parsedGanttView?.resourceFields?.text;
        // dependency
        const keyDependency="ID";
        const predecessorIdDependency = this.props.parsedGanttView?.dependencyFields?.predecessorId;
        const successorIdDependency = this.props.parsedGanttView?.dependencyFields?.successorId;
        const typeDependency = this.props.parsedGanttView?.dependencyFields?.type;
        // resource assigment
        const  keyResourceAssigment="ID";
        const  resourceIdResourceAssigment=this.props.parsedGanttView?.resourceAssignmentFields?.resourceId;
        const  taskIdResourceAssigment=this.props.parsedGanttView?.resourceAssignmentFields?.taskId;

        return ( 
            <React.Fragment>
              <Gantt
                    id='gantt-container'
                    keyExpr='ID'
                    ref={this.ganttRef}
                    scaleType={scaleType}
                    activeStateEnabled={true}
                    taskListWidth={taskListWidth}
                    taskTitlePosition={taskTitlePosition}
                    startDateRange={startDateRange}
                    endDateRange={endDateRange}
                    rowAlternationEnabled={false}
                    hoverStateEnabled={true}
                    onSelectionChanged={this.onVisibleIndexChange}
                    // Jesli robimy checkboxy to allowSelection w tym miejscu musi byc false
                    allowSelection={false} 
                    editing={isEditing}
                    showColumnHeaders={showColumnHeaders}
                    showResources={isResources}
                    showDependencies={isDependencies}
                    showRowLines={showRowLines}
                    height={"100%"}
                    rootValue={-1}>
                        <Tasks 
                        onTaskClick
                            keyExpr={keyTask}
                            dataSource={this.state.tasks}  
                            parentIdExpr={parentIdTask}
                            titleExpr={titleTask}
                            progressExpr={progressTask}
                            startExpr={startTask}
                            endExpr={endTask}
                            colorExpr={colorTask}
                        />
                        <Dependencies 
                            enabled={isDependencies} 
                            dataSource={this.state.dependencies}
                            keyExpr={keyDependency}
                            typeExpr={typeDependency}
                            predecessorIdExpr={predecessorIdDependency}
                            successorIdExpr={successorIdDependency}
                            />
                        <Resources 
                            keyExpr={keyResource}
                            enabled={isResources} 
                            dataSource={this.state.resources}
                            textExpr={textResource}
                            color={colorResource}
                            /> 
                        <ResourceAssignments 
                            keyExpr={keyResourceAssigment}
                            enabled={this.state.resourceAssignments!==(null || undefined)}
                            dataSource={this.state.resourceAssignments}
                            taskIdExpr={taskIdResourceAssigment}
                            resourceIdExpr={resourceIdResourceAssigment}
                            />
                        <ContextMenu enabled={false}/>
                        {this.state.columns}
                    
                       <Editing enabled={isEditing}/>
                       <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>
                </Gantt> 
            </React.Fragment>
        );
    }

    //* Zastępczy selection, bo gantt nie ma go w zestawie */ 
    renderCustomSelection(columns, selectedRowKeys){
            return  this.isSelectionEnabled() ?  (
                columns.push(<Column
                    headerCellTemplate = {(element, info) => {
                        let el = document.createElement('div');
                        element.append(el);
                        ReactDOM.render(<label className={`container-checkbox`}> 
                        <input 
                            type="checkbox" 
                            checked={this.state.allElementsSelector}
                            className="dx-datagrid-checkbox-size dx-show-invalid-badge dx-checkbox dx-widget"
                            onChange={(e)=> {this.selectAll(e)}}
                        /><span class="checkmark"></span></label>, element);
                    }}
                    fixed = {true}
                    width = {this.state.selectionColumnWidth}
                    fixedPosition = {'left'}
                    cellTemplate = 
                    {(element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        const recordId = info.row?.data?.ID;
                        ReactDOM.render(<label className={`container-checkbox`}> 
                        <input  
                            key={"checkbox"+ recordId}
                            type="checkbox" 
                            checked={this.state.rowElementsStorage.get(recordId)[1].value}
                            className={_selectionClassName}
                            onChange={()=>this.selectSingleRow(selectedRowKeys,recordId)}
                        /> <span class="checkmark"></span></label>, element);
                    }}
                />)
            ):null
    }

    selectAll(e){

        let selectedRowKeys =[];
        let store = this.state.rowElementsStorage;
            if(e.target.checked){
                let ids =  this.state.tasks.map(task=> task.ID);
                for (let index = 0; index < ids.length; index++) {
                    selectedRowKeys.push({ID: ids[index]});
                }    
            }

            for (const [key, value] of store.entries()) {

                let array=[{
                            id:key
                        },{
                            value:e.target.checked
                        }]
                store.set(key,array)
              }
       

            this.setState({
                allElementsSelector: !this.state.allElementsSelector
            })
    
            this.props.handleSelectAll(e.target.checked,selectedRowKeys)
            this.datasRefreshSelector(store);
            

    }

    selectSingleRow(selectedRowKeys,recordId){
        selectedRowKeys = this.props.selectedRowKeys;
        let store = this.state.rowElementsStorage;
 

        for (const [key, value] of store.entries()) {
            
            if(recordId===key){
                let array=[{
                    id:key
                },{
                    value:!value[1].value
                }]
                store.set(key,array)
            }
          }

            var index = selectedRowKeys.findIndex(item => item.ID === recordId);
            if (index !== -1) {
                selectedRowKeys.splice(index, 1);
            } else {
                selectedRowKeys.push({ID: recordId});
            }

            this.props.handleSelectedRowKeys(selectedRowKeys)
            this.datasRefreshSelector(store);

    }


    generateColumns() {
        let columns = [];
     
        let selectedRowKeys = this.props.selectedRowKeys;
        let operationsRecord = this.props.parsedGanttView?.operationsRecord;
            let operationsRecordList = this.props.parsedGanttView?.operationsRecordList;
            if (!(operationsRecord instanceof Array)) {
                operationsRecord = [];
                operationsRecord.push(this.props.parsedGanttView?.operationsRecord)
            }
        const showSelection = this.props.showSelection;

        if(showSelection && this.isSelectionEnabled()) {
                this.renderCustomSelection(columns, selectedRowKeys);
        };

        if(this.props.parsedGanttView?.ganttColumns?.length > 0){
            this.props.parsedGanttView?.ganttColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
                columns.push(<Column
                    key={INDEX_COLUMN}
                    fixed = {false}
                    onCellPrepared={this.onCellPrepared}
                    caption={columnDefinition.label}
                    sortIndex={columnDefinition.sortIndex}
                    type={columnDefinition.type}
                    visible={columnDefinition.visible}
                    width={columnDefinition.width}
                    dataField={columnDefinition.fieldName}
                    sortOrder={columnDefinition.sortOrder}
                    allowFiltering = {columnDefinition?.isFilter}
                    allowFixing = {true}
                    allowReordering = {true}
                    allowResizing = {true}
                    renderAsync = {true}
                    allowSorting = {columnDefinition?.isSort}
                    visibleIndex = {columnDefinition?.columnOrder}
                    headerId = {'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase()}
                    name = {columnDefinition?.fieldName}
                    dataType = {GanttUtils.specifyColumnType(columnDefinition?.type)}
                    format ={GanttUtils.specifyColumnFormat(columnDefinition?.type)}
                    cellTemplate = {GanttUtils.cellTemplate(columnDefinition,this.state.singleRowElements)}

                />);
            }
            )
            
            if (operationsRecord instanceof Array && operationsRecord.length > 0) {
                columns.push(<Column
                    caption=''
                    fixed = {true}
                    width = {10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0))}
                    fixedPosition = {'right'}
                    cellTemplate = {(element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        element.style.backgroundColor = "white";
                        const subViewId = this.props.elementSubViewId;
                        const kindView = this.props.elementKindView;
                        const recordId = info.row?.data?.ID;
                        const parentId = info.row?.data?.ID_PARENT;

                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                        let viewId = this.props.id;
                        viewId = GanttUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.render(<div style={{textAlign: 'center', display: 'flex'}}>
                            <OperationsButtons labels={this.labels}
                                               operations={operationsRecord}
                                               operationList={operationsRecordList}
                                               info={info}
                                               handleEdit={() => {
                                                   if (TreeListUtils.isKindViewSpec(this.props.parsedGanttView)) {
                                                       TreeListUtils.openEditSpec(viewId, parentId, [recordId], currentBreadcrumb,
                                                           () => this.props.handleUnblockUi(),
                                                           (err) => this.props.showErrorMessages(err));
                                                   } else {
                                                       let result = this.props.handleBlockUi();
                                                       if (result) {
                                                           this.crudService
                                                               .editEntry(viewId, recordId, parentId, kindView, '')
                                                               .then((entryResponse) => {
                                                                   EntryResponseUtils.run(entryResponse, () => {
                                                                       if (!!entryResponse.next) {
                                                                           this.crudService
                                                                               .edit(viewId, recordId, parentId, kindView)
                                                                               .then((editDataResponse) => {
                                                                                   this.setState({
                                                                                       editData: editDataResponse
                                                                                   }, () => {
                                                                                       this.props.handleShowEditPanel(editDataResponse);
                                                                                   });
                                                                               })
                                                                               .catch((err) => {
                                                                                   this.props.showErrorMessages(err);
                                                                               });
                                                                       } else {
                                                                           this.props.handleUnblockUi();
                                                                       }
                                                                   }, () => this.props.handleUnblockUi());
                                                               }).catch((err) => {
                                                               this.props.showErrorMessages(err);
                                                           });
                                                       }
                                                   }
                                               }}
                                               handleEditSpec={() => {
                                                   TreeListUtils.openEditSpec(viewId, parentId, [recordId], currentBreadcrumb,
                                                       () => this.props.handleUnblockUi(),
                                                       (err) => this.props.showErrorMessages(err));
                                               }}
                                               hrefSubview={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`)}
                                               handleHrefSubview={() => {
                                                   let result = this.props.handleBlockUi();
                                                   if (result) {
                                                       let newUrl = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${!!currentBreadcrumb ? currentBreadcrumb : ``}`);
                                                       window.location.assign(newUrl);
                                                   }
                                               }}
                                               handleDocuments={(el) => {
                                                this.props.handleDocumentRow(el.id)
                                               }}
                                               handlePlugins={(el) => {
                                                this.props.handlePluginRow(el.id)
                                               }} 
                                               handleArchive={() => {
                                                   this.props.handleArchiveRow(recordId)
                                               }}
                                               handleCopy={() => {
                                                   this.props.handleCopyRow(recordId)
                                               }}
                                               handleDelete={() => {
                                                   this.props.handleDeleteRow(recordId)
                                               }}
                                               handleRestore={() => {
                                                   this.props.handleRestoreRow(recordId)
                                               }}
                                            
                                               
                            />
    
                        </div>, element);
                    }}
                />);
            }
        }
       else{
        this.props.parsedGanttView?.ganttColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            columns.push(<Column
                key={INDEX_COLUMN}
                caption={columnDefinition.label}
                filterId={INDEX_COLUMN}
                allowFiltering={true} 
                sortIndex={columnDefinition.sortIndex}
                type={columnDefinition.type}
                visible={columnDefinition.visible}
                width={columnDefinition.width}
                dataField={columnDefinition.fieldName}
     
            />);
        })
       }

       this.setState({
        columns: columns
       })
    }
}



GanttViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    packageRows: Constants.DEFAULT_DATA_PACKAGE_COUNT,
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true,
    dataGridStoreSuccess: true,
    allowSelectAll: true,
    selectionDeferred: false
};

GanttViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    elementSubViewId: PropTypes.number,
    elementRecordId: PropTypes.number,
    elementKindView: PropTypes.string,
    parsedGanttView: PropTypes.object.isRequired,
    packageRows: PropTypes.number,
    handleShowEditPanel: PropTypes.func,
    //selection
    selectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowKeys: PropTypes.func,
    handleSelectAll: PropTypes.func,
    selectionDeferred: PropTypes.bool,
    //buttons
    handleArchiveRow: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired,
    handlePublishRow: PropTypes.func.isRequired,
    //other
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    refresh: PropTypes.func,
    showInfoMessages: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
};


export default GanttViewComponent;

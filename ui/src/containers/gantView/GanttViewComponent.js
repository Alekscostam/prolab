import React from 'react';
import PropTypes from 'prop-types';

import Gantt, {
    Tasks,
    Dependencies,
    Resources,
    ResourceAssignments,
    Column,
    Editing,
    StripLine,
    HeaderFilter,
    ContextMenu,
} from 'devextreme-react/gantt';

import 'devextreme/dist/css/dx.light.css';
import 'devexpress-gantt/dist/dx-gantt.css';
import Constants from '../../utils/Constants';
import CrudService from '../../services/CrudService';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import ReactDOM from 'react-dom';
import OperationsButtons from '../../components/prolab/OperationsButtons';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import EntryResponseUtils from '../../utils/EntryResponseUtils';
import DataGanttStore from '../dao/DataGanttStore.js';
import {GanttUtils} from '../../utils/component/GanttUtils.js';
import '../../assets/css/gantt_container.scss';
import ParentModel from '../../model/ParentModel';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string';
import {StringUtils} from '../../utils/StringUtils';
import Image from '../../components/Image';
import ActionButton from '../../components/ActionButton.js';
import LocUtils from '../../utils/LocUtils.js';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons.js';
import {DataGridUtils} from '../../utils/component/DataGridUtils.js';
import {ColumnType} from '../../model/ColumnType.js';
import moment from 'moment/moment.js';
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils.js';
import { HtmlUtils } from '../../utils/HtmlUtils.js';

const UNCOLLAPSED_CUT_SIZE = 327;
const COLLAPSED_CUT_SIZE = 140;

let _rowIndex = null;
let _bgcolor = null;
let _fontcolor = null;

class GanttViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.crudService = new CrudService();
        this.ganttRef = React.createRef();
        this.selectAllRef = React.createRef();
        this.dataGanttStore = new DataGanttStore();       
         this.currentClickedCell = React.createRef();

        this.labels = this.props;
        this.menu = React.createRef();
        this.state = {
            data: {},
            rowElementsStorage: new Map(),
            allElementsSelector: false,
            columns: [],
            selectionColumnWidth: undefined,
            selectedRowKeys: [],
            selectedRecordId: undefined,
            menuWithButtonInducedTime: undefined,
            tasks: [],
            dependencies: [],
            resources: [],
            resourceAssignments: [],
            columnCount: 1,
        };
        this.refresh = () => {
            this.props.handleRefreshData();
        };
        this.uncheckAllData = () => {
            const fakeEvent = {
                target: {
                    checked: false,
                },
            };
            this.selectAll(fakeEvent);
        };
        this.refreshRef = () => {
            if (this.ganttRef?.current?.instance) {
                this.ganttRef.current.instance._treeList.refresh();
            }
        };
    }
    showMenu(e) {
        const menu = this.menu.current;
        ActionButtonWithMenuUtils.hideActionButtonWithMenuPopup();
        if (menu !== null && e.targetType === 'task' && !!e?.data?.ID) {
            const mouseX = e.event.clientX;
            const mouseY = e.event.clientY;
            e.event.stopPropagation();
            e.event.preventDefault();
            menu.show(e.event);
            this.setState({selectedRecordId: e.data.ID, menuWithButtonInducedTime: new Date()}, () => {
                const menu = document.getElementById('menu-with-buttons');
                menu.style.left = mouseX + 'px';
                menu.style.top = mouseY + 'px';
            });
        } else if (menu !== null && e.targetType === 'task') {
            menu.hide(e.event);
        }
    }
    setSelectionWidth(data) {
        const allDatas = data.map((el) => new ParentModel(el.ID, el.ID_PARENT));
        let parents = allDatas.filter((el) => el.idParent === null);
        let childrens = allDatas.filter((el) => el.idParent != null);
        let resultLength = 0;
        if (childrens.length === 0) {
            /** Default 75 */
            resultLength = 75;
        } else {
            for (let index = 0; index < parents.length; index++) {
                let duplicates = [];
                let result = this.countingParents(parents[index], childrens, allDatas, duplicates);
                result = new Set(result.map((el) => el.idParent));
                if (result.size > resultLength) {
                    resultLength = result.size;
                }
            }
            resultLength = (resultLength + 1) * 21;
        }
        if (resultLength < 75) {
            resultLength = 75;
        }
        this.setState({
            selectionColumnWidth: resultLength,
        });
    }

    countingParents(parent, childrens, allDatas, duplicates) {
        for (let index = 0; index < allDatas.length; index++) {
            for (let index = 0; index < childrens.length; index++) {
                if (childrens[index].idParent === parent.id) {
                    let save = childrens[index];
                    childrens = childrens.filter((el) => el.id !== save.id);
                    duplicates.push(save);
                    this.countingParents(save, childrens, allDatas, duplicates);
                }
            }
        }
        return duplicates;
    }
    componentDidMount() {
        if (this.props.selectedRowKeys.length !== 0) {
            this.props.unselectAll();
        }
        if (
            typeof this.props.parsedGanttViewData === 'object' &&
            typeof this.props.parsedGanttViewData.then === 'function'
        ) {
            this.props.parsedGanttViewData.then((value) => {
                this.setSelectionWidth(value.data);
                const data = GanttUtils.paintDatas(value.data);
                value.data = data;
                this.setState({
                    data: value,
                });
                this.datasInitialization(value);
                this.refreshRef();
                this.generateColumns();
            });
        }
        this.unregisterKeydownEvent()
        this.registerKeydownEvent();
    }
    componentWillUnmount(){
        this.unregisterKeydownEvent()
    }

    isSelectionEnabled() {
        return !!this.props.handleSelectedRowKeys && !!this.props.selectedRowKeys;
    }

    get gantt() {
        if (this.ganttRef) {
            return this.ganttRef.current.instance;
        }
        return null;
    }

    datasInitialization(res) {
        let rowElementsStorage = new Map();
        for (let index = 0; index < res.data.length; index++) {
            let array = [
                {
                    id: res.data[index].ID,
                },
                {
                    value: false,
                },
            ];
            rowElementsStorage.set(res.data[index].ID, array);
        }
        this.setState({
            tasks: res.data,
            dependencies: res.dependenciesData,
            resources: res.resourcesData,
            resourceAssignments: res.resourcesAssigmentData,
            rowElementsStorage: rowElementsStorage,
        });
    }

    datasRefreshSelector(store) {
        this.setState({
            rowElementsStorage: store,
            tasks: this.state.tasks,
        });
        this.refreshRef();
    }

    registerKeydownEvent() {
        window.addEventListener('mousedown', this.handleAltAndLeftClickFunction);
    }
    unregisterKeydownEvent() {
        window.removeEventListener('mousedown', this.handleAltAndLeftClickFunction);
    }
    handleAltAndLeftClickFunction = (event) => {     
        if (this.props.altAndLeftClickEnabled && event.button === 0 && event.altKey) {
            setTimeout(()=>{
                if (this.currentClickedCell.current) {
                    if(HtmlUtils.clickedInsideComponent(event,"gantt-container" )){
                        const clickedCell = parseInt(this.currentClickedCell.current);
                        this.selectSingleRow(undefined, clickedCell)
                    }
                }
            },100)
        }
    };
    getRangeDate(dateRange) {
        return !!dateRange ? moment(dateRange, 'YYYY-MM-DD').toDate() : null;
    }

    render() {
        const showRowLines = this.props.showRowLines;
        const showColumnHeaders = this.props.showColumnHeaders;
        let currentDate = new Date(Date.now());
        const brawserWidth = document.body.offsetWidth;
        const width = this.props.collapsed ? brawserWidth - COLLAPSED_CUT_SIZE : brawserWidth - UNCOLLAPSED_CUT_SIZE;

        const endDateRange = this.getRangeDate(this.props?.parsedGanttView?.ganttOptions?.endDateRange);
        const startDateRange = this.getRangeDate(this.props?.parsedGanttView?.ganttOptions?.startDateRange);

        const isDependencies = this.props?.parsedGanttView?.ganttOptions?.isDependencies;
        const scaleType = this.props?.parsedGanttView?.ganttOptions?.scaleType;
        const isResources = this.props?.parsedGanttView?.ganttOptions?.isResources;
        const isEditing = !!this.props?.parsedGanttView?.ganttOptions?.isEditing;
        const taskListWidth = this.props?.parsedGanttView?.ganttOptions?.taskListWidth;
        const taskTitlePosition = this.props?.parsedGanttView?.ganttOptions?.taskTitlePosition;
        // tasks
        const keyTask = 'ID';
        const parentIdTask = this.props.parsedGanttView?.taskFields?.parentId;
        const titleTask = this.props.parsedGanttView?.taskFields?.title;
        const progressTask = this.props.parsedGanttView?.taskFields?.progress;
        const startTask = this.props.parsedGanttView?.taskFields?.start;
        const endTask = this.props.parsedGanttView?.taskFields?.end;
        const colorTask = this.props.parsedGanttView?.taskFields?.color;
        // resource
        const keyResource = 'ID';
        const colorResource = this.props.parsedGanttView?.resourceFields?.color;
        const textResource = this.props.parsedGanttView?.resourceFields?.text;
        // dependency
        const keyDependency = 'ID';
        const predecessorIdDependency = this.props.parsedGanttView?.dependencyFields?.predecessorId;
        const successorIdDependency = this.props.parsedGanttView?.dependencyFields?.successorId;
        const typeDependency = this.props.parsedGanttView?.dependencyFields?.type;
        // resource assigment
        const keyResourceAssigment = 'ID';
        const resourceIdResourceAssigment = this.props.parsedGanttView?.resourceAssignmentFields?.resourceId;
        const taskIdResourceAssigment = this.props.parsedGanttView?.resourceAssignmentFields?.taskId;

        const kindView = this.props.elementKindView;
        const subViewId = this.props.elementSubViewId;
        const selectedRecordId = this.state.selectedRecordId;
        const parentId = this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        let viewId = this.props.id;
        viewId = DataGridUtils.getRealViewId(subViewId, viewId);

        return (
            this.state.tasks.length > 0 && (
                <React.Fragment>
                    <Gantt
                        onContextMenuPreparing={(e) => {
                            e.cancel = true;
                            this.showMenu(e);
                        }}
                        id='gantt-container'
                        keyExpr='ID'
                        focusedRowEnabled={false}
                        hoverStateEnabled={false}
                        ref={this.ganttRef}
                        scaleType={scaleType}
                        activeStateEnabled={false}
                        taskListWidth={taskListWidth}
                        taskTitlePosition={taskTitlePosition}
                        startDateRange={startDateRange}
                        endDateRange={endDateRange}
                        rowAlternationEnabled={false}
                        width={width}
                        onTaskClick={(e)=>{
                            if( e?.data?.ID){
                                this.currentClickedCell.current = e.data.ID;
                            }
                        }}
                        // Jesli robimy checkboxy to allowSelection w tym miejscu musi byc false
                        allowSelection={false}
                        editing={isEditing}
                        showColumnHeaders={showColumnHeaders}
                        showResources={isResources}
                        showDependencies={isDependencies}
                        showRowLines={showRowLines}
                        height={'100%'}
                        rootValue={-1}
                    >
                        <Tasks
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
                            enabled={this.state.resourceAssignments !== (null || undefined)}
                            dataSource={this.state.resourceAssignments}
                            taskIdExpr={taskIdResourceAssigment}
                            resourceIdExpr={resourceIdResourceAssigment}
                        />

                        {this.state.columns}
                        <StripLine
                            start={currentDate}
                            title={LocUtils.loc(this.props.labels, 'Current_time', 'Aktualny czas')}
                            cssClass='current-time'
                        />
                        <Editing enabled={isEditing} />
                        <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />
                    </Gantt>
                    <MenuWithButtons
                        componentInducedTime={this.state.menuWithButtonInducedTime}
                        zIndex={1000001}
                        handleSaveAction={() => this.props.handleSaveAction()}
                        handleHrefSubview={() => this.handleHrefSubview(viewId, selectedRecordId, currentBreadcrumb)}
                        handleEdit={() =>
                            this.handleEdit(viewId, parentId, selectedRecordId, currentBreadcrumb, kindView)
                        }
                        handleEditSpec={() =>
                            this.handleEditSpec(viewId, parentId, selectedRecordId, currentBreadcrumb)
                        }
                        handleAdd={() => this.props.addButtonFunction()}
                        handleCopy={() => this.props.handleCopyRow(selectedRecordId)}
                        handleArchive={() => this.props.handleArchiveRow(selectedRecordId)}
                        handlePublish={() => this.props.handlePublishRow(selectedRecordId)}
                        handleDocumentsSk={(el) => this.props.handleDocumentRow(el.id)}
                        handlePluginsSk={(el) => this.props.handlePluginRow(el.id)}
                        handleDocuments={(el) => this.props.handleDocumentRow(selectedRecordId)}
                        handlePlugins={(el) => this.props.handlePluginRow(selectedRecordId)}
                        handleDownload={() => this.props.handleDownloadRow(selectedRecordId)}
                        handleAttachments={() => this.props.handleAttachmentRow(selectedRecordId)}
                        handleDelete={() => this.props.handleDeleteRow(selectedRecordId)}
                        handleRestore={() => this.props.handleRestoreRow(selectedRecordId)}
                        handleFormula={() => this.props.handleFormulaRow(selectedRecordId)}
                        handleHistory={() => this.props.handleHistoryLogRow(selectedRecordId)}
                        handleFill={() => this.props.handleFillRow(selectedRecordId)}
                        operationList={this.props.parsedGanttView.operationsPPM}
                        menu={this.menu}
                    />
                </React.Fragment>
            )
        );
    }
    handleEdit(viewId, parentId, recordId, currentBreadcrumb, kindView) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGanttView)) {
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
                                                    this.props.handleShowEditPanel(editDataResponse);
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
                            () => this.props.handleUnblockUi(),
                            () => this.props.handleUnblockUi()
                        );
                    })
                    .catch((err) => {
                        this.props.showErrorMessages(err);
                    });
            }
        }
    }
    handleEditSpec(viewId, parentId, recordId, currentBreadcrumb) {
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
    }
    handleHrefSubview(viewId, recordId, currentBreadcrumb) {
        const result = this.props.handleBlockUi();
        if (result) {
            const newUrl = AppPrefixUtils.locationHrefUrl(
                `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${
                    !!currentBreadcrumb ? currentBreadcrumb : ``
                }`
            );
            window.location.assign(newUrl);
        }
    }
    addButton() {
        return (
            <ActionButton
                rendered={true}
                className={'justify-content-center'}
                label={LocUtils.loc(this.props.labels, 'Add_button', 'Dodaj')}
                handleClick={(e) => {
                    this.props.addButtonFunction(e);
                }}
            />
        );
    }
    //* Zastępczy selection, bo gantt nie ma go w zestawie */
    renderCustomSelection(columns, selectedRowKeys) {
        return this.isSelectionEnabled()
            ? columns.push(
                  <Column
                      key={'column-gantt-selection'}
                      headerCellTemplate={(element, info) => {
                          const el = document.createElement('div');
                          element.append(el);
                          element.parentNode.classList.add('parent-checkbox-area');
                          ReactDOM.render(
                              <label className={`container-checkbox`}>
                                  <input
                                      ref={this.selectAllRef}
                                      type='checkbox'
                                      className='dx-datagrid-checkbox-size dx-show-invalid-badge dx-checkbox dx-widget'
                                      onChange={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          this.selectAll(e);
                                      }}
                                  />
                                  <span className='checkmark'></span>
                              </label>,
                              element
                          );
                      }}
                      fixed={true}
                      width={this.state.selectionColumnWidth}
                      fixedPosition={'left'}
                      cellTemplate={(element, info) => {
                          const gradients = info.data?._LINE_COLOR_GRADIENT;
                          gradients.forEach((el) => {
                              const divElement = document.createElement('div');
                              const classLine = 'line-treelist-' + el;
                              divElement.classList.add(classLine);
                              divElement.classList.add('line-treelist');
                              element.parentNode.appendChild(divElement);
                          });
                          let el = document.createElement('div');
                          el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                          element.append(el);
                          const recordId = info.row?.data?.ID;
                          ReactDOM.render(
                              <label className={`container-checkbox `}>
                                  <input
                                      key={'checkbox' + recordId}
                                      type='checkbox'
                                      checked={this.state.rowElementsStorage.get(recordId)[1].value}
                                      className={'checkBoxSelection'}
                                      onChange={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          this.selectSingleRow(selectedRowKeys, recordId);
                                      }}
                                  />{' '}
                                  <span className='checkmark'></span>
                              </label>,
                              element
                          );
                      }}
                  />
              )
            : null;
    }
    // doklejamy style

    selectAll(e) {
        let selectedRowKeys = [];
        let store = this.state.rowElementsStorage;
        if (e.target.checked) {
            let ids = this.state.tasks.map((task) => task.ID);
            for (let index = 0; index < ids.length; index++) {
                selectedRowKeys.push({ID: ids[index]});
            }
        }

        for (const [key] of store.entries()) {
            let array = [
                {
                    id: key,
                },
                {
                    value: e.target.checked,
                },
            ];
            store.set(key, array);
        }
        this.selectAllRef.current.checked = e.target.checked;
        this.props.handleSelectAll(e.target.checked, selectedRowKeys);
        this.datasRefreshSelector(store);
    }

    selectSingleRow(selectedRowKeys, recordId) {
        selectedRowKeys = this.props.selectedRowKeys;
        let store = this.state.rowElementsStorage;

        for (const [key, value] of store.entries()) {
            if (recordId === key) {
                let array = [
                    {
                        id: key,
                    },
                    {
                        value: !value[1].value,
                    },
                ];
                store.set(key, array);
            }
        }

        let index = selectedRowKeys.findIndex((item) => item.ID === recordId);
        if (index !== -1) {
            selectedRowKeys.splice(index, 1);
        } else {
            selectedRowKeys.push({ID: recordId});
        }
        this.props.handleSelectedRowKeys(selectedRowKeys);
        this.datasRefreshSelector(store);
    }

    generateColumns() {
        let columns = [];

        const selectedRowKeys = this.props.selectedRowKeys;
        let operationsRecord = this.props.parsedGanttView?.operationsRecord;
        const operationsRecordList = this.props.parsedGanttView?.operationsRecordList;

        if (!(operationsRecord instanceof Array)) {
            operationsRecord = [];
            operationsRecord.push(this.props.parsedGanttView?.operationsRecord);
        }
        const showSelection = this.props.showSelection;

        if (showSelection && this.isSelectionEnabled()) {
            this.renderCustomSelection(columns, selectedRowKeys);
        }

        if (this.props.parsedGanttView?.ganttColumns?.length > 0) {
            this.props.parsedGanttView?.ganttColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
                columns.push(
                    <Column
                        key={INDEX_COLUMN}
                        fixed={false}
                        onCellPrepared={this.onCellPrepared}
                        caption={columnDefinition.label}
                        sortIndex={columnDefinition.sortIndex}
                        type={columnDefinition.type}
                        visible={columnDefinition.visible}
                        width={columnDefinition.width}
                        dataField={columnDefinition.fieldName}
                        sortOrder={columnDefinition.sortOrder}
                        allowFiltering={columnDefinition?.isFilter}
                        allowFixing={true}
                        allowReordering={true}
                        className='xd'
                        allowResizing={true}
                        renderAsync={true}
                        allowSorting={columnDefinition?.isSort}
                        visibleIndex={columnDefinition?.columnOrder}
                        headerId={'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase()}
                        name={columnDefinition?.fieldName}
                        dataType={GanttUtils.specifyColumnType(columnDefinition?.type)}
                        format={GanttUtils.specifyColumnFormat(columnDefinition?.type)}
                        cellTemplate={this.cellTemplate(columnDefinition)}
                    />
                );
            });
            this.clearProperties();

            if (
                (operationsRecord instanceof Array && operationsRecord.length > 0) ||
                (operationsRecordList instanceof Array && operationsRecordList.length > 0)
            ) {
                columns.push(
                    <Column
                        caption=''
                        fixed={true}
                        width={10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0))}
                        fixedPosition={'right'}
                        headerCellTemplate={(element) => {
                            ReactDOM.render(this.addButton(), element);
                        }}
                        cellTemplate={(element, info) => {
                            let el = document.createElement('div');
                            el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                            element.append(el);
                            element.style.backgroundColor = 'white';
                            const subViewId = this.props.elementSubViewId;
                            const kindView = this.props.elementKindView;
                            const recordId = info.row?.data?.ID;
                            const parentId = info.row?.data?.ID_PARENT;
                            const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                            let viewId = this.props.id;
                            viewId = GanttUtils.getRealViewId(subViewId, viewId);
                            ReactDOM.render(
                                <div style={{textAlign: 'center', display: 'flex'}}>
                                    <OperationsButtons
                                        labels={this.labels}
                                        operations={operationsRecord}
                                        operationList={operationsRecordList}
                                        info={info}
                                        handleEdit={() => {
                                            this.handleEdit(viewId, parentId, recordId, currentBreadcrumb, kindView);
                                        }}
                                        handleEditSpec={() => {
                                            this.handleEditSpec(viewId, parentId, recordId, currentBreadcrumb);
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
                                        handleHrefSubview={() =>
                                            this.handleHrefSubview(viewId, recordId, currentBreadcrumb)
                                        }
                                        handleDocuments={(el) => this.props.handleDocumentRow(el.id)}
                                        handlePlugins={(el) => this.props.handlePluginRow(el.id)}
                                        handleArchive={() => this.props.handleArchiveRow(recordId)}
                                        handleDownload={() => this.props.handleDownloadRow(recordId)}
                                        handleAttachments={() => this.props.handleAttachmentRow(recordId)}
                                        handlePublish={() => this.props.handlePublish(recordId)}
                                        handleHistory={() => this.props.handleHistoryLogRow(recordId)}
                                        handleCopy={() => this.props.handleCopyRow(recordId)}
                                        handleDelete={() => this.props.handleDeleteRow(recordId)}
                                        handleRestore={() => this.props.handleRestoreRow(recordId)}
                                        handleBlockUi={() => this.props.handleBlockUi()}
                                    />
                                </div>,
                                element
                            );
                        }}
                    />
                );
            }
        } else {
            this.props.parsedGanttView?.ganttColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
                columns.push(
                    <Column
                        key={INDEX_COLUMN}
                        caption={columnDefinition.label}
                        filterId={INDEX_COLUMN}
                        allowFiltering={true}
                        sortIndex={columnDefinition.sortIndex}
                        type={columnDefinition.type}
                        visible={columnDefinition.visible}
                        width={columnDefinition.width}
                        dataField={columnDefinition.fieldName}
                    />
                );
            });
        }

        this.setState({
            columns: columns,
        });
    }

    clearProperties() {
        _rowIndex = null;
        _bgcolor = null;
        _fontcolor = null;
    }

    cellTemplate(column) {
        return function (element, info) {
            if (_rowIndex !== info.row.dataIndex) {
                _rowIndex = info.row.dataIndex;
                _bgcolor = info.data['_BGCOLOR'];
                _fontcolor = info.data['_FONTCOLOR'];
            }

            if (_bgcolor) element.style.backgroundColor = _bgcolor;

            let fontColorFinal = 'black';
            let bgColorFinal = '';

            if (!!_fontcolor) {
                fontColorFinal = _fontcolor;
            }
            if (!!_bgcolor) {
                bgColorFinal = _bgcolor;
            }
            switch (column?.type) {
                case ColumnType.C:
                case ColumnType.N:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
                case ColumnType.D:
                case ColumnType.E:
                case ColumnType.T:
                case ColumnType.H:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
                case ColumnType.O:
                    return ReactDOM.render(
                        <div
                            style={{
                                whiteSpace: 'nowrap',
                                maxWidth: column.width + 'px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={StringUtils.textFromHtmlString(info.text)}
                        >
                            {StringUtils.textFromHtmlString(info.text)}
                        </div>,
                        element
                    );
                case ColumnType.B:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                readOnly={true}
                                checked={GanttUtils.conditionForTrueValueForBoolType(info.text)}
                            />
                        </div>,
                        element
                    );
                case ColumnType.L:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                readOnly={true}
                                checked={GanttUtils.conditionForTrueValueForLogicType(info.text)}
                            />
                        </div>,
                        element
                    );
                case ColumnType.I:
                case ColumnType.IM:
                    if (Array.isArray(info.text) && info.text?.length > 0) {
                        return ReactDOM.render(
                            <div
                                style={{
                                    display: 'inline',
                                    color: fontColorFinal,
                                    backgroundColor: bgColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                {info.text?.map((i, index) => {
                                    return <Image style={{maxWidth: '100%'}} key={index} base64={info.text} />;
                                })}
                            </div>,
                            element
                        );
                    } else {
                        return ReactDOM.render(
                            <div
                                style={{
                                    display: 'inline',
                                    color: fontColorFinal,
                                    backgroundColor: bgColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                <Image style={{maxHeight: '26px'}} base64={info.text} />
                            </div>,
                            element
                        );
                    }
                default:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
            }
        };
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
    altAndLeftClickEnabled: true,
    showFilterRow: true,
    showSelection: true,
    dataGridStoreSuccess: true,
    allowSelectAll: true,
    selectionDeferred: false,
};

GanttViewComponent.propTypes = {
    id: PropTypes.string.isRequired,
    elementSubViewId: PropTypes.number,
    elementRecordId: PropTypes.number,
    elementKindView: PropTypes.string,
    parsedGanttView: PropTypes.object.isRequired,
    packageRows: PropTypes.number,
    handleShowEditPanel: PropTypes.func,
    //selection
    selectedRowKeys: PropTypes.array.isRequired,
    handleSelectedRowKeys: PropTypes.func,
    handleSelectAll: PropTypes.func,
    selectionDeferred: PropTypes.bool,
    //buttons
    handleArchiveRow: PropTypes.func,
    handleCopyRow: PropTypes.func,
    handleDownloadRow: PropTypes.func,
    handleAttachmentRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleRestoreRow: PropTypes.func,
    handleHistory: PropTypes.func,
    handlePublishRow: PropTypes.func,
    //other
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    refresh: PropTypes.func,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    altAndLeftClickEnabled: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
};

export default GanttViewComponent;

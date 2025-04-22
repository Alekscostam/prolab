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
    FilterRow,
    Toolbar,
    Item,
} from 'devextreme-react/gantt';

import 'devextreme/dist/css/dx.light.css';
import 'devexpress-gantt/dist/dx-gantt.css';
import Constants from '../../utils/Constants';
import CrudService from '../../services/CrudService';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import ReactDOM from 'react-dom';
import OperationsButtons from '../../components/prolab/OperationsButtons';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
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
import {ColumnType} from '../../enum/ColumnType.js';
import moment from 'moment/moment.js';
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils.js';
import {HtmlUtils} from '../../utils/HtmlUtils.js';
import {ViewDataCompUtils} from '../../utils/component/ViewDataCompUtils.js';
import {CheckBox} from 'devextreme-react';
import {handleEdit} from '../../utils/handler/EditHandler.js';
import {TranslationUtils} from '../../utils/TranslationUtils.js';
import {OperationType} from '../../enum/OperationType.js';
import {jsPDF} from 'jspdf';
import {exportGantt as exportGanttToPdf} from 'devextreme/pdf_exporter';
import 'jspdf-autotable';
import {cellTemplate, contextMenuItems} from './GanttTemplate.js';
import {SessionStoreUtils} from '../../utils/SessionStoreUtils.js';
import UrlUtils from '../../utils/UrlUtils.js';

const UNCOLLAPSED_CUT_SIZE = 314;
const COLLAPSED_CUT_SIZE = 125;
let _rowIndex = null;
let _bgcolor = null;
let _fontcolor = null;
const formats = ['A0', 'A1', 'A2', 'A3', 'A4', 'Auto'];
const exportModes = ['All', 'Chart', 'TreeList'];
const dateRanges = ['All', 'Visible', 'Custom'];

class GanttViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.crudService = new CrudService();
        this.ganttRef = React.createRef();
        this.refsCheckboxArray = [];
        this.selectAllRef = React.createRef();
        this.dataGanttStore = new DataGanttStore();
        this.currentClickedCell = React.createRef();
        this.clickedPosition = React.createRef();
        this.labels = this.props;
        this.menuContextRef = React.createRef();
        this.state = {
            data: {},
            formatBoxValue: formats[0],
            exportModeBoxValue: exportModes[0],
            rowElementsStorage: new Map(),
            allElementsSelector: false,
            columns: [],
            dateRangeBoxValue: dateRanges[1],
            landscapeCheckBoxValue: true,
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
            if (!StringUtils.isBlank(this.selectAllRef.current)) {
                const fakeEvent = {
                    target: {
                        checked: false,
                    },
                };
                this.selectAll(fakeEvent);
                const instance = this.selectAllRef.current.instance;
                instance.option('value', false);
            }
        };
        this.refreshRef = () => {
            if (this.ganttRef?.current?.instance) {
                this.ganttRef.current.instance._treeList.refresh();
            }
        };
        this.addSingleRow = (recordId) => {
            this.selectSingleRow(recordId);
        };
    }
    getStripLines() {
        const stripLines = [
            {
                start: new Date(),
                title: `${LocUtils.locFromStore('Current_time')}`,
                cssClass: 'current-time',
            },
        ];
        return stripLines;
    }

    existsOperationsPPM = () => {
        return this.props.parsedGanttView.operationsPPM && this.props.parsedGanttView.operationsPPM?.length !== 0;
    };

    render() {
        const showRowLines = this.props.showRowLines;
        const showColumnHeaders = this.props.showColumnHeaders;
        const brawserWidth = document.body.offsetWidth;
        const width = this.props.collapsed ? brawserWidth - COLLAPSED_CUT_SIZE : brawserWidth - UNCOLLAPSED_CUT_SIZE;

        const endDateRange = this.getRangeDate(this.props?.parsedGanttView?.ganttOptions?.endDateRange);
        const startDateRange = this.getRangeDate(this.props?.parsedGanttView?.ganttOptions?.startDateRange);
        const isDependencies = this.props?.parsedGanttView?.ganttOptions?.isDependencies;
        const isResources = this.props?.parsedGanttView?.ganttOptions?.isResources;
        const isEditing = !!this.props?.parsedGanttView?.ganttOptions?.isEditing;
        const taskListWidth = this.props?.parsedGanttView?.ganttOptions?.taskListWidth;
        const taskTitlePosition = this.props?.parsedGanttView?.ganttOptions?.taskTitlePosition;

        const KEY = 'ID';
        // tasks
        const parentIdTask = this.props.parsedGanttView?.taskFields?.parentId;
        const titleTask = this.props.parsedGanttView?.taskFields?.title;
        const progressTask = this.props.parsedGanttView?.taskFields?.progress;
        const startTask = this.props.parsedGanttView?.taskFields?.start;
        const endTask = this.props.parsedGanttView?.taskFields?.end;
        const colorTask = this.props.parsedGanttView?.taskFields?.color;
        // resource
        const colorResource = this.props.parsedGanttView?.resourceFields?.color;
        const textResource = this.props.parsedGanttView?.resourceFields?.text;
        // dependency
        const predecessorIdDependency = this.props.parsedGanttView?.dependencyFields?.predecessorId;
        const successorIdDependency = this.props.parsedGanttView?.dependencyFields?.successorId;
        const typeDependency = this.props.parsedGanttView?.dependencyFields?.type;
        // resource assigment
        const resourceIdResourceAssigment = this.props.parsedGanttView?.resourceAssignmentFields?.resourceId;
        const taskIdResourceAssigment = this.props.parsedGanttView?.resourceAssignmentFields?.taskId;

        return (
            <React.Fragment>
                <Gantt
                    onContextMenuPreparing={(e) => {
                        if (!this.existsOperationsPPM()) {
                            e.cancel = true;
                        }
                        this.setState({selectedRecordId: e.data.ID});
                        const checkboxToSelect = this.refsCheckboxArray[e.data.ID].instance;
                        checkboxToSelect.option('value', true);
                    }}
                    stripLines={this.getStripLines()}
                    id='gantt-container'
                    onCustomCommand={(e) => {
                        this.onCustomCommandClick(e);
                    }}
                    onContentReady={(e) => {
                        this.highlightRow(e);
                    }}
                    keyExpr={KEY}
                    focusedRowEnabled={false}
                    hoverStateEnabled={false}
                    ref={this.ganttRef}
                    activeStateEnabled={false}
                    taskListWidth={taskListWidth}
                    taskTitlePosition={taskTitlePosition}
                    startDateRange={startDateRange}
                    endDateRange={endDateRange}
                    rowAlternationEnabled={false}
                    width={width}
                    onTaskClick={(e) => {
                        if (e?.data?.ID) {
                            this.currentClickedCell.current = e.data.ID;
                        }
                    }}
                    allowSelection={false}
                    editing={isEditing}
                    showColumnHeaders={showColumnHeaders}
                    showResources={isResources}
                    showDependencies={isDependencies}
                    showRowLines={showRowLines}
                    height={'100%'}
                    rootValue={-1}
                >
                    <Toolbar>
                        <Item name='collapseAll' />
                        <Item name='expandAll' />
                        <Item name='zoomIn' />
                        <Item name='zoomOut' />
                        <Item
                            widget='dxButton'
                            options={{
                                icon: 'export',
                                hint: LocUtils.locFromStoreWithDefault('Export_to_pdf', 'Export to PDF'),
                                stylingMode: 'text',
                                onClick: () => this.exportButtonClick(),
                            }}
                        />
                    </Toolbar>
                    <FilterRow visible={true}></FilterRow>
                    <Tasks
                        keyExpr={KEY}
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
                        keyExpr={KEY}
                        typeExpr={typeDependency}
                        predecessorIdExpr={predecessorIdDependency}
                        successorIdExpr={successorIdDependency}
                    />
                    <Resources
                        keyExpr={KEY}
                        enabled={isResources}
                        dataSource={this.state.resources}
                        textExpr={textResource}
                        color={colorResource}
                    />
                    <ResourceAssignments
                        keyExpr={KEY}
                        enabled={this.state.resourceAssignments !== (null || undefined)}
                        dataSource={this.state.resourceAssignments}
                        taskIdExpr={taskIdResourceAssigment}
                        resourceIdExpr={resourceIdResourceAssigment}
                    />
                    {this.state.columns}
                    <Editing enabled={isEditing} />
                    <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'} />
                    {this.existsOperationsPPM() && (
                        <ContextMenu
                            closeMenuOnClick={true}
                            ref={this.menuContextRef}
                            items={contextMenuItems(this.props.parsedGanttView.operationsPPM)}
                        />
                    )}
                </Gantt>
            </React.Fragment>
        );
    }
    highlightRow = (e) => {
        const clickedRowFromView = SessionStoreUtils.getClickedRowFromView();
        if (clickedRowFromView) {
            if (clickedRowFromView.view.id !== UrlUtils.getIdFromUrl()) {
                SessionStoreUtils.clearClickedRowFromView();
                return;
            }
            const visibleRow = GanttUtils.sortHierarchicallyWithIndex(this.state.tasks)?.find(
                (task) => task.ID === clickedRowFromView.row?.id
            );
            if (visibleRow) {
                const tables = e.element?.getElementsByTagName('table');
                if (tables && tables.length > 1) {
                    const lastTable = tables[tables.length - 1] || null;
                    const penultimateTable = tables[tables.length - 2] || null;
                    if (lastTable && penultimateTable) {
                        lastTable.getElementsByTagName('tr');
                        const trLastTable = lastTable.getElementsByTagName('tr')?.[visibleRow.index] || null;
                        const trPenultimateTable =
                            penultimateTable.getElementsByTagName('tr')?.[visibleRow.index] || null;
                        if (trLastTable) {
                            trLastTable.className = (trLastTable.className || '') + ' highlight-row';
                            SessionStoreUtils.clearClickedRowFromView();
                        }
                        if (trPenultimateTable) {
                            trPenultimateTable.className = (trPenultimateTable.className || '') + ' highlight-row';
                            SessionStoreUtils.clearClickedRowFromView();
                        }
                    }
                }
            }
        }
    };
    exportButtonClick = (e) => {
        const format = this.state.formatBoxValue.toLowerCase();
        const isLandscape = this.state.landscapeCheckBoxValue;
        const exportMode = this.state.exportModeBoxValue.toLowerCase();
        const dataRangeMode = this.state.dateRangeBoxValue.toLowerCase();
        const gantt = this.ganttRef.current.instance;
        exportGanttToPdf({
            component: gantt,
            createDocumentMethod: (args) => new jsPDF(args),
            format: format,
            isLandscape,
            exportMode: exportMode,
            dateRange: dataRangeMode,
        }).then((doc) => doc.save('gantt.pdf'));
    };

    setSelectionWidth(data) {
        const allDatas = data.map((el) => new ParentModel(el.ID, el.ID_PARENT));
        const parents = allDatas.filter((el) => el.idParent === null);
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
                this.initGantt();
                this.generateColumns();
            });
        } else if (Array.isArray(this.props.parsedGanttViewData) && this.props.parsedGanttViewData?.length === 0) {
            this.generateColumns();
        }
        this.unregisterKeydownEvent();
        this.registerKeydownEvent();
    }

    initGantt = () => {
        if (this?.ganttRef?.current) {
            this.ganttRef.current.instance.option('scaleType', 'weeks');
            this.ganttRef.current.instance.refresh();
        }
    };
    componentWillUnmount() {
        this.unregisterKeydownEvent();
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
        const rowElementsStorage = new Map();
        for (let index = 0; index < res.data.length; index++) {
            const array = [
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
    }

    registerKeydownEvent() {
        window.addEventListener('mousedown', this.handleAltAndLeftClickFunction);
    }

    unregisterKeydownEvent() {
        window.removeEventListener('mousedown', this.handleAltAndLeftClickFunction);
    }

    handleAltAndLeftClickFunction = (event) => {
        if (this.props.altAndLeftClickEnabled && event.button === 0 && event.altKey) {
            setTimeout(() => {
                if (this.currentClickedCell.current) {
                    if (HtmlUtils.clickedInsideComponent(event, 'gantt-container')) {
                        const clickedCell = parseInt(this.currentClickedCell.current);
                        this.selectSingleRow(clickedCell);
                    }
                }
            }, 100);
        }
    };

    getRangeDate(dateRange) {
        return !!dateRange ? moment(dateRange, Constants.DATE_FORMAT.YYYY_MM_DD).toDate() : null;
    }
    // TODO: napraw ze jak klikasz w wiersz to ze potem w naglowku kliaksz w anuluj i wszystklo sie odznacza ale checkbox z pewnym oposnieniem
    preOperationAction = (operation, callback, recordId = this.state.selectedRecordId) => {
        const onlyOneRecord = operation?.onlyOneRecord;
        if (onlyOneRecord) {
            const toUnselect = this.refsCheckboxArray.filter((_, index) => String(index) !== String(recordId));
            toUnselect.forEach((el) => el.instance.option('value', false));
            const toSelect = this.refsCheckboxArray.filter((_, index) => String(index) === String(recordId));
            toSelect.forEach((el) => el.instance.option('value', true));
            callback();
            return;
        }
        callback();
    };

    handlePreview(viewId, parentId, kindView, recordId) {
        handleEdit(viewId, parentId, kindView, recordId, true);
    }

    handleEdit(viewId, parentId, recordId, kindView, readOnly = false) {
        if (TreeListUtils.isKindViewSpec(this.props.parsedGanttView)) {
            TreeListUtils.openEditSpec(
                viewId,
                parentId,
                [recordId],
                () => this.props.handleUnblockUi(),
                (err) => this.props.showErrorMessages(err)
            );
        } else {
            let result = this.props.handleBlockUi();
            if (result) {
                handleEdit(
                    this.crudService,
                    viewId,
                    recordId,
                    parentId,
                    kindView,
                    (editDataResponse) =>
                        this.setState({editData: editDataResponse}, () =>
                            this.props.handleShowEditPanel(editDataResponse)
                        ),
                    this.props.handleUnblockUi,
                    this.props.showErrorMessages,
                    readOnly
                );
            }
        }
    }

    handleEditSpec(viewId, parentId, recordId) {
        TreeListUtils.openEditSpec(
            viewId,
            parentId,
            [recordId],
            () => this.props.handleUnblockUi(),
            (err) => this.props.showErrorMessages(err)
        );
    }

    handleHrefSubview(viewId, recordId) {
        const result = this.props.handleBlockUi();
        if (result) {
            const newUrl = this.hrefSubView(viewId, recordId);
            window.location.assign(newUrl);
        }
    }

    hrefSubView = (viewId, recordId) => {
        const parentId = StringUtils.isBlank(this.props.elementRecordId) ? 0 : this.props.elementRecordId;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        return AppPrefixUtils.locationHrefUrl(
            `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}&parentId=${parentId}${
                !!currentBreadcrumb ? currentBreadcrumb : ``
            }`
        );
    };

    addButton() {
        return (
            this.addButtonExist() && (
                <ActionButton
                    rendered={true}
                    className={'justify-content-center'}
                    label={LocUtils.locFromStoreWithDefault('Add_button', 'Dodaj')}
                    handleClick={(e) => {
                        this.props.addButtonFunction(e);
                    }}
                />
            )
        );
    }
    addButtonExist() {
        const opAdd = !!TranslationUtils.getOpButton(
            this.props.parsedGanttView?.operations,
            OperationType.OP_ADD_BUTTON
        );
        const opAddFile = !!TranslationUtils.getOpButton(
            this.props.parsedGanttView?.operations,
            OperationType.OP_ADD_FILE_BUTTON
        );
        return opAdd || opAddFile;
    }
    renderCustomSelection(columns) {
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
                                  <CheckBox
                                      ref={this.selectAllRef}
                                      iconSize={15}
                                      key={'checkbox-select-all'}
                                      onValueChange={(e) => {
                                          const fakeEvent = {
                                              target: {
                                                  checked: e,
                                              },
                                          };
                                          this.selectAll(fakeEvent);
                                      }}
                                      className={'checkBoxSelection select-all'}
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
                                  <CheckBox
                                      id={'checkbox-' + recordId}
                                      iconSize={15}
                                      ref={(el) => (this.refsCheckboxArray[recordId] = el)}
                                      key={'checkbox' + recordId}
                                      onValueChange={() => {
                                          this.selectSingleRow(recordId);
                                      }}
                                      defaultValue={this.state.rowElementsStorage.get(recordId)[1].value}
                                      className={'checkBoxSelection'}
                                  />
                                  <span className='checkmark'></span>
                              </label>,
                              element
                          );
                      }}
                  />
              )
            : null;
    }
    selectAll = (e) => {
        this.props.handleBlockUi();
        const selectedRowKeys = [];
        const store = this.state.rowElementsStorage;
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
        this.props.handleSelectAll(e.target.checked, selectedRowKeys);
        this.datasRefreshSelector(store);
        setTimeout(() => {
            this.props.handleUnblockUi();
        }, 1000);
        this.refreshRef();
    };

    selectSingleRow(recordId) {
        const selectedRowKeys = this.props.selectedRowKeys;
        const store = this.state.rowElementsStorage;
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
                        cellTemplate={cellTemplate(columnDefinition)}
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
                        width={ViewDataCompUtils.operationsColumnLength(operationsRecord, operationsRecordList, true)}
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
                            const viewId = GanttUtils.getRealViewId(subViewId, this.props.id);
                            ReactDOM.render(
                                <div style={{textAlign: 'center', display: 'flex'}}>
                                    <OperationsButtons
                                        labels={this.labels}
                                        operations={operationsRecord}
                                        operationList={operationsRecordList}
                                        info={info}
                                        handleEdit={(e) => {
                                            this.preOperationAction(
                                                e,
                                                () => this.handleEdit(viewId, parentId, recordId, kindView),
                                                recordId
                                            );
                                        }}
                                        handlePreview={(e) => {
                                            this.preOperationAction(
                                                e,
                                                () => this.handlePreview(viewId, parentId, recordId, kindView),
                                                recordId
                                            );
                                        }}
                                        handleEditSpec={() => {
                                            this.handleEditSpec(viewId, parentId, recordId);
                                        }}
                                        hrefSubview={this.hrefSubView(viewId, recordId)}
                                        hrefSpecView={EditSpecUtils.editSpecUrl(viewId, parentId, compress([recordId]))}
                                        handleHrefSubview={() => this.handleHrefSubview(viewId, recordId)}
                                        handleDocuments={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDocumentRow(e.id, recordId),
                                                recordId
                                            )
                                        }
                                        handlePlugins={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handlePluginRow(e.id, recordId),
                                                recordId
                                            )
                                        }
                                        handleArchive={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleArchiveRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleDownload={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDownloadRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleAttachments={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleAttachmentRow(recordId),
                                                recordId
                                            )
                                        }
                                        handlePublish={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handlePublish(recordId),
                                                recordId
                                            )
                                        }
                                        handleHistory={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleHistoryLogRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleCopy={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleCopyRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleDelete={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleDeleteRow(recordId),
                                                recordId
                                            )
                                        }
                                        handleRestore={(e) =>
                                            this.preOperationAction(
                                                e,
                                                () => this.props.handleRestoreRow(recordId),
                                                recordId
                                            )
                                        }
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

    onCustomCommandClick = (e) => {
        const kindView = this.props.elementKindView;
        const subViewId = this.props.elementSubViewId;
        const selectedRecordId = this.state.selectedRecordId;
        const parentId = this.props.elementRecordId;
        const viewId = DataGridUtils.getRealViewId(subViewId, this.props.id);
        if (this.existsOperationsPPM()) {
            setTimeout(() => {
                switch (e.name?.toUpperCase()) {
                    case OperationType.OP_EDIT:
                        this.preOperationAction(e, () => this.handleEdit(viewId, parentId, selectedRecordId, kindView));
                        break;
                    case OperationType.OP_EDIT_SPEC:
                        this.handleEditSpec(viewId, parentId, selectedRecordId);
                        break;
                    case OperationType.OP_SUBVIEWS:
                        this.handleHrefSubview(viewId, selectedRecordId);
                        break;
                    case OperationType.OP_DELETE:
                        this.preOperationAction(e, () => this.props.handleDeleteRow());
                        break;
                    case OperationType.OP_RESTORE:
                        this.preOperationAction(e, () => this.props.handleRestoreRow());
                        break;
                    case OperationType.OP_COPY:
                        this.preOperationAction(e, () => this.props.handleCopyRow());
                        break;
                    case OperationType.SK_DOCUMENT:
                        this.preOperationAction(e, () => this.props.handleDocumentRow(e.id));
                        break;
                    case OperationType.SK_PLUGIN:
                        this.preOperationAction(e, () => this.props.handlePluginRow(e.id));
                        break;
                    case OperationType.OP_ARCHIVE:
                        this.preOperationAction(e, () => this.props.handleArchiveRow());
                        break;
                    case OperationType.OP_PUBLISH:
                        this.preOperationAction(e, () => this.props.handlePublishRow());
                        break;
                    case OperationType.OP_FORMULA:
                        this.preOperationAction(e, () => this.props.handleFormulaRow());
                        break;
                    case OperationType.OP_DOWNLOAD:
                        this.preOperationAction(e, () => this.props.handleDownloadRow());
                        break;
                    case OperationType.OP_HISTORY:
                        this.preOperationAction(e, () => this.props.handleHistoryLogRow());
                        break;
                    case OperationType.OP_ATTACHMENTS:
                        this.preOperationAction(e, () => this.props.handleAttachmentRow());
                        break;
                    case OperationType.OP_FILL:
                        this.preOperationAction(e, () => this.props.handleFillRow());
                        break;
                    case OperationType.OP_ADD:
                        this.props.addButtonFunction();
                        break;
                    case OperationType.OP_SAVE:
                        this.props.handleSaveAction();
                        break;
                    default:
                        console.log('error not found type: ' + e.name?.toUpperCase());
                        return null;
                }
            });
        }
    };
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

import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import ConsoleHelper from '../utils/ConsoleHelper';
import DataTreeStore from './dao/DataTreeStore';
import TreeViewComponent from './treeGridView/TreeViewComponent';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import LocUtils from '../utils/LocUtils';
import { Tabs} from 'devextreme-react';
import {InputNumber} from 'primereact/inputnumber';
import {TreeListUtils} from '../utils/component/TreeListUtils';
import {sessionPrelongFnc} from '../App';
import {Dialog} from 'primereact/dialog';
import {OperationType} from '../model/OperationType';
import {TabSpecType} from '../model/TabSpecType';
import {StringUtils} from '../utils/StringUtils';
import SelectedElements from '../components/SelectedElements';
import AddSpecService from '../services/AddSpecService';
import { ResponseUtils } from '../utils/ResponseUtils';

const autOfRangeIndexTab = 6;

export class AddSpecContainer extends BaseContainer {
    _isMounted = false;
    constructor(props) {
        
        ConsoleHelper('AddSpecContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.crudService = new CrudService();
        this.addSpecService =  new AddSpecService();
        this.dataTreeStore = new DataTreeStore();
        this.refTreeList = React.createRef();
        this.numberOfCopiesRef = React.createRef();
        this.numberOfCopies = React.createRef(1);
        this.numberOfCopiesEvent = React.createRef();
        this.messages = React.createRef();
        this.tabClicked = React.createRef();
        this.blocking = React.createRef(true);
        this.state = {
            lastElementId: this.props.lastId,
            // loading: true,
            selectedIndex: 0,
            tabs: 0,
            visibleAddSpec: false,
            blocking: true,
            initializedExpandAll: false,
            isSubView: false,
            arrayToAdd: [],
            elementParentId: null,
            elementRecordId: null,
            elementFilterId: null,
            parsedData: null,
            columns: [],
            selectedRowKeys: [],
        };
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
    }

    componentDidMount() {
        this.tabClicked.current= false;
        this.numberOfCopies.current =1;
        this._isMounted = true;
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        ConsoleHelper(
            `AddSpecContainer::componentDidMount -> id=${id}, parentId = ${parentId} recordId = ${recordId} filterId = ${filterId}`
        );
        this.setState({
            elementParentId: parentId,
            elementRecordId: recordId,
            elementFilterId: filterId,
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        const s1 = !DataGridUtils.equalNumbers(this.state.elementId, id);
        const s2 = !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !DataGridUtils.equalString(this.state.elementRecordId, recordId);
        const updatePage = s1 || s2 || s3;
        ConsoleHelper(
            'AddSpecContainer::componentDidUpdate -> updateData={%s} updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}',
            updatePage,
            prevProps.id,
            this.props.id,
            s1,
            s2,
            s3
        );
        if (updatePage) {
            this.setState(
                {
                    loading: true,
                    elementId: id,
                    elementParentId: parentId,
                    elementRecordId: recordId,
                    elementFilterId: filterId, //z dashboardu
                },
                () => {
                    this.downloadData(id, this.state.elementParentId, this.state.elementRecordId);
                }
            );
        } else {
            return false;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    downloadData(viewId, parentId, recordId) {
        ConsoleHelper(`AddSpecContainer::downloadData: viewId=${viewId}, parentId=${parentId}, recordId=${recordId}`);
        this.getViewById(viewId, parentId, recordId);
    }

    renderView() {
        return (
            <div>
                <React.Fragment>
                    {this.props.visibleAddSpec && (
                    <Dialog
                            id={'popup-add-spec'}
                            key={`popup-add-spec`}
                            blockScroll={true}
                            draggable={false}
                            onHide={this.props.onHide}
                            style={{maxWidth: '1500px', height: '800px', overflow: 'none'}}
                            ariaCloseIconLabel='Zamknij okno dialogowe'
                            breakpoints={{'960px': '75vw', '640px': '100vw'}}
                            header={
                                <div className='mb-4'>
                                    <div className='row ' style={{flaot: 'right!important'}}>
                                        <div className='col-lg-6 col-md-12'>{this.renderHeaderLeft()}</div>
                                        <span className='col-lg-6 col-md-12'>{this.renderHeaderRight()}</span>
                                    </div>
                                </div>
                            }
                            resizable={false}
                            visible={true}
                            footer={()=>{<div></div>}}
                        >
                            {this.renderHeadPanel()}
                            {this.renderContent()}
                        </Dialog>
                        
                    )}
                </React.Fragment>
            </div>
        );
    }
    //
    getViewById(viewId, parentId, recordId) {
        const defaultTypeArg = 'DEF';
        this.setState({loading: true}, () => {
            this.getViewAddSpec(viewId, parentId, recordId, defaultTypeArg);
        });
    }

    getViewAddSpec(viewId, parentId, recordId, type, header, headerId) {
        if (this.isGridViewUrlExist()) {
            parentId = UrlUtils.getRecordId();
        }
        this.viewService
            .getViewAddSpec(viewId, parentId, type, header, headerId)
            .then((responseView) => {
                responseView.viewOptions.multiSelect = true;
                const resView = {
                    ...responseView,
                    viewInfo: {
                        id: responseView.info.viewId,
                        name: '',
                        parentId: responseView.info.parentId,
                        headerId: responseView.info.headerId,
                        type: 'gridView',
                        kindView: 'ViewSpec',
                    },
                    gridColumns: [
                        {
                            groupName: '',
                            freeze: '',
                            columns: responseView.viewColumns,
                        },
                    ],
                    gridOptions: responseView.viewOptions,
                };
                this.processingViewResponse(resView, parentId, recordId);
            })
            .catch((err) => {
                this.refTreeList?.instance?.endCustomLoading();
                console.error('Error getViewSpec in EditSpec. Exception = ', err);
                this.setState({loading: false}, () => {
                    this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                });
            })
            .finally(() => {
                this.unblockUi();
            });
    }

    processingViewResponse(responseView, parentId, recordId) {
        if (this._isMounted) {
            ViewValidatorUtils.validation(responseView);
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            Breadcrumb.updateView(responseView.viewInfo, id, recordId);
            const pluginsListTmp = ResponseUtils.pluginListCreateAndPass(responseView);
            const documentsListTmp = ResponseUtils.documentListCreateAndPass(responseView);
            const batchesListTmp = ResponseUtils.batchListCreateAndPass(responseView);
            const filtersListTmp = ResponseUtils.filtersListCreateAndPass(responseView);
            Breadcrumb.currentBreadcrumbAsUrlParam();
            this.blockUi();
            this.setState(
                () => ({
                    pluginsList: pluginsListTmp,
                    documentsList: documentsListTmp,
                    batchesList: batchesListTmp,
                    filtersList: filtersListTmp,
                    expandAll: responseView.gridOptions.groupExpandAll,
                }),
                () => {
                    const viewIdArg = this.state.elementId;
                    let parentIdArg = this.state.elementParentId;
                    const type = responseView.info.type;
                    const headerId = responseView.info.headerId;
                    const header = responseView.info.header;
                    if (window.location.href.includes('grid-view')) {
                        parentIdArg = UrlUtils.getRecordId();
                    }
                    this.dataTreeStore
                        .getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg, type, headerId, header)
                        .then((res) => {
                            res.data.forEach((el) => {
                                if (el.ID_PARENT !== undefined) {
                                    el._ID_PARENT = el.ID_PARENT;
                                }
                                el._ID = el.ID;
                            });
                            const kind = responseView?.info?.kind || '';
                            const isGrid = kind.toUpperCase() === 'GRID';
                            if (header === false && !isGrid) {
                                res.data = TreeListUtils.paintDatas(res.data);
                            }
                            if (isGrid) {
                                TreeListUtils.createSelectionStaticColumn(responseView.gridColumns[0].columns);
                            } else {
                                TreeListUtils.createSelectionColumn(responseView.gridColumns[0].columns, res.data);
                            }
                            const columnsTmp = ResponseUtils.columnsFromGroupCreate(responseView);
                            this.setState(
                                {
                                    parsedView: responseView,
                                    columns: columnsTmp,
                                    viewInfo: responseView.viewInfo,
                                    tabs: this.createValidTabs(responseView.tabs),
                                },
                                () => {
                                    this.setState({
                                        loading: false,
                                        blocking: false,
                                        parsedData: res.data,
                                        totalCounts: res.totalCount
                                    });
                                }
                            );
                        })
                        .catch((ex) => {
                            this.showGlobalErrorMessage(ex);
                            this.unblockUi();
                        });
                }
            );
        }
    }
    createValidTabs(tabs) {
        const res = tabs?.map((el) => {
            return {
                text: el?.title ? el.title : el.text,
                header: el.header,
                type: el.type,
            };
        });
        return res;
    }
    //override
    renderGlobalTop() {
        return <React.Fragment />;
    }
    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <DivContainer id='header-left' style={{maxWidth: '400px'}}>
                    <div id='subviews-panel'>
                        {this.state.tabs?.length > 0 ? (
                            <Tabs
                                onContentReady={(e) => {
                                    if (e?.element) {
                                        e.element.children[0].className = 'dx-wrapper';
                                        const selectedIndex = this.state.selectedIndex;
                                        if (!StringUtils.isBlank(selectedIndex)) {
                                            const child = e.element.children[0].children[selectedIndex];
                                            child.className = 'dx-item dx-tab dx-tab-selected-item';
                                        }
                                    }
                                }}
                                style={{maxHeight: '300px'}}
                                dataSource={this.state.tabs}
                                selectedIndex={this.state.selectedIndex}
                                onItemClick={(event) => {
                                    if (sessionPrelongFnc) {
                                        sessionPrelongFnc();
                                    }
                                    if (this.state.selectedIndex === autOfRangeIndexTab) {
                                        this.onItemTabClick(event.itemIndex);
                                    }
                                }}
                                onOptionChanged={(args, e, b, d) => {
                                    const element = args?.element;
                                    if (element) {
                                        const children = element.children;
                                        if (children.length === 1 && children[0].classList.contains('dx-wrapper')) {
                                            Array.from(children[0].children).forEach((child) => {
                                                if (
                                                    child.classList.contains('dx-tab-selected') ||
                                                    child.classList.contains('dx-tab-selected-item')
                                                ) {
                                                    setTimeout(() => {
                                                        child.classList.remove('dx-tab-selected');
                                                    });
                                                }
                                            });
                                        }
                                    }
                                    if (args.name === 'selectedIndex') {
                                        if (this.state.isSubView) {
                                            this.setState({
                                                blocking: true,
                                                isSubView: false,
                                                selectedIndex: autOfRangeIndexTab,
                                            });
                                        }
                                        if (args.value !== -1 && args.previousValue !== -1) {
                                            if(this.tabClicked.current === false){
                                                this.tabClicked.current = true
                                                this.onItemTabClick(args.value);
                                            }
                                        }
                                    }
                                }}
                                scrollByContent={true}
                                showNavButtons={true}
                            />
                        ) : null}
                    </div>
                </DivContainer>
            </React.Fragment>
        );
    }
    onItemTabClick(index) {
        if (index !== autOfRangeIndexTab) {
            this.refTreeList?.instance?.beginCustomLoading();
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            const elementId = this.state.elementId;
            const elementParentId = this.state.elementParentId;
            const elementRecordId = this.state.elementRecordId;
            const headerId = this.state.parsedView?.info?.headerId;
            const tab = this.state.tabs[index];
            let header = tab.header;
            if (tab.type === TabSpecType.METHODS || tab.type === TabSpecType.TEMPLATES) {
                header = true;
            }
            this.getViewAddSpec(elementId, elementParentId, elementRecordId, tab.type, header, headerId);
            this.setState({
                selectedIndex: index,
                initializedExpandAll: false,
            });
            this.unselectAllDataGrid();
            setTimeout(() => {
                this?.refTreeList?.current.reInitilizedExpandAll();
                this.refTreeList?.instance?.endCustomLoading();
                this.tabClicked.current = false
            }, 1000);
        }
    }
    // TODO: naprwic komponent up and down bo sie zacina nalezy uzyc metody onValueChabnge
    //override
    renderHeaderRight() {
        const operations = this.state.parsedView.operations;
        const opAdd = DataGridUtils.getOpButton(
            operations,
            OperationType.OP_ADDSPEC_ADD,
        );
        const opCount = DataGridUtils.getOpButton(
            operations,
            OperationType.OP_ADDSPEC_COUNT,
        );
        return (
            <div>
                <div className='ml-4 text-end number-of-copies-header'>
                    <div>
                        {!!opCount ? (
                            <React.Fragment>
                                {LocUtils.loc(this.props.labels, 'number_of_copy', opCount.label + ' ')}
                                <InputNumber
                                    ref={this.numberOfCopiesRef}
                                    id='numberOsfCopy'
                                    name='numberOfCopy'
                                    onDragStart={(e)=>{console.log("DRAG" + e)}}
                                    onChange={(e) => {
                                        if (sessionPrelongFnc) {
                                            sessionPrelongFnc();
                                        }
                                        this.numberOfCopies.current = e.value;
                                    }}
                                    className='p-inputtext-sm mr-2'
                                    min={1}
                                    style={{maxHeight: '43px'}}
                                    value={1}
                                    showButtons
                                />
                            </React.Fragment>
                        ) : undefined}
                       {opAdd && <ActionButton
                            rendered={!!opAdd}
                            label={opAdd?.label}
                            disabled={this.state.selectedRowKeys.length === 0}
                            className=''
                            handleClick={() => {
                                this.handleExecSpec();
                            }}
                        />} 
                    </div>
                </div>
            </div>
        );
    }

    handleExecSpec() {
        const viewId = this.state.elementId;
        const parentId = this.state.elementParentId;
        const parsedView = this.state.parsedView;
        const type = parsedView.info?.type;
        const headerId = parsedView.info?.headerId;
        const header = parsedView.info?.header;
        if (this.state.selectedRowKeys.length === 0) {
            this.showErrorMessage(
                LocUtils.loc(this.props.labels, 'Not_selected_row', 'Nie wybrano żadnych elementów'),
                4000,
                true
            );
            return;
        }
        ConsoleHelper(
            `handleExecSpec: viewId = ${viewId} parentId = ${parentId}  parentId = ${type}  parentId = ${headerId}  parentId = ${header}`
        );
        this.specExec(viewId, parentId, type, headerId, header);
    }

    isGridViewUrlExist() {
        return UrlUtils.urlParamExsits('grid-view');
    }

    createObjectToSave() {
        if (this.props.createObjectToSave) {
            return this.props.createObjectToSave();
        }
        return null;
    }
    //override
    specExec = (viewId, parentId, type, headerId, header) => {
        const numberOfCopies = this.numberOfCopiesRef?.current.getElement().children[0]?.value;
        this.blockUi();
        if (this.isGridViewUrlExist()) {
            parentId = UrlUtils.getRecordId();
        }
        this.addSpecService
            .execute(
                viewId,
                parentId,
                type,
                headerId,
                header,
                this.state.selectedRowKeys,
                this.createObjectToSave(this.props?.parsedGridViewData),
                numberOfCopies
            )
            .then((saveResponse) => {
                const minNextId =  this.props.lastId;
                const levelId =  this.props.levelId;
                let result = []; 
                if(minNextId === undefined && levelId === undefined){
                    result = saveResponse.data;
                }
                else{
                    result = this.createValidArray(saveResponse.data,minNextId, levelId);
                }
                this.props.handleAddElements(result);
                this.props.onHide();
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };
    createValidArray(array, minNextId, levelId) {
        array.forEach((el) => {
            el._ID = el._ID +  minNextId
            if(!StringUtils.isBlank(levelId)){
                el._ID_PARENT = levelId
            }
            else if(el._ID_PARENT !== 0){
                el._ID_PARENT = el._ID_PARENT +  minNextId
            }
            el._STATUS = 'inserted';
        });
        return array;
    }

    //override
    renderHeaderContent() {}

    //override
    renderHeadPanel = () => {
        return <React.Fragment />;
    };

    updateData(dataToUpdate, callbackAction) {
        this.setState({parsedData: dataToUpdate}, () => {
            if (!!callbackAction) callbackAction();
        });
    }
    shouldComponentUpdate(nextProps, nextState) {
        const changedElementStates =
            nextState.elementParentId !== this.state.elementParentId ||
            nextState.elementRecordId !== this.state.elementRecordId;
        const changedElementId = nextState.elementId !== this.state.elementId;
        const changedParsedView = nextState.parsedView !== this.state.parsedView;
        const changedParsedData = nextState.parsedData !== this.state.parsedData;
        const changedSelectedRowKeys = nextState.selectedRowKeys !== this.state.selectedRowKeys;
        const shouldBeRerendered =
            changedElementStates ||
            changedElementId ||
            changedParsedView ||
            changedParsedData ||
            changedSelectedRowKeys;
        return shouldBeRerendered;
    }
    increaseNumberOfCopies() {
        const inputRef = this.numberOfCopiesRef.current.inputRef.current;
        inputRef.value = (parseInt(inputRef.value) + 1).toString();
    }
    //override
    renderContent() {
        let parsedData = this.state?.parsedData;
        return (
            <React.Fragment>
                {!this.state.loading && (
                    <React.Fragment>
                        <div id='spec-edit-dialog' className='spec-edit-dialog '>
                            <TreeViewComponent
                                altAndLeftClickEnabled={true}
                                ref={this?.refTreeList}
                                id={this.props.id}
                                viewInfo={this.state.viewInfo}
                                initializedExpandAll={this.state.initializedExpandAll}
                                allowOperations={false}
                                elementParentId={this.state.elementParentId}
                                isAddSpec={true}
                                preloadEnabled={false}
                                focusedRowEnabled={true}
                                hoverStateEnabled={true}
                                handleExecSpec={() => this.handleExecSpec()}
                                handleAddSpecCount={() => this.increaseNumberOfCopies()}
                                elementRecordId={this.state.elementRecordId}
                                handleOnTreeList={(ref) => (this.refTreeList = ref)}
                                parsedGridView={this.state.parsedView}
                                parsedGridViewData={parsedData}
                                gridViewColumns={this.state.columns}
                                handleAddSpecSpec={(id) => {
                                    const viewId = this.state.elementId;
                                    const parentId = this.state.elementParentId;
                                    const recordId = this.state.elementRecordId;
                                    const parsedView = this.state.parsedView;
                                    const type = parsedView.info?.type;
                                    let header = parsedView.info?.header;
                                    if (type === TabSpecType.METHODS || type === TabSpecType.TEMPLATES) {
                                        header = false;
                                        this.setState({
                                            isSubView: true,
                                        });
                                    }
                                    this.unselectAllDataGrid();
                                    this.getViewAddSpec(viewId, parentId, recordId, type, header, id);
                                    setTimeout(() => {
                                        this.refTreeList?.current.reInitilizedExpandAll();
                                        this.refTreeList?.instance?.endCustomLoading();
                                    }, 1200);
                                }}
                                selectedRowKeys={this.state.selectedRowKeys}
                                onChange={(type, e, rowId, info) => this.handleEditRowChange(type, e, rowId, info)}
                                handleBlockUi={() => {
                                    this.blockUi();
                                    return true;
                                }}
                                handleUnselectAll={() => {
                                    this.unselectAllDataGrid();
                                }}
                                handleUnblockUi={() => {
                                    this.unblockUi();
                                }}
                                handleShowEditPanel={(editDataResponse) => this.handleShowEditPanel(editDataResponse)}
                                handleSelectedRowKeys={(e, rerenderColorAfterClickCheckbox) => {
                                    this.setState(
                                        (prevState) => {
                                            return {
                                                ...prevState,
                                                selectedRowKeys: e,
                                            };
                                        },
                                        () => {
                                            if (rerenderColorAfterClickCheckbox) {
                                                rerenderColorAfterClickCheckbox();
                                            }
                                        }
                                    );
                                }}
                                modifyParsedGridViewData={(newCopyRow) => {
                                    parsedData.forEach((el) => {
                                        if (el._ID === newCopyRow._ID) {
                                            el = newCopyRow;
                                        }
                                    });
                                    this.setState({
                                        parsedData,
                                    });
                                }}
                                handleDeleteRow={(id) => this.delete(id)}
                                handleForumlaRow={(id) => this.prepareCalculateFormula(id)}
                                handleDownload={(id) => {
                                    this.props.handleDownloadRow(id);
                                }}
                                handleAttachments={(id) => {
                                    this.props.handleAttachmentRow(id);
                                }}
                                handleAddLevel={(id) => alert(id)}
                                handleUp={(id) => this.up(id)}
                                handleDown={(id) => this.down(id)}
                                handleRestoreRow={(id) => this.restore(id)}
                                handleCopyRow={(id) => this.copyEntry(id)}
                                handleDocumentsRow={(id) => this.generate(id)}
                                handlePluginsRow={(id) => this.plugin(id)}
                                handleDownloadRow={(id) => this.downloadAttachment(id)}
                                handleAttachmentRow={(id) => this.attachment(id)}
                                handleArchiveRow={(id) => this.archive(id)}
                                handlePublishRow={(id) => this.publishEntry(id)}
                                showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                                labels={this.props.labels}
                            />
                            <SelectedElements selectedRowKeys={this.state.selectedRowKeys} totalCounts={this.state.totalCounts} />
                        </div>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
    getMessages() {
        return this.messages;
    }
}

AddSpecContainer.defaultProps = {
    viewMode: 'VIEW',
    visibleAddSpec: false,
    createObjectToSave: undefined,
};

AddSpecContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
    visibleAddSpec: PropTypes.bool.isRequired,
    createObjectToSave: PropTypes.func,
};
export default AddSpecContainer;

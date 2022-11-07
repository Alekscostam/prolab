import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import ConsoleHelper from '../utils/ConsoleHelper';
import DataTreeStore from './dao/DataTreeStore';
import TreeViewComponent from './treeGrid/TreeViewComponent';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import {Dialog} from 'primereact/dialog';
import LocUtils from '../utils/LocUtils';
import {InputNumber} from 'primereact/inputnumber';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class AddSpecContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('AddSpecContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.dataTreeStore = new DataTreeStore();
        this.refTreeList = React.createRef();
        this.messages = React.createRef();
        this.state = {
            lastElementId: this.props.lastId,
            // loading: true,
            visibleAddSpec: false,
            arrayToAdd: [],
            elementParentId: null,
            elementRecordId: null,
            elementFilterId: null,
            parsedData: null,
            columns: [],
            selectedRowKeys: [],
            numberOfCopies: 1,
        };
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        const parentId = UrlUtils.getURLParameter('parentId');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
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
        const parentId = UrlUtils.getURLParameter('parentId');
        const recordId = UrlUtils.getURLParameter('recordId');
        const filterId = UrlUtils.getURLParameter('filterId');
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
                    elementId: id,
                    elementParentId: parentId,
                    elementRecordId: recordId,
                    elementFilterId: filterId, //z dashboardu
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementParentId,
                        this.state.elementRecordId,
                        this.state.elementFilterId
                    );
                }
            );
        } else {
            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, parentId, recordId, filterId) {
        ConsoleHelper(
            `AddSpecContainer::downloadData: viewId=${viewId}, parentId=${parentId}, recordId=${recordId}, filterId=${filterId}`
        );
        this.getViewById(viewId, parentId, recordId, filterId);
    }

    render() {
        return <React.Fragment>{super.render()}</React.Fragment>;
    }
    renderView() {
        return (
            <React.Fragment>
                <Dialog
                    id='addSpecDialog'
                    header={LocUtils.loc(this.props.labels, 'add_spec_parameters', 'Dodawanie parametrów')}
                    footer={<React.Fragment>{/* {this.unblockUi()} */}</React.Fragment>}
                    visible={true}
                    resizable={false}
                    breakpoints={{'960px': '75vw'}}
                    style={{width: '90vw'}}
                    onHide={() => this.props.onHide()}
                >
                    {this.renderGlobalTop()}
                    <DivContainer colClass='base-container-div'>
                        <DivContainer colClass='row base-container-header'>
                            <DivContainer id='header-left' colClass={''}>
                                {this.renderHeaderLeft()}
                            </DivContainer>
                            <DivContainer id='header-right' colClass={''}>
                                {this.renderHeaderRight()}
                            </DivContainer>
                            <DivContainer id='header-content' colClass='col-12'>
                                {this.renderHeaderContent()}
                            </DivContainer>
                        </DivContainer>
                        <DivContainer id='header-panel' colClass='col-12'>
                            {this.renderHeadPanel()}
                        </DivContainer>
                        <DivContainer id='content' colClass='col-12'>
                            {this.renderContent()}
                        </DivContainer>
                    </DivContainer>
                </Dialog>
            </React.Fragment>
        );
    }

    getViewById(viewId, parentId, recordId, filterId) {
        this.setState({loading: true}, () => {
            this.viewService
                .getViewAddSpec(viewId, parentId)
                .then((responseView) => {
                    responseView.viewOptions.multiSelect = true;
                    let refactorResponseView = {
                        ...responseView,
                        viewInfo: {
                            id: responseView.info.viewId,
                            name: '',
                            parentId: responseView.info.parentId,
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
                    this.processingViewResponse(refactorResponseView, parentId, recordId);
                })
                .catch((err) => {
                    console.error('Error getViewSpec in EditSpec. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                })
                .finally(() => {
                    this.unblockUi();
                });
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
            let columnsTmp = [];
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
                        columnsTmp.push(column);
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
            this.setState(
                () => ({
                    parsedView: responseView,
                    columns: columnsTmp,
                    pluginsList: pluginsListTmp,
                    documentsList: documentsListTmp,
                    batchesList: batchesListTmp,
                    filtersList: filtersListTmp,
                }),
                () => {
                    //const initFilterId = responseView?.viewInfo?.filterdId;
                    const viewIdArg = this.state.elementId;
                    const parentIdArg = this.state.elementParentId;
                    //const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                    this.dataTreeStore.getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg).then((res) => {
                        this.setState({
                            loading: false,
                            parsedData: res.data,
                        });
                    });
                }
            );
        }
    }

    //override
    renderGlobalTop() {
        return <React.Fragment />;
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <DivContainer id='header-left '>
                    {/* <div className='font-medium '>{this.state.parsedView?.viewInfo?.name}</div> */}
                    <div className='ml-3'>
                        {LocUtils.loc(this.props.labels, 'number_of_copy', 'Liczba kopii:')}
                        <div className='row '>
                            <InputNumber
                                id='numberOfCopy'
                                name='numberOfCopy'
                                className='p-inputtext-sm col-lg-6'
                                min={1}
                                style={{maxWidth: '20px'}}
                                value={this.state.numberOfCopies}
                                onValueChange={(e) => {
                                    this.setState(() => ({
                                        numberOfCopies: e.value,
                                    }));
                                }}
                                showButtons
                            />
                        </div>
                    </div>
                </DivContainer>
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        //TODO let operations = this.state.operations;
        //TODO mock
        let operations = [];
        operations.push({type: 'OP_ACCEPTED', label: 'Zatwierdź'});
        //TODO mock end
        let opAccept = DataGridUtils.containsOperationsButton(operations, 'OP_ACCEPTED');
        return (
            <React.Fragment>
                <ActionButton
                    label={'Anuluj'}
                    className='ml-2'
                    handleClick={() => {
                        this.props.onHide();
                    }}
                />

                <ActionButton
                    rendered={!!opAccept}
                    label={opAccept?.label}
                    className='ml-2'
                    handleClick={(e) => {
                        const viewIdArg = this.state.elementId;
                        const parentIdArg = this.state.elementParentId;
                        this.handleExecSpec(viewIdArg, parentIdArg);
                    }}
                />
            </React.Fragment>
        );
    }

    handleExecSpec(viewId, parentId) {
        ConsoleHelper(`handleExecSpec: viewId = ${viewId} parentId = ${parentId}`);
        const saveElement = {listId: this.state.selectedRowKeys};
        ConsoleHelper(`handleExecSpec: element to save = ${JSON.stringify(saveElement)}`);
        this.specExec(viewId, parentId, saveElement);
    }

    //override
    specExec = (viewId, parentId, saveElement) => {
        this.blockUi();
        this.crudService
            .executeSpec(viewId, parentId, saveElement, this.state.numberOfCopies)
            .then((saveResponse) => {
                let validArray = this.createValidArray(saveResponse.data);
                let res = this.setFakeIds(validArray);
                this.props.handleAddElements(res);
                this.props.onHide();
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };

    setFakeIds(array) {
        let startElementId = this.state.lastElementId + 1;
        let clonedArray = structuredClone(array);
        for (let x = 0; x < array.length; x++) {
            for (let y = 0; y < clonedArray.length; y++) {
                if (array[x]._ID === clonedArray[y]._ID) {
                    clonedArray[y]._ID = startElementId;
                    clonedArray[y].ID = startElementId;
                }
                if (array[x]._ID === clonedArray[y]._ID_PARENT) {
                    clonedArray[y]._ID_PARENT = startElementId;
                }
            }
            startElementId = ++startElementId;
        }
        this.setState({
            lastElementId: startElementId,
        });
        return clonedArray;
    }

    createValidArray(array) {
        array.forEach((el) => {
            if (!el.ID_PARENT || el.ID_PARENT === 0) {
                el._ID_PARENT = this.props.levelId ? this.props.levelId : 0;
            } else {
                el._ID_PARENT = el.ID_PARENT;
            }
            el._ID = el.ID;
            el._STATUS = 'inserted';
        });
        return array;
    }

    //override
    renderHeaderContent() {}

    //override
    renderHeadPanel = () => {
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={this.state.elementRecordId}
                    elementSubViewId={null}
                    elementKindView={this.state.elementKindView}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedView?.operations}
                    labels={this.props.labels}
                    rightContent={
                        <React.Fragment>
                            <ShortcutsButton items={this.state.parsedView?.shortcutButtons} maxShortcutButtons={5} />
                        </React.Fragment>
                    }
                    handleDelete={() => this.delete()}
                    handleAddLevel={() => this.publish()}
                    handleUp={() => this.up()}
                    handleDown={() => this.down()}
                    handleRestore={() => this.restore()}
                    handleCopy={() => this.copyEntry()}
                    handleArchive={() => this.archive()}
                    handleAttachments={() => this.attachment()}
                    handlePublish={() => this.publishEntry()}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleBlockUi={() => this.blockUi()}
                />
            </React.Fragment>
        );
    };

    updateData(dataToUpdate, callbackAction) {
        this.setState({parsedData: dataToUpdate}, () => {
            if (!!callbackAction) callbackAction();
        });
    }

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {/*{this.state.parsedData.map((el) => el.ID).join(", ")}*/}
                        <div id='spec-edit'>
                            <TreeViewComponent
                                id={this.props.id}
                                allowOperations={false}
                                elementParentId={this.state.elementParentId}
                                isAddSpec={true}
                                elementRecordId={this.state.elementRecordId}
                                handleOnTreeList={(ref) => (this.refTreeList = ref)}
                                parsedGridView={this.state.parsedView}
                                parsedGridViewData={this.state.parsedData}
                                gridViewColumns={this.state.columns}
                                selectedRowKeys={this.state.selectedRowKeys}
                                onChange={(type, e, rowId, info) => this.handleEditRowChange(type, e, rowId, info)}
                                handleBlockUi={() => {
                                    this.blockUi();
                                    return true;
                                }}
                                handleUnblockUi={() => this.unblockUi()}
                                handleShowEditPanel={(editDataResponse) => this.handleShowEditPanel(editDataResponse)}
                                handleSelectedRowKeys={(e) => {
                                    this.setState((prevState) => {
                                        return {
                                            ...prevState,
                                            selectedRowKeys: e,
                                        };
                                    });
                                }}
                                handleDeleteRow={(id) => this.delete(id)}
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
                                handleDocumentsRow={(id) => {
                                    this.generate(id);
                                }}
                                handlePluginsRow={(id) => {
                                    this.plugin(id);
                                }}
                                handleDownloadRow={(id) => this.downloadAttachment(id)}
                                handleAttachmentRow={(id) => this.attachment(id)}
                                handleArchiveRow={(id) => this.archive(id)}
                                handlePublishRow={(id) => this.publishEntry(id)}
                                showErrorMessages={(err) => this.showErrorMessages(err)}
                                labels={this.props.labels}
                            />
                        </div>
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };

    getMessages() {
        return this.messages;
    }
}

AddSpecContainer.defaultProps = {
    viewMode: 'VIEW',
};

AddSpecContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
};

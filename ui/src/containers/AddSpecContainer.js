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
import LocUtils from '../utils/LocUtils';
import {Tabs} from 'devextreme-react';
import {InputNumber} from 'primereact/inputnumber';
import {Popup} from 'devextreme-react/popup';

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
            selectedIndex: 0,
            tabs: 0,
            visibleAddSpec: false,
            changingTab: false,
            isSubView: false,
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
        const title = this.state.parsedView?.info?.title;
        return (
            <React.Fragment>
                <Popup
                    showTitle={true}
                    id='popup'
                    visible={this.props.visibleAddSpec}
                    className={'col-12 col-6'}
                    dragEnabled={true}
                    hideOnOutsideClick={true}
                    showCloseButton={true}
                    onHiding={this.props.onHide}
                    title={LocUtils.loc(this.props.labels, 'add_spec_parameters', title)}
                    container='.dx-viewport'
                >
                    <div className='mb-4'>
                        <div className='row ' style={{flaot: 'right!important'}}>
                            <div className='col-lg-6 col-md-12'>{this.renderHeaderLeft()}</div>
                            <span className='col-lg-6 col-md-12'>{this.renderHeaderRight()}</span>
                        </div>
                    </div>

                    {this.renderHeadPanel()}
                    {this.renderContent()}
                </Popup>
            </React.Fragment>
        );
    }

    getViewById(viewId, parentId, recordId, filterId) {
        const defaultTypeArg = 'DEF';
        this.setState({loading: true}, () => {
            this.getViewAddSpec(viewId, parentId, recordId, defaultTypeArg);
        });
    }

    getViewAddSpec(viewId, parentId, recordId, type, header, headerId) {
        this.viewService
            .getViewAddSpec(viewId, parentId, type, header, headerId)
            .then((responseView) => {
                responseView.viewOptions.multiSelect = true;
                let refactorResponseView = {
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
                    tabs: this.createValidTabs(responseView.tabs),
                }),
                () => {
                    //const initFilterId = responseView?.viewInfo?.filterdId;
                    const viewIdArg = this.state.elementId;
                    const parentIdArg = this.state.elementParentId;
                    const type = responseView.info.type;
                    const headerId = responseView.info.headerId;
                    const header = responseView.info.header;
                    //const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                    this.dataTreeStore
                        .getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg, type, headerId, header)
                        .then((res) => {
                            this.setState({
                                loading: false,
                                parsedData: res.data,
                                changingTab: false,
                            });
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
                <DivContainer id='header-left ' style={{maxWidth: '400px'}}>
                    <div id='subviews-panel' className='ml-2'>
                        {this.state.tabs?.length > 0 ? (
                            <Tabs
                                style={{maxHeight: '300px'}}
                                dataSource={this.state.tabs}
                                selectedIndex={this.state.selectedIndex}
                                onOptionChanged={(args, e, b, d) => {
                                    if (args.name === 'selectedIndex') {
                                        if (this.state.isSubView) {
                                            this.setState({isSubView: false, selectedIndex: 6});
                                        }
                                        if (args.value !== -1 && args.previousValue !== -1) {
                                            let id = UrlUtils.getViewIdFromURL();
                                            if (id === undefined) {
                                                id = this.props.id;
                                            }
                                            const elementId = this.state.elementId;
                                            const elementParentId = this.state.elementParentId;
                                            const elementRecordId = this.state.elementRecordId;
                                            const headerId = this.state.parsedView?.info?.headerId;
                                            const tab = this.state.tabs[args.value];
                                            let header = tab.header;
                                            if (tab.type === 'METHODS' || tab.type === 'TEMPLATES') {
                                                header = true;
                                            }
                                            this.getViewAddSpec(
                                                elementId,
                                                elementParentId,
                                                elementRecordId,
                                                tab.type,
                                                header,
                                                headerId
                                            );
                                            this.setState({
                                                selectedIndex: args.value,
                                                changingTab: true,
                                            });
                                            this.unselectAllDataGrid();
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

    //override
    renderHeaderRight() {
        const operations = this.state.parsedView.operations;

        let opAdd = DataGridUtils.containsOperationsButton(operations, 'OP_ADDSPEC_ADD');
        let opCount = DataGridUtils.containsOperationsButton(operations, 'OP_ADDSPEC_COUNT');

        return (
            <div>
                <div className='mt-2 ml-4 text-end'>
                    <div>
                        {!!opCount ? (
                            <React.Fragment>
                                {LocUtils.loc(this.props.labels, 'number_of_copy', opCount.label + ' ')}
                                <InputNumber
                                    id='numberOsfCopy'
                                    name='numberOfCopy'
                                    className='p-inputtext-sm mr-2'
                                    min={1}
                                    style={{maxHeight: '43px'}}
                                    value={this.state.numberOfCopies}
                                    onValueChange={(e) => {
                                        this.setState(() => ({
                                            numberOfCopies: e.value,
                                        }));
                                    }}
                                    showButtons
                                />
                            </React.Fragment>
                        ) : undefined}
                        <ActionButton
                            rendered={!!opAdd}
                            label={opAdd?.label}
                            className=''
                            handleClick={() => {
                                const viewIdArg = this.state.elementId;
                                const parentIdArg = this.state.elementParentId;
                                const parsedView = this.state.parsedView;
                                const type = parsedView.info?.type;
                                const headerId = parsedView.info?.headerId;
                                const header = parsedView.info?.header;
                                this.handleExecSpec(viewIdArg, parentIdArg, type, headerId, header);
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    handleExecSpec(viewId, parentId, type, headerId, header) {
        ConsoleHelper(
            `handleExecSpec: viewId = ${viewId} parentId = ${parentId}  parentId = ${type}  parentId = ${headerId}  parentId = ${header}`
        );
        const saveElement = {listId: this.state.selectedRowKeys};
        ConsoleHelper(`handleExecSpec: element to save = ${JSON.stringify(saveElement)}`);
        this.specExec(viewId, parentId, saveElement, type, headerId, header);
    }

    //override
    specExec = (viewId, parentId, saveElement, type, headerId, header) => {
        this.blockUi();
        this.crudService
            .executeSpec(viewId, parentId, saveElement, type, headerId, header, this.state.numberOfCopies)
            .then((saveResponse) => {
                let validArray = this.createValidArray(saveResponse.data);
                let res = this.setFakeIds(validArray);
                const parsedGridViewData = this.props?.parsedGridViewData;
                if (parsedGridViewData) {
                    const foundedElementToSetLine = parsedGridViewData.find((el) => {
                        return parseInt(el._ID) === parseInt(res[0]._ID_PARENT);
                    });
                    foundedElementToSetLine
                        ? this.setLinesForChild(res, foundedElementToSetLine._LINE_COLOR_GRADIENT)
                        : this.setLinesForChild(res);
                } else {
                    this.setLinesForChild(res);
                }
                this.props.handleAddElements(res);
                this.props.onHide();
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };

    setLinesForChild(array, prevGradients) {
        const clonedPrevGradients = structuredClone(prevGradients);

        if (clonedPrevGradients) {
            clonedPrevGradients.sort(function (a, b) {
                return b - a;
            });
            array.forEach((el) => {
                el._LINE_COLOR_GRADIENT = structuredClone(clonedPrevGradients);
                el._LINE_COLOR_GRADIENT.push(el._LINE_COLOR_GRADIENT[el._LINE_COLOR_GRADIENT.length - 1] - 10);
                // raczej nie potrzebny ten set ale w razie czego moze byc
                const set = [...new Set(el._LINE_COLOR_GRADIENT)];
                el._LINE_COLOR_GRADIENT = [...set];
            });
        } else {
            array.forEach((el) => {
                el._LINE_COLOR_GRADIENT = [100];
            });
        }
    }

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
                    handleFormula={() => {
                        this.caclulateFormula();
                    }}
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
        let parsedData = this.state?.parsedData;
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.renderHeaderLeft}
                        <div id='spec-edit-dialog'>
                            {!this.state.changingTab ? (
                                <TreeViewComponent
                                    handleChaningTab={() => {
                                        this.setState({
                                            changingTab: !this.state.changingTab,
                                        });
                                    }}
                                    ref={this.refTreeList}
                                    id={this.props.id}
                                    allowOperations={false}
                                    elementParentId={this.state.elementParentId}
                                    isAddSpec={true}
                                    preloadEnabled={false}
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
                                        if (type === 'METHODS' || type === 'TEMPLATES') {
                                            header = false;
                                            this.setState({
                                                isSubView: true,
                                            });
                                        }
                                        this.unselectAllDataGrid();
                                        this.getViewAddSpec(viewId, parentId, recordId, type, header, id);
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
                                    handleUnblockUi={() => this.unblockUi()}
                                    handleShowEditPanel={(editDataResponse) =>
                                        this.handleShowEditPanel(editDataResponse)
                                    }
                                    handleSelectedRowKeys={(e) => {
                                        this.setState((prevState) => {
                                            return {
                                                ...prevState,
                                                selectedRowKeys: e,
                                            };
                                        });
                                    }}
                                    modifyParsedGridViewData={(newCopyRow) => {
                                        parsedData.forEach((el) => {
                                            if (el.ID === newCopyRow.ID) {
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
                            ) : null}
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
    visibleAddSpec: false,
};

AddSpecContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
    visibleAddSpec: PropTypes.bool.isRequired,
};

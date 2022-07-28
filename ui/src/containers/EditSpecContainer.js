import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import Constants from "../utils/Constants";
import ConsoleHelper from "../utils/ConsoleHelper";
import DataTreeStore from "./dao/DataTreeStore";
import TreeViewComponent from "./treeGrid/TreeViewComponent";
import {SelectBox} from "devextreme-react";
import AppPrefixUtils from "../utils/AppPrefixUtils";
import ActionButton from "../components/ActionButton";
import DivContainer from "../components/DivContainer";
import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";
import ActionButtonWithMenuUtils from '../utils/ActionButtonWithMenuUtils';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class EditSpecContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('EditSpecContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.dataTreeStore = new DataTreeStore();
        this.refTreeList = React.createRef();
        this.messages = React.createRef();
        this.state = {
            loading: true,
            elementParentId: null,
            elementRecordId: null,
            elementFilterId: null,
            parsedData: null,
            columns: [],
            selectedRowKeys: [],
        };
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.blockUi();
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
        ConsoleHelper(`EditSpecContainer::componentDidMount -> id=${id}, parentId = ${parentId} recordId = ${recordId} filterId = ${filterId}`);
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
        ConsoleHelper('EditSpecContainer::componentDidUpdate -> updateData={%s} updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}', updatePage, prevProps.id, this.props.id, s1, s2, s3);
        if (updatePage) {
            this.setState({
                elementId: id,
                elementParentId: parentId,
                elementRecordId: recordId,
                elementFilterId: filterId, //z dashboardu
            }, () => {
                this.downloadData(id, this.state.elementParentId, this.state.elementRecordId, this.state.elementFilterId);
            });
        } else {
            return false;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, parentId, recordId, filterId) {
        ConsoleHelper(`EditSpecContainer::downloadData: viewId=${viewId}, parentId=${parentId}, recordId=${recordId}, filterId=${filterId}`);
        this.getViewById(viewId, parentId, recordId, filterId);
    }

    getViewById(viewId, parentId, recordId, filterId) {
        this.setState({loading: true,}, () => {
            this.viewService
                .getViewSpec(viewId, parentId)
                .then((responseView) => {
                    let refactorResponseView = {
                        ...responseView,
                        viewInfo: {
                            id: responseView.editInfo.viewId,
                            name: responseView.editInfo.viewName,
                            parentId: responseView.editInfo.parentId,
                            type: 'gridView',
                            kindView: "ViewSpec"
                        },
                        gridColumns: [{
                            groupName: '',
                            freeze: '',
                            columns: responseView.listColumns,
                        }],
                        gridOptions: responseView.listOptions,
                        editInfo: undefined,
                        listColumns: undefined,
                        listOptions: undefined
                    }
                    this.processingViewResponse(refactorResponseView, parentId, recordId)
                }).catch((err) => {
                console.error('Error getViewSpec in EditSpec. Exception = ', err);
                this.setState({loading: false,}, () => {
                    this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                });
            }).finally(() => {
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
            this.setState(() => ({
                parsedView: responseView,
                columns: columnsTmp,
                pluginsList: pluginsListTmp,
                documentsList: documentsListTmp,
                batchesList: batchesListTmp,
                filtersList: filtersListTmp
            }), () => {
                //const initFilterId = responseView?.viewInfo?.filterdId;
                const viewIdArg = this.state.elementId;
                const parentIdArg = this.state.elementParentId;
                const recordIdArg = this.state.elementRecordId;
                //const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                this.dataTreeStore.getDataTreeStoreDirect(viewIdArg, parentIdArg, recordIdArg).then(res => {
                    this.setState({
                        loading: false,
                        parsedData: res.data
                    });
                })
            });
        }
    }

    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_FILTER':
                    return (<React.Fragment>
                        {this.state.filtersList?.length > 0 ? (
                            <SelectBox
                                id={`combo_filters` + index}
                                items={this.state.filtersList}
                                className={`filter-combo ${margin}`}
                                wrapItemText={true}
                                displayExpr='label'
                                valueExpr='id'
                                value={parseInt(this.state.elementFilterId || this.state.parsedView?.viewInfo?.filterdId)}
                                onValueChanged={(e) => {
                                    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                    if (!!e.value && e.value !== e.previousValue) {
                                        const filterId = parseInt(e.value)
                                        const parentId = UrlUtils.getURLParameter('parentId') || this.state.elementParentId;
                                        const recordId = UrlUtils.getURLParameter('recordId') || this.state.elementRecordId;
                                        const breadCrumbs = UrlUtils.getURLParameter('bc');
                                        if (!breadCrumbs) return;
                                        ConsoleHelper(`Redirect -> Id =  ${this.state.elementId} ParentId = ${parentId} RecordId = ${recordId} FilterId = ${filterId}`);
                                        if (filterId) {
                                            window.location.href = AppPrefixUtils.locationHrefUrl(`/#/edit-spec/${this.state.elementId}/?parentId=${parentId}&recordId=${recordId}&filterId=${filterId}${currentBreadcrumb}`);
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
                            id={`button_batches_` + index}
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
                            id={`button_documents` + index}
                            className={`${margin}`}
                            iconName={operation?.iconCode || 'mdi-file-document'}
                            items={ActionButtonWithMenuUtils.createItemsWithCommand(this.state.documentsList, undefined, this.handleRightHeadPanelContent, operation.type?.toUpperCase())}
                            title={operation?.label}
                        />
                        {/*) : null}*/}
                    </React.Fragment>)
                case 'OP_PLUGINS':
                    return (<React.Fragment>
                        {this.state.pluginsList?.length > 0 ? (
                            <ActionButtonWithMenu
                                id={`button_plugins` + index}
                                className={`${margin}`}
                                iconName={operation?.iconCode || 'mdi-puzzle'}
                                items={ActionButtonWithMenuUtils.createItemsWithCommand(this.state.pluginsList, undefined, this.handleRightHeadPanelContent, operation.type?.toUpperCase())}
                                title={operation?.label}
                            />
                        ) : null}
                    </React.Fragment>)
                default:
                    return null;
            }
        }
    }

    //override
    renderGlobalTop() {
        return <React.Fragment/>;
    }

    //override
    renderHeaderLeft() {
        return <React.Fragment>
            <DivContainer id='header-left'>
                <div className='font-medium mb-4'>{this.state.parsedView?.viewInfo?.name}</div>
            </DivContainer>
        </React.Fragment>
    }

    //override
    renderHeaderRight() {
        //TODO let operations = this.state.operations;
        //TODO mock
        let operations = [];
        operations.push({type: 'OP_SAVE', label: 'Zapisz'});
        operations.push({type: 'OP_ADD', label: 'Dodaj'});
        //TODO mock end
        let opAdd = DataGridUtils.containsOperationsButton(operations, 'OP_ADD');
        let opSave = DataGridUtils.containsOperationsButton(operations, 'OP_SAVE');
        return <React.Fragment>
            <ActionButton rendered={!!opAdd} label={opAdd?.label}
                          className="ml-2"
                          handleClick={(e) => {
                              let newElement = {};
                              const listColumns = this.state.parsedView.gridColumns[0].columns;
                              listColumns?.forEach(column => {
                                  switch (column?.type) {
                                      default:
                                          newElement[column?.fieldName] = '';
                                  }
                              });
                              //TODO generatorek ID
                              newElement['ID'] = Math.random().toString(16).slice(2);
                              let addParsedView = this.state.parsedData || [];
                              addParsedView.push(newElement);
                              this.setState({parsedData: addParsedView}, () => {
                                  this.refreshTable();
                              });
                          }}/>
            <ActionButton rendered={!!opSave} label={opSave?.label}
                          className="ml-2"
                          handleClick={(e) => {
                              const viewIdArg = this.state.elementId;
                              const parentIdArg = this.state.elementParentId;
                              this.handleEditSpecSave(viewIdArg, parentIdArg);
                          }}/>
        </React.Fragment>
    }

    handleEditSpecSave(viewId, parentId) {
        ConsoleHelper(`handleEditSpecSave: viewId = ${viewId} parentId = ${parentId}`)
        const saveElement = this.createObjectToSave(this.state.parsedData);
        ConsoleHelper(`handleEditSpecSave: element to save = ${JSON.stringify(saveElement)}`)
        this.specSave(viewId, parentId, saveElement, false);
    }

    //override
    createObjectToSave(rowArray) {
        let arrayTmp = [];
        for (let row of rowArray) {
            let rowArray = [];
            for (let field in row) {
                rowArray.push({'fieldName': field, 'value': row[field]});
            }
            arrayTmp.push(rowArray);
        }
        return arrayTmp;
    }

    //override
    specSave = (viewId, parentId, saveElement, confirmSave) => {
        this.blockUi();
        this.crudService
            .saveSpec(viewId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                switch (saveResponse.status) {
                    case 'OK':
                        if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => {
                                }
                            })
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        }
                        break;
                    case 'NOK':
                        if (!!saveResponse.question) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.question?.text,
                                header: saveResponse?.question?.title,
                                icon: 'pi pi-question-circle',
                                acceptLabel: localeOptions('accept'),
                                rejectLabel: localeOptions('reject'),
                                accept: () => this.specSave(viewId, parentId, saveElement, true),
                                reject: () => undefined,
                            })
                        } else if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => undefined
                            })
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        }
                        break;
                    default:
                        if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        } else {
                            this.showErrorMessages(saveResponse);
                        }
                        break;
                }
                // this.refreshView();
                this.unblockUi();
            }).catch((err) => {
            this.showGlobalErrorMessage(err);
        });
    }

    //override
    renderHeaderContent() {
    }

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
                    leftContent={(<React.Fragment>
                        {this.state.parsedView?.operations.map((operation, index) => {
                            return <div key={index}>{this.renderButton(operation, index)}</div>;
                        })}
                    </React.Fragment>)}
                    rightContent={<React.Fragment>
                        <ShortcutsButton items={this.state.parsedView?.shortcutButtons} maxShortcutButtons={5}/>
                    </React.Fragment>}
                    handleDelete={() => this.delete()}
                    handleAddLevel={() => this.publish()}
                    handleUp={() => this.up()}
                    handleDown={() => this.down()}
                    handleRestore={() => this.restore()}
                    handleCopy={() => this.copy()}
                    handleArchive={() => this.archive()}
                    handlePublish={() => this.publish()}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleBlockUi={() => this.blockUi()}
                />
            </React.Fragment>
        );
    }

    //override
    delete(id) {
        this.refTreeList?.instance?.beginCustomLoading();
        if (!!id) {
            this.deleteSingleRow(id);
        } else {
            this.state.selectedRowKeys.forEach((id) => {
                this.deleteSingleRow(id);
            });
        }
        this.refTreeList?.instance?.endCustomLoading()
    }

    //usunięcie pojedyńczego rekordu
    deleteSingleRow(id) {
        let data = this.getData();
        const index = data.findIndex(x => x.ID === id);
        if (index !== undefined) {
            data.splice(index, 1);
            this.updateData(data, () => {
                this.refreshTable();
            });
        }
    }

    //metoda przenosi rekord o poziom wyżej
    up(id) {
        this.refTreeList?.instance?.beginCustomLoading();
        let data = this.getData();
        const index = data.findIndex(x => x.ID === id);
        if (index !== undefined) {
            this.move(data, index, index - 1);
            this.updateData(data, () => {
                this.disableAllSort();
                this.refreshTable();
            });
        }
        this.refTreeList?.instance?.endCustomLoading()
    }

    //metoda przenosi rekord o poziom niżej
    down(id) {
        this.refTreeList?.instance?.beginCustomLoading();
        let data = this.getData();
        const index = data.findIndex(x => x.ID === id);
        if (index !== undefined) {
            this.move(data, index, index + 1);
            this.updateData(data, () => {
                this.disableAllSort();
                this.refreshTable();
            });
        }
        this.refTreeList?.instance?.endCustomLoading()
    }

    updateData(dataToUpdate, callbackAction) {
        this.setState({parsedData: dataToUpdate}, () => {
            if (!!callbackAction) callbackAction();
        });
    }

    //metoda usuwa wszytkie sortowania z kolumn
    disableAllSort() {
        this.refTreeList?.instance?.clearSorting();
    }

    //metoda pobiera aktualne stan danych komponentu
    getData() {
        return this.state.parsedData;
    }

    refreshTable(callbackAction) {
        this.refTreeList?.instance?.refresh();
        if (!!callbackAction) callbackAction();
    }

    move(array, initialIndex, finalIndex) {
        return array.splice(finalIndex, 0, array.splice(initialIndex, 1)[0]);
    }

    //override
    renderContent = () => {
        return (<React.Fragment>
            {this.state.loading ? null : (<React.Fragment>
                {/*{this.state.parsedData.map((el) => el.ID).join(", ")}*/}
                <div id="spec-edit">
                    <TreeViewComponent
                        id={this.props.id}
                        elementParentId={this.state.elementParentId}
                        elementRecordId={this.state.elementRecordId}
                        handleOnTreeList={(ref) => this.refTreeList = ref}
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
                        handleSelectedRowKeys={(e) =>
                            this.setState(prevState => {
                                return {
                                    ...prevState,
                                    selectedRowKeys: e
                                }
                            })}
                        handleDeleteRow={(id) => this.delete(id)}
                        handleAddLevel={(id) => alert(id)}
                        handleUp={(id) => this.up(id)}
                        handleDown={(id) => this.down(id)}
                        handleRestoreRow={(id) => this.restore(id)}
                        handleCopyRow={(id) => this.copy(id)}
                        handleDocumentsRow={(id) => {
                            this.generate(id)
                        }}
                        handlePluginsRow={(id) => {
                            this.plugin(id)
                        }}
                        handleArchiveRow={(id) => this.archive(id)}
                        handlePublishRow={(id) => this.publish(id)}
                        showErrorMessages={(err) => this.showErrorMessages(err)}
                        labels={this.props.labels}
                    />
                </div>
            </React.Fragment>)}
        </React.Fragment>)
    }

    //override
    handleEditRowChange(inputType, event, rowId, info) {
    }

    //override
    handleEditRowBlur(inputType, event, groupName, viewInfo, field) {
        ConsoleHelper(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        this.handleEditRowChange(inputType, event, groupName, viewInfo, field);
    }

    getMessages() {
        return this.messages;
    }

}

EditSpecContainer.defaultProps = {
    viewMode: 'VIEW'
}

EditSpecContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
}

import {SelectBox, Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import DataGrid, {Column,} from 'devextreme-react/data-grid';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButton from '../components/ActionButton';
import ActionButtonWithMenu from '../components/ActionButtonWithMenu';
import EditRowComponent from '../components/EditRowComponent';
import HeadPanel from '../components/HeadPanel';
import ShortcutButton from '../components/ShortcutButton';
import ShortcutsButton from '../components/ShortcutsButton';
import EditService from '../services/EditService';
import ViewService from '../services/ViewService';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {GridViewUtils} from '../utils/GridViewUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import DataGridStore from './dao/DataGridStore';
import {confirmDialog} from "primereact/confirmdialog";
import Constants from "../utils/Constants";
import {localeOptions} from "primereact/api";
import GridViewComponent from "./dataGrid/GridViewComponent";
import EditRowUtils from "../utils/EditRowUtils";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class GridViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        console.log('GridViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.editService = new EditService();
        this.dataGridStore = new DataGridStore();
        this.dataGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            elementSubViewId: null,
            elementRecordId: null,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: [],
            batchesList: [],
            viewTypes: [],
            viewType: null,
            subView: null,
            viewInfoTypes: [],
            visibleEditPanel: false,
            modifyEditData: false,
            editData: null,
        };
        this.viewTypeChange = this.viewTypeChange.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.onTabsSelectionChanged = this.onTabsSelectionChanged.bind(this);
        this.onFilterChanged = this.onFilterChanged.bind(this);
        this.handleEditRowChange = this.handleEditRowChange.bind(this);
        this.handleEditRowSave = this.handleEditRowSave.bind(this);
        this.handleEditRowBlur = this.handleEditRowBlur.bind(this);
        this.handleAutoFillRowChange = this.handleAutoFillRowChange.bind(this);
        this.handleCancelRowChange = this.handleCancelRowChange.bind(this);
    }


    componentDidMount() {
        console.log('GridViewContainer::componentDidMount -> path ', window.location.pathname);
        this._isMounted = true;
        const id = this.props.id;
        const subViewId = this.props.subViewId;
        const recordId = this.props.recordId;
        const filterId = this.props.filterId;
        const viewType = this.props.viewType;
        console.log(`GridGridViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`);
        this.setState({
                elementSubViewId: subViewId,
                elementRecordId: recordId,
                elementFilterId: filterId,
                viewType: viewType,
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

    //@override
    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData(viewId, recordId, subviewId, filterId, viewType) {
        console.log(
            `GridGridViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, subViewId=${subviewId}, viewType=${viewType}`
        );
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode) {
            this.viewService
                .getSubView(viewId, recordId)
                .then((subViewResponse) => {
                    const elementSubViewId = subviewId ? subviewId : subViewResponse.subViews[0]?.id;
                    if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                        this.showErrorMessages('Brak podwidoków - niepoprawna konfiguracja!');
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
                    this.showErrorMessages(err);
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
                            //console.log('GridViewContainer -> fetch columns: ', gridViewColumnsTmp);
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
                                                `/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${e.item?.id}`
                                            );
                                        } else {
                                            console.log(
                                                `Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${e.item?.id}`
                                            );
                                            if (!!e.item?.id) {
                                                const filterId = parseInt(e.item?.id)
                                                window.location.href = AppPrefixUtils.locationHrefUrl(
                                                    `/#/grid-view/${this.state.elementId}/?filterId=${filterId}`
                                                );
                                            }
                                        }
                                    },
                                });
                            }
                            let viewInfoTypesTmp = [];
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
                                    viewType: responseView?.viewInfo?.type,
                                    parsedGridView: responseView,
                                    gridViewColumns: gridViewColumnsTmp,
                                    pluginsList: pluginsListTmp,
                                    documentsList: documentsListTmp,
                                    batchesList: batchesListTmp,
                                    filtersList: filtersListTmp,
                                    selectedRowKeys: [],
                                    viewInfoTypes: viewInfoTypesTmp,
                                    packageRows: responseView?.viewInfo?.dataPackageSize,
                                }),
                                () => {
                                    const initFilterId = responseView?.viewInfo?.filterdId;
                                    this.setState({loading: true}, () => {
                                        let res = this.dataGridStore.getDataGridStore(
                                            this.state.subView == null
                                                ? this.state.elementId
                                                : this.state.elementSubViewId,
                                            this.state.viewType,
                                            this.state.subView == null ? null : this.state.elementRecordId,
                                            !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId,
                                            (err) => {
                                                this.showErrorMessages(err);
                                            },
                                            () => {
                                                this.setState({
                                                    blocking: false,
                                                });
                                            },
                                            () => {
                                                this.setState({
                                                    blocking: true,
                                                });
                                            }
                                        );
                                        this.setState({
                                            loading: false,
                                            parsedGridViewData: res
                                        });
                                    });
                                }
                            );
                        }
                    })
                    .catch((err) => {
                        console.error('Error getView in GridView. Exception = ', err);
                        this.setState({loading: false,}, () => {
                                this.showErrorMessages(err);
                            }
                        );
                    });
            }
        );
    }

    //override
    getViewInfoName() {
        return this.state.parsedGridView?.viewInfo?.name;
    }

    viewTypeChange(e) {
        let newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), 'viewType', e.itemData.type);
        window.history.replaceState('', '', newUrl);
        this.setState({viewType: e.itemData.type}, () => {
            this.downloadData(
                this.state.elementId,
                this.state.elementRecordId,
                this.state.elementSubViewId,
                this.state.elementFilterId,
                this.state.viewType
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
                        onCancel={this.handleCancelRowChange}
                        validator={this.validator}
                        onHide={(e) => !!this.state.modifyEditData ? confirmDialog({
                            message: 'Czy na pewno chcesz zamknąć edycję?',
                            header: 'Potwierdzenie',
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

    handleEditRowSave(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
        const saveElement = this.editService.createObjectToSave(this.state);
        console.log(`handleEditRowSave: element to save = ${JSON.stringify(saveElement)}`)
        this.rowSave(viewId, recordId, parentId, saveElement, false);
    }

    rowSave = (viewId, recordId, parentId, saveElement, confirmSave) => {
        this.blockUi();
        this.editService
            .save(viewId, recordId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                switch (saveResponse.status) {
                    case 'OK':
                        if (!!saveResponse.message) {
                            confirmDialog({
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => this.setState({visibleEditPanel: false})
                            })
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        } else {
                            this.setState({visibleEditPanel: false});
                        }
                        break;
                    case 'NOK':
                        if (!!saveResponse.question) {
                            confirmDialog({
                                message: saveResponse?.question?.text,
                                header: saveResponse?.question?.title,
                                icon: 'pi pi-question-circle',
                                acceptLabel: localeOptions('accept'),
                                rejectLabel: localeOptions('reject'),
                                accept: () => this.rowSave(viewId, recordId, parentId, saveElement, true),
                                reject: () => undefined,
                            })
                        } else if (!!saveResponse.message) {
                            confirmDialog({
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
                this.unblockUi();
            }).catch((err) => {
            if (!!err.error) {
                this.showResponseErrorMessage(err);
            } else {
                this.showErrorMessages(err);
            }
        });
    }

    handleAutoFillRowChange(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
        this.blockUi();
        const autofillBodyRequest = this.editService.createObjectToAutoFill(this.state);
        this.editService
            .getEditAutoFill(viewId, recordId, parentId, autofillBodyRequest)
            .then((editAutoFillResponse) => {
                let arrayTmp = editAutoFillResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndAutoFill(editData, element.fieldName, element.value);
                })
                this.setState({editData: editData});
                this.unblockUi();
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    handleCancelRowChange(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
    }

    handleEditRowChange(inputType, event, groupName, viewInfo, forceRefreshFieldVisibility = false) {
        console.log(`handleEditRowChange inputType=${inputType} groupName=${groupName}`);
        console.log(event)
        let editData = this.state.editData;
        let groupData = editData.editFields.filter((obj) => {
            return obj.groupName === groupName;
        });
        let varName;
        let varValue;
        let startRefreshFieldVisibility = true;
        console.clear();
        console.log(event)
        if (event !== undefined) {
            switch (inputType) {
                case 'IMAGE64':
                    varName = event == null ? null : event.fieldName;
                    varValue = event == null ? '' : event.base64[0];
                    break;
                case 'MULTI_IMAGE64':
                    varName = event == null ? null : event.fieldName;
                    varValue = event == null ? '' : event.base64;
                    break;
                case 'CHECKBOX':
                    varName = event.target.name;
                    varValue = event.checked ? event.checked : false;
                    break;
                case 'EDITOR':
                    varName = event.name;
                    varValue = event.value || event.value === '' ? event.value : undefined;
                    startRefreshFieldVisibility = false;
                    break;
                case 'TEXT':
                case 'AREA':
                    varName = event.target?.name;
                    varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                    startRefreshFieldVisibility = false;
                    break;
                default:
                    varName = event.target?.name;
                    varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                    break;
            }
            console.log('handleEditRowChange - ', inputType, varName, varValue);
            let field = groupData[0]?.fields.filter((obj) => {
                return obj.fieldName === varName;
            });
            if (!!field && !!field[0]) {
                field[0].value = varValue;
            }
            if (!!field[0]
                && !!field[0]?.selectionList
                && (startRefreshFieldVisibility || forceRefreshFieldVisibility)) {
                this.refreshFieldVisibility(viewInfo);
            }
            this.setState({editData: editData, modifyEditData: true});
        } else {
            console.log('handleEditRowChange implementation error');
        }
    }

    handleEditRowBlur(inputType, event, groupName, viewInfo) {
        console.log(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        if (inputType === 'EDITOR') {
            this.refreshFieldVisibility(viewInfo);
        } else {
            this.handleEditRowChange(inputType, event, groupName, viewInfo, true);
        }
    }

    refreshFieldVisibility(viewInfo) {
        const refreshObject = this.editService.createObjectToRefresh(this.state)
        this.editService
            .refreshFieldVisibility(viewInfo.viewId, viewInfo.recordId, viewInfo.parentId, refreshObject)
            .then((editRefreshResponse) => {
                let arrayTmp = editRefreshResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndRefreshVisibility(editData, element.fieldName, element.hidden);
                })
                this.setState({editData: editData});
                this.unblockUi();
            })
            .catch((err) => { //zjadam
            });
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
                <ActionButton rendered={opADD} label={opADD?.label}/>
            </React.Fragment>
        );
    }

    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons} maxShortcutButtons={5}/>
            </React.Fragment>
        );
    }

    onFilterChanged(e) {
        console.log('onValueChanged', e);
        if (!!e.value && e.value !== e.previousValue) {
            const filterId = parseInt(e.value)
            window.location.href = AppPrefixUtils.locationHrefUrl(
                `/#/grid-view/${this.state.elementId}/?filterId=${filterId}`
            );
        }
    }

    leftHeadPanelContent = () => {
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
                        onValueChanged={this.onFilterChanged}
                        stylingMode='underlined'
                    />
                ) : null}
                <ButtonGroup
                    className={`${centerElementStyle}`}
                    items={this.state.viewInfoTypes}
                    keyExpr='type'
                    stylingMode='outlined'
                    selectedItemKeys={this.state.viewType}
                    onItemClick={this.viewTypeChange}
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


    //override
    renderHeadPanel = () => {
        const viewId = this.getRealViewId();
        return (
            <React.Fragment>
                <HeadPanel
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedGridView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleDelete={() => {
                        console.log('handleDelete');
                        confirmDialog({
                            message: 'Czy na pewno chcesz usunąć zaznaczone rekordy?',
                            header: 'Potwierdzenie',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                this.editService.delete(viewId, this.state.selectedRowKeys)
                                    .then((deleteResponse) => {
                                        this.unselectedDataGrid();
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
                        console.log('handleRestore');
                        confirmDialog({
                            message: 'Czy na pewno chcesz przywrócić zaznaczone rekordy?',
                            header: 'Potwierdzenie',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                this.editService.restore(viewId, this.state.selectedRowKeys)
                                    .then((restoreResponse) => {
                                        this.unselectedDataGrid();
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
                        console.log('handleCopy');
                        confirmDialog({
                            message: 'Czy na pewno chcesz przywrócić zaznaczone rekordy?',
                            header: 'Potwierdzenie',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                this.editService.copy(viewId, parentId, this.state.selectedRowKeys)
                                    .then((copyResponse) => {
                                        this.unselectedDataGrid();
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
                        console.log('handleArchive');
                        confirmDialog({
                            message: 'Czy na pewno chcesz przenieść do archiwum zaznaczone rekordy?',
                            header: 'Potwierdzenie',
                            icon: 'pi pi-exclamation-triangle',
                            acceptLabel: localeOptions('accept'),
                            rejectLabel: localeOptions('reject'),
                            accept: () => {
                                this.blockUi();
                                const parentId = this.state.parsedGridView?.viewInfo.parentId;
                                this.editService.archive(viewId, parentId, this.state.selectedRowKeys)
                                    .then((archiveResponse) => {
                                        this.unselectedDataGrid();
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
        this.dataGrid.instance.getDataSource().reload();
    }

    unselectedDataGrid() {
        this.dataGrid.instance.deselectAll();
        this.setState({
            selectedRowKeys: {}
        });
    }

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
        const viewId = this.state.subView?.viewInfo?.id;
        const recordId = this.state.subView?.headerData[0]?.ID;
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
                                            onCellPrepared={GridViewUtils.onCellPrepared(c)}
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
                                    onCellPrepared={(element, info) => {
                                        ReactDOM.render(
                                            <div>
                                                <ShortcutButton
                                                    id={`${info.column.headerId}_menu_button`}
                                                    className={`action-button-with-menu`}
                                                    iconName={'mdi-pencil'}
                                                    handleClick={() => {
                                                        this.blockUi();
                                                        this.editService
                                                            .getEdit(viewId, recordId)
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
                                                    }}
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
        return (
            <a
                href={AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}/?recordId=${recordId}&subview=${subViewId}`
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
                window.location.href = AppPrefixUtils.locationHrefUrl(
                    `/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}`
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
    render() {
        return (
            <React.Fragment>
                {this.renderContent()}
            </React.Fragment>
        );
    }

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        <GridViewComponent
                            id={this.props.id}
                            elementSubViewId={this.state.elementSubViewId}
                            handleOnInitialized={(ref) => this.dataGrid = ref}
                            parsedGridView={this.state.parsedGridView}
                            parsedGridViewData={this.state.parsedGridViewData}
                            gridViewColumns={this.state.gridViewColumns}
                            selectedRowKeys={this.state.selectedRowKeys}
                            handleBlockUi={() => this.blockUi}
                            handleUnblockUi={() => this.unblockUi}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            packageRows={this.state.packageRows}
                            handleShowEditPanel={(editDataResponse) => {
                                this.setState({
                                    visibleEditPanel: true,
                                    modifyEditData: false,
                                    editData: editDataResponse
                                });
                                this.unblockUi();
                            }}
                            handleSelectedRowKeys={(e) => this.setState({selectedRowKeys: e?.selectedRowKeys})}
                            showColumnLines={this.props.showColumnLines}
                            showRowLines={this.props.showRowLines}
                            showBorders={this.props.showBorders}
                            showColumnHeaders={this.props.showColumnHeaders}
                            showFilterRow={this.props.showFilterRow}
                            showSelection={this.props.showSelection}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }

    static defaultProps =
        {
            viewMode: 'VIEW',
            showColumnLines: true,
            showRowLines: true,
            showBorders: true,
            showColumnHeaders: true,
            showFilterRow: true,
            showSelection: true,
        }

    static propTypes =
        {
            id: PropTypes.number.isRequired,
            subViewId: PropTypes.number.isRequired,
            recordId: PropTypes.number.isRequired,
            filterId: PropTypes.number.isRequired,
            viewType: PropTypes.number.isRequired,
            showColumnLines: PropTypes.bool,
            showRowLines: PropTypes.bool,
            showBorders: PropTypes.bool,
            showColumnHeaders: PropTypes.bool,
            showFilterRow: PropTypes.bool,
            showSelection: PropTypes.bool,
        }
}


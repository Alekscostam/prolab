import {SelectBox, Tabs} from 'devextreme-react';
import ButtonGroup from 'devextreme-react/button-group';
import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import EditHeaderDialogComponent from '../components/prolab/EditHeaderDialogComponent';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import Constants from '../utils/Constants';
import $, {data} from 'jquery';
import {localeOptions} from 'primereact/api';
import ConsoleHelper from '../utils/ConsoleHelper';
import LocUtils from '../utils/LocUtils';
import EntryResponseHelper from '../utils/helper/EntryResponseHelper';
import GanttViewComponent from '../containers/gantView/GanttViewComponent';
import PluginListDialog from '../components/prolab/PluginListDialog';
import ActionButtonWithMenuUtils from '../utils/ActionButtonWithMenuUtils';
import {DocumentRowComponent} from '../components/prolab/DocumentRowComponent';
import CopyDialog from '../components/prolab/CopyDialog';
import PublishDialog from '../components/prolab/PublishDialog';
import PublishSummaryDialog from '../components/prolab/PublishSummaryDialog';
import UploadFileDialog from '../components/prolab/UploadFileDialog';
import CardViewInfiniteComponent from '../containers/cardView/CardViewInfiniteComponent';
import DataGridStore from '../containers/dao/DataGridStore';
import DataGanttStore from '../containers/dao/DataGanttStore';
import DataPluginStore from '../containers/dao/DataPluginStore';
import DataTreeStore from '../containers/dao/DataTreeStore';
import DashboardContainer from '../containers/dashboard/DashboardContainer';
import GridViewComponent from '../containers/dataGrid/GridViewComponent';
import DataCardStore from '../containers/dao/DataCardStore';
import {ConfirmDialog} from 'primereact/confirmdialog';
import {StringUtils} from '../utils/StringUtils';
import {saveObjToCookieGlobal} from '../utils/Cookie';
import DataHistoryLogStore from '../containers/dao/DataHistoryLogStore';
import HistoryLogDialog from '../components/prolab/HistoryLogDialog';
import {OperationType} from '../enum/OperationType';
import ReactDOM from 'react-dom/client';
import {QrCodesDialog} from '../components/prolab/QrCodesDialog';
import ActionShortcutWithoutMenu from '../components/prolab/ActionShortcutWithoutMenu';
import SelectedElements from '../components/SelectedElements';
import {ResponseUtils} from '../utils/ResponseUtils';
import {ViewUtils} from '../utils/ViewUtils';
import {PDFViewerDialog} from '../components/prolab/PDFViewerDialog';
import FileTypeUtils from '../utils/FileTypeUtils';
import {TranslationUtils} from '../utils/TranslationUtils';
import {ConfirmPluginDialog} from '../components/prolab/ConfirmPluginDialog';
import {EditFormType} from '../enum/EditFormType';
import EditHeaderComponent from '../components/prolab/EditHeaderComponent';
import CodeService from '../services/CodeService';
import {CodeOperationType} from '../enum/CodeOperationType';
import {handleEdit, handleEditSpec} from '../utils/handler/EditHandler';
import {ConfirmationOperationDialog} from '../components/prolab/ConfirmOperationDialog';
import {SessionStoreUtils} from '../utils/SessionStoreUtils';
import useStore from '../store';
import KeyCombinationDetector from '../utils/KeyCombinationDetector';
import {
    getStore,
    isFirstMethodShowBarCode,
    isSecondMethodShowBarCode,
    isThirdMethodShowBarCode,
} from '../utils/helper/StoreHelper';
import {ArrayUtils} from '../utils/ArrayUtils';

let dataGrid;

export class BaseViewContainer extends BaseContainer {
    _isMounted = false;
    defaultKindView = 'View';

    constructor(props) {
        ConsoleHelper('BaseViewContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.dataGridStore = new DataGridStore();
        this.dataCardStore = new DataCardStore();
        this.codeService = new CodeService();
        this.dataGanttStore = new DataGanttStore();
        this.dataPluginStore = new DataPluginStore();
        this.dataHistoryLogStore = new DataHistoryLogStore();
        this.dataTreeStore = new DataTreeStore();
        this.refDataGrid = React.createRef();
        this.inputRef = React.createRef();
        this.ganttRef = React.createRef();
        this.refCardGrid = React.createRef();
        this.messages = React.createRef();
        this.selectedDataGrid = null;
        this.isAttachment = false;
        this.state = {
            loading: true,
            fileViewer: {
                dialogEnabled: false,
                file: undefined,
                name: undefined,
                type: '',
            },
            totalCounts: undefined,
            elementId: props.id,
            elementSubViewId: null,
            qrCodesDialog: false,
            filtersCached: [],
            visibleAddSpec: false,
            elementRecordId: null,
            elementParentId: null,
            elementKindView: this.defaultKindView,
            elementKindOperation: null,
            elementViewType: '',
            viewMode: props.viewMode,
            parsedGridView: {},
            documentInfo: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            attachmentFiles: [],
            parsedPluginViewData: {},
            pluginId: undefined,
            visibleHistoryLogPanel: false,
            copyId: undefined,
            parsedPluginView: {},
            selectedRowKeys: [],
            parsedCardViewData: {},
            parsedGanttViewData: {},
            publishValues: {},
            publishOptions: {},
            publishSummary: {
                publishedIds: [],
                unpublishedIds: [],
            },
            counterOfCopies: undefined,
            batchesList: [],
            gridViewType: null,
            gridViewTypes: [],
            subView: null,
            attachmentViewInfo: null,
            viewInfoTypes: [],
            visibleEditPanel: false,
            visibleUploadFile: false,
            updateBreadcrumb: true,
            visiblePluginPanel: false,
            visibleCopyDialog: false,
            visiblePublishDialog: false,
            visiblePublishSummaryDialog: false,
            visibleMessagePluginPanel: false,
            modifyEditData: false,
            editData: null,
            copyData: null,
            select: false,
            selectAll: false,
            isSelectAll: false,
            isPluginFirstStep: true,
            dataGridStoreSuccess: false,
            dataPluginStoreSuccess: false,
            confirmationOperation: {
                visible: false,
                fncAfterClickYes: () => {},
                operationType: undefined,
            },
        };
        this.onInitialize = this.onInitialize.bind(this);
        this.getDataByViewResponse = this.getDataByViewResponse.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.handleRightHeadPanelContent = this.handleRightHeadPanelContent.bind(this);
        this.additionalTopComponents = this.additionalTopComponents.bind(this);
        this.executeDocument = this.executeDocument.bind(this);
        this.showCopyView = this.showCopyView.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.unselectAllDataGrid = this.unselectAllDataGrid.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        const subViewId = UrlUtils.getSubViewId();
        const recordId = this.props.recordId || UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        const viewType = UrlUtils.getViewType();
        const parentId = UrlUtils.getParentId();
        const kindView = UrlUtils.getKindView();
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        ConsoleHelper(
            `BaseViewContainer::componentDidMount -> id=${id}, subViewId = ${subViewId}, recordId = ${recordId}, filterId = ${filterId}, viewType=${viewType}`
        );
        const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
        window.history.replaceState('', '', newUrl);
        if (!this.isAttachment) this.openEditRowIfPossible();
        this.registerKeydownEvent();
        this.setState(
            {
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
            },
            () => {
                this.downloadData(
                    id,
                    this.state.elementRecordId,
                    this.state.elementSubViewId,
                    this.state.elementFilterId,
                    this.state.elementParentId,
                    this.state.elementViewType
                );
            }
        );
    }

    removeAttachmentReferenceIfPossible() {
        const prevDataGridGlobalReference = this.state.prevDataGridGlobalReference;
        if (!!prevDataGridGlobalReference && !this.state.isAttachment) {
            window.dataGrid = prevDataGridGlobalReference;
            dataGrid = prevDataGridGlobalReference;
            this.setState({
                prevDataGridGlobalReference: null,
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let id = UrlUtils.getIdFromUrl();
        if (id === undefined) {
            id = this.props.id;
        }

        this.removeAttachmentReferenceIfPossible();
        const subViewId = UrlUtils.getSubViewId();
        const recordId = this.props.recordId || UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        const viewType = UrlUtils.getViewType();
        const force = UrlUtils.getForce();
        const parentId = UrlUtils.getParentId();
        const kindView = UrlUtils.getKindView();
        const firstSubViewMode = !!recordId && !!id && !!!subViewId;
        const fromSubviewToFirstSubView =
            firstSubViewMode &&
            this.state.elementSubViewId &&
            this.state.subView &&
            this.state.subView.subViews &&
            this.state.subView.subViews.length > 0 &&
            this.state.elementSubViewId !== this.state.subView.subViews[0].id;

        const updatePage =
            !!force ||
            !DataGridUtils.equalNumbers(this.state.elementId, id) ||
            (!firstSubViewMode && !DataGridUtils.equalNumbers(this.state.elementSubViewId, subViewId)) ||
            fromSubviewToFirstSubView ||
            !DataGridUtils.equalNumbers(this.state.elementRecordId, recordId);

        if (updatePage || this.state?.attachmentCloseWindow) {
            const newUrl = UrlUtils.deleteParameterFromURL(window.document.URL.toString(), 'force');
            window.history.replaceState('', '', newUrl);
            this.setState(
                {
                    elementId: id,
                    elementSubViewId: subViewId,
                    elementRecordId: recordId,
                    elementFilterId: filterId,
                    elementParentId: parentId,
                    elementKindView: kindView,
                    elementViewType: viewType,
                    dataGridStoreSuccess: false,
                    attachmentCloseWindow: false,
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementRecordId,
                        this.state.elementSubViewId,
                        this.state.elementFilterId,
                        this.state.elementParentId,
                        this.state.elementViewType
                    );
                }
            );
        }
    }

    registerKeydownEvent() {
        window.addEventListener('keydown', this.keyDownFunction);
    }
    unregisterKeydownEvent() {
        window.removeEventListener('keydown', this.keyDownFunction);
    }
    keyDownFunction = (event) => {
        const findKey = this.state?.parsedGridView?.options?.findKey;
        if (!StringUtils.isBlank(findKey)) {
            const keyCombinationDetector = new KeyCombinationDetector(event, findKey);
            if (keyCombinationDetector.isExecuted()) {
                const dialogsOpened = document.getElementsByClassName('p-dialog-mask');
                if (dialogsOpened.length > 1) {
                    event.preventDefault();
                    return;
                }
                this.showBarCode();
                event.preventDefault();
            }
        }
    };
    componentWillUnmount() {
        super.componentWillUnmount();
        if (window?.dataGrid) {
            delete window?.dataGrid;
        }
        this.unregisterKeydownEvent();
    }

    onShowConfirmationOperationDialog(type, fncAfterClickYes) {
        this.setState({
            confirmationOperation: {
                visible: true,
                fncAfterClickYes: fncAfterClickYes,
                operationType: type,
            },
        });
    }
    onHideConfirmationOperationDialog() {
        this.setState({
            confirmationOperation: {
                visible: false,
                fncAfterClickYes: () => {},
                operationType: undefined,
            },
        });
    }

    showAddSpecDialog(recordId) {
        // to overide
    }
    getDataByViewResponse(responseView) {
        // to overide
    }

    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        // to overide
    }

    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        // to overide
    }
    processViewResponse(responseView, parentId, recordId, isSubView) {
        if (this._isMounted) {
            ViewValidatorUtils.validation(responseView);
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            if (this.state.updateBreadcrumb !== false) Breadcrumb.updateView(responseView.viewInfo, id, recordId);
            const gridViewColumnsTmp = this.isGridViewBands(responseView.viewInfo.type)
                ? ResponseUtils.columnsGroupCreate(responseView)
                : ResponseUtils.columnsFromGroupCreate(responseView);
            const pluginsListTmp = ResponseUtils.pluginListCreateAndPass(responseView);
            const documentsListTmp = ResponseUtils.documentListCreateAndPass(responseView);
            const batchesListTmp = ResponseUtils.batchListCreateAndPass(responseView);
            const filtersListTmp = ResponseUtils.filtersListCreateAndPass(responseView);
            Breadcrumb.currentBreadcrumbAsUrlParam();
            const viewInfoTypesTmp = [];
            const cardButton = TranslationUtils.getOpButton(responseView.operations, OperationType.OP_CARDVIEW);
            if (cardButton) {
                viewInfoTypesTmp.push({
                    icon: 'mediumiconslayout',
                    type: 'cardView',
                    hint: cardButton?.label,
                });
            }
            const viewButton = TranslationUtils.getOpButton(responseView.operations, OperationType.OP_GRIDVIEW);
            if (viewButton) {
                viewInfoTypesTmp.push({
                    icon: 'contentlayout',
                    type: 'gridView',
                    hint: viewButton?.label,
                });
            }
            useStore.getState().setCurrentViewType(responseView?.viewInfo?.type);
            this.setState(
                () => ({
                    loading: false, //elementId: this.props.id,
                    gridViewType: responseView?.viewInfo?.type,
                    kindView: responseView?.viewInfo?.kindView,
                    parsedGridView: responseView,
                    // showColumnHeaders: responseView?.gridOptions?.dashboardHeader,
                    gridViewColumns: gridViewColumnsTmp,
                    pluginsList: pluginsListTmp,
                    documentsList: documentsListTmp,
                    batchesList: batchesListTmp,
                    filtersList: filtersListTmp,
                    filtersCached: this.getFilters(),
                    selectedRowKeys: [],
                    viewInfoTypes: viewInfoTypesTmp,
                    packageRows: responseView?.viewInfo?.dataPackageSize,
                    select: false,
                    selectAll: false,
                    isSelectAll: false,
                    visibleEditPanel: false,
                    attachmentViewInfo: null,
                    visibleUploadFile: false,
                    visiblePluginPanel: false,
                    visibleCopyDialog: false,
                    visiblePublishDialog: false,
                    visiblePublishSummaryDialog: false,
                    visibleMessagePluginPanel: false,
                }),
                () => {
                    this.props.handleRenderNoRefreshContent(true);
                    this.props.handleViewInfoName(
                        isSubView ? this.state.subView?.viewInfo?.name : this.state.parsedGridView?.viewInfo?.name
                    );
                    this.props.handleOperations(this.state.parsedGridView?.operations);
                    this.props.handleShortcutButtons(this.state.parsedGridView?.shortcutButtons);
                    this.getDataByViewResponse(responseView, parentId);
                }
            );
        }
    }
    handleRightHeadPanelContent(element) {
        let parentIdArg = this.state.subView == null ? UrlUtils.getParentId() : this.state.elementRecordId;
        if (StringUtils.isBlank(parentIdArg)) {
            parentIdArg = 0;
        }
        const id = this.props.id;
        const elementId = `${element?.id}`;
        switch (element.type) {
            case OperationType.OP_PLUGINS:
            case OperationType.SK_PLUGIN:
                this.plugin(elementId);
                break;
            case OperationType.OP_BATCH:
            case OperationType.SK_BATCH:
                // zapamietanie do cookiesa bo zmieniamy url :(
                const selectedRowKeys = this.state.selectedRowKeys;
                saveObjToCookieGlobal('selectedRowKeys', selectedRowKeys);
                window.location.href = AppPrefixUtils.locationHrefUrl(
                    `/#/batch/${id}?batchId=${elementId}&parentId=${parentIdArg}&bc=${UrlUtils.getBc()}`
                );
                break;
            case OperationType.OP_DOCUMENTS:
            case OperationType.SK_DOCUMENT:
                this.generate(elementId);
                break;
            case OperationType.OP_ATTACHMENTS:
                this.attachment(elementId, element.id === 0);
                break;
            case OperationType.OP_PUBLISH:
            case OperationType.SK_PUBLISH:
                this.publishEntry();
                break;
            case OperationType.OP_HISTORY:
            case OperationType.SK_HISTORY:
                this.historyLog(elementId);
                break;
            case OperationType.OP_ADD:
                this.addView();
                break;
            default:
                return null;
        }
    }
    handleQrCodeResponse = (result) => {
        const viewId = UrlUtils.getIdFromUrlOrAlternative(this.props.id);
        const kindView = UrlUtils.getKindView();
        const parentId = UrlUtils.getParentId();
        if (StringUtils.isBlank(result.listId) || ArrayUtils.isEmpty(result?.listId)) {
            this.unblockUi();
            return;
        }
        switch (result.operation) {
            case CodeOperationType.EDIT:
                this.blockUi();
                handleEdit(
                    this.crudService,
                    viewId,
                    result.listId[0],
                    parentId,
                    kindView,
                    (res) => this.handleShowEditPanel(res),
                    () => this.handleUnBlockUi(),
                    (err) => this.showGlobalErrorMessage(err),
                    false,
                    result?.param
                );
                break;
            case CodeOperationType.EDIT_SPEC:
                this.blockUi();
                handleEditSpec(
                    viewId,
                    parentId,
                    result.listId[0],
                    this.state.parsedGridView,
                    () => this.handleUnBlockUi(),
                    (err) => this.showGlobalErrorMessage(err)
                );
                break;
            case CodeOperationType.FIND:
                const datagridInstance = this.getRefGridView()?.instance;
                if (datagridInstance) {
                    datagridInstance.filter(['ID', 'contains', result.listId[0]]);
                }
                break;
            default:
                break;
        }
    };
    onHideEditPanel = (e, viewId, recordId, parentId) => {
        if (!!this.state.modifyEditData) {
            const confirmDialogWrapper = document.createElement('div');
            confirmDialogWrapper.className = 'confirm-dialog';
            document.body.appendChild(confirmDialogWrapper);
            const root = ReactDOM.createRoot(confirmDialogWrapper);
            root.render(
                <ConfirmDialog
                    closable={false}
                    visible={true}
                    message={LocUtils.locFromStoreWithDefault(
                        'Question_Close_Edit',
                        'Czy na pewno chcesz zamknąć edycję?'
                    )}
                    header={LocUtils.locFromStoreWithDefault('Confirm_Label', 'Potwierdzenie')}
                    icon='pi pi-exclamation-triangle'
                    acceptLabel={localeOptions('accept')}
                    rejectLabel={localeOptions('reject')}
                    accept={() => {
                        this.handleCancelRowChange(viewId, recordId, parentId);
                        this.setState({visibleEditPanel: false});
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                    reject={() => {
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                />
            );
        } else {
            this.setState({visibleEditPanel: e}, () => {
                this.handleCancelRowChange(viewId, recordId, parentId);
            });
        }
    };
    getFilters = () => {
        const filtersInformation = SessionStoreUtils.getFiltersInformation();
        if (SessionStoreUtils.canApplyFilter() && !this.isAttachment && !this.isDashboard()) {
            const filters = this.extractFilters(filtersInformation.filters);
            SessionStoreUtils.clearFiltersInformation();
            return filters;
        }
        this.clearFiltersIfViewChanged(filtersInformation);
        return undefined;
    };
    extractFilters = (rawFilters) => {
        if (!Array.isArray(rawFilters)) return [];

        const isCondition = (el) => Array.isArray(el) && el.length === 3 && !el.some(Array.isArray);
        if (isCondition(rawFilters)) {
            return [rawFilters];
        }

        const collectConditions = (arr) => {
            let result = [];
            for (const el of arr) {
                if (isCondition(el)) {
                    result.push(el);
                } else if (Array.isArray(el)) {
                    result = result.concat(collectConditions(el));
                }
            }
            return result;
        };

        return collectConditions(rawFilters);
    };
    clearFiltersIfViewChanged = (filtersInformation) => {
        if (!filtersInformation) return;
        const viewIdFromCookie = StringUtils.isBlank(filtersInformation?.view?.id) ? null : filtersInformation.view.id;
        const viewIdFromUrl = UrlUtils.getIdFromUrlOrAlternative(null);
        if (viewIdFromCookie !== viewIdFromUrl) {
            SessionStoreUtils.clearFiltersInformation();
        }
    };
    renderGlobalTop() {
        const {parsedPluginView} = this.state;
        const formType = this.state.editData?.editInfo?.editFormType;
        return (
            <React.Fragment>
                {this.state.visibleEditPanel ? (
                    !StringUtils.isBlank(formType) && formType.toUpperCase() === EditFormType.FULLSCREEN ? (
                        <EditHeaderDialogComponent
                            visibleEditPanel={this.state.visibleEditPanel}
                            editData={this.state.editData}
                            kindView={this.state.elementKindView}
                            onChange={this.handleEditRowChange}
                            onBlur={this.handleEditRowBlur}
                            onAttachment={(id) => {
                                this.attachment(id);
                            }}
                            onSave={this.handleEditRowSave}
                            onAutoFill={this.handleAutoFillRowChange}
                            onEditList={this.handleEditListRowChange}
                            onCancel={this.handleCancelRowChange}
                            validator={this.validator}
                            onHide={(e, viewId, recordId, parentId) => {
                                this.onHideEditPanel(e, viewId, recordId, parentId);
                            }}
                            onError={(e) => this.showErrorMessage(e)}
                            showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        />
                    ) : (
                        <EditHeaderComponent
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
                            onAttachment={(id) => {
                                this.attachment(id);
                            }}
                            copyData={this.state.copyData}
                            onCloseCustom={() => {
                                this.setState({
                                    visibleEditPanel: false,
                                });
                            }}
                            onHide={(e, viewId, recordId, parentId) => {
                                this.onHideEditPanel(e, viewId, recordId, parentId);
                            }}
                            onError={(e) => this.showErrorMessage(e)}
                            showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        />
                    )
                ) : null}
                {this.state.visibleDocumentPanel ? (
                    <DocumentRowComponent
                        visibleDocumentPanel={this.state.visibleDocumentPanel}
                        editData={this.state.editData}
                        kindView={this.state.elementKindView}
                        documentInfo={this.state.documentInfo}
                        onChange={this.handleChangeCriteria}
                        onBlur={this.handleChangeCriteria}
                        inputDataFields={this.state.inputDataFields}
                        onApprove={this.executeDocument}
                        onAutoFill={this.handleAutoFillRowChange}
                        validator={this.validator}
                        onHide={() => this.setState({visibleDocumentPanel: false})}
                        onError={(e) => this.showErrorMessage(e)}
                        showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                    />
                ) : null}

                {this.state.visibleCopyDialog ? (
                    <CopyDialog
                        visible={this.state.visibleCopyDialog}
                        onHide={() => this.setState({visibleCopyDialog: false})}
                        isSpecification={this.state.parsedGridView.viewInfo.isSpecification}
                        handleUnselectAllData={this.unselectAllDataGrid}
                        handleCopy={(copyData) => {
                            this.setState({
                                copyData: copyData,
                            });
                            this.copyEntry(this.state.copyId);
                        }}
                    />
                ) : null}
                {this.state.visibleUploadFile ? (
                    <UploadFileDialog
                        visible={this.state.visibleUploadFile}
                        onHide={() => this.setState({visibleUploadFile: false})}
                        upload={(attachmentFiles) => {
                            const options = this.state.parsedGridView.options;
                            const gridView = this.state.parsedGridView;
                            if (options.addFilesAddForm) {
                                this.uploadAttachment(gridView, attachmentFiles[0]);
                                this.setState({
                                    attachmentFiles,
                                });
                            } else {
                                attachmentFiles.forEach((attachmentFile) => {
                                    this.uploadAttachment(gridView, attachmentFile);
                                });
                                this.refreshView();
                            }
                            this.setState({
                                visibleUploadFile: false,
                            });
                        }}
                    />
                ) : null}
                {this.state.visiblePublishDialog ? (
                    <PublishDialog
                        visible={this.state.visiblePublishDialog}
                        onHide={() => {
                            let visiblePublishDialog = false;
                            let visiblePublishSummaryDialog = false;
                            let publishSummary = this.state.publishSummary;
                            const currentSelectedRowKeyId = this.state?.currentSelectedRowKeyId;
                            publishSummary.unpublishedIds.push(currentSelectedRowKeyId);
                            if (this.state.selectedRowKeys.length === 0) {
                                visiblePublishSummaryDialog = true;
                            } else {
                                let selectedRowKeys = this.state.selectedRowKeys.filter(
                                    (rowKey) => rowKey.ID !== currentSelectedRowKeyId
                                );
                                if (selectedRowKeys.length === 0) {
                                    visiblePublishSummaryDialog = true;
                                } else {
                                    this.publishEntry(selectedRowKeys[0].ID);
                                }
                                this.setState({
                                    selectedRowKeys,
                                });
                            }
                            this.unblockUi();
                            this.setState({
                                visiblePublishDialog,
                                visiblePublishSummaryDialog,
                                publishSummary,
                            });
                        }}
                        close={() => this.setState({visiblePublishDialog: false})}
                        handleUnselectAllData={this.unselectAllDataGrid}
                        publishValues={this.state.publishValues}
                        handlePublish={(el) => {
                            this.publish(this.state?.currentSelectedRowKeyId, el);
                        }}
                    />
                ) : null}
                {this.state.visiblePublishSummaryDialog ? (
                    <PublishSummaryDialog
                        publishSummary={this.state.publishSummary}
                        visible={this.state.visiblePublishSummaryDialog}
                        onHide={() =>
                            this.setState({
                                visiblePublishSummaryDialog: false,
                                publishSummary: {
                                    publishedIds: [],
                                    unpublishedIds: [],
                                },
                            })
                        }
                        handleUnselectAllData={this.unselectAllDataGrid}
                    />
                ) : null}
                {this.state.visiblePluginPanel && (
                    <PluginListDialog
                        visible={this.state.visiblePluginPanel}
                        field={this.state.editListField}
                        parsedPluginView={this.state.parsedPluginView}
                        parsedPluginViewData={this.state.parsedPluginViewData}
                        onHide={() => this.setState({visiblePluginPanel: false})}
                        handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                        unselectAllDataGrid={() => {
                            this.setState({
                                selectedRowKeys: [],
                            });
                        }}
                        pluginId={this.state.pluginId}
                        isPluginFirstStep={this.state.isPluginFirstStep}
                        executePlugin={this.executePlugin}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleUnblockUi={() => this.unblockUi}
                        showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        dataGridStoreSuccess={this.state.dataPluginStoreSuccess}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                    />
                )}

                {this.state.visibleHistoryLogPanel ? (
                    <HistoryLogDialog
                        visible={this.state.visibleHistoryLogPanel}
                        field={this.state.editListField}
                        parsedHistoryLogView={this.state.parsedHistoryLogView}
                        parsedHistoryLogViewData={this.state.parsedHistoryLogViewData}
                        onHide={() => this.setState({visibleHistoryLogPanel: false})}
                        handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                        historyLogId={this.state.historyLogId}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleUnblockUi={() => this.unblockUi}
                        showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        dataGridStoreSuccess={this.state.dataHistoryLogStoreSuccess}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                    />
                ) : null}

                {this.state.visibleMessagePluginPanel ? (
                    <ConfirmPluginDialog
                        parsedPluginView={parsedPluginView}
                        onAccept={() => {
                            if (this.state.isPluginFirstStep) {
                                const isThereNextStep = this.state.parsedPluginView?.info?.next;
                                const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
                                const listId = {listId: idRowKeys};
                                const pluginId = this.state.pluginId;
                                if (isThereNextStep) this.executePlugin(pluginId, listId);
                                else this.setState({visibleMessagePluginPanel: false});
                            }
                            this.unselectAllDataGrid(false);
                            this.setState({visibleMessagePluginPanel: false});
                        }}
                        onHide={() => this.setState({visibleMessagePluginPanel: false})}
                        onReject={() => this.setState({visibleMessagePluginPanel: false})}
                    />
                ) : null}

                {this.additionalTopComponents()}
            </React.Fragment>
        );
    }
    additionalTopComponents() {
        // to overide
    }
    async executeDocument(data, viewId, elementId, parentId, recordId) {
        const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
        const requestBody = recordId
            ? {listId: [recordId], data: data}
            : {
                  listId: idRowKeys.length === 0 ? [elementId] : idRowKeys,
                  data: data,
              };
        let info = undefined;
        this.blockUi();
        await this.crudService
            .executeDocument(requestBody, viewId, elementId, parentId)
            .then((res) => {
                if (!res?.info?.fileId) {
                    this.showSuccessMessage(res?.message?.text, undefined, res?.message?.title);
                }
                info = res?.info;
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex);
                this.unblockUi();
            });
        const fileId = info?.fileId;
        const fileName = info?.fileName;
        const isDownload = StringUtils.isBlank(info?.isDownload) ? false : info.isDownload;
        if (isDownload) {
            this.crudService.downloadDocument(viewId, elementId, fileId, fileName);
            this.setState({
                visibleDocumentPanel: false,
            });
        }
        const isPreview = StringUtils.isBlank(info?.isPreview) ? false : info.isPreview;
        if (isPreview) {
            this.showDocumentViewer(viewId, elementId, fileId, fileName);
        }
        this.unblockUi();
    }
    showDocumentViewer = (viewId, elementId, fileId, fileName) => {
        this.crudService
            .getStreamResponseBodyFromDownload(viewId, elementId, fileId, fileName)
            .then((res) => {
                const realName = fileName ? fileName : '';
                const name = (fileName ? fileName : '').toUpperCase();
                const type = FileTypeUtils.getFileType(name);
                this.setState({
                    fileViewer: {
                        dialogEnabled: true,
                        file: res.body,
                        name: realName,
                        type: type,
                    },
                });
            })
            .catch((error) => {
                this.showGlobalErrorMessage(error);
            });
    };

    //override
    renderHeaderRight() {
        return <React.Fragment />;
    }
    //override
    renderHeaderLeft() {
        return <React.Fragment />;
    }
    //to ovveride
    addButtonFunction = () => {
        return <React.Fragment />;
    };
    rightHeadPanelContent = () => {
        if (this.isDashboard()) {
            return <React.Fragment />;
        }
        return (
            <React.Fragment>
                <ShortcutsButton
                    handleClick={(e) => this.handleRightHeadPanelContent(e)}
                    items={this.state.parsedGridView?.shortcutButtons}
                    maxShortcutButtons={5}
                />
            </React.Fragment>
        );
    };
    canNotBeRefreshed() {
        return (
            this.state.kindView === 'View' &&
            (this.state.gridViewType === 'gridView' ||
                this.state.gridViewType === 'cardView' ||
                this.state.gridViewType === 'gantt')
        );
    }
    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case OperationType.OP_FILTER:
                    return (
                        <React.Fragment>
                            {this.state.filtersList?.length > 0 ? (
                                <SelectBox
                                    className={`filter-combo ${margin}`}
                                    wrapItemText={true}
                                    id='combo_filters'
                                    items={this.state.filtersList}
                                    defaultValue={parseInt(
                                        this.state.elementFilterId || this.state.parsedGridView?.viewInfo?.filterdId
                                    )}
                                    displayExpr='label'
                                    valueExpr='id'
                                    onValueChanged={(e) => {
                                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                        if (!!e.value && e.value !== e.previousValue) {
                                            const filterId = parseInt(e.value);
                                            const subViewId = UrlUtils.getSubViewId() || this.state.elementSubViewId;
                                            const recordId = UrlUtils.getRecordId() || this.state.elementRecordId;
                                            const parentId = UrlUtils.getParentId() || this.state.elementParentId;
                                            const subviewMode = !!recordId && !!this.state.elementId;
                                            const breadCrumbs = UrlUtils.getBc();
                                            const viewType = UrlUtils.getViewType() || this.state.gridViewType;
                                            const canNotBeRefresh = this.canNotBeRefreshed() ? false : !breadCrumbs;
                                            if (canNotBeRefresh) {
                                                return;
                                            }
                                            const params = new URLSearchParams();
                                            if (parentId) {
                                                params.append('parentId', parentId);
                                            }
                                            if (subviewMode) {
                                                params.append('recordId', recordId);
                                                params.append('subview', subViewId);
                                                ConsoleHelper(
                                                    `Redirect -> Id = ${
                                                        this.state.elementId
                                                    } SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId} ParentId = ${
                                                        parentId || 'N/A'
                                                    }`
                                                );
                                            } else {
                                                ConsoleHelper(
                                                    `Redirect -> Id = ${
                                                        this.state.elementId
                                                    } FilterId = ${filterId} ParentId = ${parentId || 'N/A'}`
                                                );
                                            }
                                            params.append('filterId', filterId);
                                            params.append('viewType', viewType);
                                            const basePath = `/#/grid-view/${this.state.elementId}`;
                                            window.location.href = AppPrefixUtils.locationHrefUrl(
                                                `${basePath}?${params.toString()}${currentBreadcrumb}`
                                            );
                                            this.setState(
                                                {
                                                    elementFilterId: filterId,
                                                },
                                                () => {
                                                    this.getDataByViewResponse(
                                                        this.state.parsedGridView,
                                                        parentId,
                                                        filterId
                                                    );
                                                }
                                            );
                                        }
                                    }}
                                    stylingMode='underlined'
                                />
                            ) : null}
                        </React.Fragment>
                    );
                case OperationType.OP_BATCH:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id='button_batches'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                        this.state.batchesList,
                                        undefined,
                                        this.handleRightHeadPanelContent,
                                        OperationType.OP_BATCH
                                    )}
                                    title={operation?.label}
                                />
                            )}
                        </React.Fragment>
                    );

                case OperationType.OP_DOCUMENTS:
                    return (
                        <React.Fragment>
                            {this.state.documentsList?.length > 0 ? (
                                <ActionButtonWithMenu
                                    id='button_documents'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-file-document'}
                                    items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                        this.state.documentsList,
                                        undefined,
                                        this.handleRightHeadPanelContent,
                                        OperationType.OP_DOCUMENTS
                                    )}
                                    title={operation?.label}
                                />
                            ) : null}
                        </React.Fragment>
                    );

                case OperationType.OP_PLUGINS:
                    return (
                        <React.Fragment>
                            {this.state.pluginsList?.length > 0 ? (
                                <ActionButtonWithMenu
                                    id='button_plugins'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-puzzle'}
                                    items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                        this.state.pluginsList,
                                        undefined,
                                        this.handleRightHeadPanelContent,
                                        OperationType.OP_PLUGINS
                                    )}
                                    title={operation?.label}
                                />
                            ) : null}
                        </React.Fragment>
                    );
                case OperationType.OP_FORMULA:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id={`button_formula_` + index}
                                    className={`${margin}`}
                                    customEventClick={() => this.prepareCalculateFormula()}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    title={operation?.label}
                                />
                            )}
                        </React.Fragment>
                    );
                case OperationType.OP_ADD_SPEC:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionShortcutWithoutMenu
                                    id='button_add_spec'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    operationType={OperationType.OP_ADD_SPEC}
                                    title={operation?.label}
                                    customEventClick={() => this.showAddSpecDialog()}
                                />
                            )}
                        </React.Fragment>
                    );
                case OperationType.OP_ADD:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionShortcutWithoutMenu
                                    id='button_add'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    operationType={OperationType.OP_ADD}
                                    title={operation?.label}
                                    customEventClick={(el) => this.handleRightHeadPanelContent(el)}
                                />
                            )}
                        </React.Fragment>
                    );
                case OperationType.OP_ADD_FILE:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionShortcutWithoutMenu
                                    id='button_add'
                                    className={`${margin}`}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    operationType={OperationType.OP_ADD}
                                    title={operation?.label}
                                    customEventClick={() => this.addButtonFunction()}
                                />
                            )}
                        </React.Fragment>
                    );
                case OperationType.OP_CARDVIEW:
                case OperationType.OP_GRIDVIEW:
                    return this.viewOperation(index);
                default:
                    return null;
            }
        }
    }
    viewOperation = (index) => {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        const indexInArray = this.state.parsedGridView?.operations?.findIndex(
            (o) =>
                o?.type?.toUpperCase() === OperationType.OP_CARDVIEW ||
                o?.type?.toUpperCase() === OperationType.OP_GRIDVIEW
        );
        if (index > indexInArray) {
            return this.state.viewInfoTypes ? (
                <React.Fragment>
                    <ButtonGroup
                        className={`${margin}`}
                        items={this.state.viewInfoTypes}
                        keyExpr='type'
                        stylingMode='outlined'
                        selectedItemKeys={[this.state.gridViewType]}
                        onItemClick={(e) => {
                            const newUrl = UrlUtils.addParameterToURL(
                                window.document.URL.toString(),
                                'viewType',
                                e.itemData.type
                            );
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
                        }}
                    />
                </React.Fragment>
            ) : null;
        } else {
            return null;
        }
    };
    leftHeadPanelContent = () => {
        if (this.isDashboard()) {
            return <React.Fragment />;
        }
        return (
            <React.Fragment>
                {this.state.parsedGridView?.operations?.map((operation, index) => {
                    return <div key={index}>{this.renderButton(operation, index)}</div>;
                })}
            </React.Fragment>
        );
    };
    isCalendarDateBox(event) {
        try {
            const dateBoxCalendar = event?.target?.parentElement?.parentElement?.parentElement?.parentElement;
            const neededParents = dateBoxCalendar.parentElement?.parentElement?.parentElement?.parentElement;
            if (dateBoxCalendar && neededParents) {
                const classesFromDateBox = dateBoxCalendar?.classList;
                return Array.from(classesFromDateBox).includes('dx-datebox-calendar');
            }
            return false;
        } catch (err) {}
    }
    onInitialize(e) {
        dataGrid = e.component;
        window.dataGrid = dataGrid;
        $(document).keyup((event) => {
            try {
                const keycode = event.keyCode || event.which;
                if (!this.isCalendarDateBox(event)) {
                    this.dataGridStore.clearCache();
                }
                if (this.isNotEnter(keycode)) {
                    return;
                }
                if (!this.isCalendarDateBox(event)) {
                    return;
                }
                if (!this.isCalendarDateBoxValidForFilter(event)) {
                    return;
                }
                const tr = this.getCurrentDataGridByEvent(event);
                const filterArray = this.filterArrayFromInitialize(tr);
                this.dataGridStore.clearCache();
                if (filterArray.length > 0) {
                    this.getRefGridView()?.instance?.filter(filterArray);
                } else {
                    this.getRefGridView()?.instance?.clearFilter('dataSource');
                }
            } catch (err) {
                this.showGlobalErrorMessage(err);
            }
        });
    }
    filterArrayFromInitialize(tr) {
        const filterArray = [];
        for (let index = 0; index < tr.children.length; index++) {
            const child = tr.children[index];
            if (this.isValidChildForFilter(child)) {
                const inputValue = this.getValueFromChild(child);
                if (this.isValidValueFromChild(inputValue)) {
                    const ariaDescribedby = child?.getAttribute('aria-describedby');
                    const columnName = '' + ariaDescribedby?.replace(new RegExp('column_[0-9]+_'), '')?.toUpperCase();
                    if (filterArray.length > 0) {
                        filterArray.push('and');
                    }
                    filterArray.push([columnName, 'contains', inputValue]);
                }
            }
        }
        return filterArray;
    }
    isCalendarDateBoxValidForFilter(event) {
        const inputValue = event.target.value;
        return inputValue === undefined || inputValue === null || inputValue === '' || inputValue.includes('*');
    }
    isNotEnter(keyCode) {
        return keyCode !== 13;
    }
    getCurrentDataGridByEvent(event) {
        return event?.target?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
            ?.parentElement?.parentElement;
    }
    isValidChildForFilter(child) {
        return child?.getAttribute('aria-describedby') !== null && child.className !== 'dx-command-select';
    }
    getValueFromChild(child) {
        return child?.children[0]?.children[1]?.children[0]?.children[0]?.children[1]?.children[0]?.children[0]?.value;
    }
    isValidValueFromChild(inputValue) {
        return inputValue !== undefined && inputValue !== null && inputValue !== '';
    }
    //override
    renderHeadPanel = () => {
        const operations = this.state?.parsedGridView?.operations || [];
        if (this.isDashboard()) {
            return <React.Fragment />;
        }
        const canViewHeaderPanel = ViewUtils.canViewHeaderPanel(this.state?.parsedGridView);
        return (
            <React.Fragment>
                {canViewHeaderPanel ? (
                    <HeadPanel
                        elementId={this.state.elementId}
                        elementRecordId={this.state.elementRecordId}
                        elementSubViewId={this.state.elementSubViewId}
                        elementKindView={this.state.elementKindView}
                        selectedRowKeys={this.state.selectedRowKeys}
                        operations={operations}
                        leftContent={this.leftHeadPanelContent()}
                        rightContent={this.rightHeadPanelContent()}
                        handleFormula={() => this.prepareCalculateFormula()}
                        handleDelete={() =>
                            this.onShowConfirmationOperationDialog(OperationType.OP_DELETE, () => this.delete())
                        }
                        handleRestore={() => this.restore()}
                        handleCopy={() => this.showCopyView()}
                        handleDownload={() => this.downloadAttachment()}
                        handleArchive={() => this.archive()}
                        handlePublish={() => this.publishEntry()}
                        handleUnblockUi={() => this.unblockUi()}
                        showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        handleBlockUi={() => this.blockUi()}
                    />
                ) : (
                    <div className='mb-2'></div>
                )}
            </React.Fragment>
        );
    };
    // callback na zaznaczone elementy
    selectAllDataGrid(selectionValue) {
        if (this.isTypeOfGrid()) {
            this.setState(
                {
                    selectAll: true,
                    isSelectAll: selectionValue,
                    select: false,
                },
                () => {
                    this.getRefGridView()?.instance.clearSelection();
                    this.dataGridStore
                        .getSelectAllDataGridStore(
                            this.state.subView == null ? this.state.elementId : this.state.elementSubViewId,
                            'gridView',
                            this.state.elementRecordId === null
                                ? this.state.elementParentId
                                : this.state.elementRecordId,
                            this.state.elementFilterId,
                            this.state.kindView,
                            this.getRefGridView()?.instance.getCombinedFilter(),
                            undefined,
                            undefined,
                            undefined,
                            (totalCounts) => {
                                this.setState({
                                    totalCounts: totalCounts,
                                });
                            }
                        )
                        .then((result) => {
                            this.setState(
                                {
                                    selectAll: false,
                                    select: false,
                                    selectedRowKeys: result.data,
                                },
                                () => {
                                    this.getRefGridView()?.instance.selectAll();
                                    this.unblockUi();
                                }
                            );
                        })
                        .catch((err) => {
                            this.showGlobalErrorMessage(err);
                        });
                }
            );
        }
    }
    unselectAllDataGrid(selectionValue) {
        this.blockUi();
        if (this.isTypeOfGrid()) {
            this.setState(
                {
                    selectAll: true,
                    isSelectAll: selectionValue,
                    select: false,
                },
                () => {
                    this.dataGridStore.clearCache();
                    this.getRefGridView()?.instance?.deselectAll();
                    this.getRefGridView()?.instance?.clearSelection();
                    this.setState(
                        {
                            selectAll: false,
                            select: false,
                            selectedRowKeys: [],
                        },
                        () => {
                            this.unblockUi();
                        }
                    );
                }
            );
        } else if (this.isGanttView()) {
            this.setState(
                {
                    selectedRowKeys: [],
                },
                () => {
                    this.getRefGanttView()?.current?.uncheckAllData();
                    this.unblockUi();
                }
            );
        } else {
            this.setState(
                {
                    selectedRowKeys: [],
                },
                this.unblockUi()
            );
        }
    }
    //override
    renderHeaderContent() {
        if (this.isDashboard()) {
            return <React.Fragment />;
        }
        return (
            <React.Fragment>
                <div id='subviews-panel'>
                    {this.state.subView != null &&
                    this.state.subView.subViews != null &&
                    this.state.subView.subViews.length > 0 ? (
                        <Tabs
                            onContentReady={(e) => {
                                if (e?.element) {
                                    e.element.children[0].className = 'dx-wrapper';
                                    Array.from(e.element.children[0].children).forEach((child) => {
                                        if (child.classList.contains('dx-tab-selected')) {
                                            child.className = 'dx-item dx-tab dx-tab-selected-item';
                                        }
                                    });
                                }
                            }}
                            dataSource={this.state.subView.subViewsTabs}
                            selectedIndex={this.state.subViewTabIndex}
                            onOptionChanged={(args) => {
                                if (args.name === 'selectedItem') {
                                    if (
                                        args.value?.id &&
                                        args.previousValue !== null &&
                                        args.value?.id !== args.previousValue?.id
                                    ) {
                                        this.state.subView.subViewsTabs.forEach((subView, i) => {
                                            if (subView.id === args.value.id) {
                                                this.setState({subViewTabIndex: i});
                                            }
                                        });

                                        const subViewId = args.value.id;
                                        const parentId = StringUtils.isBlank(UrlUtils.getParentId())
                                            ? ''
                                            : `&parentId=${UrlUtils.getParentId()}`;
                                        const viewInfoId = this.state.subView.viewInfo.id;
                                        const recordId = this.state.elementRecordId;
                                        const kindView = !!this.state.subView.viewInfo?.kindView
                                            ? this.state.subView.viewInfo?.kindView
                                            : this.defaultKindView;
                                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                        window.location.href = AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${viewInfoId}?recordId=${recordId}${parentId}&subview=${subViewId}&kindView=${kindView}${currentBreadcrumb}`
                                        );
                                    }
                                }
                            }}
                            scrollByContent={true}
                            itemRender={(itemData) => {
                                const viewInfoId = this.state.subView.viewInfo?.id;
                                const subViewId = itemData.id;
                                const recordId = this.state.elementRecordId;
                                const parentId = UrlUtils.getParentId();
                                const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                                const parentUrl = StringUtils.isBlank(parentId) ? '' : `&parentId=${parentId}`;
                                return (
                                    <a
                                        href={AppPrefixUtils.locationHrefUrl(
                                            `/#/grid-view/${viewInfoId}?recordId=${recordId}${parentUrl}&subview=${subViewId}${currentBreadcrumb}`
                                        )}
                                        className='subview-tab-item-href'
                                    >
                                        {itemData.text}
                                    </a>
                                );
                            }}
                            showNavButtons={true}
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }
    addView() {
        this.blockUi();
        const subViewId = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentId = this.state.subView == null ? UrlUtils.getParentId() : this.state.elementRecordId;
        const viewId = DataGridUtils.getRealViewId(subViewId, this.props.id);
        this.crudService
            .addEntry(viewId, parentId)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .add(viewId, parentId)
                                .then((editDataResponse) => {
                                    this.setState({
                                        visibleEditPanel: true,
                                        editData: editDataResponse,
                                    });
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi(),
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    openEditRowIfPossible() {
        if (UrlUtils.isEditRowOpen()) {
            setTimeout(() => {
                const editViewId = UrlUtils.getEditViewId();
                const editParentId = UrlUtils.getEditParentId();
                const editRecordId = UrlUtils.getEditRecordId();
                const editKindView = UrlUtils.getEditKindView();
                handleEdit(
                    this.crudService,
                    editViewId,
                    editRecordId,
                    editParentId,
                    editKindView,
                    (editDataResponse) =>
                        this.setState({editData: editDataResponse}, () => this.handleShowEditPanel(editDataResponse)),
                    () => this.unblockUi(),
                    (err) => this.showGlobalErrorMessage(err)
                );
            }, 1000);
        }
    }

    showCopyView(id) {
        this.setState({
            visibleCopyDialog: true,
            copyId: id,
        });
    }

    editSubView(e) {
        const parentId = e.parentId || this.state.elementRecordId;
        const kindView = this.state.elementKindView;
        handleEdit(
            this.crudService,
            e.viewId,
            e.recordId,
            parentId,
            kindView,
            (editDataResponse) => this.setState({editData: editDataResponse, visibleEditPanel: true}),
            () => this.unblockUi(),
            (err) => this.showErrorMessage(err)
        );
    }

    refreshGanttData = () => {
        const initFilterId = this.state.parsedGridView?.viewInfo?.filterdId;
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.state.subView == null ? UrlUtils.getParentId() : this.state.elementRecordId;
        const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
        const kindViewArg = this.state.kindView;
        const loadSortOptions = this.state.parsedGridView.ganttColumns.filter((c) => {
            return c.sortIndex === 1;
        })[0];
        this.loadGanttData(viewIdArg, parentIdArg, filterIdArg, kindViewArg, loadSortOptions);
    };

    loadGanttData(viewIdArg, parentIdArg, filterIdArg, kindViewArg, loadSortOptions) {
        this.setState({loading: true}, () => {
            const sort = [];
            if (loadSortOptions) {
                const operation = {
                    desc: loadSortOptions?.sortOrder?.toUpperCase() === 'DESC',
                    selector: loadSortOptions?.fieldName,
                };
                sort.push(operation);
            }
            const res = this.dataGanttStore.getDataForGantt(
                viewIdArg,
                {
                    skip: 0,
                    take: Constants.INTEGER_MAX_VALUE,
                    sort: sort.length === 0 ? undefined : sort,
                },
                parentIdArg,
                filterIdArg,
                kindViewArg,
                (totalCounts) => {
                    this.setState({
                        totalCounts: totalCounts,
                    });
                }
            );
            if (!!res) {
                this.setState({
                    loading: false,
                    parsedGanttViewData: res,
                });
            }
            this.unblockUi();
        });
    }
    renderFileViewer = () => {
        const onHide = () => {
            this.setState({
                fileViewer: {
                    dialogEnabled: false,
                    file: undefined,
                    name: undefined,
                    type: '',
                },
            });
        };
        return <PDFViewerDialog onHide={onHide} name={this.state.fileViewer.name} file={this.state.fileViewer.file} />;
    };
    showBarCode = () => {
        const second = isSecondMethodShowBarCode();
        const first = isFirstMethodShowBarCode();
        const third = isThirdMethodShowBarCode();

        const barCode = document.getElementById('barCode');
        const hiddenInput = document.getElementById('hidden-input');
        const qrCodeTextbox = document.getElementById('qrCode-textbox')?.children?.[0]?.children?.[0]?.children?.[0];

        const showBarCodeElement = () => {
            if (barCode) barCode.style.display = 'flex';
            else console.warn('Element #barCode nie został znaleziony.');
        };

        const focusQrCodeTextbox = () => {
            if (qrCodeTextbox) {
                qrCodeTextbox.focus();
                qrCodeTextbox.click();
            } else console.warn('Element qrCodeTextbox nie został znaleziony.');
        };

        const handleHiddenInputRead = (onSuccess, fallback) => {
            if (hiddenInput) hiddenInput.focus();
            setTimeout(() => {
                const inputValue = hiddenInput?.value;
                if (inputValue) {
                    console.log('value of barcode: ' + inputValue);
                    onSuccess(inputValue);
                    if (hiddenInput) hiddenInput.value = '';
                } else fallback?.();
            }, 200);
        };

        if (first) {
            console.log('firstMethodShowBarCode executed');
            showBarCodeElement();
            focusQrCodeTextbox();
        } else if (second) {
            console.log('secondMethodShowBarCode executed');
            showBarCodeElement();
            handleHiddenInputRead(
                (value) => {
                    if (qrCodeTextbox) qrCodeTextbox.value = value;
                    document.getElementById('opConfirm-qr-code')?.click();
                },
                () => {
                    focusQrCodeTextbox();
                }
            );
        } else if (third) {
            console.log('thirdMethodShowBarCode executed');
            handleHiddenInputRead(
                (value) => {
                    this.findCode?.(value);
                },
                () => {
                    showBarCodeElement();
                    focusQrCodeTextbox();
                }
            );
        } else console.error('Method to show barcode not exist: ' + getStore().barCodeShowMethod);
    };

    closeBarCode = () => {
        const qrCodeTextbox = document.getElementById('qrCode-textbox')?.children?.[0]?.children?.[0]?.children?.[0];
        if (qrCodeTextbox) {
            qrCodeTextbox.value = '';
        } else {
            console.warn('Element qrCodeTextbox nie został znaleziony.');
        }
        const barCode = document.getElementById('barCode');
        if (barCode) barCode.style.display = 'none';
        else console.warn('Element #barCode nie został znaleziony.');
    };

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.isTypeOfGrid()
                            ? this.renderGridViewComponent()
                            : this.isCardView()
                            ? this.renderCardViewComponent()
                            : this.isGanttView()
                            ? this.renderGanttViewComponent()
                            : this.isDashboard()
                            ? this.renderDashboardViewComponent()
                            : null}
                        {!this.isDashboard() && (
                            <SelectedElements
                                selectedRowKeys={this.state.selectedRowKeys}
                                totalCounts={this.state.totalCounts}
                            />
                        )}

                        <QrCodesDialog
                            onHide={() => this.closeBarCode()}
                            findCode={(code) => {
                                this.findCode(code);
                            }}
                        />

                        {this.state.confirmationOperation?.visible && (
                            <ConfirmationOperationDialog
                                onAccept={() => {
                                    this.state.confirmationOperation.fncAfterClickYes();
                                    this.onHideConfirmationOperationDialog();
                                }}
                                onHide={() => {
                                    this.onHideConfirmationOperationDialog();
                                    this.unselectAllDataGrid();
                                }}
                                operationType={this.state.confirmationOperation.operationType}
                                visible={this.state.confirmationOperation?.visible}
                            />
                        )}
                        {this.state.fileViewer?.dialogEnabled && this.renderFileViewer()}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };

    findCode = (code) => {
        const isSubView = !StringUtils.isBlank(this.state.subView);
        const viewId = isSubView ? this.state.elementId : UrlUtils.getIdFromUrlOrAlternative(this.props.id);
        const kindView = UrlUtils.getKindView();
        const parentId = isSubView ? this.state.elementSubViewId : UrlUtils.getParentId();
        const filterId = UrlUtils.getFilterId();
        const body = {
            filter: null,
            filterId: StringUtils.isBlank(filterId) ? 0 : filterId,
            barCode: code,
            value: '',
        };
        this.blockUi();
        this.codeService
            .find(viewId, parentId, kindView, body)
            .then((result) => {
                const message = result?.message;
                if (message) {
                    const text = message?.text;
                    const title = message?.title;
                    this.showErrorMessage(text, 3000, true, title);
                }
                this.handleQrCodeResponse(result);
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex);
            })
            .finally(() => {
                this.closeBarCode();
                this.unblockUi();
            });
    };

    renderDashboardViewComponent = () => {
        return (
            <React.Fragment>
                <div className='col-12 '>{Breadcrumb.render()} </div>
                <DashboardContainer
                    key={'Dashboard'}
                    showColumnHeaders={this.state.showColumnHeaders}
                    dashboard={this.state.subView}
                    handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                        this.props.handleRenderNoRefreshContent(renderNoRefreshContent);
                    }}
                />
            </React.Fragment>
        );
    };
    handleSelectRow = (rowDataKeys, callBack) => {
        const prevDataGridGlobalReference = this.state?.prevDataGridGlobalReference;
        if (prevDataGridGlobalReference) {
            window.dataGrid = prevDataGridGlobalReference;
            dataGrid = prevDataGridGlobalReference;
        }
        const uniqueKeys = Array.from(
            new Map(rowDataKeys.map((item) => [String(item.ID), {ID: String(item.ID)}])).values()
        );
        this.setState(
            {
                selectedRowKeys: uniqueKeys,
                prevDataGridGlobalReference: null,
            },
            () => {
                if (callBack) callBack();
            }
        );
    };

    removeDuplicates = (array) => {
        const countMap = array.reduce((acc, obj) => {
            acc[obj.ID] = (acc[obj.ID] || 0) + 1;
            return acc;
        }, {});
        return array.filter((obj) => countMap[obj.ID] === 1);
    };

    onGroupIndexChange = (index, value) => {
        this.setState((prevState) => {
            const gridViewColumns = [...prevState.gridViewColumns];
            gridViewColumns[index] = {
                ...gridViewColumns[index],
                groupIndex: value,
            };
            return {gridViewColumns};
        });
    };

    renderGridViewComponent = () => {
        const parentIdArg = this.state.subView == null ? UrlUtils.getParentId() : this.state.elementRecordId;
        return (
            <React.Fragment>
                <GridViewComponent
                    handleOnGroupIndexChange={(index, value) => {
                        this.onGroupIndexChange(index, value);
                    }}
                    showColumnHeaders={this.state.showColumnHeaders}
                    filtersCached={this.state.filtersCached}
                    multiLevelHeaders={this.isGridViewBands()}
                    gridViewColumns={this.state.gridViewColumns}
                    ppmEnabled={true}
                    altAndLeftClickEnabled={true}
                    id={this.props.id}
                    isAttachment={this.isAttachment}
                    selectedRows={this.state.selectedRowKeys}
                    elementSubViewId={this.state.elementSubViewId}
                    elementKindView={this.state.elementKindView}
                    elementRecordId={this.state.elementRecordId ? this.state.elementRecordId : parentIdArg}
                    focusedRowEnabled={true}
                    hoverStateEnabled={true}
                    handleOnInitialized={this.onInitialize}
                    handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                    parsedGridView={this.state.parsedGridView}
                    getRef={() => {
                        return this.refDataGrid;
                    }}
                    parsedGridViewData={this.state.parsedGridViewData}
                    handleBlockUi={() => {
                        this.blockUi();
                        return true;
                    }}
                    handleSelectSingleRow={(rowId, callBack) => {
                        this.handleSelectRow([{ID: String(rowId)}], callBack);
                    }}
                    handleUnselectAll={() => {
                        this.setState({
                            selectedRowKeys: [],
                        });
                    }}
                    addButtonFunction={this.addButtonFunction}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                    packageRows={this.state.packageRows}
                    handleShowEditPanel={(editDataResponse) => {
                        this.handleShowEditPanel(editDataResponse);
                    }}
                    handleSelectRows={(rowData, callback) => {
                        this.handleSelectRow(rowData, callback);
                    }}
                    handleSelectAll={(selectionValue) => {
                        this.blockUi();
                        const prevDataGridGlobalReference = this.state?.prevDataGridGlobalReference;
                        if (prevDataGridGlobalReference) {
                            window.dataGrid = prevDataGridGlobalReference;
                            dataGrid = prevDataGridGlobalReference;
                        }
                        if (selectionValue === null) {
                            this.setState({
                                selectAll: false,
                                select: true,
                            });
                            dataGrid.getSelectedRowsData().then((rowData) => {
                                rowData = this.removeDuplicates(rowData);
                                this.setState(
                                    {
                                        selectedRowKeys: rowData,
                                        selectAll: false,
                                        select: false,
                                        prevDataGridGlobalReference: null,
                                    },
                                    () => {
                                        this.unblockUi();
                                    }
                                );
                            });
                            this.unblockUi();
                        } else {
                            if (selectionValue) this.selectAllDataGrid(selectionValue);
                            else this.unselectAllDataGrid(selectionValue);
                        }
                    }}
                    handleFormulaRow={(id) => {
                        this.prepareCalculateFormula(id);
                    }}
                    dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                    selectionDeferred={true}
                    handlePluginRow={(id, recordId) => this.plugin(id, recordId)}
                    handleDocumentRow={(id, recordId) => this.generate(id, recordId)}
                    handleDeleteRow={(id) =>
                        this.onShowConfirmationOperationDialog(OperationType.OP_DELETE, () => this.delete(id))
                    }
                    handleRestoreRow={(id) => this.restore(id)}
                    handleDownloadRow={(id) => this.downloadAttachment(id)}
                    handleAttachmentRow={(id) => this.attachment(id)}
                    handleHistoryLogRow={(id) => this.historyLog(id)}
                    handleCopyRow={(id) => this.showCopyView(id)}
                    handleArchiveRow={(id) => this.archive(id)}
                    handlePublishRow={(id) => this.publishEntry(id)}
                />
            </React.Fragment>
        );
    };
    renderCardViewComponent = () => {
        const parentIdArg = this.state.subView == null ? UrlUtils.getParentId() : this.state.elementRecordId;
        const filterIdArg = !!this.state.elementFilterId
            ? this.state.elementFilterId
            : this.state.parsedGridView?.viewInfo?.filterdId;
        const kindViewArg = !!this.state.elementKindView ? this.state.elementKindView : UrlUtils.getKindView();
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const viewHeight = window.innerHeight - 220;
        return (
            <React.Fragment>
                {!!this.state.parsedCardViewData && (
                    <CardViewInfiniteComponent
                        id={parseInt(viewIdArg)}
                        ref={this.refCardGrid}
                        handleTotalCounts={(totalCounts) => {
                            this.setState({
                                totalCounts: totalCounts,
                            });
                        }}
                        gridViewType={this.state.gridViewType}
                        elementSubViewId={this.state.elementSubViewId}
                        elementKindView={this.state.elementKindView}
                        handleOnInitialized={(ref) => (this.cardGrid = ref)}
                        parsedCardView={this.state.parsedGridView}
                        parsedCardViewData={this.state.parsedCardViewData}
                        handleShowEditPanel={(editDataResponse) => {
                            this.handleShowEditPanel(editDataResponse);
                        }}
                        addButtonFunction={this.addButtonFunction}
                        viewHeight={viewHeight}
                        showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                        handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                        editHeaderIsVisible={this.state.visibleEditPanel}
                        isBlocking={this.state.blocking}
                        handleUnblockUi={() => {
                            this.unblockUi();
                            return true;
                        }}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleSelectedRowKeys={(e, callBack) =>
                            this.setState({selectedRowKeys: e}, () => {
                                if (callBack) {
                                    callBack();
                                }
                            })
                        }
                        collapsed={this.props.collapsed}
                        kindView={kindViewArg}
                        parentId={parentIdArg}
                        filterId={filterIdArg}
                        handleFormulaRow={(id) => {
                            this.prepareCalculateFormula(id);
                        }}
                        handleHistoryLogRow={(id) => this.historyLog(id)}
                        handlePluginRow={(id, recordId) => this.plugin(id, recordId)}
                        handleDocumentRow={(id, recordId) => this.generate(id, recordId)}
                        handleDeleteRow={(id) =>
                            this.onShowConfirmationOperationDialog(OperationType.OP_DELETE, () => this.delete(id))
                        }
                        handleAttachmentRow={(id) => this.attachment(id)}
                        handleDownloadRow={(id) => this.downloadAttachment(id)}
                        handleRestoreRow={(id) => this.restore(id)}
                        handleCopyRow={(id) => this.showCopyView(id)}
                        handleArchiveRow={(id) => this.archive(id)}
                        handlePublishRow={(id) => this.publishEntry(id)}
                    />
                )}
            </React.Fragment>
        );
    };
    // TODO: pokazuje biale tlo po wykonaniu operacji na akrcie i dopeiro potem wyswietla te karty
    renderGanttViewComponent = () => {
        return (
            <React.Fragment>
                <GanttViewComponent
                    filtersCached={this.state.filtersCached}
                    id={this.props.id}
                    handleTotalCounts={(totalCounts) => {
                        this.setState({
                            totalCounts: totalCounts,
                        });
                    }}
                    unselectAll={() => {
                        this.setState({
                            selectedRowKeys: [],
                        });
                    }}
                    showColumnHeaders={this.state.showColumnheaders}
                    collapsed={this.props.collapsed}
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
                    handleSelectAll={(selectionValue, selectedRowKeys) => {
                        this.state.selectedRowKeys.length = 0;
                        if (selectionValue) {
                            this.setState({
                                selectedRowKeys: selectedRowKeys,
                            });
                        } else {
                            this.setState({
                                selectedRowKeys: this.state.selectedRowKeys,
                            });
                        }
                    }}
                    handleRefreshData={this.refreshGanttData}
                    handleUp={() => this.up()}
                    handleDown={() => this.publishEntry()}
                    parsedGanttView={this.state.parsedGridView}
                    gridViewColumns={this.state.ganttViewColumns}
                    dataGanttStoreSuccess={this.state.dataGanttStoreSuccess}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showGlobalErrorMessage(err)}
                    packageRows={this.state.packageRows}
                    handleShowEditPanel={(editDataResponse) => {
                        this.handleShowEditPanel(editDataResponse);
                    }}
                    handleSelectedRowKeys={(e, callBack) => {
                        this.setState({selectedRowKeys: e}, () => {
                            if (callBack) {
                                callBack();
                            }
                        });
                    }}
                    addButtonFunction={this.addButtonFunction}
                    dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                    selectionDeferred={true}
                    handlePluginRow={(id, recordId) => this.plugin(id, recordId)}
                    handleDocumentRow={(id, recordId) => this.generate(id, recordId)}
                    handleDeleteRow={(id) =>
                        this.onShowConfirmationOperationDialog(OperationType.OP_DELETE, () => this.delete(id))
                    }
                    handleDownloadRow={(id) => this.downloadAttachment(id)}
                    handleAttachmentRow={(id) => this.attachment(id)}
                    handleRestoreRow={(id) => this.restore(id)}
                    handleCopyRow={(id) => this.showCopyView(id)}
                    handleHistoryLogRow={(id) => this.historyLog(id)}
                    handleArchiveRow={(id) => this.archive(id)}
                    handlePublishRow={(id) => this.publishEntry(id)}
                />
            </React.Fragment>
        );
    };

    getMessages() {
        return this.messages;
    }
}

BaseViewContainer.defaultProps = {
    viewMode: 'VIEW',
};

BaseViewContainer.propTypes = {
    id: PropTypes.string.isRequired,
    handleRenderNoRefreshContent: PropTypes.array.isRequired,
    handleViewInfoName: PropTypes.func.isRequired,
    handleSubView: PropTypes.func.isRequired,
    handleOperations: PropTypes.func.isRequired,
    handleShortcutButtons: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
};

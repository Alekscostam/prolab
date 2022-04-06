import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import ViewService from '../services/ViewService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {GridViewUtils} from '../utils/GridViewUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import Constants from "../utils/Constants";
import ConsoleHelper from "../utils/ConsoleHelper";
import DataTreeStore from "./dao/DataTreeStore";
import TreeViewComponent from "./treeGrid/TreeViewComponent";

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
        this.refDataTree = React.createRef()
        this.messages = React.createRef();
        this.state = {
            loading: true,
            elementParentId: null,
            elementRecordId: null,
            elementFilterId: null,
            parsedData: null,
            columns:[],
            selectedRowKeys: [],

        };
        this.downloadData = this.downloadData.bind(this);
        this.getViewById = this.getViewById.bind(this);
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
        }, () => {
            this.downloadData(id, this.state.elementParentId, this.state.elementRecordId, this.state.elementFilterId);
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
        const s1 = !GridViewUtils.equalNumbers(this.state.elementId, id);
        const s2 = !GridViewUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !GridViewUtils.equalString(this.state.elementRecordId, recordId);
        const updatePage = s1 || (s2 || s3);
        ConsoleHelper('EditSpecContainer::componentDidUpdate -> updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}', updatePage, prevProps.id, this.props.id, s1, s2, s3);
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
            ConsoleHelper('EditSpecContainer::componentDidUpdate -> not updating !');
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

    //override
    renderGlobalTop() {
        return (<React.Fragment>
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
        return (<React.Fragment>
            <ShortcutsButton items={this.state.parsedView?.shortcutButtons} maxShortcutButtons={5}/>
        </React.Fragment>);
    }

    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_FILTER':
                    return (<React.Fragment>
                        {/*{this.state.filtersList?.length > 0 ? (<SelectBox*/}
                        {/*    className={`filter-combo ${margin}`}*/}
                        {/*    wrapItemText={true}*/}
                        {/*    id='combo_filters'*/}
                        {/*    items={this.state.filtersList}*/}
                        {/*    displayExpr='label'*/}
                        {/*    valueExpr='id'*/}
                        {/*    value={parseInt(this.state.elementFilterId || this.state.parsedView?.viewInfo?.filterdId)}*/}
                        {/*    onValueChanged={(e) => {*/}
                        {/*        ConsoleHelper('onValueChanged', e);*/}
                        {/*        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();*/}
                        {/*        if (!!e.value && e.value !== e.previousValue) {*/}
                        {/*            const filterId = parseInt(e.value)*/}
                        {/*            const subViewId = UrlUtils.getURLParameter('subview') || this.state.elementSubViewId;*/}
                        {/*            const recordId = UrlUtils.getURLParameter('recordId') || this.state.elementRecordId;*/}
                        {/*            const subviewMode = !!recordId && !!this.state.elementId;*/}
                        {/*            const breadCrumbs = UrlUtils.getURLParameter('bc');*/}
                        {/*            const viewType = UrlUtils.getURLParameter('viewType');*/}
                        {/*            //myczek na błąd [FIX] Przełączanie między widokami a filtry*/}
                        {/*            if (!breadCrumbs) {*/}
                        {/*                return;*/}
                        {/*            }*/}
                        {/*            if (subviewMode) {*/}
                        {/*                ConsoleHelper(`Redirect -> Id =  ${this.state.elementId} SubViewId = ${subViewId} RecordId = ${recordId} FilterId = ${filterId}`);*/}
                        {/*                window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}?recordId=${recordId}&subview=${subViewId}&filterId=${filterId}&viewType=${viewType}${currentBreadcrumb}`);*/}
                        {/*            } else {*/}
                        {/*                ConsoleHelper(`Redirect -> Id =  ${this.state.elementId} RecordId = ${recordId} FilterId = ${filterId}`);*/}
                        {/*                if (filterId) {*/}
                        {/*                    window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${this.state.elementId}/?filterId=${filterId}&viewType=${viewType}${currentBreadcrumb}`);*/}
                        {/*                }*/}
                        {/*            }*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    stylingMode='underlined'*/}
                        {/*/>) : null}*/}
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
                        {/*{this.state.pluginsList?.length > 0 ? (*/}
                        <ActionButtonWithMenu
                            id='button_plugins'
                            className={`${margin}`}
                            iconName={operation?.iconCode || 'mdi-puzzle'}
                            items={this.state.pluginsList}
                            title={operation?.label}
                        />
                        {/*) : null}*/}
                    </React.Fragment>)
                default:
                    return null;
            }
        }
    }

    leftHeadPanelContent = () => {
        return (<React.Fragment>
            {this.state.parsedView?.operations.map((operation, index) => {
                return <div key={index}>{this.renderButton(operation, index)}</div>;
            })}
        </React.Fragment>);
    }

    //override
    renderHeadPanel = () => {
        return (
            <React.Fragment>
            </React.Fragment>
        );
    }

    //override
    renderHeaderContent() {

    }

    addView(e) {
        this.blockUi();

    }

    //override
    render() {
        return (<React.Fragment>
            {super.render()}
        </React.Fragment>);
    }

    //override
    renderContent = () => {
        return (<React.Fragment>
            {this.state.loading ? null : (<React.Fragment>
                <TreeViewComponent
                    id={this.props.id}
                    elementRecordId={this.state.elementRecordId}
                    handleOnDataTree={(ref) => this.refDataTree = ref}
                    parsedGridView={this.state.parsedView}
                    parsedGridViewData={this.state.parsedData}
                    gridViewColumns={this.state.columns}
                    handleBlockUi={() => {
                        this.blockUi();
                        return true;
                    }}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleShowEditPanel={(editDataResponse) => {
                        this.handleShowEditPanel(editDataResponse)
                    }}
                    selectedRowKeys={this.state.selectedRowKeys}
                    handleSelectedRowKeys={(e) => this.setState(prevState => {
                        return {
                            ...prevState,
                            selectedRowKeys: e
                        }
                    })}
                    handleDeleteRow={(id) => this.delete(id)}
                    handleRestoreRow={(id) => this.restore(id)}
                    handleCopyRow={(id) => this.copy(id)}
                    handleArchiveRow={(id) => this.archive(id)}
                    handlePublishRow={(id) => this.publish(id)}
                />
            </React.Fragment>)}
        </React.Fragment>)
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
    labels: PropTypes.object.isRequired,
    collapsed: PropTypes.bool.isRequired,
}

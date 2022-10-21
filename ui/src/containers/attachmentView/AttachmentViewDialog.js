import {Toast} from 'devextreme-react';
import PropTypes from 'prop-types';
import React from 'react';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import UrlUtils from '../../utils/UrlUtils';
import ConsoleHelper from '../../utils/ConsoleHelper';
import LocUtils from '../../utils/LocUtils';
import DivContainer from '../../components/DivContainer';
import {BaseViewContainer} from '../../baseContainers/BaseViewContainer';
import {Dialog} from 'primereact/dialog';
import BlockUi from '../../components/waitPanel/BlockUi';
import ActionButton from '../../components/ActionButton';
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//

export class AttachmentViewDialog extends BaseViewContainer {
    constructor(props) {
        ConsoleHelper('AttachmentViewDialog -> constructor');
        super(props);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
    }

    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        ConsoleHelper(
            `AttachmentViewDialog::downloadData: viewId=${viewId}, subview=${subviewId} recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
        );
        this.setState({subView: null}, () => {
            this.props.handleSubView(null);
            this.getViewById(viewId, recordId, filterId, parentId, viewType, false);
        });
    }

    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        this.setState({loading: true}, () => {
            this.viewService
                .getAttachemntView(viewId, recordId)
                .then((responseView) => {
                    this.setState({
                        elementSubViewId: responseView.viewInfo.id,
                    });
                    this.processViewResponse(responseView, parentId, recordId, isSubView);
                })
                .catch((err) => {
                    console.error('Error getView in GridView. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                });
        });
    }

    processViewResponse(responseView, parentId, recordId, isSubView) {
        ConsoleHelper(`AttachmentViewDialog: oldParentId=${parentId}, newParentId=${responseView.viewInfo.parentId}`);

        if (this._isMounted) {
            ViewValidatorUtils.validation(responseView);
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            Breadcrumb.updateView(responseView.viewInfo, id, recordId);
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
            let viewInfoTypesTmp = [];
            let cardButton = DataGridUtils.containsOperationsButton(responseView.operations, 'OP_CARDVIEW');
            if (cardButton) {
                viewInfoTypesTmp.push({
                    icon: 'mediumiconslayout',
                    type: 'cardView',
                    hint: cardButton?.label,
                });
            }
            let viewButton = DataGridUtils.containsOperationsButton(responseView.operations, 'OP_GRIDVIEW');
            if (viewButton) {
                viewInfoTypesTmp.push({
                    icon: 'contentlayout',
                    type: 'gridView',
                    hint: viewButton?.label,
                });
            }

            this.setState(
                () => ({
                    loading: false, //elementId: this.props.id,
                    gridViewType: responseView?.viewInfo?.type,
                    kindView: responseView?.viewInfo?.kindView,
                    parsedGridView: responseView,
                    gridViewColumns: gridViewColumnsTmp,
                    pluginsList: pluginsListTmp,
                    documentsList: documentsListTmp,
                    batchesList: batchesListTmp,
                    filtersList: filtersListTmp,
                    selectedRowKeys: [],
                    viewInfoTypes: viewInfoTypesTmp,
                    packageRows: responseView?.viewInfo?.dataPackageSize,
                    select: false,
                    selectAll: false,
                    isSelectAll: false,
                    visibleEditPanel: false,
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
                    const initFilterId = responseView?.viewInfo?.filterdId;

                    const viewInfo = responseView.viewInfo;

                    const viewIdArg = viewInfo.id;
                    const parentIdArg = viewInfo.parentId;
                    const parentViewIdArg = viewInfo.parentViewId;
                    const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
                    const kindViewArg = 'View';

                    this.setState({loading: true}, () => {
                        let res = this.dataGridStore.getDataGridStore(
                            viewIdArg,
                            'gridView',
                            parentIdArg,
                            filterIdArg,
                            kindViewArg,
                            () => {
                                this.blockUi();
                                return {
                                    select: this.state.select,
                                    selectAll: this.state.selectAll,
                                };
                            },
                            () => {
                                this.setState(
                                    {
                                        select: false,
                                        selectAll: false,
                                        dataGridStoreSuccess: true,
                                    },
                                    () => {
                                        this.unblockUi();
                                    }
                                );
                            },
                            (err) => {
                                this.setState(
                                    {
                                        select: false,
                                        selectAll: false,
                                    },
                                    () => {
                                        this.showErrorMessages(err);
                                        this.unblockUi();
                                    }
                                );
                            },
                            parentViewIdArg
                        );
                        if (!!res) {
                            this.setState({
                                loading: false,
                                parsedGridViewData: res,
                            });
                        }
                        this.unblockUi();
                    });
                }
            );
        }
    }

    render() {
        let operations = this.state.parsedGridView?.operations;
        let opADDFile = DataGridUtils.containsOperationsButton(operations, 'OP_ADD_FILE');
        return (
            <React.Fragment>
                <Dialog
                    id='attachmentDialog'
                    header={LocUtils.loc(this.props.labels, 'Attachments_header', 'Załączniki')}
                    visible={true}
                    resizable={true}
                    breakpoints={{'960px': '75vw'}}
                    style={{width: '90vw'}}
                    onHide={() => this.props.onHide()}
                >
                    <BlockUi
                        tag='div'
                        className='block-ui-div'
                        blocking={this.state.blocking || this.state.loading}
                        loader={this.loader}
                        renderBlockUi={this.state.gridViewType !== 'dashboard'}
                    >
                        <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                        <DivContainer id='header-right' colClass='to-right'>
                            <ActionButton
                                type='default'
                                stylingMode='contained'
                                rendered={true}
                                label={opADDFile?.label}
                                handleClick={() => {
                                    this.setState({
                                        visibleUploadFile: true,
                                    });
                                }}
                            />
                        </DivContainer>
                        {this.state.loading === false ? (
                            <React.Fragment>
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
                            </React.Fragment>
                        ) : null}
                    </BlockUi>
                </Dialog>
            </React.Fragment>
        );
    }
}

AttachmentViewDialog.defaultProps = {
    viewMode: 'VIEW',
};

AttachmentViewDialog.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    handleRenderNoRefreshContent: PropTypes.bool.isRequired,
    handleViewInfoName: PropTypes.func.isRequired,
    handleSubView: PropTypes.func.isRequired,
    handleOperations: PropTypes.func.isRequired,
    handleShortcutButtons: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
};

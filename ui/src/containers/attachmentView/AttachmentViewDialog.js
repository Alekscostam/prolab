import PropTypes from 'prop-types';
import React from 'react';
import ConsoleHelper from '../../utils/ConsoleHelper';
import LocUtils from '../../utils/LocUtils';
import DivContainer from '../../components/DivContainer';
import {BaseViewContainer} from '../../baseContainers/BaseViewContainer';
import {Dialog} from 'primereact/dialog';
import UrlUtils from '../../utils/UrlUtils';
import Constants from '../../utils/Constants';
import {OperationType} from '../../model/OperationType';
import {ButtonGroup} from 'devextreme-react';
import CardViewInfiniteComponent from '../cardView/CardViewInfiniteComponent';

export class AttachmentViewDialog extends BaseViewContainer {
    constructor(props) {
        ConsoleHelper('AttachmentViewDialog -> constructor');
        super(props);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.isAttachement = true;
        this.state = {
            currentViewType: 'gridView',
            realParentId: undefined,
        };
    }

    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        ConsoleHelper(
            `AttachmentViewDialog::downloadData: viewId=${viewId}, subview=${subviewId} recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
        );
        if (recordId !== '0' && recordId !== 0) {
            viewId = subviewId;
            parentId = UrlUtils.getRecordId();
        }
        this.setState({test: null, cardId: recordId}, () => {
            this.getViewById(viewId, recordId, filterId, parentId, viewType, false);
        });
    }

    addButtonFunction = () => {
        this.setState({
            visibleUploadFile: true,
        });
    };

    // overide
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state?.cardId) {
            this.addBorderToCardView(this.state.cardId);
        }
    }

    // overide
    componentDidMount() {
        this.props.setPrevDataGridGlobalReference();
        this.setState({
            updateBreadcrumb: false,
        });
        super.componentDidMount();
    }

    componentWillUnmount() {
        const {prevElementSubViewId} = this.state;
        this.setState({
            elementSubViewId: prevElementSubViewId,
            updateBreadcrumb: true,
            cardId: null,
        });
        this.props.handleBackToOldGlobalReference();
        super.componentWillUnmount();
    }

    selectAllDataGrid(selectionValue) {
        this.setState(
            {
                selectAll: true,
                isSelectAll: selectionValue,
                select: false,
            },
            () => {
                this.getRefGridView().instance.clearSelection();
                const {viewInfo} = this.state.attachmentResponseView;
                const parentIdArg = viewInfo.parentId === 0 ? UrlUtils.getRecordId() : viewInfo.parentId;
                this.dataGridStore
                    .getSelectAllDataGridStore(
                        viewInfo.id,
                        'gridView',
                        parentIdArg,
                        viewInfo.filterdId,
                        'View',
                        this.getRefGridView().instance.getCombinedFilter(),
                        viewInfo.parentViewId,
                        true,
                        this.props.isKindViewSpec
                    )
                    .then((result) => {
                        this.setState(
                            {
                                selectAll: false,
                                select: false,
                                selectedRowKeys: result.data,
                            },
                            () => {
                                this.getRefGridView().instance.selectAll();
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

    isCardViewType() {
        return UrlUtils.getViewType() === 'cardView';
    }
    classListIncludesSelectedBorder(element) {
        if (element === undefined || element === null) {
            return true;
        }
        return Array.from(element.classList).includes('card-grid-selected');
    }
    addBorderToCardView(recordId) {
        if (this.isCardViewType()) {
            const card = document.getElementById(recordId.toString());
            if (!this.classListIncludesSelectedBorder(card)) {
                card.classList.add('card-grid-selected');
            }
        }
    }
    getKindView(viewType) {
        if (this.props.isKindViewSpec) {
            return 'ViewSpec';
        }
        return viewType;
    }
    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        ConsoleHelper(
            `AttachmentViewDialog::getViewById: viewId=${viewId}, isSubView=${isSubView} recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
        );
        if (viewId === null || viewId === undefined) {
            // przypadek dashboardu
            viewId = this.props.id;
        }
        if (recordId === parentId && UrlUtils.urlParamExsits('subview')) {
            viewId = UrlUtils.getIdFromUrl();
        }
        this.setState({loading: true}, () => {
            this.viewService
                .getAttachemntView(viewId, recordId, parentId, this.getKindView(viewType))
                .then((responseView) => {
                    const {elementSubViewId} = this.state;
                    this.setState({
                        prevElementSubViewId: elementSubViewId,
                        elementSubViewId: responseView.viewInfo.id,
                        attachmentResponseView: responseView,
                    });
                    this.processViewResponse(responseView, parentId, recordId, isSubView);
                })
                .catch((err) => {
                    console.error('Error getView in GridView. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.props.handleShowGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                });
        });
    }

    // @override
    getDataByViewResponse(responseView) {
        const viewInfo = responseView.viewInfo;
        const initFilterId = viewInfo?.filterdId;
        const viewIdArg = viewInfo.id;
        let recordParentIdArg = viewInfo.parentId;
        if (viewInfo.parentId === 0) {
            recordParentIdArg = UrlUtils.getRecordId();
        }
        const parentViewIdArg = viewInfo.parentViewId;
        const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
        const kindViewArg = 'View';
        this.setState({loading: true}, () => {
            let res = this.dataGridStore.getDataGridStore(
                viewIdArg,
                'gridView',
                recordParentIdArg,
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
                            this.props.handleShowErrorMessages(err.error.message);
                            this.unblockUi();
                        }
                    );
                },
                parentViewIdArg,
                true,
                this.props.isKindViewSpec
            );
            if (!!res) {
                this.setState({
                    loading: false,
                    realParentId: undefined,
                    parsedGridViewData: res,
                    gridViewType: this.state.currentViewType,
                    currentViewType: undefined,
                });
            }
            this.unblockUi();
        });
    }

    render() {
        return <React.Fragment>{super.render()}</React.Fragment>;
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
                        selectedItemKeys={this.state.gridViewType}
                        onItemClick={(e) => {
                            const {viewInfo} = this.state.attachmentResponseView;
                            this.setState(
                                {
                                    currentViewType: e.itemData.type,
                                    dataGridStoreSuccess: false,
                                },
                                () => {
                                    this.downloadData(
                                        this.props.id,
                                        viewInfo.parentId,
                                        undefined, // todo idk cyz to dobrze
                                        undefined,
                                        undefined,
                                        e.itemData.type
                                    );
                                }
                            );
                        }}
                    />
                </React.Fragment>
            ) : null;
        } else {
            return null;
        }
    };
    renderCardViewComponent() {
        const {viewInfo} = this.state.attachmentResponseView;
        return (
            <React.Fragment>
                <CardViewInfiniteComponent
                    id={viewInfo.id}
                    ref={this.refCardGrid}
                    gridViewType={this.state.currentViewType}
                    elementSubViewId={this.state.elementSubViewId}
                    elementKindView={this.state.elementKindView}
                    handleOnInitialized={(ref) => (this.cardGrid = ref)}
                    parsedCardView={this.state.parsedGridView}
                    parsedCardViewData={this.state.parsedCardViewData}
                    handleShowEditPanel={(editDataResponse) => {
                        this.handleShowEditPanel(editDataResponse);
                    }}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleBlockUi={() => {
                        this.blockUi();
                        return true;
                    }}
                    parentViewId={viewInfo.parentViewId}
                    handleUnblockUi={() => {
                        this.unblockUi();
                        return true;
                    }}
                    parentKindViewSpec={this.props.isKindViewSpec ? 'viewSpec' : undefined}
                    viewHeight={600}
                    selectedRowKeys={this.state.selectedRowKeys}
                    handleSelectedRowKeys={(e) => this.setState({selectedRowKeys: e})}
                    collapsed={this.props.collapsed}
                    kindView={viewInfo.kindView}
                    parentId={viewInfo.parentId}
                    filterId={viewInfo.filterId}
                    handleFormulaRow={(id) => {
                        this.prepareCalculateFormula(id);
                    }}
                    handleHistoryLogRow={(id) => this.historyLog(id)}
                    handlePluginRow={(id) => this.plugin(id)}
                    handleDocumentRow={(id) => this.generate(id)}
                    handleDeleteRow={(id) => this.delete(id)}
                    handleAttachmentRow={(id) => this.attachment(id)}
                    handleDownloadRow={(id) => this.downloadAttachment(id)}
                    handleRestoreRow={(id) => this.restore(id)}
                    handleCopyRow={(id) => this.showCopyView(id)}
                    handleArchiveRow={(id) => this.archive(id)}
                    handlePublishRow={(id) => this.publishEntry(id)}
                />
            </React.Fragment>
        );
    }
    renderView() {
        return (
            <Dialog
                id='attachmentDialog'
                header={LocUtils.loc(this.props.labels, 'Attachments_header', 'Załączniki')}
                visible={true}
                resizable={true}
                breakpoints={{'960px': '75vw'}}
                style={{width: '90vw'}}
                onHide={() => this.props.onHide()}
            >
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
            </Dialog>
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

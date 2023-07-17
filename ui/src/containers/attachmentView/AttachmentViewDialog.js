import PropTypes from 'prop-types';
import React from 'react';
import ConsoleHelper from '../../utils/ConsoleHelper';
import LocUtils from '../../utils/LocUtils';
import DivContainer from '../../components/DivContainer';
import {BaseViewContainer} from '../../baseContainers/BaseViewContainer';
import {Dialog} from 'primereact/dialog';
import UrlUtils from '../../utils/UrlUtils';
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
        if (recordId !== '0' && recordId !== 0) {
            viewId = subviewId;
            parentId = UrlUtils.getURLParameter('recordId');
        }
        // rerender
        this.setState({test: null}, () => {
            // this.props.handleSubView(null);
            this.getViewById(viewId, recordId, filterId, parentId, viewType, false);
        });
    }

    // overide
    componentDidUpdate(prevProps, prevState, snapshot) {}

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
        });
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
                this.getRefGridView().instance.selectAll();

                const {viewInfo} = this.state.attachmentResponseView;
                const parentIdArg =
                    UrlUtils.getURLParameter('recordId') === null
                        ? viewInfo.parentId
                        : UrlUtils.getURLParameter('recordId');
                this.dataGridStore
                    .getSelectAllDataGridStore(
                        viewInfo.id,
                        'gridView',
                        parentIdArg,
                        viewInfo.filterdId,
                        'View',
                        this.getRefGridView().instance.getCombinedFilter(),
                        viewInfo.parentViewId,
                        true
                    )
                    .then((result) => {
                        this.setState(
                            {
                                selectAll: false,
                                select: false,
                                selectedRowKeys: result.data,
                            },
                            () => {
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

    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        ConsoleHelper(
            `AttachmentViewDialog::getViewById: viewId=${viewId}, isSubView=${isSubView} recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
        );
        if (viewId === null || viewId === undefined) {
            // przypadek dashboardu
            viewId = this.props.id;
        }
        this.setState({loading: true}, () => {
            this.viewService
                .getAttachemntView(viewId, recordId, parentId)
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
            recordParentIdArg = UrlUtils.getURLParameter('recordId');
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
                true
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

    render() {
        return <React.Fragment>{super.render()}</React.Fragment>;
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

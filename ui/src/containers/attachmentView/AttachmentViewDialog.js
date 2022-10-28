import {Toast} from 'devextreme-react';
import PropTypes from 'prop-types';
import React from 'react';
import ConsoleHelper from '../../utils/ConsoleHelper';
import LocUtils from '../../utils/LocUtils';
import DivContainer from '../../components/DivContainer';
import {BaseViewContainer} from '../../baseContainers/BaseViewContainer';
import {Dialog} from 'primereact/dialog';
import BlockUi from '../../components/waitPanel/BlockUi';
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//

export class AttachmentViewDialog extends BaseViewContainer {
    constructor(props) {
        ConsoleHelper('AttachmentViewDialog -> constructor');
        super(props);
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.state = {
            loading: undefined,
        };
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
        ConsoleHelper(
            `AttachmentViewDialog::getViewById: viewId=${viewId}, isSubView=${isSubView} recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
        );
        if (this.state.loading === undefined) {
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
                            this.props.handleShowGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                        });
                    });
            });
        }
    }

    // @override
    getDataByViewResponse(responseView) {
        const viewInfo = responseView.viewInfo;
        const initFilterId = viewInfo?.filterdId;
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
                            this.props.showErrorMessages(err);
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

import PropTypes from 'prop-types';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import {ViewValidatorUtils} from '../../utils/parser/ViewValidatorUtils';
import UrlUtils from '../../utils/UrlUtils';
import BaseContainer from '../../baseContainers/BaseContainer';
import ConsoleHelper from '../../utils/ConsoleHelper';
import ViewService from '../../services/ViewService';
import CrudService from '../../services/CrudService';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import {OperationType} from '../../model/OperationType';
import React from 'react';
import DivContainer from '../../components/DivContainer';
import ActionButton from '../../components/ActionButton';
import HeadPanel from '../../components/prolab/HeadPanel';
import {ConfirmationEditQuitDialog} from '../../components/prolab/ConfirmationEditQuitDialog';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import SchedulerComponent from './SchedulerComponent';
import SchedulerService from '../../services/SchedulerService';

export class SchedulerContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('SchedulerContainer -> constructor');
        super(props);
        this.viewService = new ViewService();
        this.crudService = new CrudService();
        this.SchedulerService = new SchedulerService();
        this.state = {
            loading: true,
            renderConfirmationEditQuitDialog: false,
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
        this.props.handleRenderNoRefreshContent(false);
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        ConsoleHelper(
            `SchedulerContainer::componentDidMount -> id=${id}, parentId = ${parentId} recordId = ${recordId} filterId = ${filterId}`
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
        const parentId = UrlUtils.getParentId();
        const recordId = UrlUtils.getRecordId();
        const filterId = UrlUtils.getFilterId();
        const s1 = !DataGridUtils.equalNumbers(this.state.elementId, id);
        const s2 = !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !DataGridUtils.equalString(this.state.elementRecordId, recordId);
        const updatePage = s1 || s2 || s3;
        ConsoleHelper(
            'SchedulerContainer::componentDidUpdate -> updateData={%s} updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}',
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
                },
                () => {
                    this.downloadData(id, this.state.elementParentId, this.state.elementRecordId);
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
        if (!window.location.href.includes('grid-view')) {
            ConsoleHelper(
                `SchedulerContainer::downloadData: viewId=${viewId}, parentId=${parentId}, recordId=${recordId}`
            );
            this.getViewById(viewId, parentId, recordId);
        }
    }

    getViewById(viewId, parentId, recordId) {
        this.setState({loading: true}, () => {
            this.editSpecService
                .getView(viewId, parentId)
                .then((resView) => {
                    const responseView = {
                        ...resView,
                        viewInfo: {
                            id: resView.editInfo.viewId,
                            name: resView.editInfo.viewName,
                            parentId: resView.editInfo.parentId,
                        },
                        gridColumns: [
                            {
                                groupName: '',
                                freeze: '',
                                columns: resView.listColumns,
                            },
                        ],
                        gridOptions: resView.listOptions,
                        editInfo: undefined,
                        listColumns: undefined,
                        listOptions: undefined,
                    };
                    this.processingViewResponse(responseView, parentId, recordId);
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
            const id = UrlUtils.getViewIdFromURL() === undefined ? this.props.id : UrlUtils.getViewIdFromURL();
            Breadcrumb.updateView(responseView.viewInfo, id, recordId);
            const columnsTmp = this.createColumnsFromGroup(responseView);
            this.setState(
                () => ({
                    parsedView: responseView,
                    viewInfo: responseView.viewInfo,
                    columns: columnsTmp,
                }),
                () => {
                    const dataPackageSize = responseView.viewInfo?.packageCount;
                    const viewIdArg = this.state.elementId;
                    const parentIdArg = this.state.elementParentId;
                    const recordIdArg = this.state.elementRecordId;
                }
            );
        }
    }

    renderButton(operation, index) {
        return <React.Fragment></React.Fragment>;
    }

    // //override
    renderGlobalTop() {
        return <React.Fragment></React.Fragment>;
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <DivContainer id='header-left'>
                    {Breadcrumb.render(this.props.labels)}
                    <div className='font-medium mb-4'>{this.state.parsedView?.viewInfo?.name}</div>
                </DivContainer>
            </React.Fragment>
        );
    }
    //override
    renderHeaderRight() {
        const operations = [];
        const opSave = DataGridUtils.getOrCreateOpButton(
            operations,
            this.props.labels,
            OperationType.OP_SAVE,
            'Zapisz'
        );
        const opCancel = DataGridUtils.getOrCreateOpButton(
            operations,
            this.props.labels,
            OperationType.OP_CANCEL,
            'Anuluj'
        );
        return (
            <React.Fragment>
                <div id='global-top-components'>
                    <ActionButton rendered={!!opSave} label={opSave?.label} className='ml-2' handleClick={() => {}} />
                    <ActionButton
                        rendered={!!opCancel}
                        label={opCancel?.label}
                        className='ml-2 inverse'
                        handleClick={() => {
                            this.setState({
                                renderConfirmationEditQuitDialog: true,
                            });
                        }}
                    />
                </div>
            </React.Fragment>
        );
    }
    //override
    renderHeaderContent() {
        return <React.Fragment />;
    }

    //override
    renderHeadPanel = () => {
        const operations = this.state?.parsedView?.operations;
        if (operations?.length === 0) {
            return <React.Fragment />;
        }
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={
                        this.state.elementRecordId ? this.state.elementRecordId : UrlUtils.getBatchIdParam()
                    }
                    elementSubViewId={null}
                    elementKindView={this.state.elementKindView}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={operations}
                    labels={this.props.labels}
                    leftContent={
                        <React.Fragment>
                            {operations.map((operation, index) => {
                                return <div key={index}>{this.renderButton(operation, index)}</div>;
                            })}
                        </React.Fragment>
                    }
                    rightContent={
                        <React.Fragment>
                            <ShortcutsButton items={this.state.parsedView?.shortcutButtons} maxShortcutButtons={5} />
                        </React.Fragment>
                    }
                    handleDelete={() => this.delete()}
                    handleFormula={(e) => {
                        this.prepareCalculateFormula();
                    }}
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

    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        {this.state.renderConfirmationEditQuitDialog && (
                            <ConfirmationEditQuitDialog
                                onHide={() => {
                                    this.setState({
                                        renderConfirmationEditQuitDialog: false,
                                    });
                                }}
                                visible={this.state.renderConfirmationEditQuitDialog}
                                labels={this.props.labels}
                                onAccept={() => this.cancelSpec()}
                            />
                        )}

                        <div id='scheduler-div'>
                            <SchedulerComponent schedulerInfo={undefined} dataSource={undefined} />
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

SchedulerContainer.defaultProps = {
    viewMode: 'VIEW',
};

SchedulerContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
};

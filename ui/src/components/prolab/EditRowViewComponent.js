/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from './ShortcutButton';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import ConsoleHelper from '../../utils/ConsoleHelper';
import EditListComponent from './EditListComponent';
import {Toast} from 'primereact/toast';
import EditListDataStore from '../../containers/dao/DataEditListStore';
import EditListUtils from '../../utils/EditListUtils';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import UrlUtils from '../../utils/UrlUtils';
import {EntryResponseUtils} from '../../utils/EntryResponseUtils';
import BlockUi from '../waitPanel/BlockUi';
import {OperationType} from '../../model/OperationType';

// TODO: block ui na liste podpwoiedzi
export class EditRowViewComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            loading: true,
            editListField: {},
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            gridViewTypes: [],
            gridViewType: null,
            dataGridStoreSuccess: false,
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preventSave: false,
        };

        this.editListDataStore = new EditListDataStore();
        this.editListDataGrid = null;

        this.messages = React.createRef();
        this.sidebarRef = React.createRef();
        this.handleAutoFill = this.handleAutoFill.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        super.componentDidUpdate();
    }

    componentDidMount() {
        this.openEditRow();
        super.componentDidMount();
        this.blockUi();
    }

    openEditRow() {
        const editViewId = UrlUtils.getEditViewId();
        const editParentId = UrlUtils.getEditParentId();
        const editRecordId = UrlUtils.getEditRecordId();
        const editKindView = UrlUtils.getEditKindView();
        this.crudService
            .editEntry(editViewId, editRecordId, editParentId, editKindView, '')
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .edit(editViewId, editRecordId, editParentId, editKindView)
                                .then((editDataResponse) => {
                                    this.props.editDataChange(editDataResponse);
                                })
                                .catch((err) => {
                                    this.showErrorMessages(err);
                                })
                                .finally(() => {
                                    this.unblockUi();
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showErrorMessages(err);
                this.unblockUi();
            });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }
    handleSelectedRowData(selectedRowData) {
        ConsoleHelper('EditRowComponent::handleSelectedRowData obj=' + JSON.stringify(selectedRowData));
        const setFields = this.state.parsedGridView.setFields;
        const transformedRowsData = [];
        const transformedRowsCRC = [];
        for (let selectedRows in selectedRowData) {
            const selectedRow = selectedRowData[selectedRows];
            const transformedSingleRowData = EditListUtils.transformBySetFields(selectedRow, setFields);
            const CALC_CRC = EditListUtils.calculateCRC(transformedSingleRowData);
            ConsoleHelper('transformedRowsData = {} hash = {} ', transformedSingleRowData, CALC_CRC);
            transformedRowsData.push(transformedSingleRowData);
            transformedRowsCRC.push(CALC_CRC);
        }
        this.setState({selectedRowData: transformedRowsData, defaultSelectedRowKeys: transformedRowsCRC});
    }
    onBlur(inputType, event, groupName, info) {
        this.handleEditRowBlur(inputType, event, groupName, info);
    }
    onChange(inputType, event, groupName, info) {
        this.handleEditRowChange(inputType, event, groupName, info);
    }

    render() {
        const labels = this.props.labels;
        const operations = [];
        const opSave = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_SAVE, 'Zapisz');
        const opFill = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_FILL, 'Wypełnij');
        const opCancel = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_CANCEL, 'Anuluj');
        const editData = this.props.editData;
        const editListVisible = this.state.editListVisible;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <BlockUi
                    tag='div'
                    className=''
                    blocking={this.state.blocking}
                    loader={this.loader}
                    renderBlockUi={this.state.gridViewType !== 'dashboard'}
                >
                    <EditListComponent
                        visible={editListVisible}
                        field={this.state.editListField}
                        parsedGridView={this.state.parsedGridView}
                        parsedGridViewData={this.state.parsedGridViewData}
                        gridViewColumns={this.state.gridViewColumns}
                        onHide={() => {
                            this.setState({editListVisible: false});
                        }}
                        handleBlockUi={() => {
                            this.blockUi();
                            return true;
                        }}
                        handleUnblockUi={() => this.unblockUi}
                        handleOnChosen={(editListData, field) => {
                            ConsoleHelper('EditRowComponent::handleOnChosen = ', JSON.stringify(editListData));
                            const editInfo = this.props.editData?.editInfo;
                            editInfo.field = field;
                            this.handleEditListRowChange(editInfo, editListData);
                        }}
                        showErrorMessages={(err) => this.showErrorMessages(err)}
                        dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                        labels={labels}
                    />
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div className='row no-gutters'>
                            <div id='view-name' className='col-lg-6 col-md-12'>
                                <div id='label' className='label'>
                                    {this.props.editData?.editInfo?.viewName}
                                </div>
                            </div>
                            <div className='col-lg-6 col-md-12 text-right'>
                                <ShortcutButton
                                    id={'opSave'}
                                    className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleFormSubmit}
                                    title={opSave?.label}
                                    label={opSave?.label}
                                    rendered={opSave}
                                />
                                <ShortcutButton
                                    id={'opFill'}
                                    className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleAutoFill}
                                    title={opFill?.label}
                                    label={opFill?.label}
                                    rendered={opFill}
                                />
                                <ShortcutButton
                                    id={'opCancel'}
                                    className={`grid-button-panel-big normal mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleCancel}
                                    title={opCancel?.label}
                                    label={opCancel?.label}
                                    rendered={opCancel}
                                />
                            </div>
                        </div>
                        <div id='row-edit' className='mt-4 row'>
                            {this.state.preventSave ? (
                                <div id='validation-panel' className='validation-panel justify-content-center'>
                                    {this.fieldsMandatoryLabel}
                                </div>
                            ) : null}
                            {editData?.editFields?.map((group, index) => {
                                return this.renderGroup(group, index);
                            })}
                        </div>
                    </form>
                </BlockUi>
            </React.Fragment>
        );
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.setState({preventSave: false}, () => {
                this.blockUi(this.handleValidForm);
            });
        } else {
            this.setState({preventSave: true}, () => {
                this.validator.showMessages();
                this.showErrorMessages(this.fieldsMandatoryLabel);
                // rerender to show messages for the first time
                this.scrollToError = true;
                this.preventSave = true;
                this.forceUpdate();
            });
        }
    }

    handleValidForm() {
        const editInfo = this.props.editData?.editInfo;
        this.handleEditRowSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleAutoFill() {
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.state.kindView;
        this.handleAutoFillRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        const editInfo = this.props.editData?.editInfo;
        this.handleCancelRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    getPanelSize = (group) => {
        const panelSize = group?.panelSize ? group?.panelSize : 'col-lg-4';
        if (panelSize === 'col-lg-4') {
            return panelSize;
        }
        return 'ccol-' + panelSize;
    };
    getPanel = (group) => {
        const panel = group?.panel;
        switch (panel) {
            case 'left':
                return {marginRight: 'auto'};
            case 'right':
                return {marginLeft: 'auto'};
            case 'bottom':
            case 'center':
                return {margin: '0 auto'};
            default:
                return {};
        }
    };
    calcaulateMarginsForBottomPanel = (group) => {
        const panel = group?.panel;
        const panelSize = group?.panelSize ? '100' : group?.panelSize;
        if (panel === 'bottom') {
            const margin = Math.floor((100 - parseInt(panelSize)) / 2);
            return 'ccol-' + margin;
        }
        return undefined;
    };
    renderGroup(group, groupIndex) {
        const marginsForBottomPanel = this.calcaulateMarginsForBottomPanel(group);
        return (
            <React.Fragment>
                {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                <div className={`${this.getPanelSize(group)} col-md-6 col-sm-12`}>
                    <Panel
                        style={this.getPanel(group)}
                        key={`edit-row-panel-${groupIndex}`}
                        id={`group_${groupIndex}`}
                        header={group.groupName}
                        toggleable={group.isExpanded}
                    >
                        <DivContainer>
                            {group.fields?.map((field, index) => {
                                return this.renderField(field, index, group.groupName);
                            })}
                        </DivContainer>
                    </Panel>
                </div>
                {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
            </React.Fragment>
        );
    }
}

EditRowViewComponent.defaultProps = {};

EditRowViewComponent.propTypes = {
    editData: PropTypes.object,
    kindView: PropTypes.string,
    editDataChange: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

export default EditRowViewComponent;

/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from './ShortcutButton';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import SimpleReactValidator from '../validator';
import ConsoleHelper from '../../utils/ConsoleHelper';
import EditListComponent from './EditListComponent';
import {Toast} from 'primereact/toast';
import EditListDataStore from '../../containers/dao/EditListDataStore';
import EditListUtils from '../../utils/EditListUtils';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import UrlUtils from '../../utils/UrlUtils';
import {EntryResponseUtils} from '../../utils/EntryResponseUtils';
import BlockUi from '../waitPanel/BlockUi';

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
    }

    openEditRow() {
        const viewId = UrlUtils.getIdFromUrl();
        const editParentId = UrlUtils.getURLParameter('editParentId');
        const editRecordId = UrlUtils.getURLParameter('editRecordId');
        const editKindView = UrlUtils.getURLParameter('editKindView');
        this.crudService
            .editEntry(viewId, editRecordId, editParentId, editKindView, '')
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .edit(viewId, editRecordId, editParentId, editKindView)
                                .then((editDataResponse) => {
                                    this.props.editDataChange(editDataResponse);
                                })
                                .catch((err) => {
                                    this.showErrorMessages(err);
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
            });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }
    handleSelectedRowData(selectedRowData) {
        ConsoleHelper('EditRowComponent::handleSelectedRowData obj=' + JSON.stringify(selectedRowData));
        const setFields = this.state.parsedGridView.setFields;
        let transformedRowsData = [];
        let transformedRowsCRC = [];
        for (let selectedRows in selectedRowData) {
            let selectedRow = selectedRowData[selectedRows];
            let transformedSingleRowData = EditListUtils.transformBySetFields(selectedRow, setFields);
            let CALC_CRC = EditListUtils.calculateCRC(transformedSingleRowData);
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
        const operations = this.props.editData?.operations;
        const opSave = DataGridUtils.containsOperationsButton(operations, 'OP_SAVE');
        const opFill = DataGridUtils.containsOperationsButton(operations, 'OP_FILL');
        const opCancel = DataGridUtils.containsOperationsButton(operations, 'OP_CANCEL');
        let editData = this.props.editData;
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
                            let editInfo = this.props.editData?.editInfo;
                            editInfo.field = field;
                            this.handleEditListRowChange(editInfo, editListData);
                        }}
                        showErrorMessages={(err) => this.showErrorMessages(err)}
                        dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                        labels={this.props.labels}
                    />
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div id='row-edit' className=' justify-content-center row'>
                            <div className='col-12 '>
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
                                    className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleCancel}
                                    title={opCancel?.label}
                                    label={opCancel?.label}
                                    rendered={opCancel}
                                />
                            </div>

                            {this.state.preventSave ? (
                                <div id='validation-panel' className='validation-panel'>
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
        let editInfo = this.props.editData?.editInfo;
        this.handleEditRowSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleAutoFill() {
        let editInfo = this.props.editData?.editInfo;
        let kindView = this.state.kindView;
        this.handleAutoFillRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        let editInfo = this.props.editData?.editInfo;
        this.handleCancelRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    renderGroup(group, groupIndex) {
        return (
            <React.Fragment>
                <Panel
                    id={`group_${groupIndex}`}
                    className={'col-xl-6 col-lg-6 col-md-8 col-sm-12 '}
                    header={group.groupName}
                    toggleable={group.isExpanded}
                >
                    <DivContainer>
                        {group.fields?.map((field, index) => {
                            return this.renderField(field, index, group.groupName);
                        })}
                    </DivContainer>
                </Panel>
            </React.Fragment>
        );
    }
}

EditRowViewComponent.defaultProps = {};

EditRowViewComponent.propTypes = {
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onEditList: PropTypes.func.isRequired,
    editDataChange: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

export default EditRowViewComponent;

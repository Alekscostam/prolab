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
import {Sidebar} from 'primereact/sidebar';
import ConsoleHelper from '../../utils/ConsoleHelper';
import EditListComponent from './EditListComponent';
import {Toast} from 'primereact/toast';
import EditListDataStore from '../../containers/dao/DataEditListStore';
import EditListUtils from '../../utils/EditListUtils';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import LocUtils from '../../utils/LocUtils';
import {OperationType} from '../../model/OperationType';

let copyDataGlobalTop = null;
export class EditRowComponent extends BaseRowComponent {
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
        const visibleEditPanelPrevious = prevProps.visibleEditPanel;
        const visibleEditPanel = this.props.visibleEditPanel;
        console.log('visibleEditPanelPrevious %s %visibleEditPanel', visibleEditPanelPrevious, visibleEditPanel);
        //wykrycie eventu wysunięcia panelu z edycją
        if (visibleEditPanelPrevious === false && visibleEditPanel === true) {
            this.setState({preventSave: false});
        }
        window.sidebarRef = this.sidebarRef;
        super.componentDidUpdate();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.sidebarRef = null;
        copyDataGlobalTop = null;
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

    render() {
        const labels = this.props?.labels;
        const operations = this.props?.editData?.operations || [];
        const kindOperation = this.props.editData?.editInfo?.kindOperation;

        const opSave = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_SAVE, 'Zapisz');
        const opCancel = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_CANCEL, 'Anuluj');
        const opFill = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_FILL, 'Wypełnij');

        const visibleEditPanel = this.props.visibleEditPanel;
        const editData = this.props.editData;
        let editListVisible = this.state.editListVisible;
        if (this.props?.copyData) {
            copyDataGlobalTop = this.props.copyData;
        }
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />

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
                        this.props.onEditList(editInfo, editListData);
                    }}
                    showErrorMessages={(err) => this.props.showErrorMessages(err)}
                    dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                    selectedRowData={this.state.selectedRowData}
                    defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                    handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                    labels={labels}
                />
                <Sidebar
                    ref={this.sidebarRef}
                    id='right-sidebar'
                    visible={visibleEditPanel}
                    modal={true}
                    dismissable={false}
                    style={this.getWidthSizeSidebar()}
                    onHide={() => this.props.onCloseCustom()}
                    onCustomClose={() => {
                        this.props.onCloseCustom();
                    }}
                    position='right'
                    icons={() => (
                        <React.Fragment>
                            <div className='row'>
                                <div className='col-9'>
                                    <div className='row ' style={{flex: 'auto'}}>
                                        <div id='label' className='label col-lg-12 '>
                                            <div className=''>{editData?.editInfo?.viewName}</div>
                                        </div>
                                        {kindOperation?.toUpperCase() === 'COPY' ? (
                                            <div id='label' className='label col-lg-12' style={{fontSize: '1em'}}>
                                                {LocUtils.loc(labels, 'Copied_Label', 'Kopiowanie')}{' '}
                                                {copyDataGlobalTop?.copyCounter?.counter} /{' '}
                                                {copyDataGlobalTop?.copyOptions?.numberOfCopy}{' '}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className='col-3' style={{paddingLeft: '0px'}}>
                                    <div id='buttons' style={{textAlign: 'right'}} className='mr-3'>
                                        <ShortcutButton
                                            id={'opSave'}
                                            className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                            handleClick={this.handleFormSubmit}
                                            title={opSave?.label}
                                            label={opSave?.label}
                                            rendered={opSave}
                                        />
                                        <ShortcutButton
                                            id={'opFill'}
                                            className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                            handleClick={this.handleAutoFill}
                                            title={opFill?.label}
                                            label={opFill?.label}
                                            rendered={opFill}
                                        />
                                        <ShortcutButton
                                            id={'opCancel'}
                                            className={`grid-button-panel normal mt-1 mb-1 mr-1 col-lg-12`}
                                            handleClick={() => {
                                                const editInfo = this.props.editData?.editInfo;
                                                if (editInfo) {
                                                    this.props.onHide(
                                                        !visibleEditPanel,
                                                        editInfo.viewId,
                                                        editInfo.recordId,
                                                        editInfo.parentId
                                                    );
                                                }
                                            }}
                                            title={opCancel?.label}
                                            label={opCancel?.label}
                                            rendered={opCancel}
                                        />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )}
                >
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div id='row-edit' className='row-edit-container'>
                            {this.state.preventSave ? (
                                <div id='validation-panel' className='validation-panel'>
                                    {this.fieldsMandatoryLabel}
                                </div>
                            ) : null}
                            {this.renderFields(editData)}
                        </div>
                    </form>
                </Sidebar>
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
                this.props.showErrorMessages(this.fieldsMandatoryLabel);
                // rerender to show messages for the first time
                this.scrollToError = true;
                this.preventSave = true;
                this.forceUpdate();
            });
        }
    }

    handleValidForm() {
        const editInfo = this.props.editData?.editInfo;
        this.props.onSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
        this.refreshView();
    }

    handleAutoFill() {
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.props.kindView;
        this.props.onAutoFill(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        const editInfo = this.props.editData?.editInfo;
        this.props.onCancel(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    renderGroup(group, groupIndex) {
        return (
            <React.Fragment>
                <Panel
                    key={`key_group_${groupIndex}`}
                    id={`group_${groupIndex}`}
                    className={'mb-6'}
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

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    visibleEditPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    showErrorMessages: PropTypes.func.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEditList: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
    onError: PropTypes.func,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

export default EditRowComponent;

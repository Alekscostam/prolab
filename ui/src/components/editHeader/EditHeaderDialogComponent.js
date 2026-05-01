import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from '../prolab/ShortcutButton';
import SimpleReactValidator from '../validator';
import ConsoleHelper from '../../utils/ConsoleHelper';
import ListOfHintsDialogComponent from '../prolab/ListOfHintsDialogComponent';
import {Toast} from 'primereact/toast';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import {OperationType} from '../../enum/OperationType';
import {TranslationUtils} from '../../utils/TranslationUtils';
import {Dialog} from 'primereact/dialog';
import EditRowUtils from '../../utils/EditRowUtils';
import {RequestUtils} from '../../utils/RequestUtils';
import {StickyHeader} from '../../utils/StickyHeader';

export class EditHeaderDialogComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            selectedRowKeysFromMainView: this.props.selectedRowKeysFromMainView,
            windowSize: {
                width: '100%',
                height: '100%',
                maxHeight: '100%',
            },
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
            operationEnabled: true,
        };
        this.editListDataGrid = null;
        this.messages = React.createRef();
    }
    // TO OVVERIDE
    renderFields(panel) {}

    // TO OVVERIDE
    renderPanels(editData) {
        return <div></div>;
    }
    render() {
        const operations = this.props?.editData?.operations || [];
        const opSave = TranslationUtils.getOpButton(operations, OperationType.OP_SAVE);
        const opFill = TranslationUtils.getOpButton(operations, OperationType.OP_FILL);
        const opCancel = TranslationUtils.getOpButton(operations, OperationType.OP_CANCEL);
        const opClose = TranslationUtils.getOpButton(operations, OperationType.OP_CLOSE);
        const opAttachment = TranslationUtils.getOpButton(operations, OperationType.OP_ATTACHMENTS);
        const editData = this.props.editData;
        const editInfo = editData?.editInfo;
        const visibleEditPanel = this.props.visibleEditPanel;

        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='edit-header-dialog'
                    header={undefined}
                    headerStyle={{padding: '10px'}}
                    closable={false}
                    resizable={false}
                    style={{
                        width: this.state.windowSize.width,
                        height: this.state.windowSize.height,
                        maxHeight: this.state?.windowSize?.maxHeight || undefined,
                    }}
                    visible={true}
                >
                    {this.state.editListVisible && (
                        <ListOfHintsDialogComponent
                            selectedRowKeysFromMainView={this.state.selectedRowKeysFromMainView}
                            editData={editData}
                            field={this.state.editListField}
                            viewId={editInfo?.viewId}
                            recordId={editInfo?.recordId}
                            parentId={editInfo?.parentId}
                            editListBody={RequestUtils.createObjectDataToRequest(this.props)}
                            visible={this.state.editListVisible}
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
                                ConsoleHelper('EditHeaderComponent::handleOnChosen = ', JSON.stringify(editListData));
                                let editInfo = this.props.editData?.editInfo;
                                editInfo.field = field;
                                this.props.onEditList(editInfo, editListData);
                                this.setState({editListVisible: false});
                            }}
                            showErrorMessages={(err) => this.props.showErrorMessages(err)}
                            dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                            selectedRowData={this.state.selectedRowData}
                            defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        />
                    )}
                    {/* TODO: psuje się editor ze ikonki wyskakuja  */}
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <StickyHeader>
                            <div className='row no-gutters d-flex justify-content-between align-items-center'>
                                <div className='col-lg-6 col-md-12 d-flex align-items-center'>
                                    <div id='label' className='label'>
                                        {this.props.editData?.editInfo?.viewName}
                                    </div>

                                    {opAttachment && (
                                        <ShortcutButton
                                            id={'opAttachment'}
                                            className='grid-button-panel-big normal mt-1 mb-1 ml-2'
                                            handleClick={this.handleAttachment}
                                            title={opAttachment?.label}
                                            label={opAttachment?.label}
                                            rendered={opAttachment}
                                            disabled={!this.state.operationEnabled}
                                        />
                                    )}
                                </div>
                                <div className='col-lg-6 col-md-12 d-flex justify-content-end flex-wrap'>
                                    {opSave && (
                                        <ShortcutButton
                                            id={'opSave'}
                                            className='grid-button-panel-big inverse mt-1 mb-1 ml-1'
                                            handleClick={this.handleSave}
                                            title={opSave?.label}
                                            label={opSave?.label}
                                            rendered={opSave}
                                            disabled={!this.state.operationEnabled}
                                        />
                                    )}
                                    {opFill && EditRowUtils.hasAnyToFillField(editData) && (
                                        <ShortcutButton
                                            id={'opFill'}
                                            className='grid-button-panel-big inverse mt-1 mb-1 ml-1'
                                            handleClick={this.handleAutoFill}
                                            title={opFill?.label}
                                            label={opFill?.label}
                                            rendered={opFill}
                                            disabled={!this.state.operationEnabled}
                                        />
                                    )}
                                    {opCancel && (
                                        <ShortcutButton
                                            id={'opCancel'}
                                            className='grid-button-panel-big normal mt-1 mb-1 ml-1'
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
                                            disabled={!this.state.operationEnabled}
                                        />
                                    )}
                                    {opClose && (
                                        <ShortcutButton
                                            id={'opClose'}
                                            className='grid-button-panel-big normal mt-1 mb-1 ml-1'
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
                                            title={opClose?.label}
                                            label={opClose?.label}
                                            rendered={opClose}
                                            disabled={!this.state.operationEnabled}
                                        />
                                    )}
                                </div>
                            </div>
                        </StickyHeader>

                        <div id='row-edit' className='mt-4 row row-edit-view'>
                            {this.renderPanels(editData)}
                        </div>
                    </form>
                </Dialog>
            </React.Fragment>
        );
    }

    renderGroup(group, groupIndex) {
        return (
            EditRowUtils.hasAnyVisibleField(group) && (
                <React.Fragment>
                    <div
                        key={'div_panel_' + groupIndex}
                        className={`col-12`}
                        style={{paddingRight: '0px', paddingLeft: '0px', boxShadow: 'none', paddingBottom: '0px'}}
                    >
                        <Panel
                            key={`edit-row-panel-${groupIndex}`}
                            id={`group_${groupIndex}`}
                            header={group.groupName}
                            toggleable={group.isExpanded}
                        >
                            <DivContainer>
                                {group.fields?.map((field, index) => {
                                    field.readOnly = this.isReadOnly();
                                    return (
                                        <span key={`field_col_` + index}>
                                            {this.renderField(field, index, group.uuid)}
                                        </span>
                                    );
                                })}
                            </DivContainer>
                        </Panel>
                    </div>
                </React.Fragment>
            )
        );
    }
}

EditHeaderDialogComponent.defaultProps = {};

EditHeaderDialogComponent.propTypes = {
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
};

export default EditHeaderDialogComponent;

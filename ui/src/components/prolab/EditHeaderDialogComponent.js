import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from './ShortcutButton';
import SimpleReactValidator from '../validator';
import ConsoleHelper from '../../utils/ConsoleHelper';
import ListOfHintsDialogComponent from './ListOfHintsDialogComponent';
import {Toast} from 'primereact/toast';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import {OperationType} from '../../enum/OperationType';
import {TranslationUtils} from '../../utils/TranslationUtils';
import {Dialog} from 'primereact/dialog';
import EditListDataStore from '../../containers/dao/DataEditListStore';
import EditRowUtils from '../../utils/EditRowUtils';
import {RequestUtils} from '../../utils/RequestUtils';

export class EditHeaderDialogComponent extends BaseRowComponent {
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
        this.handleAutoFill = this.handleAutoFill.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    renderFields(panel) {
        return panel.groups.map((group, index) => {
            const hiddenElements = group.fields.filter((field) => field.hidden);
            if (hiddenElements.length === group.fields.length) {
                return null;
            }
            return this.renderGroup(group, index);
        });
    }
    scaleSize(editField, side) {
        const left = editField.panels.find((panel) => panel.panel === 'left');
        const middle = editField.panels.find((panel) => panel.panel === 'middle');
        const right = editField.panels.find((panel) => panel.panel === 'right');
        const panelFounded = editField.panels.find((panel) => panel.panel === side);

        const leftSize = left ? left.size : 0;
        const rightSize = right ? right.size : 0;
        const middleSize = middle ? middle.size : 0;
        if (side === 'bottom') {
            const bottom = editField.panels.find((panel) => panel.panel === side);
            if (bottom) {
                return bottom?.size;
            }
            return undefined;
        }
        if (leftSize + middleSize + rightSize > 100) {
            if (leftSize + middleSize > 100) {
                if (leftSize > 100) {
                    if (side === 'middle' || side === 'right') {
                        return undefined;
                    }
                    return 100;
                } else {
                    if (side === 'middle') {
                        const sizeResult = 100 - leftSize;
                        return sizeResult === 0 ? undefined : sizeResult;
                    }
                    if (side === 'right') {
                        return undefined;
                    }
                    return panelFounded?.size;
                }
            } else {
                if (side === 'right') {
                    const sizeResult = 100 - (leftSize + middleSize);
                    return sizeResult === 0 ? undefined : sizeResult;
                }
                return panelFounded?.size;
            }
        } else {
            return panelFounded?.size;
        }
    }

    calcaulateMarginsForBottomPanel = (panel) => {
        if (panel) {
            const margin = Math.floor((100 - parseInt(panel.size)) / 2);
            return 'ccol-' + margin;
        }
    };

    getPanelColSize = (size) => {
        const panelSize = size ? size : 'col-lg-4';
        if (panelSize === 'col-lg-4') {
            return panelSize;
        }
        return 'ccol-' + panelSize;
    };

    renderPanels(editData) {
        return editData?.editFields.map((editField, panelIndex) => {
            const left = editField.panels.find((panel) => panel.panel === 'left');
            const middle = editField.panels.find((panel) => panel.panel === 'middle');
            const right = editField.panels.find((panel) => panel.panel === 'right');
            const bottom = editField.panels.find((panel) => panel.panel === 'bottom');
            const marginsForBottomPanel = this.calcaulateMarginsForBottomPanel(bottom);
            const styleForPanels = {
                paddingRight: '0px',
                paddingLeft: '0px',
                boxShadow: 'none',
                paddingBottom: '0px',
            };
            const sizeLeft = this.scaleSize(editField, 'left') === 0 ? undefined : this.scaleSize(editField, 'left');
            const sizeRight = this.scaleSize(editField, 'right') === 0 ? undefined : this.scaleSize(editField, 'right');
            const sizeMiddle =
                this.scaleSize(editField, 'middle') === 0 ? undefined : this.scaleSize(editField, 'middle');
            const sizeBottom =
                this.scaleSize(editField, 'bottom') === 0 ? undefined : this.scaleSize(editField, 'bottom');
            return (
                <React.Fragment key={`panel_${panelIndex}`}>
                    {sizeLeft && (
                        <div
                            key={`div_col_left_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeLeft)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-left-${panelIndex}`}
                                id={`panel_left_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(left)}
                            </Panel>
                        </div>
                    )}
                    {sizeMiddle && (
                        <div
                            key={`div_col_middle_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeMiddle)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-middle-${panelIndex}`}
                                id={`panel_middle_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(middle)}
                            </Panel>
                        </div>
                    )}
                    {sizeRight && (
                        <div
                            key={`div_col_right_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeRight)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-right-${panelIndex}`}
                                id={`panel_right_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(right)}
                            </Panel>
                        </div>
                    )}
                    {sizeBottom && (
                        <React.Fragment>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                            <div
                                key={`div_col_bottom_${panelIndex}`}
                                className={`${this.getPanelColSize(sizeBottom)} col-md-6 col-sm-12`}
                            >
                                <Panel
                                    key={`edit-row-panel-bottom-${panelIndex}`}
                                    id={`panel_bottom_${panelIndex}`}
                                    style={styleForPanels}
                                >
                                    {this.renderFields(bottom)}
                                </Panel>
                            </div>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                        </React.Fragment>
                    )}
                </React.Fragment>
            );
        });
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

        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='fullscreen-dialog'
                    header={undefined}
                    headerStyle={{padding: '10px'}}
                    closable={false}
                    style={{width: '100%', height: '100%', maxHeight: '100%'}}
                    visible={true}
                >
                    {this.state.editListVisible && (
                        <ListOfHintsDialogComponent
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
                            }}
                            showErrorMessages={(err) => this.props.showErrorMessages(err)}
                            dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                            selectedRowData={this.state.selectedRowData}
                            defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        />
                    )}
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div className='row no-gutters'>
                            <div id='view-name' className='col-lg-4 col-md-12'>
                                <div id='label' className='label'>
                                    {this.props.editData?.editInfo?.viewName}
                                </div>
                                {opAttachment && (
                                    <ShortcutButton
                                        id={'opAttachment'}
                                        className={`grid-button-panel-big normal mt-1 mb-1 mr-1`}
                                        handleClick={this.handleAttachment}
                                        title={opAttachment?.label}
                                        label={opAttachment?.label}
                                        rendered={opAttachment}
                                    />
                                )}
                            </div>
                            <div className='col-4'></div>
                            <div className='col-lg-4 col-md-12 text-right'>
                                {opSave && (
                                    <ShortcutButton
                                        id={'opSave'}
                                        className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                        handleClick={this.handleFormSubmit}
                                        title={opSave?.label}
                                        label={opSave?.label}
                                        rendered={opSave}
                                    />
                                )}
                                {opFill && EditRowUtils.hasAnyToFillField(editData) && (
                                    <ShortcutButton
                                        id={'opFill'}
                                        className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                        handleClick={this.handleAutoFill}
                                        title={opFill?.label}
                                        label={opFill?.label}
                                        rendered={opFill}
                                    />
                                )}
                                {opCancel && (
                                    <ShortcutButton
                                        id={'opCancel'}
                                        className={`grid-button-panel-big normal mt-1 mb-1 mr-1 `}
                                        handleClick={this.handleCancel}
                                        title={opCancel?.label}
                                        label={opCancel?.label}
                                        rendered={opCancel}
                                    />
                                )}
                                {opClose && (
                                    <ShortcutButton
                                        id={'opClose'}
                                        className={`grid-button-panel-big normal mt-1 mb-1 mr-1`}
                                        handleClick={this.handleCancel}
                                        title={opClose?.label}
                                        label={opClose?.label}
                                        rendered={opClose}
                                    />
                                )}
                            </div>
                        </div>
                        <div id='row-edit' className='mt-4 row row-edit-view'>
                            {this.renderPanels(editData)}
                        </div>
                    </form>
                </Dialog>
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

        this.props.onHide(false, editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }
    handleAttachment = () => {
        const editInfo = this.props.editData?.editInfo;
        if (this.props.onAttachment) {
            this.props.onAttachment(editInfo.recordId);
        }
    };
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

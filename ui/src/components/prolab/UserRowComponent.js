import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Toast} from 'primereact/toast';
import AuthService from '../../services/AuthService';
import moment from 'moment';
import ShortcutButton from './ShortcutButton';
import {Panel} from 'primereact/panel';
import DivContainer from '../DivContainer';
import EditRowUtils from '../../utils/EditRowUtils';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {OperationType} from '../../model/OperationType';
import {ColumnType} from '../../model/ColumnType';

export default class UserRowComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.authService = new AuthService();
        this.refDataGrid = {};
        this.state = {
            user: this.props.user,
        };
    }

    render() {
        const {labels} = this.props;
        const editData = this.props.editData;
        const operations = editData.operations;
        const opSave = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_SAVE, 'Zapisz');
        const opFill = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_FILL, 'Uzupełnij');
        const opCancel = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_CANCEL, 'Anuluj');
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='right-sidebar'
                    
                    style={this.getWidthSizeSidebar()}
                    className='bg-dark'
                    header={
                        <div className='row ' style={{flex: 'auto'}}>
                            <div id='label' className='label  col-lg-12'>
                                {editData?.editInfo?.viewName}
                            </div>
                        </div>
                    }
                    icons={
                        <React.Fragment>
                            <div id='buttons' style={{textAlign: 'right'}}>
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
                                    className={`grid-button-panel normal mt-1 mb-1 mr-1`}
                                    handleClick={this.handleCancel}
                                    title={opCancel?.label}
                                    label={opCancel?.label}
                                    rendered={opCancel}
                                />
                            </div>
                        </React.Fragment>
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'860px': '75vw', '640px': '100vw'}}
                    onHide={() => this.props.onHide()}
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
                </Dialog>
            </React.Fragment>
        );
    }

    handleValidForm() {
        const editInfo = this.props.editData?.editInfo;
        this.props.onSave(editInfo.viewId, editInfo.recordId, editInfo.parentId, this.props.token);
    }

    handleAutoFill() {
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.props.kindView;
        this.props.onAutoFill(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onCancel(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    getValidDateField(field) {
        switch (field.type) {
            case ColumnType.D: //D – Data
                field.value = !!field.value ? moment(field.value, 'YYYY-MM-DD').toDate() : null;
                break;
            case ColumnType.E: //E – Data + czas
                field.value = !!field.value ? moment(field.value, 'YYYY-MM-DD HH:mm:ss').toDate() : null;
                break;
            case ColumnType.T: //T – Czas
                field.value = !!field.value ? moment(field.value, 'HH:mm:ss').toDate() : null;
                break;
            default:
                break;
        }
        return field;
    }

    renderField(field, fieldIndex, groupName) {
        const visibleDocumentCriteria = this.props?.visibleDocumentPanel;
        const {onChange} = this.props;
        const {onBlur} = this.props;
        const required = field.requiredValue && field.visible && !field.hidden;
        const validationMsg = this.validator
            ? this.validator.message(
                  `${EditRowUtils.getType(field.type)}${fieldIndex}`,
                  field.label,
                  field.value,
                  required ? 'required' : 'not_required'
              )
            : null;
        field = this.getValidDateField(field);
        return (
            <React.Fragment>
                {this.getVisibleAndHiddenResult(field) ? (
                    <DivContainer colClass={'row mb-2'}>
                        <DivContainer>
                            <div id={`field_${fieldIndex}`} className='field'>
                                <div
                                    className={validationMsg ? 'validation-msg invalid' : 'validation-msg'}
                                    aria-live='assertive'
                                >
                                    {this.renderInputComponent(
                                        field,
                                        fieldIndex,
                                        onChange,
                                        onBlur,
                                        groupName,
                                        required,
                                        validationMsg,
                                        () => {
                                            !visibleDocumentCriteria && this.editListVisible(field);
                                        }
                                    )}
                                    {validationMsg}
                                </div>
                            </div>
                        </DivContainer>
                    </DivContainer>
                ) : null}
            </React.Fragment>
        );
    }
    getVisibleAndHiddenResult(field) {
        const visibleDocumentCriteria = this.props?.visibleDocumentPanel;
        if (!visibleDocumentCriteria) {
            return field.visible && !field.hidden;
        }
        return true;
    }
    renderGroup(group, groupIndex) {
        return (
            <React.Fragment>
                <Panel
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

UserRowComponent.defaultProps = {
    visible: true,
};

UserRowComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    user: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

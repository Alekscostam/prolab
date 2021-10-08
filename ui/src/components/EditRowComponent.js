/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from "./DivContainer";
import {InputText} from "primereact/inputtext";
import BaseContainer from "../baseContainers/BaseContainer";
import {Panel} from "primereact/panel";
import ShortcutButton from "./ShortcutButton";
import {GridViewUtils} from "../utils/GridViewUtils";
import {InputNumber} from "primereact/inputnumber";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import Image from "./Image";
import SimpleReactValidator from "./validator";
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import moment from 'moment';
import UploadImageFileBase64 from "./UploadImageFileBase64";
import EditService from "../services/EditService";
import {Sidebar} from "primereact/sidebar";

export class EditRowComponent extends BaseContainer {

    constructor(props) {
        super(props);
        this.service = new EditService();
        this.booleanTypes = [
            {name: 'Tak', code: '1'},
            {name: 'Nie', code: '0'},
        ];
        this.yesNoTypes = [
            {name: 'Tak', code: 'T'},
            {name: 'Nie', code: 'N'},
        ];
        this.sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
        this.fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
        this.headerValues = [false, 1, 2, 3, 4, 5];
        this.preventSave = false;
        this.handleAutoFill = this.handleAutoFill.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    render() {
        const operations = this.props.editData?.operations;
        const opSave = GridViewUtils.containsOperationButton(operations, 'OP_SAVE');
        const opFill = GridViewUtils.containsOperationButton(operations, 'OP_FILL');
        const opCancel = GridViewUtils.containsOperationButton(operations, 'OP_CANCEL');
        let editData = this.props.editData;
        let visibleEditPanel = this.props.visibleEditPanel;
        return <React.Fragment>
            <Sidebar
                id='right-sidebar'
                visible={visibleEditPanel}
                modal={true}
                style={{width: '45%'}}
                position='right'
                onHide={() => this.props.onHide(!visibleEditPanel)}
                icons={() => (
                    <React.Fragment>
                        <div id='label' className="label"
                             style={{flex: 'auto'}}>{editData?.editInfo?.viewName}</div>
                        <div id='buttons' style={{textAlign: 'right'}}>
                            <ShortcutButton id={'opSave'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleFormSubmit}
                                            title={opSave?.label}
                                            label={opSave?.label}
                                            rendered={opSave}/>
                            <ShortcutButton id={'opFill'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleAutoFill}
                                            title={opFill?.label}
                                            label={opFill?.label}
                                            rendered={opFill}/>
                            <ShortcutButton id={'opCancel'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleCancel}
                                            title={opCancel?.label}
                                            label={opCancel?.label}
                                            rendered={opCancel}/>
                        </div>
                    </React.Fragment>
                )}
            >
                <form onSubmit={this.handleFormSubmit} noValidate>
                    <div id="row-edit" className="row-edit-container">
                        {this.preventSave ? <div id="validation-panel" className="validation-panel">
                            Wypełnij wszystkie wymagane pola
                        </div> : null}
                        {editData?.editFields?.map((group, index) => {
                                return this.renderGroup(group, index)
                            }
                        )}
                    </div>
                </form>
            </Sidebar>
        </React.Fragment>
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.preventSave = false;
            this.blockUi(this.handleValidForm);
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.preventSave = true;
            this.forceUpdate();
        }
    }

    handleValidForm() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleAutoFill() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onAutoFill(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleCancel() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onCancel(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    renderGroup(group, groupIndex) {
        return <React.Fragment>
            <Panel id={`group_${groupIndex}`} className={'mb-6'} header={group.groupName} toggleable={group.isExpanded}>
                <DivContainer>
                    {group.fields?.map((field, index) => {
                            return this.renderField(group.groupName, field, index)
                        }
                    )}
                </DivContainer>
            </Panel>
        </React.Fragment>;
    }

    renderField(groupName, field, fieldIndex) {
        const {onChange} = this.props;
        const required = field.requiredValue;
        let validationMsg = this.validator ? this.validator.message(`${this.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
        switch (field.type) {
            case 'D'://D – Data
                field.value = !!field.value ? moment(field.value, "YYYY-MM-DD").toDate() : null;
                break;
            case 'E'://E – Data + czas
                field.value = !!field.value ? moment(field.value, "YYYY-MM-DD HH:mm:ss").toDate() : null;
                break;
            case 'T'://T – Czas
                field.value = !!field.value ? moment(field.value, "HH:mm:ss").toDate() : null;
                break;
        }
        return <React.Fragment>
            {field.visible && !field.hidden ?
                <DivContainer colClass={'row mb-2'}>
                    <DivContainer>
                        <div id={`field_${fieldIndex}`} className='field'>
                            <div className={validationMsg ? 'validation-msg invalid' : 'validation-msg'}
                                 aria-live="assertive">
                                {this.renderInputComponent(field, fieldIndex, onChange, groupName, required, validationMsg)}
                                {validationMsg}
                            </div>
                        </div>
                    </DivContainer>
                </DivContainer>
                : null}
        </React.Fragment>;
    }

    getType(type) {
        switch (type) {
            case 'C'://C – Znakowy
                return 'text_field_';
            case "N"://N – Numeryczny/Liczbowy
                return 'number_field_';
            case 'B'://B – Logiczny (0/1)
                return 'bool_field_';
            case 'L'://L – Logiczny (T/N)
                return 'yes_no_field_';
            case 'D'://D – Data
                return 'date_';
            case 'E'://E – Data + czas
                return 'date_time_';
            case 'T'://T – Czas
                return 'time_';
            case 'O'://O – Opisowe
                return 'editor_';
            case 'I'://I – Obrazek
            case 'IM'://IM – Obrazek multi
                return 'image_';
            case 'H'://H - Hyperlink
                return 'link_';
        }
        return 'field';
    }

    renderInputComponent(field, fieldIndex, onChange, groupName, required, validatorMsgs) {
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const validate = !!validatorMsgs ? 'p-invalid' : '';
        const labelColor = !!field.labelColor ? field.labelColor : '';
        let editInfo = this.props.editData?.editInfo;
        switch (field.type) {
            case 'C'://C – Znakowy
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <InputText id={`${this.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               onChange={e => onChange ? onChange('TEXT', e, groupName, editInfo) : null}
                               disabled={!field.edit}
                               required={required}
                    />
                </React.Fragment>);
            case "N"://N – Numeryczny/Liczbowy
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <InputText id={`${this.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${validate}`}
                               style={{width: '100%'}}
                               value={field.value}
                               type="number"
                               onChange={e => onChange ? onChange('TEXT', e, groupName, editInfo) : null}
                               disabled={!field.edit}
                               required={required}
                               padControl="false"
                    />
                </React.Fragment>);
            case 'B'://B – Logiczny (0/1)
                return (<React.Fragment>
                    <label htmlFor={`bool_field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Dropdown optionLabel="name"
                              id={`${this.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={this.booleanTypes}
                              onChange={e => onChange ? onChange('DROPDOWN', e, groupName, editInfo) : null}
                              appendTo="self"
                              showClear
                              optionLabel="name"
                              optionValue="code"
                              dataKey="code"
                              disabled={!field.edit}
                              required={required}/>
                </React.Fragment>);
            case 'L'://L – Logiczny (T/N)
                return (<React.Fragment>
                    <label htmlFor={`yes_no_field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Dropdown optionLabel="name"
                              id={`${this.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={this.yesNoTypes}
                              onChange={e => onChange ? onChange('DROPDOWN', e, groupName, editInfo) : null}
                              appendTo="self"
                              showClear
                              optionLabel="name"
                              optionValue="code"
                              dataKey="code"
                              disabled={!field.edit}
                              required={required}/>
                </React.Fragment>);
            case 'D'://D – Data
                return (<React.Fragment>
                    <label htmlFor={`date_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${this.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              onChange={e => onChange ? onChange('DATE', e, groupName, editInfo) : null}
                              appendTo="self"
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'E'://E – Data + czas
                return (<React.Fragment>
                    <label htmlFor={`date_time_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${this.getType(field.type)}${fieldIndex}`}
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              appendTo="self"
                              onChange={e => onChange ? onChange('DATETIME', e, groupName, editInfo) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'T'://T – Czas
                return (<React.Fragment>
                    <label htmlFor={`time_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${this.getType(field.type)}${fieldIndex}`}
                              timeOnly
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              appendTo="self"
                              onChange={e => onChange ? onChange('TIME', e, groupName, editInfo) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'O'://O – Opisowe
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`${this.getType(field.type)}${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <HtmlEditor
                        id={`editor_${fieldIndex}`}
                        className={`editor ${autoFill} ${validate}`}
                        defaultValue={field.value}
                        onValueChange={e => {
                            let event = {
                                name: field.fieldName,
                                value: e
                            }
                            onChange('EDITOR', event, groupName, editInfo)
                        }}
                        validationMessageMode="always"
                        disabled={!field.edit}
                        required={true}
                    >  {required ? <Validator>
                        <RequiredRule message={`Pole jest wymagane`}/>
                    </Validator> : null}
                        <MediaResizing enabled={true}/>
                        <Toolbar>
                            <Item name="undo"/>
                            <Item name="redo"/>
                            <Item name="separator"/>
                            <Item name="size" acceptedValues={this.sizeValues}/>
                            <Item name="font" acceptedValues={this.fontValues}/>
                            <Item name="header" acceptedValues={this.headerValues}/>
                            <Item name="separator"/>
                            <Item name="bold"/>
                            <Item name="italic"/>
                            <Item name="strike"/>
                            <Item name="underline"/>
                            <Item name="subscript"/>
                            <Item name="superscript"/>
                            <Item name="separator"/>
                            <Item name="alignLeft"/>
                            <Item name="alignCenter"/>
                            <Item name="alignRight"/>
                            <Item name="alignJustify"/>
                            <Item name="separator"/>
                            <Item name="orderedList"/>
                            <Item name="bulletList"/>
                            <Item name="separator"/>
                            <Item name="color"/>
                            <Item name="background"/>
                            <Item name="separator"/>
                            <Item name="insertTable"/>
                            <Item name="deleteTable"/>
                            <Item name="insertRowAbove"/>
                            <Item name="insertRowBelow"/>
                            <Item name="deleteRow"/>
                            <Item name="insertColumnLeft"/>
                            <Item name="insertColumnRight"/>
                            <Item name="deleteColumn"/>
                        </Toolbar>
                    </HtmlEditor>
                </React.Fragment>);
            case 'I'://I – Obrazek
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className="image-base">
                        <label style={{color: labelColor}}
                               htmlFor={`image_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                        <br/>
                        <Image id={`${this.getType(field.type)}`}
                               style={{maxWidth: '100%'}}
                               className={`img-responsive ${autoFill} ${validate}`}
                               alt={field.label}
                               base64={field.value}
                               rendered={!!field.value}/>
                        <UploadImageFileBase64
                            id={`${this.getType(field.type)}`}
                            name={field.fieldName}
                            multiple={true}
                            disabled={!field.edit}
                            required={required}
                            onDone={e => {
                                onChange('IMAGE64', e, groupName, editInfo)
                            }}
                        />
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <InputText id={`${this.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               onChange={e =>
                                   onChange ? onChange('TEXT', e, groupName, editInfo) : null
                               }
                               disabled={!field.edit}
                               required={required}
                    />
                    <a href={field.value} style={{float: 'right'}}
                       target='_blank'>
                        {field.label}
                    </a>
                </React.Fragment>);
        }
    }

    getFiles(files) {
        console.log(files[0].base64)
    }

}

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    visibleEditPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
};

export default EditRowComponent;

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
import {InputTextarea} from "primereact/inputtextarea";
import Image from "./Image";
import SimpleReactValidator from "./validator";

export class EditRowComponent extends BaseContainer {

    constructor(props) {
        super(props);
        this.booleanTypes = [
            {name: 'Tak', code: '0'},
            {name: 'Nie', code: '1'},
        ];
        this.yesNoTypes = [
            {name: 'Tak', code: 'T'},
            {name: 'Nie', code: 'N'},
        ];
    }

    render() {
        const operations = this.props.editData.operations;
        const opSave = GridViewUtils.containsOperationButton(operations, 'OP_SAVE');
        const opFill = GridViewUtils.containsOperationButton(operations, 'OP_FILL');
        const opCancel = GridViewUtils.containsOperationButton(operations, 'OP_CANCEL');
        let editData = this.props.editData;
        return <React.Fragment>
            <form onSubmit={this.handleFormSubmit} noValidate>
                <div id="row-edit" className="row-edit-container">
                    <b>Funkcjonalność w przygotowaniu ...</b>
                    <br/>
                    <div className="label">{editData.editInfo?.viewName}</div>
                    <br/>
                    {editData.editFields?.map((group, index) => {
                            return this.renderGroup(group, index)
                        }
                    )}
                    <div id='buttons'>
                        <ShortcutButton id={'opSave'}
                                        className={`grid-button-panel mr-2`}
                                        handleClick={this.handleFormSubmit}
                                        title={opSave?.label}
                                        label={opSave?.label}
                                        rendered={opSave}/>
                        <ShortcutButton id={'opFill'}
                                        className={`grid-button-panel mr-2`}
                                        handleClick={(e) => {
                                        }}
                                        title={opFill?.label}
                                        label={opFill?.label}
                                        rendered={opFill}/>
                        <ShortcutButton id={'opCancel'}
                                        className={`grid-button-panel mr-2`}
                                        handleClick={(e) => {
                                        }}
                                        title={opCancel?.label}
                                        label={opCancel?.label}
                                        rendered={opCancel}/>
                    </div>
                </div>
            </form>
        </React.Fragment>
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.blockUi(this.handleValidForm);
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.forceUpdate();
        }
    }

    renderGroup(group, groupIndex) {
        return <React.Fragment>
            <Panel className={'mb-4'} header={group.groupName} toggleable={group.isExpanded}>
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
        const {
            onChange
        } = this.props;
        return <React.Fragment>
            {field.visible && !field.hidden ?
                <DivContainer colClass={'row mb-2'}>
                    <DivContainer>
                        {this.renderInputComponent(field, fieldIndex, onChange, groupName)}
                    </DivContainer>
                </DivContainer>
                : null}

        </React.Fragment>;
    }

    renderInputComponent(field, fieldIndex, onChange, groupName) {
        const required = true;
        switch (field.type) {
            case 'C'://C – Znakowy
                return (<React.Fragment>
                    <span className="p-float-label">
                        <InputText id={`text_field_${fieldIndex}`}
                                   name={field.fieldName}
                                   style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                   type="text"
                                   value={field.value}
                                   validator={this.props.validator}
                                   validators={required ? 'required' : 'not_required'}
                                   onChange={e =>
                                       onChange ? onChange('TEXT', e, groupName) : null
                                   }
                                   disabled={!field.edit}
                        />
                        <label htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    </span>
                </React.Fragment>);
            case "N"://N – Numeryczny/Liczbowy
                return (<React.Fragment>
                     <span className="p-float-label">
                        <InputNumber id={`number_field_${fieldIndex}`}
                                     name={field.fieldName}
                                     style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                     type="text"
                                     value={field.value}
                                     validator={this.props.validator}
                                     validators={required ? 'required' : 'not_required'}
                                     onChange={e => onChange ? onChange('NUMBER', e, groupName) : null}
                                     mode="decimal"
                                     maxFractionDigits={20}
                                     disabled={!field.edit}
                        />
                        <label htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    </span>
                </React.Fragment>);
            case 'B'://B – Logiczny (0/1)
                return (<React.Fragment>
                         <span className="p-float-label">
                            <Dropdown optionLabel="name"
                                      id={`bool_field_${fieldIndex}`}
                                      name={field.fieldName}
                                      style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                      value={field.value}
                                      validator={this.props.validator}
                                      validators={required ? 'required' : 'not_required'}
                                      options={this.booleanTypes}
                                      onChange={e => onChange ? onChange('DROPDOWN', e, groupName) : null}
                                      appendTo="self"
                                      showClear
                                      disabled={!field.edit}/>
                                <label htmlFor={`bool_field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                         </span>
                </React.Fragment>);
            case 'L'://L – Logiczny (T/N)
                return (<React.Fragment>
                     <span className="p-float-label">
                    <Dropdown optionLabel="name"
                              id={`yes_no_field_${fieldIndex}`}
                              name={field.fieldName}
                              style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                              value={field.value}
                              validator={this.props.validator}
                              validators={required ? 'required' : 'not_required'}
                              options={this.yesNoTypes}
                              onChange={e => onChange ? onChange('DROPDOWN', e, groupName) : null}
                              appendTo="self"
                              showClear
                              disabled={!field.edit}/>
                           <label htmlFor={`yes_no_field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                     </span>
                </React.Fragment>);
            case 'D'://D – Data
                return (<React.Fragment>
                     <span className="p-float-label">
                       <Calendar id={`date_${fieldIndex}`}
                                 name={field.fieldName}
                                 style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                 value={field.value}
                                 validator={this.props.validator}
                                 validators={required ? 'required' : 'not_required'}
                                 dateFormat="yy-mm-dd"
                                 onChange={e => onChange ? onChange('DATE', e, groupName) : null}
                                 appendTo="self"
                                 disabled={!field.edit}>
                         </Calendar>
                           <label htmlFor={`date_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                     </span>
                </React.Fragment>);
            case 'E'://E – Data + czas
                return (<React.Fragment>
                     <span className="p-float-label">
                         <Calendar id={`date_time_${fieldIndex}`}
                                   showTime
                                   hourFormat="24"
                                   name={field.fieldName}
                                   style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                   value={field.value}
                                   validator={this.props.validator}
                                   validators={required ? 'required' : 'not_required'}
                                   dateFormat="yy-mm-dd"
                                   appendTo="self"
                                   onChange={e => onChange ? onChange('DATETIME', e, groupName) : null}
                                   disabled={!field.edit}>
                         </Calendar>
                           <label htmlFor={`date_time_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                     </span>
                </React.Fragment>);
            case 'T'://T – Czas
                return (<React.Fragment>
                     <span className="p-float-label">
                          <Calendar id={`time_${fieldIndex}`}
                                    timeOnly
                                    showTime
                                    hourFormat="24"
                                    name={field.fieldName}
                                    style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                    value={field.value}
                                    validator={this.props.validator}
                                    validators={required ? 'required' : 'not_required'}
                                    appendTo="self"
                                    onChange={e => onChange ? onChange('TIME', e, groupName) : null}
                                    disabled={!field.edit}>
                          </Calendar>
                           <label htmlFor={`time_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                     </span>
                </React.Fragment>);
            case 'O'://O – Opisowe
                return (<React.Fragment>
                     <span className="p-float-label">
                             <InputTextarea id={`area_${fieldIndex}`}
                                            name={field.fieldName}
                                            rows={5}
                                            cols={30}
                                            style={{width: '100%', color: field.labelColor ? field.labelColor : null}}
                                            type="text"
                                            value={field.value}
                                            validator={this.props.validator}
                                            validators={required ? 'required' : 'not_required'}
                                            onChange={e => onChange ? onChange('AREA', e, groupName) : null}
                                            autoResize
                                            disabled={!field.edit}
                             />
                           <label htmlFor={`time_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                     </span>
                </React.Fragment>);
            case 'I'://I – Obrazek
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <Image alt={field.label} base64={field.value}/>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <a href={field.value} style={{color: field.labelColor ? field.labelColor : null}} target='_blank'
                       rel='noopener noreferrer'>
                        {field.label}{required ? '*' : ''}
                    </a>
                </React.Fragment>);
        }
    }

}

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    editData: PropTypes.object.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
};

export default EditRowComponent;

/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from "../DivContainer";
import {InputText} from "primereact/inputtext";
import BaseContainer from "../../baseContainers/BaseContainer";
import ShortcutButton from "./ShortcutButton";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import SimpleReactValidator from "../validator";
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import moment from 'moment';
import {Sidebar} from "primereact/sidebar";
import UploadMultiImageFileBase64 from "./UploadMultiImageFileBase64";
import {Checkbox} from "primereact/checkbox";
import ConsoleHelper from "../../utils/ConsoleHelper";
import {Toast} from "primereact/toast";
import EditRowUtils from "../../utils/EditRowUtils";
import MockService from "../../services/MockService";
import LocUtils from "../../utils/LocUtils";
import CrudService from "../../services/CrudService";
import { DataGridUtils } from '../../utils/component/DataGridUtils';

export class DocumentRowComponent extends BaseContainer {

    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            loading: true,
            preventSave: false
        };

        this.yesNoTypes = [
            {name: 'Tak', code: 'T'},
            {name: 'Nie', code: 'N'},
        ];
        this.sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
        this.fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
        this.headerValues = [false, 1, 2, 3, 4, 5];
        this.messages = React.createRef();
        this.handleCancel = this.handleCancel.bind(this);
        this.selectionListValuesToJson = this.selectionListValuesToJson.bind(this);
        this.fieldsMandatoryLabel = LocUtils.loc(this.props.labels, 'Fields_Mandatory_Label', 'Wypełnij wszystkie wymagane pola');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const visibleDocumentPanelPrevious = prevProps.visibleDocumentPanel;
        const visibleDocumentPanel = this.props.visibleDocumentPanel;
        console.log('visibleDocumentPanelPrevious %s %visibleDocumentPanel', visibleDocumentPanelPrevious, visibleDocumentPanel)
        //wykrycie eventu wysunięcia panelu z edycją
        if (visibleDocumentPanelPrevious === false && visibleDocumentPanel === true) {
            this.setState({preventSave: false});
        }
        super.componentDidUpdate();
    }

    createObjectToSave(rowArray) {
        let arrayTmp = [];
        for (let row of rowArray) {
            if(row.type==="B"){
                row.value = row.value === null ? false : row.value;   
            }
            arrayTmp.push({'fieldName': row.fieldName, 'value': row.value});
        }
        return arrayTmp;
    }

    render() {
        const visibleDocumentPanel = this.props.visibleDocumentPanel;
        let inputDataFields = this.props.documentInfo.inputDataFields; 

        return <React.Fragment>
            <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)}/>
            
            <Sidebar
                id='right-sidebar'
                visible={visibleDocumentPanel}
                modal={true}
                style={{width: '45%'}}
                position='right'
                onHide={() => {
                    this.props.onHide()
                }}
                icons={() => (
                    <React.Fragment>
                        <div id='label' className="label" style={{flex: 'auto'}}>
                        {LocUtils.loc(this.props.labels, '', 'Zatwierdzanie kryteriów')}
                        </div>
                        <div id='buttons' style={{textAlign: 'right'}}>
                            <ShortcutButton id={'opSave'}
                                            className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                            handleClick={this.handleFormSubmit}
                                            title={"Zatwierdzanie kryteriów"}
                                            label={LocUtils.loc(this.props.labels, '', 'Zatwierdź')}
                                            />
                            <ShortcutButton id={'opCancel'}
                                            className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                            handleClick={this.handleCancel}
                                            title={"Anulowanie"}
                                            label={LocUtils.loc(this.props.labels, '', 'Anuluj')}
                                            />
                        </div>
                    </React.Fragment>
                )}>
                <form onSubmit={this.handleFormSubmit} noValidate>
                    <div id="row-edit" className="row-edit-container">
                        {this.state.preventSave ?
                            <div id="validation-panel" className="validation-panel">
                                {this.fieldsMandatoryLabel}
                            </div> : null}
                            {inputDataFields?.map((field, index) => {return this.renderField(field, index)})}
                    </div>
                </form>
            </Sidebar>
        </React.Fragment>
    }

    handleCancel(){
        this.props.onHide();
    }
    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.setState({preventSave: false},()=>{
                this.blockUi(this.handleValidForm);
            });
        } else {
            this.setState({preventSave: true},()=>{
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
        const data =  this.createObjectToSave(this.props.documentInfo.inputDataFields);
        const info = this.props.documentInfo.info;
        const parentIdArg =  info.parentId ? `${info.parentId}` : null; 
        this.props.onSave(data, `${info.viewId}`, `${info.viewObjectId}`, parentIdArg );
    }

    renderField(field, fieldIndex) {
        const {onChange} = this.props;
        const {onBlur} = this.props;
        const required = field.requiredValue && field.visible && !field.hidden;
        let validationMsg = this.validator ? this.validator.message(`${EditRowUtils.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
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
            default:
                break;
        }
        return <React.Fragment>
                <DivContainer colClass={'row mb-2'}>
                    <DivContainer>
                        <div id={`field_${fieldIndex}`} className='field'>
                            <div className={validationMsg ? 'validation-msg invalid' : 'validation-msg'}
                                 aria-live="assertive">
                                {this.renderInputComponent(field, fieldIndex, onChange, onBlur, required, validationMsg, () => {})}
                                {validationMsg}
                            </div>
                        </div>
                    </DivContainer>
                </DivContainer>
        </React.Fragment>;
    }

    selectionListValuesToJson(selectionListValues){
        let selectionListValuesJson =[]
        for (let index = 0; index < selectionListValues.length; index++) {
            let one = { "name" : selectionListValues[index] }
            selectionListValuesJson.push(one)
        } 
        return selectionListValuesJson
    }

    renderInputComponent(field, fieldIndex, onChange, onBlur, required, validatorMsgs, onClickEditList) {
        //mock functionality
        field.edit = MockService.getFieldEnableDisableOrMock(field.edit, 'edit');
        field.autoFill = MockService.getFieldEnableDisableOrMock(field.autoFill, 'autoFill');
        field.autoFillOnlyEmpty = MockService.getFieldEnableDisableOrMock(field.autoFillOnlyEmpty, 'autoFillOnlyEmpty');
        field.requiredValue = MockService.getFieldEnableDisableOrMock(required, 'requiredValue');
        field.refreshFieldVisibility = MockService.getFieldEnableDisableOrMock(field.refreshFieldVisibility, 'refreshFieldVisibility');
        field.selectionList = MockService.getFieldEnableDisableOrMock(field.selectionList, 'selectionList');
        field.visible = MockService.getFieldEnableDisableOrMock(field.visible, 'visible');
        //end mock functionality
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const editable = field?.edit ? 'editable-border' : '';
        const validate = !!validatorMsgs ? 'p-invalid' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const validateCheckbox = !!validatorMsgs ? 'p-invalid-checkbox' : '';
        const labelColor = !!field.labelColor ? field.labelColor : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        let selectionListValues = field?.selectionListValues;
        if(selectionListValues){
            selectionListValues = this.selectionListValuesToJson(selectionListValues)
        }

        switch (field.type) {
            case 'C': // C – Znakowy
            default:
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}
                           style={{color: labelColor}}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <div>
                        {!!selectionList ? 
                        <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={selectionListValues}
                              onChange={e => onChange ? onChange('DROPDOWN', e) : null}
                              appendTo="self"
                              showClear
                              filter 
                              filterBy={"name"} 
                              optionLabel="name"
                              optionValue="name"
                            //   disabled={!field.edit}
                              disabled={field.edit}
                              required={required}/> : 
                    <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={` ${editable} ${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              type="text"
                              value={field.value}
                              onChange={e => onChange ? onChange('TEXT', e) : null}
                              onBlur={e => onBlur ? onBlur('TEXT',e) : null}
                              disabled={!field.edit}
                              required={required}
                   />}


                    </div>
                </React.Fragment>);
            case "N"://N – Numeryczny/Liczbowy
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <div>
                      
                        {!!selectionList ? 
                        <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            value={field.value}
                            options={selectionListValues}
                            onChange={e => onChange ? onChange('DROPDOWN', e) : null}
                            appendTo="self"
                            showClear
                            filter 
                            filterBy={"name"} 
                            optionLabel="name"
                            optionValue="name"
                            disabled={!field.edit}
                            required={required}/> 
                            :  <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                                   name={field.fieldName}
                                                   className={`${autoFill} ${editable} ${validate}`}
                                                   style={{width: '100%'}}
                                                   value={field.value}
                                                   type="number"
                                                   onChange={e => onChange ? onChange('TEXT', e) : null}
                                                   onBlur={e => onBlur ? onBlur('TEXT', e) : null}
                                                   disabled={!field.edit}
                                                   required={required}
                            />}

                                                   
                    </div>
                </React.Fragment>);
            case 'B': //B – Logiczny (0/1)
                return (<React.Fragment>
                    <label htmlFor={`bool_field_${fieldIndex}`}
                           title={MockService.printField(field)}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <br/>
                    <div style={{display: 'inline-block'}}
                         className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}>
                        <Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  name={field.fieldName}
                                  onChange={(e) => {
                                      if (this.props.onChange) {
                                          this.props.onChange('CHECKBOX', e);
                                      }
                                  }}
                                  checked={field.value === true || DataGridUtils.conditionForTrueValueForBoolType(field.value)}
                                  disabled={!field.edit}
                                  required={required}
                        />
                        
                    </div>
                </React.Fragment>);
            case 'L': // L – Logiczny (T/N)
                return (<React.Fragment>
                    <label htmlFor={`yes_no_field_${fieldIndex}`}
                           style={{color: labelColor}}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={this.yesNoTypes}
                              onChange={e => onChange ? onChange('DROPDOWN', e) : null}
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
                           style={{color: labelColor}}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              onChange={e => onChange ? onChange('DATE', e) : null}
                              appendTo={document.body}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon
                              mask="9999-99-99">
                    </Calendar>
                </React.Fragment>);
            case 'E'://E – Data + czas
                return (<React.Fragment>
                    <label htmlFor={`date_time_${fieldIndex}`}
                           style={{color: labelColor}}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              appendTo={document.body}
                              onChange={e => onChange ? onChange('DATETIME', e) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon
                              mask="9999-99-99 99:99">
                    </Calendar>
                </React.Fragment>);
            case 'T'://T – Czas
                return (<React.Fragment>
                    <label htmlFor={`time_${fieldIndex}`}
                           style={{color: labelColor}}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              timeOnly
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              appendTo={document.body}
                              onChange={e => onChange ? onChange('TIME', e) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon
                              mask="99:99">
                    </Calendar>
                </React.Fragment>);
            case 'O'://O – Opisowe
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <HtmlEditor
                        id={`editor_${fieldIndex}`}
                        className={`editor ${autoFill} ${editable} ${validate}`}
                        defaultValue={field.value}
                        onValueChange={e => {
                            let event = {
                                name: field.fieldName,
                                value: e
                            }
                            onChange('EDITOR', event)
                        }}
                        onFocusOut={e => onBlur ? onBlur('EDITOR', e) : null}
                        validationMessageMode="always"
                        disabled={!field.edit}
                        required={required}
                    >  {required ? <Validator>
                        <RequiredRule message={`Pole jest wymagane`}/>
                    </Validator> : null}
                        <MediaResizing enabled={true}/>
                        <Toolbar multiline={false}>
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
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <label style={{color: labelColor}}
                               htmlFor={`image_${fieldIndex}`}
                               title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                        <br/>
                        <UploadMultiImageFileBase64 multiple={false}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChange('IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        })}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <label style={{color: labelColor}}
                               htmlFor={`image_${fieldIndex}`}
                               title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                        <br/>
                        <UploadMultiImageFileBase64 multiple={true}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChange('MULTI_IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        })}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`field_${fieldIndex}`}
                           title={MockService.printField(field)}>{field.label}{required ? '*' : ''}</label>
                    <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${editable} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               onChange={e =>
                                   onChange ? onChange('TEXT', e) : null
                               }
                               onBlur={e => onBlur ? onBlur('TEXT', e) : null}
                               disabled={!field.edit}
                               required={required}
                    />
                    <a href={field.value} style={{float: 'right'}} rel="noreferrer"
                       target='_blank'>
                        {field.label}
                    </a>
                </React.Fragment>);
        }
    }

    getMessages() {
        return this.messages;
    }

    getFiles(files) {
        ConsoleHelper(files[0].base64)
    }

}

DocumentRowComponent.defaultProps = {};

DocumentRowComponent.propTypes = {
    visibleDocumentPanel: PropTypes.bool.isRequired,
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
    labels: PropTypes.object.isRequired,
};

export default DocumentRowComponent;

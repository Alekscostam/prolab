import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../../components/Image';
import {ViewDataCompUtils} from "./ViewDataCompUtils";
import {InputText} from "primereact/inputtext";
import EditRowUtils from "../EditRowUtils";
import {Button} from "primereact/button";
import {Password} from "primereact/password";
import {Checkbox} from "primereact/checkbox";
import {DataGridUtils} from "./DataGridUtils";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import HtmlEditor, {Item, MediaResizing, Toolbar} from "devextreme-react/html-editor";
import {Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import UploadMultiImageFileBase64 from "../../components/prolab/UploadMultiImageFileBase64";

export class TreeListUtils extends ViewDataCompUtils {

    editCellRender(field, cellInfo) {

        const setEditedValue = (valueChangedEventArg) => {
            cellInfo.setValue(valueChangedEventArg.value);
        }

        let _rowIndex = null;
        let _bgColor = null;
        let _fontcolor = null;

        // return function (element, info) {
        // let bgColorFinal = undefined;
        // let rowSelected = null;
        // if (_rowIndex !== info.row.dataIndex) {
        //     rowSelected = info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
        //     _rowIndex = info.row.dataIndex;
        //     _bgColor = info.data['_BGCOLOR'];
        //     _fontcolor = info.data['_FONTCOLOR'];
        // }
        // if (!!rowSelected) {
        //     bgColorFinal = undefined;
        // } else {
        //     const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
        //     if (!!specialBgColor) {
        //         bgColorFinal = specialBgColor;
        //     } else {
        //         if (_bgColor) {
        //             element.style.backgroundColor = _bgColor;
        //             bgColorFinal = undefined;
        //         }
        //     }
        // }
        // let fontColorFinal = 'black';
        // const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
        // if (!!specialFontColor) {
        //     fontColorFinal = specialFontColor;
        // } else {
        //     if (!!_fontcolor) {
        //         fontColorFinal = _fontcolor;
        //     }
        // }
        //TODO mock
        field.edit = true;
        //----------------
        if (field.edit === true) {
            //TODO
            // const rowId = info.data.ID;
            const fieldIndex = field.id;
            const required = field.requiredValue && field.visible && !field.hidden;
            const validationMsg = this.validator ? this.validator.message(`${EditRowUtils.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
            const validateCheckbox = !!validationMsg ? 'p-invalid-checkbox' : '';
            const autoFill = field?.autoFill ? 'autofill-border' : '';
            const editable = field?.edit ? 'editable-border' : '';
            const validate = !!validationMsg ? 'p-invalid' : '';
            const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
            const selectionList = field?.selectionList ? 'p-inputgroup' : null;
            const refreshFieldVisibility = !!field?.refreshFieldVisibility;
            switch (field?.type) {
                case 'C':
                    return ReactDOM.render(
                        (<React.Fragment>
                            <div className={`${selectionList}`}>
                                <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                           name={field.fieldName}
                                           className={` ${editable} ${autoFill} ${validate}`}
                                           style={{width: '100%'}}
                                           type="text"
                                    // value={info.value}
                                    // onChange={e => onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null}
                                           value={cellInfo.value}
                                           onChange={e => setEditedValue(e)}
                                    // onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                                           disabled={!field.edit}
                                           required={required}
                                />
                                {/*{!!selectionList ?*/}
                                {/*    <Button type="button" onClick={onClickEditListCallback}*/}
                                {/*            icon="pi pi-question-circle"*/}
                                {/*            className="p-button-secondary"/> : null}*/}
                            </div>
                        </React.Fragment>)
                        // ,
                        // element
                    );
                case 'P'://P - hasło
                    return (<React.Fragment>
                        <div className={`${selectionList}`}>
                            <Password id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                      name={field.fieldName}
                                      className={`${autoFill} ${editable} ${validate}`}
                                      style={{width: '100%'}}
                                      type="text"
                                      value={field.value}
                                // onChange={e => onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null}
                                // onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                                      disabled={!field.edit}
                                      required={required}
                                      feedback={false}
                            />
                            {/*{!!selectionList ?*/}
                            {/*    <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"*/}
                            {/*            className="p-button-secondary"/> : null}*/}
                        </div>
                    </React.Fragment>);
                case "N"://N – Numeryczny/Liczbowy
                    return (<React.Fragment>
                        <div className={`${selectionList}`}>
                            <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                       name={field.fieldName}
                                       className={`${autoFill} ${editable} ${validate}`}
                                       style={{width: '100%'}}
                                       value={field.value}
                                       type="number"
                                // onChange={e => onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null}
                                // onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                                       disabled={!field.edit}
                                       required={required}
                            />
                            {/*{!!selectionList ?*/}
                            {/*    <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"*/}
                            {/*            className="p-button-secondary"/> : null}*/}
                        </div>
                    </React.Fragment>);
                case 'B'://B – Logiczny (0/1)
                    return (<React.Fragment>
                        <div style={{display: 'inline-block'}}
                             className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}>
                            {/*<Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}*/}
                            {/*          name={field.fieldName}*/}
                            {/*          onChange={(e) => {*/}
                            {/*              if (this.props.onChange) {*/}
                            {/*                  e.refreshFieldVisibility = refreshFieldVisibility*/}
                            {/*                  this.props.onChange('CHECKBOX', e, rowId, info);*/}
                            {/*              }*/}
                            {/*          }}*/}
                            {/*          checked={field.value === true || DataGridUtils.conditionForTrueValueForBoolType(field.value)}*/}
                            {/*          disabled={!field.edit}*/}
                            {/*          required={required}*/}
                            {/*/>*/}
                        </div>
                    </React.Fragment>);
                case 'L'://L – Logiczny (T/N)
                    return (<React.Fragment>
                        <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  name={field.fieldName}
                                  className={`${autoFill} ${editable} ${validate}`}
                                  style={{width: '100%'}}
                                  value={field.value}
                                  options={this.yesNoTypes}
                            // onChange={e => onChangeCallback ? onChangeCallback('DROPDOWN', e, rowId, info) : null}
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
                        <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  name={field.fieldName}
                                  className={`${autoFill} ${editable} ${validate}`}
                                  style={{width: '100%'}}
                                  value={field.value}
                                  dateFormat="yy-mm-dd"
                            // onChange={e => onChangeCallback ? onChangeCallback('DATE', e, rowId, info) : null}
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
                        <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  showTime
                                  hourFormat="24"
                                  name={field.fieldName}
                                  className={`${autoFill} ${editable} ${validate}`}
                                  style={{width: '100%'}}
                                  value={field.value}
                                  dateFormat="yy-mm-dd"
                                  appendTo={document.body}
                            // onChange={e => onChangeCallback ? onChangeCallback('DATETIME', e, rowId, info) : null}
                                  disabled={!field.edit}
                                  required={required}
                                  showButtonBar
                                  showIcon
                                  mask="9999-99-99 99:99">
                        </Calendar>
                    </React.Fragment>);
                case 'T'://T – Czas
                    return (<React.Fragment>
                        <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  timeOnly
                                  showTime
                                  hourFormat="24"
                                  name={field.fieldName}
                                  className={`${autoFill} ${editable} ${validate}`}
                                  style={{width: '100%'}}
                                  value={field.value}
                                  appendTo={document.body}
                            // onChange={e => onChangeCallback ? onChangeCallback('TIME', e, rowId, info) : null}
                                  disabled={!field.edit}
                                  required={required}
                                  showButtonBar
                                  showIcon
                                  mask="99:99">
                        </Calendar>
                    </React.Fragment>);
                case 'O'://O – Opisowe
                    return (<React.Fragment>
                        <HtmlEditor
                            id={`editor_${fieldIndex}`}
                            className={`editor ${autoFill} ${editable} ${validate}`}
                            defaultValue={field.value}
                            // onValueChange={e => {
                            //     let event = {
                            //         name: field.fieldName,
                            //         value: e
                            //     }
                            //     onChangeCallback('EDITOR', event, rowId, info)
                            // }}
                            // onFocusOut={e => onBlurCallback ? onBlurCallback('EDITOR', e, rowId, info) : null}
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
                            <UploadMultiImageFileBase64 multiple={false}
                                                        displayText={""}
                                                        alt={field.label}
                                                        initBase64={field.value}
                                // onSuccessB64={(e) => onChangeCallback('IMAGE64', {
                                //         fieldName: field.fieldName,
                                //         base64: e
                                //     },
                                //     rowId,
                                //     info)}
                                                        onError={(e) => this.props.onError(e)}/>
                        </div>
                    </React.Fragment>);
                case 'IM'://IM – Obrazek multi
                    return (<React.Fragment>
                        <div className={`image-base ${autoFill} ${validate}`}>
                            <UploadMultiImageFileBase64 multiple={true}
                                                        displayText={""}
                                                        alt={field.label}
                                                        initBase64={field.value}
                                // onSuccessB64={(e) => onChangeCallback('MULTI_IMAGE64', {
                                //         fieldName: field.fieldName,
                                //         base64: e
                                //     },
                                //     rowId,
                                //     info)}
                                                        onError={(e) => this.props.onError(e)}/>
                        </div>
                    </React.Fragment>);
                case 'H'://H - Hyperlink
                    return (<React.Fragment>
                        <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                   name={field.fieldName}
                                   className={`${autoFill} ${editable} ${validate}`}
                                   style={{width: '100%'}}
                                   type="text"
                                   value={field.value}
                            // onChange={e =>
                            //     onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null
                            // }
                            // onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                                   disabled={!field.edit}
                                   required={required}
                        />
                        <a href={field.value} style={{float: 'right'}} rel="noreferrer"
                           target='_blank'>
                            {field.label}
                        </a>
                    </React.Fragment>)
                default:
                    return ReactDOM.render(
                        // <div
                        //     style={{
                        //         display: 'inline',
                        //         backgroundColor: bgColorFinal,
                        //         color: fontColorFinal,
                        //         borderRadius: '25px',
                        //         padding: '2px 6px 2px 6px',
                        //     }}
                        //     title={info.text}
                        // >
                        //     {info.text}
                        // </div>,
                        // element
                    );
            }
        }
        // };
    }

    static cellTemplate(field, onChangeCallback, onBlurCallback) {

        let _rowIndex = null;
        let _bgColor = null;
        let _fontcolor = null;

        return function (element, info) {
            let bgColorFinal = undefined;
            let rowSelected = null;
            if (_rowIndex !== info.row.dataIndex) {
                rowSelected = info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
                _rowIndex = info.row.dataIndex;
                _bgColor = info.data['_BGCOLOR'];
                _fontcolor = info.data['_FONTCOLOR'];
            }
            if (!!rowSelected) {
                bgColorFinal = undefined;
            } else {
                const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
                if (!!specialBgColor) {
                    bgColorFinal = specialBgColor;
                } else {
                    if (_bgColor) {
                        element.style.backgroundColor = _bgColor;
                        bgColorFinal = undefined;
                    }
                }
            }
            let fontColorFinal = 'black';
            const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
            if (!!specialFontColor) {
                fontColorFinal = specialFontColor;
            } else {
                if (!!_fontcolor) {
                    fontColorFinal = _fontcolor;
                }
            }
            //TODO mock
            field.edit = true;
            //----------------
            return TreeListUtils.editableCell(field, element, info, bgColorFinal, fontColorFinal, onChangeCallback, onBlurCallback);
        };
    }

    static editableCell(field, element, info, bgColorFinal, fontColorFinal, onChangeCallback, onBlurCallback, onClickEditListCallback) {
        //TODO
        const rowId = info.data.ID;
        const fieldIndex = field.id;
        const required = field.requiredValue && field.visible && !field.hidden;
        const validationMsg = this.validator ? this.validator.message(`${EditRowUtils.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
        const validateCheckbox = !!validationMsg ? 'p-invalid-checkbox' : '';
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const editable = field?.edit ? 'editable-border' : '';
        const validate = !!validationMsg ? 'p-invalid' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        const refreshFieldVisibility = !!field?.refreshFieldVisibility;
        switch (field?.type) {
            case 'C':
                return ReactDOM.render(
                    (<React.Fragment>
                        <div className={`${selectionList}`}>
                            <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                       name={field.fieldName}
                                       className={` ${editable} ${autoFill} ${validate}`}
                                       style={{width: '100%'}}
                                       type="text"
                                       value={info.value}
                                       disabled={!field.edit}
                                       required={required}
                            />
                            {!!selectionList ?
                                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                                        className="p-button-secondary"/> : null}
                        </div>
                    </React.Fragment>)
                    ,
                    element
                );
            case 'P'://P - hasło
                return ReactDOM.render(
                    (<React.Fragment>
                        <div className={`${selectionList}`}>
                            <Password id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                      name={field.fieldName}
                                      className={`${autoFill} ${editable} ${validate}`}
                                      style={{width: '100%'}}
                                      type="text"
                                      value={info.value}
                                      disabled={!field.edit}
                                      required={required}
                                      feedback={false}
                            />
                            {!!selectionList ?
                                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                                        className="p-button-secondary"/> : null}
                        </div>
                    </React.Fragment>)
                    ,
                    element
                );
            case "C"://N – Numeryczny/Liczbowy
                return ReactDOM.render(
                    (<React.Fragment>
                        <div className={`${selectionList}`}>
                            <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                       name={field.fieldName}
                                       className={`${autoFill} ${editable} ${validate}`}
                                       style={{width: '100%'}}
                                       value={info.value}
                                       type="number"
                                       disabled={!field.edit}
                                       required={required}
                            />
                            {!!selectionList ?
                                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                                        className="p-button-secondary"/> : null}
                        </div>
                    </React.Fragment>)
                    ,
                    element
                );
            case 'B'://B – Logiczny (0/1)
                return (<React.Fragment>
                    <div style={{display: 'inline-block'}}
                         className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}>
                        <Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                  name={field.fieldName}
                                  onChange={(e) => {
                                      if (this.props.onChange) {
                                          e.refreshFieldVisibility = refreshFieldVisibility
                                          this.props.onChange('CHECKBOX', e, rowId, info);
                                      }
                                  }}
                                  checked={field.value === true || DataGridUtils.conditionForTrueValueForBoolType(field.value)}
                                  disabled={!field.edit}
                                  required={required}
                        />
                    </div>
                </React.Fragment>);
            case 'L'://L – Logiczny (T/N)
                return (<React.Fragment>
                    <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={this.yesNoTypes}
                              onChange={e => onChangeCallback ? onChangeCallback('DROPDOWN', e, rowId, info) : null}
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
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              onChange={e => onChangeCallback ? onChangeCallback('DATE', e, rowId, info) : null}
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
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              appendTo={document.body}
                              onChange={e => onChangeCallback ? onChangeCallback('DATETIME', e, rowId, info) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon
                              mask="9999-99-99 99:99">
                    </Calendar>
                </React.Fragment>);
            case 'T'://T – Czas
                return (<React.Fragment>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              timeOnly
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${editable} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              appendTo={document.body}
                              onChange={e => onChangeCallback ? onChangeCallback('TIME', e, rowId, info) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon
                              mask="99:99">
                    </Calendar>
                </React.Fragment>);
            case 'O'://O – Opisowe
                return (<React.Fragment>
                    <HtmlEditor
                        id={`editor_${fieldIndex}`}
                        className={`editor ${autoFill} ${editable} ${validate}`}
                        defaultValue={field.value}
                        onValueChange={e => {
                            let event = {
                                name: field.fieldName,
                                value: e
                            }
                            onChangeCallback('EDITOR', event, rowId, info)
                        }}
                        onFocusOut={e => onBlurCallback ? onBlurCallback('EDITOR', e, rowId, info) : null}
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
                        <UploadMultiImageFileBase64 multiple={false}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChangeCallback('IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        },
                                                        rowId,
                                                        info)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <UploadMultiImageFileBase64 multiple={true}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChangeCallback('MULTI_IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        },
                                                        rowId,
                                                        info)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${editable} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               onChange={e =>
                                   onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null
                               }
                               onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                               disabled={!field.edit}
                               required={required}
                    />
                    <a href={field.value} style={{float: 'right'}} rel="noreferrer"
                       target='_blank'>
                        {field.label}
                    </a>
                </React.Fragment>)
            default:
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                        title={info.text}
                    >
                        {info.text}
                    </div>,
                    element
                );
        }
    }

    static nonEditableCell(column, element, info, bgColorFinal, fontColorFinal) {
        switch (column?.type) {
            case 'C':
            case "N":
            case 'D':
            case 'E':
            case 'T':
            case 'H':
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                        title={info.text}
                    >
                        {info.text}
                    </div>,
                    element
                );
            case 'O':
                element.innerHTML
                    = '<div id="innerHTML" style="' +
                    // 'display: inline; ' +
                    'border-radius: 25px; ' +
                    'padding: 2px 6px 2px 6px; ' +
                    'background-color: ' + bgColorFinal + '; ' +
                    'color: ' + fontColorFinal + ';">' + info.text + '' +
                    '</div>'
                break;
            case 'B':
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                        title={info.text}
                    >
                        <input type="checkbox" readOnly={true}
                               checked={TreeListUtils.conditionForTrueValueForBoolType(info.text)}/>
                    </div>,
                    element
                );
            case 'L':
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                        title={info.text}
                    >
                        <input type="checkbox" readOnly={true}
                               checked={TreeListUtils.conditionForTrueValueForLogicType(info.text)}/>
                    </div>,
                    element
                );
            case 'I':
            case 'IM':
                if (Array.isArray(info.text) && info.text?.length > 0) {
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 0px 2px 0px',
                            }}
                        >
                            {info.text?.map((i, index) => {
                                return <Image style={{maxWidth: '100%'}} key={index} base64={info.text}/>;
                            })}
                        </div>,
                        element
                    );
                } else {
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 0px 2px 0px',
                            }}
                        >
                            <Image style={{maxHeight: '26px'}} base64={info.text}/>
                        </div>,
                        element
                    );
                }
            default:
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                        title={info.text}
                    >
                        {info.text}
                    </div>,
                    element
                );
        }
    }

}

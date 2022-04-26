import React from 'react';
import ReactDOM from 'react-dom';
import {ViewDataCompUtils} from "./ViewDataCompUtils";
import {InputText} from "primereact/inputtext";
import EditRowUtils from "../EditRowUtils";
import {Button} from "primereact/button";
import {Password} from "primereact/password";
import {Checkbox} from "primereact/checkbox";
import {DataGridUtils} from "./DataGridUtils";
import {Calendar} from "primereact/calendar";
import HtmlEditor, {Item, MediaResizing, Toolbar} from "devextreme-react/html-editor";
import {Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import UploadMultiImageFileBase64 from "../../components/prolab/UploadMultiImageFileBase64";

export const MemoizedChar = React.memo(({field, inputValue, fieldIndex, editable, autoFill, required, validate, selectionList, onChangeCallback, onBlurCallback, onClickEditListCallback}) => {
    return (<React.Fragment>
        <div className={`${selectionList}`}>
            <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                       name={field.fieldName}
                       className={` ${editable} ${autoFill} ${validate}`}
                       style={{width: '100%'}}
                       type="text"
                       value={inputValue}
                       onChange={onChangeCallback ? onChangeCallback : null}
                       onBlur={onBlurCallback ? onBlurCallback : null}
                       onKeyPress={onBlurCallback ? onBlurCallback : null}
                       disabled={!field.edit || onChangeCallback === undefined}
                       required={required}
            />
            {!!selectionList ?
                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                        className="p-button-secondary"/> : null}
        </div>
    </React.Fragment>)});

export const MemoizedPasswordInput = React.memo(({field, inputValue, fieldIndex, editable, autoFill, required, validate, selectionList, onChangeCallback, onBlurCallback, onClickEditListCallback}) => {
    return (<React.Fragment>
        <div className={`${selectionList}`}>
            <Password id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      className={`${autoFill} ${editable} ${validate}`}
                      style={{width: '100%'}}
                      type="text"
                      value={inputValue}
                      onChange={onChangeCallback ? onChangeCallback : null}
                      onBlur={onBlurCallback ? onBlurCallback : null}
                      disabled={!field.edit}
                      required={required}
                      feedback={false}
            />
            {!!selectionList ?
                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                        className="p-button-secondary"/> : null}
        </div>
    </React.Fragment>);
});

export const MemoizedNumericInput = React.memo(({field, inputValue, fieldIndex, editable, autoFill, required, validate, selectionList, onChangeCallback, onBlurCallback, onClickEditListCallback}) => {
    return (<React.Fragment>
        <div className={`${selectionList}`}>
            <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                       name={field.fieldName}
                       className={`${autoFill} ${editable} ${validate}`}
                       style={{width: '100%'}}
                       type="number"
                       value={inputValue}
                       onChange={onChangeCallback}
                       onBlur={onBlurCallback}
                       onKeyPress={onBlurCallback}
                       disabled={!field.edit}
                       required={required}
            />
            {!!selectionList ?
                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                        className="p-button-secondary"/> : null}
        </div>
    </React.Fragment>);
});

export const MemoizedBoolInput = React.memo(({field, inputValue, fieldIndex, editable, autoFillCheckbox, required, validateCheckbox, onChangeCallback}) => {
    return (<React.Fragment>
        <div style={{display: 'inline-block'}}
             className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}>
            <Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      onChange={onChangeCallback}
                      checked={inputValue === true || DataGridUtils.conditionForTrueValueForLogicType(inputValue)}
                      disabled={!field.edit}
                      required={required}
            />
        </div>
    </React.Fragment>);
});

export const MemoizedLogicInput = React.memo(({field, inputValue, fieldIndex, editable, autoFillCheckbox, required, validateCheckbox, onChangeCallback}) => {
    return (<React.Fragment>
        <div style={{display: 'inline-block'}}
             className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}>
            <Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      onChange={onChangeCallback}
                      checked={inputValue === true || DataGridUtils.conditionForTrueValueForLogicType(inputValue)}
                      disabled={!field.edit}
                      required={required}
            />
        </div>
    </React.Fragment>);
});


export class TreeListUtils extends ViewDataCompUtils {

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

    //D – Data
    static dateInput(field, value, fieldIndex, editable, autoFill, required, validate, onChangeCallback, onBlurCallback) {
        return (<React.Fragment>
            <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      className={`${autoFill} ${editable} ${validate}`}
                      style={{width: '100%'}}
                      value={value}
                      dateFormat="yy-mm-dd"
                      mask="9999-99-99"
                      showOnFocus={onChangeCallback === undefined? false : true}
                      onChange={onChangeCallback}
                      onBlur={onBlurCallback}
                      onKeyPress={onBlurCallback}
                      appendTo={document.body}
                      disabled={!field.edit}
                      required={required}
                      showButtonBar
                      showIcon>
            </Calendar>
        </React.Fragment>);
    }

    //E – Data + czas
    static dateTimeInput(field, value, fieldIndex, editable, autoFill, required, validate, onChangeCallback, onBlurCallback) {
        return (<React.Fragment>
            <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      className={`${autoFill} ${editable} ${validate}`}
                      style={{width: '100%'}}
                      value={value}
                      showTime
                      hourFormat="24"
                      dateFormat="yy-mm-dd"
                      mask="9999-99-99 99:99"
                      showOnFocus={onChangeCallback === undefined? false : true}
                      onChange={onChangeCallback}
                      onBlur={onBlurCallback}
                      onKeyPress={onBlurCallback}
                      appendTo={document.body}
                      disabled={!field.edit}
                      required={required}
                      showButtonBar
                      showIcon>
            </Calendar>
        </React.Fragment>);
    }

    //T – Czas
    static timeInput(field, value, fieldIndex, editable, autoFill, required, validate, onChangeCallback, onBlurCallback) {
        return (<React.Fragment>
            <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      className={`${autoFill} ${editable} ${validate}`}
                      style={{width: '100%'}}
                      value={value}
                      timeOnly
                      showTime
                      hourFormat="24"
                      dateFormat="yy-mm-dd"
                      mask="99:99"
                      showOnFocus={onChangeCallback === undefined? false : true}
                      onChange={onChangeCallback}
                      onBlur={onBlurCallback}
                      onKeyPress={onBlurCallback}
                      appendTo={document.body}
                      disabled={!field.edit}
                      required={required}
                      showButtonBar
                      showIcon>
            </Calendar>
        </React.Fragment>);
    }

    static editorDescription(field, value, fieldIndex, editable, autoFill, required, validate, onChangeCallback, onBlurCallback) {
        return (<React.Fragment>
                <HtmlEditor
                    id={`editor_${fieldIndex}`}
                    className={`editor ${autoFill} ${editable} ${validate}`}
                    defaultValue={value}
                    onValueChange={onChangeCallback}
                    onFocusOut={onBlurCallback}
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
        </React.Fragment>)
    }

    static editableCell(field, element, info, bgColorFinal, fontColorFinal, onChangeCallback, onBlurCallback, onClickEditListCallback) {
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
                return ReactDOM.render(<MemoizedChar field={field} inputValue={info.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate} selectionList={selectionList} />, element);
            case 'P'://P - Hasło
                return ReactDOM.render(<MemoizedPasswordInput field={field} inputValue={info.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate} selectionList={selectionList} />, element);
            case "N"://N – Numeryczny/Liczbowy
                return ReactDOM.render(<MemoizedNumericInput field={field} inputValue={info.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate} selectionList={selectionList} />, element);
            case 'B'://B – Logiczny (0/1)
                return ReactDOM.render(<MemoizedBoolInput field={field}  inputValue={info.value} fieldIndex={fieldIndex} editable={editable} autoFillCheckbox={autoFillCheckbox} required={required} validateCheckbox={validateCheckbox}/>, element);
            case 'L'://L – Logiczny (T/N)
                return ReactDOM.render(<MemoizedLogicInput field={field}  inputValue={info.value} fieldIndex={fieldIndex} editable={editable} autoFillCheckbox={autoFillCheckbox} required={required} validateCheckbox={validateCheckbox}/>, element);
            case 'D'://D – Data
                return ReactDOM.render(TreeListUtils.dateInput(field, info.value, fieldIndex, editable, autoFill, required, validate, undefined,undefined), element);
            case 'E'://E – Data + czas
                return ReactDOM.render(TreeListUtils.dateTimeInput(field, info.value, fieldIndex, editable, autoFill, required, validate, undefined,undefined), element);
            case 'T'://T – Czas
                return ReactDOM.render(TreeListUtils.timeInput(field, info.value, fieldIndex, editable, autoFill, required, validate, undefined,undefined), element);
            case 'O'://O – Opisowe
                return ReactDOM.render(TreeListUtils.editorDescription(field, info.value, fieldIndex, editable, autoFill, required, validate, undefined,undefined), element);
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

}

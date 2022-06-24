import React from 'react';
import {ViewDataCompUtils} from "./ViewDataCompUtils";
import EditRowUtils from "../EditRowUtils";
import {Button} from "primereact/button";
import {DataGridUtils} from "./DataGridUtils";
import HtmlEditor, {Item, MediaResizing, Toolbar} from "devextreme-react/html-editor";
import {CheckBox, DateBox, NumberBox, TextBox, Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import moment from "moment";
import Constants from "../Constants";

const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
const fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
const headerValues = [false, 1, 2, 3, 4, 5];

//P - Hasło
export const MemoizedText = React.memo(({
                                            field,
                                            cellInfo,
                                            inputValue,
                                            fieldIndex,
                                            mode,
                                            editable,
                                            autoFill,
                                            required,
                                            validate,
                                            selectionList,
                                            onClickEditListCallback
                                        }) => {
    return (<React.Fragment>
        <div className={`${selectionList}`}>
            {/*${editable} ${autoFill}*/}
            <TextBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                     className={`${validate}`}
                     mode={mode || 'text'}
                     defaultValue={inputValue}
                     stylingMode={'filled'}
                     disabled={!field.edit}
                     valueChangeEvent={'keyup'}
                     onValueChanged={(e) => {
                         switch (required) {
                             case true:
                                 if (e.value !== '') {
                                     cellInfo.setValue(e.value)
                                 }
                                 break;
                             default:
                                 cellInfo.setValue(e.value)
                                 break;
                         }
                     }}
            >
                {required ?
                    <Validator>
                        <RequiredRule/>
                    </Validator> : null}
            </TextBox>
            {/*{mode === 'link' ?*/}
            {/*    <a href={field.value} style={{float: 'right'}}>*/}
            {/*        {field.label}*/}
            {/*    </a> : null}*/}
            {!!selectionList ?
                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                        className="p-button-secondary selectionList"/> : null}
        </div>
    </React.Fragment>)
});
//N – Numeryczny/Liczbowy
export const MemoizedNumericInput = React.memo(({
                                                    field,
                                                    cellInfo,
                                                    inputValue,
                                                    fieldIndex,
                                                    editable,
                                                    autoFill,
                                                    required,
                                                    validate,
                                                    selectionList,
                                                    fontColorFinal,
                                                    onChangeCallback,
                                                    onBlurCallback,
                                                    onClickEditListCallback
                                                }) => {
    return (<React.Fragment>
        <div className={`${selectionList}`}>
            {/*${editable} ${autoFill}*/}
            <NumberBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                       className={`${validate}`}
                       defaultValue={inputValue}
                       stylingMode={'filled'}
                       disabled={!field.edit}
                       valueChangeEvent={'keyup'}
                       onValueChanged={(e) => {
                           switch (required) {
                               case true:
                                   if (e.value !== '') {
                                       cellInfo.setValue(e.value)
                                   }
                                   break;
                               default:
                                   cellInfo.setValue(e.value)
                                   break;
                           }
                       }}
            >
                {required ?
                    <Validator>
                        <RequiredRule/>
                    </Validator> : null}
            </NumberBox>
            {!!selectionList ?
                <Button type="button" onClick={onClickEditListCallback} icon="pi pi-question-circle"
                        className="p-button-secondary"/> : null}
        </div>
    </React.Fragment>);
});
//B – Logiczny (0/1)
export const MemoizedBoolInput = React.memo(({
                                                 field,
                                                 cellInfo,
                                                 inputValue,
                                                 fieldIndex,
                                                 editable,
                                                 autoFillCheckbox,
                                                 required,
                                                 validateCheckbox
                                             }) => {
    return (<React.Fragment>
        <div style={{display: 'inline-block'}}
            // ${autoFillCheckbox} ${editable}
             className={`${validateCheckbox}`}>
            <CheckBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      onValueChanged={(e) => {
                          cellInfo.setValue(e.value)
                      }}
                      defaultValue={inputValue === true || DataGridUtils.conditionForTrueValueForBoolType(inputValue)}
                      disabled={!field.edit}
                      required={required}/>
        </div>
    </React.Fragment>);
});
//B – Logiczny (0/1)
export const MemoizedLogicInput = React.memo(({
                                                  field,
                                                  cellInfo,
                                                  inputValue,
                                                  fieldIndex,
                                                  editable,
                                                  autoFillCheckbox,
                                                  required,
                                                  validateCheckbox,
                                                  onChangeCallback
                                              }) => {
    return (<React.Fragment>
        <div style={{display: 'inline-block'}}
            // ${autoFillCheckbox} ${editable}
             className={`${validateCheckbox}`}>
            <CheckBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                      name={field.fieldName}
                      onValueChanged={(e) => {
                          cellInfo.setValue(e.value)
                      }}
                      checked={inputValue === true || DataGridUtils.conditionForTrueValueForLogicType(inputValue)}
                      disabled={!field.edit}
                      required={required}/>
        </div>
    </React.Fragment>);
});

//D – Data
export const MemoizedDateInput = React.memo(({
                                                 field,
                                                 cellInfo,
                                                 inputValue,
                                                 fieldIndex,
                                                 editable,
                                                 autoFill,
                                                 required,
                                                 validate
                                             }) => {
    return (<React.Fragment>
        <DateBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                 name={field.fieldName}
            // ${autoFill} ${editable}
                 className={`${validate}`}
                 onValueChanged={(e) => {
                     cellInfo.setValue(e.component.option('text'));
                 }}
                 defaultValue={!!inputValue ? moment(inputValue, Constants.DATE_FORMAT.DATE_FORMAT_MOMENT).toDate() : new Date()}
                 style={{width: '100%'}}
                 disabled={!field.edit}
                 required={required}
                 type="date"
                 useMaskBehavior={true}
                 displayFormat={'yyyy-MM-dd'}
        ></DateBox>
    </React.Fragment>);
});
//E – Data + czas
export const MemoizedDateTimeInput = React.memo(({
                                                     field,
                                                     cellInfo,
                                                     inputValue,
                                                     fieldIndex,
                                                     editable,
                                                     autoFill,
                                                     required,
                                                     validate
                                                 }) => {
    return (<React.Fragment>
        <DateBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                 name={field.fieldName}
            // ${autoFill} ${editable}
                 className={`${validate}`}
                 onValueChanged={(e) => {
                     cellInfo.setValue(e.component.option('text'));
                 }}
                 defaultValue={!!inputValue ? moment(inputValue, Constants.DATE_FORMAT.DATE_TIME_FORMAT_MOMENT).toDate() : new Date()}
                 style={{width: '100%'}}
                 disabled={!field.edit}
                 required={required}
                 type="datetime"
                 useMaskBehavior={true}
                 applyValueMode="useButtons"
                 displayFormat={'yyyy-MM-dd HH:mm'}
        >
        </DateBox>
    </React.Fragment>);
});
//T – Czas
export const MemoizedTimeInput = React.memo(({
                                                 field,
                                                 cellInfo,
                                                 inputValue,
                                                 fieldIndex,
                                                 editable,
                                                 autoFill,
                                                 required,
                                                 validate
                                             }) => {
    return (<React.Fragment>
        <DateBox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                 name={field.fieldName}
            // ${autoFill} ${editable}
                 className={`${validate}`}
                 onValueChanged={(e) => {
                     cellInfo.setValue(e.component.option('text'));
                 }}
                 defaultValue={!!inputValue ? moment(inputValue, Constants.DATE_FORMAT.TIME_FORMAT).toDate() : new Date()}
                 style={{width: '100%'}}
                 disabled={!field.edit}
                 required={required}
                 type="time"
                 useMaskBehavior={true}
                 displayFormat={'HH:mm'}
        />
    </React.Fragment>);
});
//O – Opisowe
export const MemoizedEditorDescription = React.memo(({
                                                         field,
                                                         cellInfo,
                                                         inputValue,
                                                         fieldIndex,
                                                         editable,
                                                         autoFill,
                                                         required,
                                                         validate
                                                     }) => {
    return (<React.Fragment>
        <HtmlEditor
            id={`editor_${fieldIndex}`}
            // ${autoFill} ${editable}
            className={`editor ${validate}`}
            defaultValue={inputValue}
            onValueChanged={(e) => {
                cellInfo.setValue(e.value)
            }}
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
                <Item name="size" acceptedValues={sizeValues}/>
                <Item name="font" acceptedValues={fontValues}/>
                <Item name="header" acceptedValues={headerValues}/>
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
});


export class TreeListUtils extends ViewDataCompUtils {

    static cellTemplate(field, onChangeCallback, onBlurCallback) {

        let _rowIndex = null;
        let _bgColor = null;
        let _fontcolor = null;

        return function (element, info, e1, e2, e3) {
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
            console.log(field);
            // field.cellElement.style.color ="green";
            return info;
        };
        return field;
    }

}

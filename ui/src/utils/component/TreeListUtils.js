import React from 'react';
import {ViewDataCompUtils} from './ViewDataCompUtils';
import EditRowUtils from '../EditRowUtils';
import {Button} from 'primereact/button';
import {DataGridUtils} from './DataGridUtils';
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {CheckBox, DateBox, NumberBox, TextBox, Validator} from 'devextreme-react';
import {RequiredRule} from 'devextreme-react/validator';
import moment from 'moment';
import Constants from '../Constants';
import {EntryResponseUtils} from '../EntryResponseUtils';
import {compress} from 'int-compress-string/src';
import {EditSpecUtils} from '../EditSpecUtils';
import CrudService from '../../services/CrudService';

const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
const fontValues = [
    'Arial',
    'Courier New',
    'Georgia',
    'Impact',
    'Lucida Console',
    'Tahoma',
    'Times New Roman',
    'Verdana',
];
const headerValues = [false, 1, 2, 3, 4, 5];

//P - Hasło
export const MemoizedText = React.memo(
    ({
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
        onClickEditListCallback,
    }) => {
        return (
            <React.Fragment>
                <div className={`${selectionList}`}>
                    {/*${editable} ${autoFill}*/}
                    <TextBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
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
                                        cellInfo.setValue(e.value);
                                    }
                                    break;
                                default:
                                    cellInfo.setValue(e.value);
                                    break;
                            }
                        }}
                    >
                        {required ? (
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        ) : null}
                    </TextBox>
                    {/*{mode === 'link' ?*/}
                    {/*    <a href={field.value} style={{float: 'right'}}>*/}
                    {/*        {field.label}*/}
                    {/*    </a> : null}*/}
                    {!!selectionList ? (
                        <Button
                            type='button'
                            onClick={onClickEditListCallback}
                            icon='pi pi-question-circle'
                            className='p-button-secondary selectionList'
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }
);
//N – Numeryczny/Liczbowy
export const MemoizedNumericInput = React.memo(
    ({
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
        onClickEditListCallback,
    }) => {
        return (
            <React.Fragment>
                <div className={`${selectionList}`}>
                    {/*${editable} ${autoFill}*/}
                    <NumberBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        className={`${validate}`}
                        defaultValue={inputValue}
                        stylingMode={'filled'}
                        disabled={!field.edit}
                        valueChangeEvent={'keyup'}
                        onValueChanged={(e) => {
                            switch (required) {
                                case true:
                                    if (e.value !== '') {
                                        cellInfo.setValue(e.value);
                                    }
                                    break;
                                default:
                                    cellInfo.setValue(e.value);
                                    break;
                            }
                        }}
                    >
                        {required ? (
                            <Validator>
                                <RequiredRule />
                            </Validator>
                        ) : null}
                    </NumberBox>
                    {!!selectionList ? (
                        <Button
                            type='button'
                            onClick={onClickEditListCallback}
                            icon='pi pi-question-circle'
                            className='p-button-secondary'
                        />
                    ) : null}
                </div>
            </React.Fragment>
        );
    }
);
//B – Logiczny (0/1)
export const MemoizedBoolInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, editable, autoFillCheckbox, required, validateCheckbox}) => {
        return (
            <React.Fragment>
                <div style={{display: 'inline-block'}} className={`${validateCheckbox}`}>
                    <CheckBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        name={field.fieldName}
                        onValueChanged={(e) => {
                            if (e.event) cellInfo.setValue(e.value);
                        }}
                        defaultValue={inputValue === true || TreeListUtils.conditionForTrueValue(inputValue)}
                        value={inputValue === true || TreeListUtils.conditionForTrueValue(inputValue)}
                        disabled={!field.edit}
                        required={required}
                    />
                </div>
            </React.Fragment>
        );
    }
);
//B – Logiczny (0/1)
export const MemoizedLogicInput = React.memo(
    ({
        field,
        cellInfo,
        inputValue,
        fieldIndex,
        editable,
        autoFillCheckbox,
        required,
        validateCheckbox,
        onChangeCallback,
    }) => {
        return (
            <React.Fragment>
                <div style={{display: 'inline-block'}} className={`${validateCheckbox}`}>
                    <CheckBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        name={field.fieldName}
                        onValueChanged={(e) => {
                            if (e.event) cellInfo.setValue(e.value);
                        }}
                        disabled={!field.edit}
                        defaultValue={inputValue === true || TreeListUtils.conditionForTrueValue(inputValue)}
                        value={inputValue === true || TreeListUtils.conditionForTrueValue(inputValue)}
                        required={required}
                    />
                </div>
            </React.Fragment>
        );
    }
);

//D – Data
export const MemoizedDateInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, editable, autoFill, required, validate}) => {
        return (
            <React.Fragment>
                <DateBox
                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                    name={field.fieldName}
                    // ${autoFill} ${editable}
                    className={`${validate}`}
                    onValueChanged={(e) => {
                        cellInfo.setValue(e.component.option('text'));
                    }}
                    defaultValue={inputValue}
                    style={{width: '100%'}}
                    disabled={!field.edit}
                    required={required}
                    type='date'
                    useMaskBehavior={true}
                    displayFormat={'yyyy-MM-dd'}
                ></DateBox>
            </React.Fragment>
        );
    }
);
//E – Data + czas
export const MemoizedDateTimeInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, editable, autoFill, required, validate}) => {
        return (
            <React.Fragment>
                <DateBox
                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                    name={field.fieldName}
                    // ${autoFill} ${editable}
                    className={`${validate}`}
                    onValueChanged={(e) => {
                        cellInfo.setValue(e.component.option('text'));
                    }}
                    defaultValue={inputValue}
                    style={{width: '100%'}}
                    disabled={!field.edit}
                    required={required}
                    type='datetime'
                    useMaskBehavior={true}
                    applyValueMode='useButtons'
                    displayFormat={'yyyy-MM-dd HH:mm'}
                ></DateBox>
            </React.Fragment>
        );
    }
);
//T – Czas
export const MemoizedTimeInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, editable, autoFill, required, validate}) => {
        return (
            <React.Fragment>
                <DateBox
                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                    name={field.fieldName}
                    // ${autoFill} ${editable}
                    className={`${validate}`}
                    onValueChanged={(e) => {
                        cellInfo.setValue(e.component.option('text'));
                    }}
                    defaultValue={
                        !!inputValue ? moment(inputValue, Constants.DATE_FORMAT.TIME_FORMAT).toDate() : new Date()
                    }
                    style={{width: '100%'}}
                    disabled={!field.edit}
                    required={required}
                    type='time'
                    useMaskBehavior={true}
                    displayFormat={'HH:mm'}
                />
            </React.Fragment>
        );
    }
);
//O – Opisowe
export const MemoizedEditorDescription = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, editable, autoFill, required, validate}) => {
        return (
            <React.Fragment>
                <HtmlEditor
                    id={`editor_${fieldIndex}`}
                    // ${autoFill} ${editable}
                    className={`editor ${validate}`}
                    defaultValue={inputValue}
                    onValueChanged={(e) => {
                        // dostosowanie pierwszej doklejonej kolumny
                        const rowIndex = cellInfo.rowIndex;
                        const elements = document.querySelectorAll('td[aria-describedby=column_0_undefined-fixed]');
                        const element = elements[rowIndex + 1];
                        element.style.height = e.element.clientHeight + 'px';
                        cellInfo.setValue(e.value);
                    }}
                    validationMessageMode='always'
                    disabled={!field.edit}
                    required={required}
                >
                    {' '}
                    {required ? (
                        <Validator>
                            <RequiredRule message={`Pole jest wymagane`} />
                        </Validator>
                    ) : null}
                    <MediaResizing enabled={true} />
                    <Toolbar multiline={false}>
                        <Item name='undo' />
                        <Item name='redo' />
                        <Item name='separator' />
                        <Item name='size' acceptedValues={sizeValues} />
                        <Item name='font' acceptedValues={fontValues} />
                        <Item name='header' acceptedValues={headerValues} />
                        <Item name='separator' />
                        <Item name='bold' />
                        <Item name='italic' />
                        <Item name='strike' />
                        <Item name='underline' />
                        <Item name='subscript' />
                        <Item name='superscript' />
                        <Item name='separator' />
                        <Item name='alignLeft' />
                        <Item name='alignCenter' />
                        <Item name='alignRight' />
                        <Item name='alignJustify' />
                        <Item name='separator' />
                        <Item name='orderedList' />
                        <Item name='bulletList' />
                        <Item name='separator' />
                        <Item name='color' />
                        <Item name='background' />
                        <Item name='separator' />
                        <Item name='insertTable' />
                        <Item name='deleteTable' />
                        <Item name='insertRowAbove' />
                        <Item name='insertRowBelow' />
                        <Item name='deleteRow' />
                        <Item name='insertColumnLeft' />
                        <Item name='insertColumnRight' />
                        <Item name='deleteColumn' />
                    </Toolbar>
                </HtmlEditor>
            </React.Fragment>
        );
    }
);

export class TreeListUtils extends ViewDataCompUtils {
    static crudService = new CrudService();

    static getCrudService() {
        return TreeListUtils.crudService;
    }

    static conditionForTrueValue(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value === 1;
        }
        if (typeof value === 'string') {
            return (
                value === 'T' ||
                value === 't' ||
                value === '1' ||
                value.toLowerCase() === 'true' ||
                value.toLowerCase() === 'tak'
            );
        }
        return value;
    }

    static paintDatas = (datas) => {
        datas.forEach((data) => {
            this.recursionPainting(data, 100, datas);
        });
        return datas;
    };

    static recursionPainting = (data, value, datas) => {
        if (!data._LINE_COLOR_GRADIENT) {
            data._LINE_COLOR_GRADIENT = [value];
        } else {
            data._LINE_COLOR_GRADIENT.push(value);
        }
        const childrens = datas.filter((el) => {
            return data._ID === el._ID_PARENT;
        });
        if (childrens.length) {
            childrens.forEach((children) => {
                this.recursionPainting(children, value - 10, datas);
            });
        }
    };

    static unpackAllElementsFromTreeListModel = (items) => {
        const set = new Set();
        TreeListUtils.recursionUnpacking(items, set);
        return [...set];
    };

    static recursionUnpacking = (items, set) => {
        items.forEach((item) => {
            set.add(item);
            if (item.hasChildren) this.recursionUnpacking(item.children, set);
        });
    };

    static elementsToCalculate = (startIndex, allTheElements) => {
        const array = [];
        const parent = allTheElements.find((el) => {
            return el._ID === startIndex;
        });
        array.push(parent);
        TreeListUtils.recursionElementTocalculate(parent, array, allTheElements);
        return array;
    };

    static recursionElementTocalculate = (parent, array, allTheElements) => {
        allTheElements.forEach((el) => {
            if (el._ID_PARENT === parent._ID) {
                array.push(el);
                this.recursionElementTocalculate(el, array, allTheElements);
            }
        });
    };

    static openEditSpec = (
        viewId,
        parentId,
        recordIds,
        currentBreadcrumb,
        handleUnblockUiCallback,
        showErrorMessagesCallback
    ) => {
        TreeListUtils.getCrudService()
            .saveSpecEntry(viewId, parentId, recordIds, null)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            const compressedRecordId = compress(recordIds);
                            EditSpecUtils.navToEditSpec(viewId, parentId, compressedRecordId, currentBreadcrumb);
                        } else {
                            handleUnblockUiCallback();
                        }
                    },
                    () => handleUnblockUiCallback()
                );
            })
            .catch((err) => {
                showErrorMessagesCallback(err);
            });
    };

    static isKindViewSpec(parsedGridView) {
        return parsedGridView?.viewInfo?.kindView === 'ViewSpec';
    }

    //utworzenie request body dla listy podpowiedzi
    static createBodyToEditList(editData) {
        let arrayTmp = [];
        for (const item in editData) {
            const elementTmp = {
                fieldName: item,
                value: editData[item],
            };
            arrayTmp.push(elementTmp);
        }
        return {data: arrayTmp};
    }

    //wyszukanie w wybranym wierszu specyfikacji
    //poprzez zwrócenie obiektu callbacka wartości pola o nazwie :searchFieldName
    static searchField(editData, searchFieldName, callback) {
        callback({value: editData[searchFieldName]});
        return;
    }
}

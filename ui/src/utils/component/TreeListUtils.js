import React from 'react';
import {ViewDataCompUtils} from './ViewDataCompUtils';
import EditRowUtils from '../EditRowUtils';
import {Button} from 'primereact/button';
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {CheckBox, DateBox, NumberBox, TextBox, Validator} from 'devextreme-react';
import {RequiredRule} from 'devextreme-react/validator';
import moment from 'moment';
import {EntryResponseUtils} from '../EntryResponseUtils';
import {compress} from 'int-compress-string/src';
import {EditSpecUtils} from '../EditSpecUtils';
import EditSpecService from '../../services/EditSpecService';
import OperationCell from '../../model/OperationCell';

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

export const MemoizedOperations = React.memo(({editListVisible, fillDownVisible, onOperationClick}) => {
    return (
        <React.Fragment>
            {editListVisible && (
                <Button
                    type='button'
                    onClick={() => onOperationClick(OperationCell.EDIT_LIST)}
                    icon='mdi mdi-format-list-bulleted'
                    className='p-button-secondary'
                />
            )}
            {fillDownVisible && (
                <Button
                    type='button'
                    onClick={() => onOperationClick(OperationCell.FILL_DOWN)}
                    icon='mdi mdi-sort-bool-ascending'
                    className='p-button-secondary'
                />
            )}
        </React.Fragment>
    );
});

export const MemoizedText = React.memo(
    ({
        field,
        cellInfo,
        inputValue,
        fieldIndex,
        mode,
        required,
        validate,
        selectionList,
        onOperationClick,
        downFill,
        onFillDownClick,
    }) => {
        return (
            <React.Fragment>
                <div className={`${selectionList}`}>
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
                    <MemoizedOperations
                        editListVisible={!!selectionList}
                        onOperationClick={onOperationClick}
                        fillDownVisible={!!downFill}
                        onFillDownClick={onFillDownClick}
                    />
                </div>
            </React.Fragment>
        );
    }
);
//N – Numeryczny/Liczbowy
export const MemoizedNumericInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validate, selectionList, onOperationClick, downFill}) => {
        return (
            <React.Fragment>
                <div className={`${selectionList}`}>
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
                    <MemoizedOperations
                        editListVisible={!!selectionList}
                        onOperationClick={onOperationClick}
                        fillDownVisible={!!downFill}
                    />
                </div>
            </React.Fragment>
        );
    }
);
//B – Logiczny (0/1)
export const MemoizedBoolInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validateCheckbox, onOperationClick}) => {
        return (
            <React.Fragment>
                <div style={{display: 'inline-block'}} className={`${validateCheckbox}`}>
                    <CheckBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        name={field.fieldName}
                        onValueChanged={(e) => {
                            let res = e.value;
                            if (typeof e.value === 'boolean') {
                                res = res === true ? '1' : '0';
                            }
                            cellInfo.setValue(res);
                            onOperationClick(e.value);
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

//L – Logiczny (T/N)
export const MemoizedLogicInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validateCheckbox, onOperationClick}) => {
        return (
            <React.Fragment>
                <div style={{display: 'inline-block'}} className={`${validateCheckbox}`}>
                    <CheckBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        name={field.fieldName}
                        onValueChanged={(e) => {
                            let res = e.value;
                            if (typeof e.value === 'boolean') {
                                res = res === true ? 'T' : 'N';
                            }
                            cellInfo.setValue(res);
                            onOperationClick(e.value);
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
export const MemoizedDateInput = React.memo(({field, cellInfo, inputValue, fieldIndex, required, validate}) => {
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
});
//E – Data + czas
export const MemoizedDateTimeInput = React.memo(
    ({field, cellInfo, fieldIndex, required, validate, refDateTime, labels}) => {
        return (
            <React.Fragment>
                <DateBox
                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                    name={field.fieldName}
                    // ${autoFill} ${editable}
                    className={`${validate}`}
                    showAnalogClock={false}
                    ref={refDateTime}
                    onOpenedChange={() => {
                        setTimeout(function () {
                            const cells = document.getElementsByClassName('dx-calendar-cell');
                            for (let index = 0; index < cells.length; index++) {
                                const element = cells[index];
                                element.addEventListener('click', (e) => {
                                    const ref = refDateTime?.current?.props;
                                    if (ref) {
                                        const selectedDate =
                                            document.getElementsByClassName('dx-calendar-selected-date')[0];
                                        if (selectedDate) {
                                            if (Array.from(selectedDate.classList).includes('dx-state-active')) {
                                                const dateYYYYMMDD = selectedDate.attributes[1].value;
                                                const hours = Array.from(
                                                    document.querySelectorAll('input[aria-valuenow')
                                                ).find((e) => e.ariaLabel === 'hours').ariaValueNow;
                                                const minutes = Array.from(
                                                    document.querySelectorAll('input[aria-valuenow')
                                                ).find((e) => e.ariaLabel === 'minutes').ariaValueNow;

                                                const myMomentInString = moment(
                                                    dateYYYYMMDD + ` ${hours}:${minutes}`
                                                ).format('yyyy-MM-DD HH:mm');
                                                ref.onValueChanged(myMomentInString);
                                            }
                                        }
                                    }
                                });
                            }
                        }, 0);
                    }}
                    onValueChanged={(e) => {
                        const headerLeft = document.getElementById('header-left');
                        if (typeof e === 'string') {
                            cellInfo.setValue(e);
                            headerLeft.click();
                        } else if (headerLeft) {
                            headerLeft.click();
                        }
                    }}
                    style={{width: '100%'}}
                    disabled={!field.edit}
                    applyButtonText={labels['Calendar_ButtonClear']}
                    required={required}
                    type='datetime'
                    useMaskBehavior={true}
                    displayFormat={'yyyy-MM-dd HH:mm'}
                ></DateBox>
            </React.Fragment>
        );
    }
);

//T – Czas
export const MemoizedTimeInput = React.memo(({field, cellInfo, fieldIndex, required, validate}) => {
    return (
        <React.Fragment>
            <DateBox
                id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                name={field.fieldName}
                className={`${validate}`}
                onValueChanged={(e) => {
                    cellInfo.setValue(e.component.option('text'));
                }}
                style={{width: '100%'}}
                disabled={!field.edit}
                required={required}
                type='time'
                useMaskBehavior={true}
                displayFormat={'HH:mm'}
            />
        </React.Fragment>
    );
});
//O – Opisowe
export const MemoizedEditorDescription = React.memo(({field, cellInfo, inputValue, fieldIndex, required, validate}) => {
    return (
        <React.Fragment>
            <div aria-live='assertive'>
                <HtmlEditor
                    id={`editor_${fieldIndex}`}
                    className={`editor ${validate}`}
                    defaultValue={inputValue}
                    onValueChanged={(e) => {
                        // dostosowanie pierwszej doklejonej kolumny
                        const rowIndex = cellInfo.rowIndex;
                        const realRowIndex = rowIndex + 1;
                        const elements = document.querySelectorAll('td[aria-describedby=column_0_undefined-fixed]');
                        const row = document.querySelectorAll(
                            'tr[aria-rowindex="' + realRowIndex + '"][class*="dx-column-lines"]'
                        )[0];
                        const element = elements[realRowIndex];
                        if (element) {
                            element.style.height = row.clientHeight + 'px';
                        }
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
                        <Item
                            name='color'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />
                        <Item
                            name='background'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />
                        <Item name='separator' />
                        <Item
                            name='insertTable'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />

                        <Item name='deleteTable' />
                        <Item name='insertRowAbove' />
                        <Item name='insertRowBelow' />
                        <Item name='deleteRow' />
                        <Item name='insertColumnLeft' />
                        <Item name='insertColumnRight' />
                        <Item name='deleteColumn' />
                    </Toolbar>
                </HtmlEditor>
            </div>
        </React.Fragment>
    );
});

const classListContainsButton = (element) => {
    try {
        return Array.from(element.classList).includes('dx-button');
    } catch (ex) {
        console.log('to much iterations');
    }
};
const clickButtonIfIsParent = (parent, iterations) => {
    if (iterations < 0) {
        return;
    }
    if (classListContainsButton(parent)) {
        parent.click();
        return;
    }
    clickButtonIfIsParent(parent.parentNode, iterations - 1);
};
const overideEventClick = (element) => {
    element.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (classListContainsButton(event.target)) {
            event.target.click();
        } else {
            clickButtonIfIsParent(event.target.parentNode, 3);
        }
    });
    Array.from(element.children).forEach((child) => {
        overideEventClick(child);
    });
};
export class TreeListUtils extends ViewDataCompUtils {
    static editSpecService = new EditSpecService();

    static getEditSpecService() {
        return TreeListUtils.editSpecService;
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
            if (!data._ID) {
                return false;
            }
            return data._ID === el._ID_PARENT;
        });
        if (childrens.length) {
            childrens.forEach((children) => {
                this.recursionPainting(children, value - 10, datas);
            });
        }
    };
    static findAllDescendants(tree, parentId) {
        const descendants = [];
        function findChildren(parentId) {
            const children = tree.filter((node) => node._ID_PARENT === parentId);
            children.forEach((child) => {
                descendants.push(child);
                findChildren(child._ID);
            });
        }
        findChildren(parentId);
        return descendants;
    }
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
        TreeListUtils.getEditSpecService()
            .getViewEntry(viewId, parentId, recordIds, null)
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

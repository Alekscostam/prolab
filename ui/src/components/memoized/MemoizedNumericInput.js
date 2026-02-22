import React from 'react';
import Validator, {RequiredRule} from 'devextreme-react/validator';
import EditRowUtils from '../../utils/EditRowUtils';
import {TextBox} from 'devextreme-react';
import {MemoizedOperations} from './MemoizedOperations';
import {StringUtils} from '../../utils/StringUtils';

//N – Numeryczny/Liczbowy
export const MemoizedNumericInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validate, selectionList, onOperationClick, downFill}) => {
        const isValid = (() => {
            if (inputValue == null || inputValue === '') return true;
            if (typeof inputValue === 'number') return true;
            if (typeof inputValue === 'string') {
                const normalized = inputValue.replace(',', '.');
                const numberRegex = /^-?\d*(\.\d*)?$/;
                return numberRegex.test(normalized);
            }
            return false;
        })();
        return (
            <React.Fragment>
                <div className={`${selectionList}`}>
                    <TextBox
                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                        className={`${validate}`}
                        mode={'text'}
                        isValid={isValid}
                        onDisposing={(e) => {
                            try {
                                const inputElement = e.element?.querySelector('input');
                                if (!inputElement) return;
                                let value = inputElement.value;
                                if (!value || value.trim() === '') return;
                                let normalized = StringUtils.normalizeNumberString(value);
                                if (normalized) {
                                    const lastChar = normalized[normalized.length - 1];
                                    if (lastChar === '.' || lastChar === ',') {
                                        if (normalized.length === 1 || !/\d/.test(normalized[normalized.length - 2])) {
                                            normalized = '0' + normalized;
                                        }
                                        normalized = normalized + '0';
                                    }
                                    inputElement.value = normalized;
                                    if (cellInfo) {
                                        cellInfo.setValue(normalized);
                                    }
                                }
                            } catch (err) {
                                console.warn('Błąd w onDisposing:', err);
                            }
                        }}
                        validationMessagePosition='left'
                        defaultValue={inputValue}
                        stylingMode={'filled'}
                        disabled={!field.edit}
                        valueChangeEvent={'keyup'}
                        onValueChanged={(e) => {
                            let value = e.value;
                            if (required && (value === '' || value == null)) return;
                            if (typeof value === 'number') {
                                cellInfo.setValue(String(value));
                                return;
                            }
                            if (typeof value === 'string') {
                                const normalized = StringUtils.normalizeNumberString(value);
                                cellInfo.setValue(normalized);
                                try {
                                    const inputElement = e.element?.querySelector('input');
                                    if (inputElement) inputElement.value = normalized;
                                } catch (err) {
                                    console.warn('Nie udało się ustawić wartości w DOM TextBox:', err);
                                }
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
                    />
                </div>
            </React.Fragment>
        );
    }
);

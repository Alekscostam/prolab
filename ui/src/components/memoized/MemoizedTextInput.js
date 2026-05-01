import React, {useState} from 'react';
import CellValidator, {ResultType} from '../../model/CellValidator';
import {TextBox, Validator} from 'devextreme-react';
import EditRowUtils from '../../utils/EditRowUtils';
import {MemoizedOperations} from './MemoizedOperations';
import OperationCell from '../../enum/OperationCell';

import {PatternRule, RequiredRule} from 'devextreme-react/validator';
import {StringUtils} from '../../utils/StringUtils';
import {getStore} from '../../utils/helper/StoreHelper';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {ListOfHintType} from '../../enum/ListOfHintType';

export const MemoizedTextInput = React.memo(
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
        afterValidatorExecute,
        refreshComponent,
    }) => {
        const cellValidator = new CellValidator(cellInfo, field);
        const [isValid, setIsValid] = useState(cellValidator.isValidField(inputValue));
        let currentVal = inputValue;
        const handleValidation = (value) => {
            cellValidator.validateChain(value);
            const isValid = cellValidator.isValidField(value);
            if (!isValid || !cellValidator.testNok(value)) {
                const title = LocUtils.locFromStoreWithDefault('Error', 'Błąd');
                getStore().messages?.show({
                    severity: 'error',
                    sticky: false,
                    life: 3000,
                    detail: cellValidator.getMessage(),
                    summary: title,
                });
            }
            const helpBtn = document.getElementById('helpBtn');
            if (cellValidator.canShowReasonsChanges(value)) {
                helpBtn.style.display = 'flex';
                if (cellValidator.resultCode === ResultType.NOK) {
                    helpBtn.children[0].style.backgroundColor = 'red';
                    helpBtn.children[0].classList.add('dx-invalid');
                } else if (cellValidator.resultCode === ResultType.OK) {
                    helpBtn.children[0].style.backgroundColor = 'green';
                    helpBtn.children[0].classList.remove('dx-invalid');
                } else {
                    helpBtn.style.display = 'none';
                }
            } else {
                helpBtn.style.display = 'none';
            }
        };

        return (
            <React.Fragment>
                <div className={`row`}>
                    <div className={`${selectionList} col-12`}>
                        <TextBox
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            className={`${validate}`}
                            onContentReady={() => {
                                handleValidation(currentVal);
                            }}
                            mode={mode || 'text'}
                            isValid={isValid}
                            onDisposing={(e) => {
                                const value = cellInfo?.value;
                                if (afterValidatorExecute) {
                                    afterValidatorExecute(cellValidator, value);
                                    if (cellValidator.shouldRunListOfHintsIfPossible()) {
                                        onOperationClick(false, ListOfHintType.REASON, {cellValidator, value: value});
                                    }
                                }
                                if (field.fieldName === 'FORMULA') {
                                    if (
                                        (StringUtils.isBlankOrEmpty(cellInfo.displayValue) &&
                                            !StringUtils.isBlankOrEmpty(value)) ||
                                        (!StringUtils.isBlankOrEmpty(cellInfo.displayValue) &&
                                            StringUtils.isBlankOrEmpty(value))
                                    ) {
                                        refreshComponent();
                                    }
                                }
                            }}
                            validationMessagePosition='left'
                            defaultValue={inputValue}
                            stylingMode={'filled'}
                            disabled={!field.edit}
                            valueChangeEvent={'keyup'}
                            onValueChanged={(e) => {
                                const isValid = cellValidator.isValidField(e.value);
                                handleValidation(e.value);
                                setIsValid(isValid);
                                switch (required) {
                                    case true:
                                        if (e.value !== '') {
                                            currentVal = e.value;
                                            cellInfo.setValue(e.value);
                                        }
                                        break;
                                    default:
                                        currentVal = e.value;
                                        cellInfo.setValue(e.value);
                                        break;
                                }
                            }}
                        >
                            <Validator>
                                {cellValidator.expressionSatisfiesCondition() && (
                                    <PatternRule pattern={cellValidator.getRegex()} message={''} />
                                )}
                                {required && <RequiredRule />}
                            </Validator>
                        </TextBox>
                        <div id='helpBtn' style={{display: 'none'}}>
                            <Button
                                type='button'
                                style={{maxWidth: '41px'}}
                                onClick={() => onOperationClick(false, 'REASON', {cellValidator, value: currentVal})}
                                icon='mdi mdi-help'
                                className='p-button-danger'
                            />
                        </div>
                        <MemoizedOperations
                            editListVisible={!!selectionList}
                            onOperationClick={onOperationClick}
                            fillDownVisible={!!downFill}
                            onFillDownClick={onFillDownClick}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }
);

import React, {useState} from 'react';
import CellValidator from '../../model/CellValidator';
import {TextBox, Validator} from 'devextreme-react';
import EditRowUtils from '../../utils/EditRowUtils';
import {MemoizedOperations} from './MemoizedOperations';
import {PatternRule, RequiredRule} from 'devextreme-react/validator';
import {StringUtils} from '../../utils/StringUtils';

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

        return (
            <React.Fragment>
                <div className={`row`}>
                    <div className={`${selectionList} col-12`}>
                        <TextBox
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            className={`${validate}`}
                            mode={mode || 'text'}
                            isValid={isValid}
                            onDisposing={(e) => {
                                const value = cellInfo?.value;
                                if (afterValidatorExecute) {
                                    afterValidatorExecute(cellValidator, value);
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

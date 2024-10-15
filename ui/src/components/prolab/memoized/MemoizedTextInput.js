import React, { useState } from "react";
import CellValidator from "../../../model/ValidatorPattern";
import { TextBox, Validator } from "devextreme-react";
import EditRowUtils from "../../../utils/EditRowUtils";
import { MemoizedOperations } from "./MemoizedOperations";
import {PatternRule, RequiredRule} from 'devextreme-react/validator';

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
        afterValidatorExecute
    }) => {
      const cellValidator = new CellValidator(cellInfo, field);
      const [isValid, setIsValid] = useState(cellValidator.isValidField(inputValue));  
      let currentVal = inputValue;
        return (
            <React.Fragment>
                <div className={`row`}>
                    <div className={ `${selectionList} col-12`}>
                    <TextBox
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            className={`${validate}`}
                            mode={mode || 'text'}
                            isValid={isValid}
                            onFocusOut={(e)=>{ afterValidatorExecute(cellValidator, currentVal, false);}}     
                            onDisposing={(e)=>{ 
                                const value = cellInfo?.value;
                                afterValidatorExecute(cellValidator, value);
                            }}
                            validationMessagePosition="left"
                            defaultValue={inputValue}
                            stylingMode={'filled'}
                            disabled={!field.edit}
                            valueChangeEvent={'keyup'}
                            onValueChanged={(e) => {
                                const isValid = cellValidator.isValidField(e.value);
                                setIsValid(isValid)
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
                            
                                }
                            }
                        >
                                <Validator>
                                    {cellValidator.expressionSatisfiesCondition() && <PatternRule
                                        pattern={cellValidator.getRegex()}
                                        message={""}
                                    />}
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


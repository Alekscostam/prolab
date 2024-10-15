import React from "react";
import Validator, {PatternRule, RequiredRule} from 'devextreme-react/validator';
import EditRowUtils from "../../../utils/EditRowUtils";
import { NumberBox } from "devextreme-react";
import { MemoizedOperations } from "./MemoizedOperations";


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
import React from "react";
import { TreeListUtils } from "../../../utils/component/TreeListUtils";
import {PatternRule, RequiredRule} from 'devextreme-react/validator';
import { CheckBox } from "devextreme-react";
import EditRowUtils from "../../../utils/EditRowUtils";

//L – Logiczny (T/N)
export const MemoizedLogicInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validateCheckbox, onOperationClick}) => {
        if((inputValue === null)){
            inputValue =  false;
        }
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

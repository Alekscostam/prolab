import React from "react";
import { TreeListUtils } from "../../../utils/component/TreeListUtils";
import { CheckBox } from "devextreme-react";
import EditRowUtils from "../../../utils/EditRowUtils";

//B – Logiczny (0/1)
export const MemoizedBoolInput = React.memo(
    ({field, cellInfo, inputValue, fieldIndex, required, validateCheckbox, onOperationClick}) => {
        if(inputValue === null){
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
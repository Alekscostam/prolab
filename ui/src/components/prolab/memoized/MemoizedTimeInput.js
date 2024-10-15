import { DateBox } from "devextreme-react";
import React from "react";
import EditRowUtils from "../../../utils/EditRowUtils";

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

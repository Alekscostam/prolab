import {DateBox} from 'devextreme-react';
import React from 'react';
import EditRowUtils from '../../../utils/EditRowUtils';
import Constants from '../../../utils/Constants';

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
                displayFormat={Constants.DATE_FORMAT.YYYY_MM_DD}
            ></DateBox>
        </React.Fragment>
    );
});

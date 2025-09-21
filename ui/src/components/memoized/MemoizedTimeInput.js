import {DateBox} from 'devextreme-react';
import React from 'react';
import EditRowUtils from '../../utils/EditRowUtils';
import {StringUtils} from '../../utils/StringUtils';

const getDate = (inputValue) => {
    let date = new Date();
    if (!StringUtils.isBlankOrEmpty(inputValue)) {
        const [hours, minutes] = inputValue.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
            date.setHours(hours, minutes, 0, 0);
        } else {
            date = undefined;
        }
    } else {
        date = undefined;
    }
    return date;
};

//T – Czas
export const MemoizedTimeInput = React.memo(({field, cellInfo, inputValue, fieldIndex, required, validate}) => {
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
                defaultValue={getDate(inputValue)}
            />
        </React.Fragment>
    );
});

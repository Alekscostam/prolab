import {DateBox} from 'devextreme-react';
import React from 'react';
import EditRowUtils from '../../../utils/EditRowUtils';
import {StringUtils} from '../../../utils/StringUtils';

//T – Czas
export const MemoizedTimeInput = React.memo(({field, cellInfo, inputValue, fieldIndex, required, validate}) => {
    let date = new Date();
    if (!StringUtils.isBlank(inputValue)) {
        const [hours, minutes] = inputValue.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0); // Ustawia godzinę i minutę
    } else {
        date = undefined;
    }
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
                defaultValue={date}
            />
        </React.Fragment>
    );
});

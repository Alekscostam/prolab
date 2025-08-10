import {DateBox} from 'devextreme-react';
import React, {useEffect, useRef} from 'react';
import EditRowUtils from '../../../utils/EditRowUtils';
import {StringUtils} from '../../../utils/StringUtils';
import moment from 'moment';

export const MemoizedDateTimeInput = React.memo(({field, cellInfo, fieldIndex, required, validate, refDateTime}) => {
    const calendarCellsRef = useRef([]);
    const handleCalendarClick = () => {
        const ref = refDateTime?.current?.props;
        if (!ref) return;

        const selectedDate = document.querySelector('.dx-calendar-selected-date');
        if (!selectedDate) return;

        if (selectedDate.classList.contains('dx-state-active')) {
            const dateYYYYMMDD = selectedDate.getAttribute('aria-label');

            const hoursInput = Array.from(document.querySelectorAll('input[aria-valuenow]')).find(
                (el) => el.getAttribute('aria-label') === 'hours'
            );

            const minutesInput = Array.from(document.querySelectorAll('input[aria-valuenow]')).find(
                (el) => el.getAttribute('aria-label') === 'minutes'
            );

            const hours = hoursInput?.getAttribute('aria-valuenow');
            const minutes = minutesInput?.getAttribute('aria-valuenow');

            if (dateYYYYMMDD && hours && minutes) {
                const formatted = moment(`${dateYYYYMMDD} ${hours}:${minutes}`, 'LL HH:mm').format('YYYY-MM-DD HH:mm');

                ref.onValueChanged?.(formatted);
            }
        }
    };
    useEffect(() => {
        const handleOpened = () => {
            setTimeout(() => {
                const cells = Array.from(document.getElementsByClassName('dx-calendar-cell'));
                calendarCellsRef.current = cells;

                cells.forEach((cell) => {
                    cell.addEventListener('click', handleCalendarClick);
                });
            }, 0);
        };
        handleOpened();
        return () => {
            calendarCellsRef.current.forEach((cell) => {
                cell.removeEventListener('click', handleCalendarClick);
            });
        };
    }, []);

    const handleValueChanged = (e) => {
        const value = e?.value;
        if (value instanceof Date && !isNaN(value)) {
            const formatted = moment(value).format('YYYY-MM-DD HH:mm');
            cellInfo.setValue(formatted);
        } else {
            cellInfo.setValue('');
        }

        const headerLeft = document.getElementById('header-left');
        if (headerLeft) headerLeft.click();
    };

    return (
        <DateBox
            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
            name={field.fieldName}
            defaultValue={StringUtils.isBlankOrEmpty(cellInfo.displayValue) ? undefined : new Date(cellInfo.displayValue)}
            className={`${validate}`}
            showAnalogClock={true}
            ref={refDateTime}
            onValueChanged={handleValueChanged}
            style={{width: '100%'}}
            disabled={!field.edit}
            required={required}
            type='datetime'
            useMaskBehavior={true}
            displayFormat={'yyyy-MM-dd HH:mm'}
        />
    );
});

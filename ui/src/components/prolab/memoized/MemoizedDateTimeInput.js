import { DateBox } from "devextreme-react";
import React from "react";
import EditRowUtils from "../../../utils/EditRowUtils";
import { StringUtils } from "../../../utils/StringUtils";
import moment from "moment";

//E – Data + czas
export const MemoizedDateTimeInput = React.memo(
    ({field, cellInfo, fieldIndex, required, validate, refDateTime, labels}) => {
        
        return (
            <React.Fragment>
                <DateBox
                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                    name={field.fieldName}
                    defaultValue={cellInfo.displayValue === '' ? undefined : cellInfo.displayValue}
                    className={`${validate}`}
                    showAnalogClock={true}
                    ref={refDateTime}
                    onOpenedChange={(e) => {
                        setTimeout(() => {
                            const cells = document.getElementsByClassName('dx-calendar-cell');
                            for (let index = 0; index < cells.length; index++) {
                                const element = cells[index];
                                element.addEventListener('click', (e) => {
                                    const ref = refDateTime?.current?.props;
                                    if (ref) {
                                        const selectedDate =
                                            document.getElementsByClassName('dx-calendar-selected-date')[0];
                                        if (selectedDate) {
                                            if (Array.from(selectedDate.classList).includes('dx-state-active')) {
                                                const dateYYYYMMDD = selectedDate.attributes[1].value;
                                                const hours = Array.from(
                                                    document.querySelectorAll('input[aria-valuenow')
                                                ).find((e) => e.ariaLabel === 'hours').ariaValueNow;
                                                const minutes = Array.from(
                                                    document.querySelectorAll('input[aria-valuenow')
                                                ).find((e) => e.ariaLabel === 'minutes').ariaValueNow;
                                                const myMomentInString = moment(
                                                    dateYYYYMMDD + ` ${hours}:${minutes}`
                                                ).format('yyyy-MM-DD HH:mm');
                                                ref.onValueChanged(myMomentInString);
                                            }
                                        }
                                    }
                                });
                            }
                        }, 0);
                    }}
                    onValueChanged={(e) => {
                        const headerLeft = document.getElementById('header-left');
                        if (typeof e === 'string') {
                            cellInfo.setValue(e);
                            headerLeft.click();
                        } else if (!StringUtils.isEmpty(e?.component?.option('text'))) {
                            cellInfo.setValue(e.component.option('text'));
                            headerLeft.click();
                        } else if (headerLeft) {
                            headerLeft.click();
                        }
                    }}
                    style={{width: '100%'}}
                    disabled={!field.edit}
                    required={required}
                    type='datetime'
                    useMaskBehavior={true}
                    displayFormat={'yyyy-MM-dd HH:mm'}
                ></DateBox>
            </React.Fragment>
        );
    }
);

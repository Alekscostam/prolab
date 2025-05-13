import React, {useEffect, useRef, useState} from 'react';
import useStore from '../../store';
import {StringUtils} from '../../utils/StringUtils';
import LocUtils from '../../utils/LocUtils';

import {useCallback} from 'react';
import {InputSwitch} from 'primereact/inputswitch';

const FilterClear = ({clearFnc, filters}) => {
    const [filterEnabled, setFilterEnabled] = useState(!StringUtils.isBlank(filters));
    const [disabled, setDisabled] = useState(StringUtils.isBlank(filters));

    const handleChange = useCallback((value) => {
        setFilterEnabled(value);
    }, []);

    const initFunction = useCallback(() => {
        useStore.getState().setFilterClearFnc((val) => {
            setDisabled(!val);
            if (StringUtils.isBlank(val)) {
                handleChange((prev) => !prev);
            } else {
                handleChange(val);
            }
        });
    }, [handleChange]);

    useEffect(() => {
        initFunction();
        return () => {};
    }, [initFunction]);

    return (
        <div className='row'>
            <div className='col-12'>
                <div
                    id='clear-filter-outside'
                    className='d-flex justify-content-center align-items-center'
                    style={{height: '35px'}}
                >
                    <InputSwitch
                        disabled={disabled}
                        id='clear-filter'
                        onClick={() => {
                            if (clearFnc) clearFnc();
                        }}
                        checked={filterEnabled}
                        onChange={(e) => {
                            setDisabled(true);
                            if (!e.value) {
                                handleChange(e.value);
                            }
                        }}
                    />
                    <label className='ml-2 mt-0 mb-0'>{LocUtils.locFromStoreWithDefault('Filters', 'Filtry')}</label>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilterClear);

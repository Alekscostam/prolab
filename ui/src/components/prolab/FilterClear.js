import React, {useCallback, useEffect, useRef, useState} from 'react';

import useStore from '../../store';
import {StringUtils} from '../../utils/StringUtils';

const FilterClear = ({clearFnc, filters}) => {
    const ignoreNextFiltersUpdateRef = useRef(false);

    const [filterEnabled, setFilterEnabled] = useState(!StringUtils.isBlank(filters));

    const setButtonState = useCallback((hasFilters) => {
        setFilterEnabled(hasFilters);
    }, []);

    const initFunction = useCallback(() => {
        useStore.getState().setFilterClearFnc((val) => {
            const hasFilters = !StringUtils.isBlank(val);
            if (ignoreNextFiltersUpdateRef.current) {
                ignoreNextFiltersUpdateRef.current = false;
                return;
            }
            setButtonState(hasFilters);
        });
    }, [setButtonState]);

    useEffect(() => {
        initFunction();
    }, [initFunction]);

    useEffect(() => {
        const hasFilters = !StringUtils.isBlank(filters);
        if (ignoreNextFiltersUpdateRef.current && hasFilters) {
            ignoreNextFiltersUpdateRef.current = false;
            return;
        }
        setButtonState(hasFilters);
    }, [filters, setButtonState]);

    const handleClear = () => {
        ignoreNextFiltersUpdateRef.current = true;

        setButtonState(false);

        if (clearFnc) {
            clearFnc();
        }
    };

    return (
        <div className='row'>
            <div className='col-12'>
                <div id='clear-filter-outside' className='d-flex justify-content-center align-items-center'>
                    <button
                        className={`btn-clear-filter mdi mdi-filter-variant-remove ${
                            filterEnabled ? 'filter-active' : ''
                        }`}
                        disabled={!filterEnabled}
                        onClick={handleClear}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(FilterClear);

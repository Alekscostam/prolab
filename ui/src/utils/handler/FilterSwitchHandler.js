import useStore from '../../store';
import {StringUtils} from '../StringUtils';

export const handleSwitchFilterForGrid = (filters) => {
    const combinedFilter = window?.dataGrid?.getCombinedFilter();

    if (combinedFilter) {
        filters = combinedFilter;
    }
    handleCallToggle(filters);
};

const handleCallToggle = (filters) => {
    const callToggleFn = useStore.getState().callToggleFn;
    if (!StringUtils.isBlank(filters)) {
        callToggleFn(true);
    } else {
        callToggleFn(false);
    }
};

export const handleSwitchFilterForGantt = (filters) => {
    const ganttView = useStore.getState().ganttView;
    const combinedFilter = ganttView?.getCombinedFilter();
    if (combinedFilter) {
        filters = combinedFilter;
    }
    handleCallToggle(filters);
};

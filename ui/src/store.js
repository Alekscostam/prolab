import {create} from 'zustand';

const useStore = create((set) => ({
    fetchData: true,
    filterClearFnc: null,
    ganttView: undefined,
    dataGridView: undefined,
    listOfHintsElements: true,
    labels: [],
    accessToken: undefined,
    showHintListButtons: undefined,
    showFilterClear: undefined,
    showMarkupOnHtmlEditor: undefined,
    showAddFromDashboard: undefined,
    appName: undefined,
    appVersion: undefined,
    deviceName: undefined,
    refreshToken: undefined,
    currentViewType: undefined,
    setLabels: (value) => set({labels: value}),
    setGanttView: (value) => set({ganttView: value}),
    setDataGridView: (value) => set({dataGridView: value}),
    setAppVersion: (value) => set({appVersion: value}),
    setAppName: (value) => set({appName: value}),
    setDeviceName: (value) => set({deviceName: value}),
    setFetchData: (value) => set({fetchData: value}),
    setAccessToken: (value) => set({accessToken: value}),
    setRefreshToken: (value) => set({refreshToken: value}),
    setCurrentViewType: (value) => set({currentViewType: value}),
    setShowHintListButtons: (value) => set({showHintListButtons: value}),
    setShowFilterClear: (value) => set({showFilterClear: value}),
    setListOfHintsElements: (value) => set({listOfHintsElements: value}),
    setShowMarkupOnHtmlEditor: (value) => set({showMarkupOnHtmlEditor: value}),
    setShowAddFromDashboard: (value) => set({showAddFromDashboard: value}),
    setFilterClearFnc: (fn) => set({filterClearFnc: fn}),
    callToggleFn: (val) => {
        const {filterClearFnc} = useStore.getState();
        if (filterClearFnc) filterClearFnc(val);
    },
}));
export default useStore;

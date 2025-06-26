import {create} from 'zustand';
import {StringUtils} from './utils/StringUtils';

const useStore = create((set) => ({
    fetchData: true,
    filterClearFnc: null,
    draggableGridEnabled: false,
    ganttView: undefined,
    barCodeShowMethod: undefined,
    wssUrl: undefined,
    aboutVersion: undefined,
    webSocket: undefined,
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
    setBarCodeShowMethod: (value) => {
        if (StringUtils.isBlank(value)) {
            value = 'FIRST';
        }
        set({
            barCodeShowMethod: value,
        });
    },
    setDraggableGridEnabled: (value) => set({draggableGridEnabled: value}),
    setGanttView: (value) => set({ganttView: value}),
    setDataGridView: (value) => set({dataGridView: value}),
    setAppVersion: (value) => set({appVersion: value}),
    setAboutVersion: (value) => set({aboutVersion: value}),
    setAppName: (value) => set({appName: value}),
    setWssUrl: (value) => set({wssUrl: value}),
    setDeviceName: (value) => set({deviceName: value}),
    setFetchData: (value) => set({fetchData: value}),
    setAccessToken: (value) => set({accessToken: value}),
    setRefreshToken: (value) => set({refreshToken: value}),
    setCurrentViewType: (value) => set({currentViewType: value}),
    setShowHintListButtons: (value) => set({showHintListButtons: value}),
    setShowFilterClear: (value) => set({showFilterClear: value}),
    setWebSocket: (value) => set({webSocket: value}),
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

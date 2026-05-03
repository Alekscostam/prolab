import {create} from 'zustand';
import {StringUtils} from './utils/StringUtils';

const useStore = create((set, get) => ({
    fetchData: true,
    filterClearFnc: null,
    draggableGridEnabled: false,
    gridStateStore: undefined,
    rememberMe: false,
    messages: undefined,
    chatAi: undefined,
    ganttView: undefined,
    showMerge: undefined,
    captcha: undefined,
    unlockSave: undefined,
    barCodeShowMethod: undefined,
    baseViewBlockUi: undefined,
    baseViewUnblockUi: undefined,
    headerOperationBlock: undefined,
    headerOperationUnblock: undefined,
    wssUrl: undefined,
    aboutVersion: undefined,
    webSocket: undefined,
    dataGridView: undefined,
    listOfHintsElements: true,
    labels: [],
    accessToken: undefined,
    showHintListButtons: undefined,
    showFilterClear: undefined,
    heartbeatDate: undefined,
    heartbeatTimeMinutes: undefined,
    showMarkupOnHtmlEditor: undefined,
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
    setMessages: (value) => set({messages: value}),
    setCaptcha: (value) => set({captcha: value}),
    setRememberMe: (value) => set({rememberMe: value}),
    setBaseViewBlockUi: (value) => set({baseViewBlockUi: value}),
    setBaseViewUnblockUi: (value) => set({baseViewUnblockUi: value}),
    setHeaderOperationBlock: (value) => set({headerOperationBlock: value}),
    setHeaderOperationUnblock: (value) => set({headerOperationUnblock: value}),
    setGanttView: (value) => set({ganttView: value}),
    setDataGridView: (value) => set({dataGridView: value}),
    setHeartbeatTimeMinutes: (value) => set({heartbeatTimeMinutes: value}),
    setHeartbeatDate: (value) => set({heartbeatDate: value}),
    setAppVersion: (value) => set({appVersion: value}),
    setChatAi: (value) => set({chatAi: value}),
    setAboutVersion: (value) => set({aboutVersion: value}),
    setShowMerge: (value) => set({showMerge: value}),
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
    setGridStateStore: (value) => set({gridStateStore: value}),
    setListOfHintsElements: (value) => set({listOfHintsElements: value}),
    setShowMarkupOnHtmlEditor: (value) => set({showMarkupOnHtmlEditor: value}),
    setFilterClearFnc: (fn) => set({filterClearFnc: fn}),
    callToggleFn: (val) => {
        const {filterClearFnc} = useStore.getState();
        if (filterClearFnc) filterClearFnc(val);
    },
    onHeaderOperationBlock: (block) => {
        const {headerOperationBlock, headerOperationUnblock} = get();
        if (block) {
            headerOperationBlock?.();
        } else {
            setTimeout(() => {
                headerOperationUnblock?.();
            }, 1500);
        }
    },
    onBaseViewBlockUi: (block) => {
        const {baseViewBlockUi, baseViewUnblockUi} = get();
        if (block) {
            baseViewBlockUi?.();
        } else {
            baseViewUnblockUi?.();
        }
    },
}));
export default useStore;

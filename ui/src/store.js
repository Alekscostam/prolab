import {create} from 'zustand';

const useStore = create((set) => ({
    fetchData: true,
    popLastBreadcrumb: true,
    listOfHintsElements: true,
    labels: [],
    accessToken: undefined,
    appName: undefined,
    appVersion: undefined,
    deviceName: undefined,
    refreshToken: undefined,
    setLabels: (value) => set({labels: value}),
    setAppVersion: (value) => set({appVersion: value}),
    setAppName: (value) => set({appName: value}),
    setDeviceName: (value) => set({deviceName: value}),
    setFetchData: (value) => set({fetchData: value}),
    setAccessToken: (value) => set({accessToken: value}),
    setRefreshToken: (value) => set({refreshToken: value}),
    setListOfHintsElements: (value) => set({listOfHintsElements: value}),
    setPopLastBreadcrumb: (value) => set({popLastBreadcrumb: value}),
}));
export default useStore;

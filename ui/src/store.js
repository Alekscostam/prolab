import { create } from 'zustand';

const useStore = create((set) => ({
  fetchData: true, 
  listOfHintsElements: true, 
  labels: [], 
  accessToken: undefined, 
  appVersion: undefined, 
  refreshToken: undefined, 
    setLabels: (value) => set({ labels: value}),
    setAppVersion: (value) => set({ appVersion: value }),
    setFetchData: (value) => set({ fetchData: value }),
    setAccessToken: (value) => set({ accessToken: value }),
    setRefreshToken: (value) => set({ refreshToken: value }),
    setListOfHintsElements: (value) => set({ listOfHintsElements: value }),
}));
export default useStore;
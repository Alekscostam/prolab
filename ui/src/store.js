import { create } from 'zustand';

const useStore = create((set) => ({
  fetchData: true, 
  listOfHintsElements: true, 
  accessToken: undefined, 
  refreshToken: undefined, 
    setFetchData: (value) => set({ fetchData: value }),
    setAccessToken: (value) => set({ accessToken: value }),
    setRefreshToken: (value) => set({ refreshToken: value }),
    setListOfHintsElements: (value) => set({ listOfHintsElements: value }),
}));

export default useStore;
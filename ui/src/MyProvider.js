import React from 'react';

export const MyContext = React.createContext();

export const MyProvider = ({children}) => {
    const value = {};
    return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

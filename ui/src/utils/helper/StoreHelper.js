import useStore from '../../store';

export const getStore = () => useStore?.getState();

export const updateHeartbeatDate = () => {
    try {
        const now = new Date();
        const heartbeatTimeMinutes = getStore().heartbeatTimeMinutes;
        if (heartbeatTimeMinutes) {
            getStore().setHeartbeatDate(new Date(now.getTime() + heartbeatTimeMinutes * 60 * 1000));
        }
    } catch (ex) {}
};

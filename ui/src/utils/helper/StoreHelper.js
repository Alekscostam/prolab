import useStore from '../../store';
import {StringUtils} from '../StringUtils';

export const getStore = () => useStore?.getState();

export const isFirstMethodShowBarCode = () =>
    getStore().barCodeShowMethod === 'FIRST' || StringUtils.isBlank(getStore().barCodeShowMethod);
export const isSecondMethodShowBarCode = () => getStore().barCodeShowMethod === 'SECOND';
export const isThirdMethodShowBarCode = () => getStore().barCodeShowMethod === 'THIRD';

export const updateHeartbeatDate = () => {
    try {
        const now = new Date();
        const heartbeatTimeMinutes = getStore().heartbeatTimeMinutes;
        if (heartbeatTimeMinutes) {
            getStore().setHeartbeatDate(new Date(now.getTime() + heartbeatTimeMinutes * 60 * 1000));
        }
    } catch (ex) {}
};

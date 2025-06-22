import useStore from '../../store';
import {StringUtils} from '../StringUtils';

export const getStore = () => useStore?.getState();

export const isFirstMethodShowBarCode = () =>
    getStore().barCodeShowMethod === 'FIRST' || StringUtils.isBlank(getStore().barCodeShowMethod);
export const isSecondMethodShowBarCode = () => getStore().barCodeShowMethod === 'SECOND';
export const isThirdMethodShowBarCode = () => getStore().barCodeShowMethod === 'THIRD';

import {getStore} from './helper/StoreHelper';
import {StringUtils} from './StringUtils';

export const isFirstMethodShowBarCode = () =>
    getStore().barCodeShowMethod === 'FIRST' || StringUtils.isBlank(getStore().barCodeShowMethod);
export const isSecondMethodShowBarCode = () => getStore().barCodeShowMethod === 'SECOND';
export const isThirdMethodShowBarCode = () => getStore().barCodeShowMethod === 'THIRD';

export const showBarCode = () => {
    const second = isSecondMethodShowBarCode();
    const first = isFirstMethodShowBarCode();
    const third = isThirdMethodShowBarCode();

    const barCode = document.getElementById('barCode');
    const hiddenInput = document.getElementById('hidden-input');
    const qrCodeTextbox = document.getElementById('qrCode-textbox')?.children?.[0]?.children?.[0]?.children?.[0];

    const showBarCodeElement = () => {
        if (barCode) barCode.style.display = 'flex';
        else console.warn('Element #barCode nie został znaleziony.');
    };

    const focusQrCodeTextbox = () => {
        if (qrCodeTextbox) {
            qrCodeTextbox.focus();
            qrCodeTextbox.click();
        } else console.warn('Element qrCodeTextbox nie został znaleziony.');
    };

    const handleHiddenInputRead = (onSuccess, fallback) => {
        if (hiddenInput) hiddenInput.focus();
        setTimeout(() => {
            const inputValue = hiddenInput?.value;
            if (inputValue) {
                console.log('value of barcode: ' + inputValue);
                onSuccess(inputValue);
                if (hiddenInput) hiddenInput.value = '';
            } else fallback?.();
        }, 200);
    };

    if (first) {
        console.log('firstMethodShowBarCode executed');
        showBarCodeElement();
        focusQrCodeTextbox();
    } else if (second) {
        console.log('secondMethodShowBarCode executed');
        showBarCodeElement();
        handleHiddenInputRead(
            (value) => {
                if (qrCodeTextbox) qrCodeTextbox.value = value;
                document.getElementById('opConfirm-qr-code')?.click();
            },
            () => {
                focusQrCodeTextbox();
            }
        );
    } else if (third) {
        console.log('thirdMethodShowBarCode executed');
        handleHiddenInputRead(
            (value) => {
                this.findCode?.(value);
            },
            () => {
                showBarCodeElement();
                focusQrCodeTextbox();
            }
        );
    } else console.error('Method to show barcode not exist: ' + getStore().barCodeShowMethod);
};

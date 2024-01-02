import {confirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';

export class ResponseUtils {
    static run(response, nokAcceptFnc, okAcceptFnc, errMessage, resErrorMessage) {
        switch (response.status) {
            case 'OK':
                if (!!response.message) {
                    confirmDialog({
                        appendTo: document.body,
                        message: response?.message?.text,
                        header: response?.message?.title,
                        icon: 'pi pi-info-circle',
                        rejectClassName: 'hidden',
                        acceptLabel: 'OK',
                        rejectLabel: undefined,
                        accept: () => okAcceptFnc(),
                    });
                } else if (!!response.error) {
                    resErrorMessage(response);
                } else {
                    okAcceptFnc();
                }
                break;
            case 'NOK':
                if (!!response.question) {
                    confirmDialog({
                        appendTo: document.body,
                        message: response?.question?.text,
                        header: response?.question?.title,
                        icon: 'pi pi-question-circle',
                        acceptLabel: localeOptions('accept'),
                        rejectLabel: localeOptions('reject'),
                        accept: () => nokAcceptFnc(),
                        reject: () => undefined,
                    });
                } else if (!!response.message) {
                    confirmDialog({
                        appendTo: document.body,
                        message: response?.message?.text,
                        header: response?.message?.title,
                        icon: 'pi pi-info-circle',
                        rejectClassName: 'hidden',
                        acceptLabel: 'OK',
                        rejectLabel: undefined,
                        accept: () => undefined,
                    });
                } else if (!!response.error) {
                    resErrorMessage(response);
                }
                break;
            default:
                if (!!response.error) {
                    resErrorMessage(response);
                } else {
                    errMessage(response);
                }
                break;
        }
    }
}

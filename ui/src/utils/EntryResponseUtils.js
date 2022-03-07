import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";

export class EntryResponseUtils {

    static run(entryResponse, accept, reject){
        if (!!entryResponse.message) {
            confirmDialog({
                appendTo: document.body,
                message: entryResponse.message?.text,
                header: entryResponse.message?.title,
                icon: 'pi pi-info-circle',
                rejectClassName: 'hidden',
                acceptLabel: 'OK',
                rejectLabel: undefined,
                accept: () => {
                    accept();
                },
                reject: () => {
                    reject();
                },
                onHide: () => {
                    reject();
                },
            })
        } else if (!!entryResponse.question) {
            confirmDialog({
                appendTo: document.body,
                message: entryResponse?.question?.text,
                header: entryResponse?.question?.title,
                icon: 'pi pi-question-circle',
                acceptLabel: localeOptions('accept'),
                rejectLabel: localeOptions('reject'),
                accept: () => {
                    accept();
                },
                reject: () => {
                    reject();
                },
                onHide: () => {
                    reject();
                },
            })
        } else {
            accept();
        }
    }

}
import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom';

export class ResponseUtils {
    static run(response, nokAcceptFnc, okAcceptFnc, errMessage, resErrorMessage) {
        switch (response.status) {
            case 'OK':
                if (!!response.message) {
                    const confirmDialogWrapper = document.createElement('div');
                    document.body.appendChild(confirmDialogWrapper);
                    ReactDOM.render(
                        <ConfirmDialog
                            message={response?.message?.text}
                            header={response?.message?.title}
                            icon={'pi pi-info-circle'}
                            rejectClassName={'hidden'}
                            acceptLabel={'OK'}
                            rejectLabel={undefined}
                            accept={() => okAcceptFnc()}
                        />,
                        confirmDialogWrapper
                    );
                } else if (!!response.error) {
                    resErrorMessage(response);
                } else {
                    okAcceptFnc();
                }
                break;
            case 'NOK':
                if (!!response.question) {
                    const confirmDialogWrapper = document.createElement('div');
                    document.body.appendChild(confirmDialogWrapper);
                    ReactDOM.render(
                        <ConfirmDialog
                            message={response?.question?.text}
                            header={response?.question?.title}
                            icon={'pi pi-question-circle'}
                            acceptLabel={localeOptions('accept')}
                            rejectLabel={localeOptions('reject')}
                            accept={() => nokAcceptFnc()}
                            reject={() => undefined}
                        />,
                        confirmDialogWrapper
                    );
                } else if (!!response.message) {
                    const confirmDialogWrapper = document.createElement('div');
                    document.body.appendChild(confirmDialogWrapper);
                    ReactDOM.render(
                        <ConfirmDialog
                            appendTo={document.body}
                            message={response?.message?.text}
                            header={response?.message?.title}
                            icon={'pi pi-info-circle'}
                            rejectClassName={'hidden'}
                            acceptLabel={'OK'}
                            rejectLabel={undefined}
                            accept={() => undefined}
                        />,
                        confirmDialogWrapper
                    );
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

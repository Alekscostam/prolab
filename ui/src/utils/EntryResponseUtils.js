import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom';

export class EntryResponseUtils {
    static run(entryResponse, accept, reject) {
        if (!!entryResponse.message) {
            const confirmDialogWrapper = document.createElement('div');
            document.body.appendChild(confirmDialogWrapper);
            ReactDOM.render(
                <ConfirmDialog
                    visible={true}
                    message={entryResponse?.question?.text}
                    header={entryResponse?.question?.title}
                    rejectClassName={'hidden'}
                    icon={'pi pi-info-circle'}
                    acceptLabel={'OK'}
                    rejectLabel={undefined}
                    accept={() => {
                        accept();
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                    reject={() => {
                        reject();
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                    onHide={() => {
                        document.body.removeChild(confirmDialogWrapper);
                        reject();
                    }}
                />,
                confirmDialogWrapper
            );
        } else if (!!entryResponse.question) {
            const confirmDialogWrapper = document.createElement('div');
            document.body.appendChild(confirmDialogWrapper);
            ReactDOM.render(
                <ConfirmDialog
                    visible={true}
                    message={entryResponse?.question?.text}
                    header={entryResponse?.question?.title}
                    icon={'pi pi-question-circle'}
                    acceptLabel={localeOptions('accept')}
                    rejectLabel={localeOptions('reject')}
                    accept={() => {
                        accept();
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                    reject={() => {
                        reject();
                        document.body.removeChild(confirmDialogWrapper);
                    }}
                    onHide={() => {
                        document.body.removeChild(confirmDialogWrapper);
                        reject();
                    }}
                />,
                confirmDialogWrapper
            );
        } else {
            accept();
        }
    }
}

import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom';

function EntryResponseUtils() {}
EntryResponseUtils.run = (entryResponse, accept, reject) => {
    if (!!entryResponse.message || !!entryResponse.question) {
        const confirmDialogWrapper = document.createElement('div');
        document.body.appendChild(confirmDialogWrapper);
        ReactDOM.render(
            <ConfirmDialog
                closable={false}
                visible={true}
                message={entryResponse?.question?.text || entryResponse?.message?.text}
                header={entryResponse?.question?.title || entryResponse?.message?.title}
                icon={entryResponse?.question ? 'pi pi-question-circle' : 'pi pi-info-circle'}
                acceptLabel={entryResponse?.question ? localeOptions('accept') : 'OK'}
                rejectLabel={entryResponse?.question ? localeOptions('reject') : undefined}
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
                rejectClassName={entryResponse?.question ? 'hidden' : undefined} // Ukryj przycisk reject dla pytania
            />,
            confirmDialogWrapper
        );
    } else {
        accept();
    }
};
export default EntryResponseUtils;

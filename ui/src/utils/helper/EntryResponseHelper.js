import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom';
import UrlUtils from '../UrlUtils';

// TODO: pojawienie sie blokady i klkniecie ok nie zmienia sie url
function EntryResponseHelper() {}
EntryResponseHelper.run = (entryResponse, accept, reject, unblockUi) => {
    if (!!entryResponse.message || !!entryResponse.question) {
        if (typeof unblockUi === 'function' && (entryResponse?.next===false || entryResponse?.next===true )) {
            unblockUi();
            if(entryResponse?.next === false){
              window.location.href =  UrlUtils.getUrlWithoutEditRowParams()
            }
        }
        const confirmDialogWrapper = document.createElement('div');
        document.body.appendChild(confirmDialogWrapper);
        confirmDialogWrapper.className="confirm-dialog";
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
                    safeRemoveChild();
                }}
                reject={() => {
                    reject();
                    safeRemoveChild();
                }}
                onHide={() => {
                    reject();
                    safeRemoveChild();
                }}
                rejectClassName={entryResponse?.message || entryResponse?.question ? 'hidden' : undefined} // Ukryj przycisk reject dla pytania i odpowiedzi
            />,
            confirmDialogWrapper
        );
        const safeRemoveChild = () => {
            if (document.body.contains(confirmDialogWrapper)) {
                document.body.removeChild(confirmDialogWrapper);
            }
        };
    } else {
        accept();
    }
};
export default EntryResponseHelper;

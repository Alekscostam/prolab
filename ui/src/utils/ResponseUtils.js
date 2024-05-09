import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom';
import React from 'react';
import {useEffect} from 'react';

function ResponseUtils() {
    useEffect(() => {
        return () => {
            // Czyść wszystkie dialogi potwierdzające przy odmontowywaniu komponentu
            document.querySelectorAll('.confirm-dialog-wrapper').forEach((element) => {
                ReactDOM.unmountComponentAtNode(element);
                document.body.removeChild(element);
            });
        };
    }, []);

    return null;
}

ResponseUtils.run = (response, nokAcceptFnc, okAcceptFnc, errMessage, resErrorMessage) => {
    switch (response.status) {
        case 'OK':
            if (!!response.message) {
                renderConfirmDialog(response.message.text, response.message.title, 'pi pi-info-circle', okAcceptFnc);
            } else if (!!response.error) {
                resErrorMessage(response);
            } else {
                okAcceptFnc();
            }
            break;
        case 'NOK':
            if (!!response.question) {
                renderConfirmDialog(
                    response.question.text,
                    response.question.title,
                    'pi pi-question-circle',
                    nokAcceptFnc,
                    true
                );
            } else if (!!response.message) {
                renderConfirmDialog(response.message.text, response.message.title, 'pi pi-info-circle');
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
};

function renderConfirmDialog(message, header, icon, onAccept, isQuestionDialog = false) {
    const confirmDialogWrapper = document.createElement('div');
    confirmDialogWrapper.classList.add('confirm-dialog-wrapper');
    document.body.appendChild(confirmDialogWrapper);
    ReactDOM.render(
        <ConfirmDialog
            visible={true}
            message={message}
            header={header}
            icon={icon}
            acceptLabel={isQuestionDialog ? localeOptions('accept') : 'OK'}
            rejectLabel={isQuestionDialog ? localeOptions('reject') : undefined}
            accept={
                onAccept
                    ? () => {
                          onAccept();
                          document.body.removeChild(confirmDialogWrapper);
                      }
                    : () => {
                          document.body.removeChild(confirmDialogWrapper);
                      }
            }
            reject={
                isQuestionDialog
                    ? () => document.body.removeChild(confirmDialogWrapper)
                    : () => document.body.removeChild(confirmDialogWrapper)
            }
            rejectClassName={`${isQuestionDialog ? `` : 'p-hidden'} `} // Ukryj przycisk reject
        />,
        confirmDialogWrapper
    );
}

export default ResponseUtils;

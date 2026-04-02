import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom/client';
import React, {useEffect} from 'react';
import {ResponseStatus} from '../../enum/ResponseStatus';
import {HtmlUtils} from '../HtmlUtils';

function ResponseHelper() {
    useEffect(() => {
        return () => {
            document.querySelectorAll('.confirm-dialog-wrapper').forEach((element) => {
                const root = element._reactRoot;
                if (root) {
                    root.unmount();
                }
                document.body.removeChild(element);
            });
        };
    }, []);

    return null;
}

ResponseHelper.run = (response, nokAcceptFnc, okAcceptFnc, resErrorMessage, onAfterNokClick) => {
    switch (response.status) {
        case ResponseStatus.OK:
            if (response.message) {
                renderConfirmDialog(response.message.text, response.message.title, 'pi pi-info-circle', okAcceptFnc);
                okAcceptFnc();
            } else if (response.error) {
                resErrorMessage(response);
            } else {
                okAcceptFnc();
            }
            break;
        case ResponseStatus.NOK:
            if (response.question) {
                renderConfirmDialog(
                    response.question.text,
                    response.question.title,
                    'pi pi-question-circle',
                    nokAcceptFnc,
                    true
                );
            } else if (response.message) {
                renderConfirmDialog(
                    response.message.text,
                    response.message.title,
                    'pi pi-info-circle',
                    onAfterNokClick
                );
            } else if (response.error) {
                resErrorMessage(response);
            }
            break;
        default:
            resErrorMessage(response);
            break;
    }
};

function renderConfirmDialog(message, header, icon, onAccept, isQuestionDialog = false) {
    const confirmDialogWrapper = document.createElement('div');
    confirmDialogWrapper.classList.add('confirm-dialog-wrapper', 'confirm-dialog');
    document.body.appendChild(confirmDialogWrapper);

    const root = ReactDOM.createRoot(confirmDialogWrapper);
    confirmDialogWrapper._reactRoot = root;

    const cleanup = () => {
        root.unmount();
        document.body.removeChild(confirmDialogWrapper);
    };
    root.render(
        <ConfirmDialog
            closable={false}
            visible={true}
            message={HtmlUtils.createHtmlFromString(message)}
            header={HtmlUtils.createHtmlFromString(header)}
            icon={icon}
            acceptLabel={isQuestionDialog ? localeOptions('accept') : 'OK'}
            rejectLabel={isQuestionDialog ? localeOptions('reject') : undefined}
            accept={
                onAccept
                    ? () => {
                          onAccept();
                          cleanup();
                      }
                    : cleanup
            }
            reject={cleanup}
            rejectClassName={isQuestionDialog ? 'p-button-text' : 'p-hidden'}
        />
    );
}

export default ResponseHelper;

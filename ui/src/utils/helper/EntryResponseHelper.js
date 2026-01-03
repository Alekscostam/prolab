import {ConfirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import ReactDOM from 'react-dom/client';
import UrlUtils from '../UrlUtils';
import {HtmlUtils} from '../HtmlUtils';
import {StringUtils} from '../StringUtils';

function EntryResponseHelper() {}
EntryResponseHelper.run = (entryResponse, accept, reject, unblockUi) => {
    if (!!entryResponse.message || !!entryResponse.question) {
        if (typeof unblockUi === 'function' && (entryResponse?.next === false || entryResponse?.next === true)) {
            unblockUi();
            if (entryResponse?.next === false) {
                window.location.href = UrlUtils.getUrlWithoutEditRowParams();
            }
        }
        const getMessage = () => {
            const isMessageHtml = HtmlUtils.isValidHtml(entryResponse?.message?.text);
            const isQuestionHtml = HtmlUtils.isValidHtml(entryResponse?.question?.text);
            if (isMessageHtml || isQuestionHtml) {
                const msg = entryResponse?.question?.text || entryResponse?.message?.text;
                return HtmlUtils.createHtmlFromString(msg);
            } else {
                const message = entryResponse?.message?.text;
                const question = entryResponse?.question?.text;
                if (!StringUtils.isBlank(message) && !StringUtils.isBlank(question)) {
                    return message + '\n' + question;
                }
                return HtmlUtils.createHtmlFromString(message || question);
            }
        };
        const getHeader = () => {
            const header = entryResponse?.question?.title || entryResponse?.message?.title;
            return HtmlUtils.createHtmlFromString(header);
        };
        const confirmDialogWrapper = document.createElement('div');
        document.body.appendChild(confirmDialogWrapper);
        confirmDialogWrapper.className = 'confirm-dialog';
        ReactDOM.createRoot(confirmDialogWrapper).render(
            <ConfirmDialog
                closable={false}
                visible={true}
                message={getMessage()}
                header={getHeader()}
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
                rejectClassName={entryResponse?.question?.text ? undefined : 'hidden'}
            />
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

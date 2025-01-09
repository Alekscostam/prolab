import React from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {ConfirmDialog} from 'primereact/confirmdialog';
import {HtmlUtils} from '../../utils/HtmlUtils';
import {StringUtils} from '../../utils/StringUtils';

export const ConfirmPluginDialogComponent = ({parsedPluginView, onHide, onAccept, onReject}) => {
    const acceptLabel = () => {
        if (isQuestion()) {
            return LocUtils.locFromStoreWithDefault('Yes', 'Tak');
        }
        return LocUtils.locFromStoreWithDefault('Ok', 'OK');
    };
    const rejectLabel = () => {
        if (isQuestion()) {
            return LocUtils.locFromStoreWithDefault('No', 'Nie');
        }
        return LocUtils.locFromStoreWithDefault('Close', 'Zamknij');
    };
    const isMessage = () => {
        return parsedPluginView.info.kind === 'MESSAGE';
    };
    const isQuestion = () => {
        return parsedPluginView.info.kind === 'QUESTION';
    };
    const message = () => {
        if (isQuestion()) {
            return HtmlUtils.createHtmlFromString(parsedPluginView.info.question?.text);
        }
        return HtmlUtils.createHtmlFromString(parsedPluginView.info.message?.text);
    };
    const headerLabel = () => {
        let header = LocUtils.locFromStoreWithDefault('', parsedPluginView.info?.name);
        if (isMessage()) {
            if (!parsedPluginView.info?.message?.title) {
                return '';
            }
            return HtmlUtils.createHtmlFromString(parsedPluginView.info?.message?.title);
        }
        if (isQuestion()) {
            if (!parsedPluginView.info.question?.title) {
                return '';
            }
            return HtmlUtils.createHtmlFromString(parsedPluginView.info?.question?.title);
        }
        return header;
    };
    const accept = () => {
        onAccept();
    };
    const reject = () => {
        if (isQuestion()) {
            onReject();
        }
        return undefined;
    };
    const getIcon = () => {
        const info = parsedPluginView?.info;
        if ('icon' in info) {
            if (StringUtils.isBlank(info.icon)) {
                return '';
            }
            return info.icon;
        } else {
            return 'pi pi-exclamation-triangle';
        }
    };

    const classNameGenerate = () => {
        let className = 'confirm-plugin';
        if (isMessage()) {
            className = className + ' single-button';
            if (HtmlUtils.isValidHtml(parsedPluginView.info?.message?.text)) {
                className = className + ' override-align-items-stretch';
            }
        }
        if (HtmlUtils.isValidHtml(parsedPluginView.info?.question?.text)) {
            className = className + ' override-align-items-stretch';
        }
        return className;
    };
    return (
        <ConfirmDialog
            closable={false}
            visible={true}
            acceptLabel={acceptLabel()}
            rejectLabel={rejectLabel()}
            header={headerLabel()}
            onHide={() => onHide()}
            message={message()}
            className={classNameGenerate()}
            icon={getIcon()}
            accept={() => accept()}
            reject={() => reject()}
        />
    );
};

ConfirmPluginDialogComponent.defaultProps = {
    parsedPluginView: undefined,
    labels: [],
    onHide: () => {},
    onAccept: () => {},
    onReject: () => {},
};

ConfirmPluginDialogComponent.defaultProps = {
    parsedPluginView: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onAccept: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

import LocUtils from '../LocUtils';

export class PluginConfirmDialogUtils {
    static acceptLabel(parsedPluginView, labels) {
        parsedPluginView.info.question ? LocUtils.loc(labels, 'Yes', 'Tak') : LocUtils.loc(labels, 'Ok', 'Ok');
    }
    static rejectLabel(parsedPluginView, labels) {
        parsedPluginView.info.question ? LocUtils.loc(labels, 'No', 'Nie') : LocUtils.loc(labels, 'Close', 'Zamknij');
    }
    static message(parsedPluginView, labels) {
        return parsedPluginView.info.question
            ? LocUtils.loc(labels, '', parsedPluginView.info.question?.text)
            : LocUtils.loc(labels, '', parsedPluginView.info.message?.text);
    }
    static header(parsedPluginView, labels) {
        return parsedPluginView.info.question
            ? LocUtils.loc(labels, '', parsedPluginView.info.question?.title)
            : parsedPluginView.info.message
            ? LocUtils.loc(labels, '', parsedPluginView.info.message?.title)
            : LocUtils.loc(labels, '', parsedPluginView.info?.name);
    }
}

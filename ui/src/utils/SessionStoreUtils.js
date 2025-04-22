import UrlUtils from './UrlUtils';

export class SessionStoreUtils {
    static saveClickedRowFromView(
        id,
        recordId = UrlUtils.getRecordId(),
        parentId = UrlUtils.getParentId(),
        viewId = UrlUtils.getIdFromUrl()
    ) {
        const clickedRowFromView = {
            view: {
                id: viewId,
                recordId: recordId,
                parentId: parentId,
            },
            row: {
                id: id,
            },
        };
        sessionStorage.setItem('clickedRowFromView', JSON.stringify(clickedRowFromView));
    }
    static getClickedRowFromView() {
        const clickedRowFromView = sessionStorage.getItem('clickedRowFromView');
        if (clickedRowFromView) {
            return JSON.parse(clickedRowFromView);
        }
        return null;
    }
    static clearClickedRowFromView() {
        sessionStorage.removeItem('clickedRowFromView');
    }
}

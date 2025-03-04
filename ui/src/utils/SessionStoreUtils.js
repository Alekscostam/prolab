import UrlUtils from './UrlUtils';

export class SessionStoreUtils {
    static saveClickedRowFromView(id) {
        const clickedRowFromView = {
            view: {
                id: UrlUtils.getIdFromUrl(),
                recordId: UrlUtils.getRecordId(),
                parentId: UrlUtils.getParentId(),
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

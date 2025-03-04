import useStore from '../store';
import {CompareUtils} from './CompareUtils';
import {SessionStoreUtils} from './SessionStoreUtils';
import UrlUtils from './UrlUtils';

export class RowTemplateUtils {
    static highlighBackgroundClass(rowId, deleteAfterFound = false) {
        if (!rowId) {
            return '';
        }
        const clickedRowFromView = SessionStoreUtils.getClickedRowFromView();
        if (!clickedRowFromView) {
            return '';
        }
        const {view, row} = clickedRowFromView;
        if (!this.isSameView(view)) {
            SessionStoreUtils.clearClickedRowFromView();
            return '';
        }
        if (this.isSameRecord(view) && CompareUtils.areEqualIgnoringType(rowId, row.id)) {
            if (deleteAfterFound) {
                SessionStoreUtils.clearClickedRowFromView();
            }
            return 'highlight-row';
        }
        return '';
    }

    static isSameView(view) {
        return CompareUtils.areEqualIgnoringType(view.id, UrlUtils.getIdFromUrl());
    }

    static isSameRecord(view) {
        return (
            CompareUtils.areEqualIgnoringType(view.parentId, UrlUtils.getParentId()) &&
            CompareUtils.areEqualIgnoringType(view.recordId, UrlUtils.getRecordId())
        );
    }
}

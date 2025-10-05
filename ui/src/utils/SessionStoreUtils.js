import useStore from '../store';
import {ColumnUtils} from './ColumnUtils';
import {getStore} from './helper/StoreHelper';
import {StringUtils} from './StringUtils';
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

    static saveFiltersFromView(view = window.dataGrid) {
        const currentViewType = useStore.getState().currentViewType;
        if (currentViewType === 'gantt') {
            view = useStore.getState().ganttView;
        }
        if (view) {
            let filters = view.getCombinedFilter();
            if (currentViewType === 'gantt') {
                const columns = view.option('columns');
                filters = ColumnUtils.replaceFunctionsWithDataField(filters, columns);
            }
            SessionStoreUtils.saveFilters(filters);
        }
    }
    static getStoreInformation() {
        const clickedRowFromView = sessionStorage.getItem('storeInformation');
        if (clickedRowFromView) {
            return JSON.parse(clickedRowFromView);
        }
        return null;
    }
    static saveStore(
        store = getStore()?.gridStateStore,
        recordId = UrlUtils.getRecordId(),
        parentId = UrlUtils.getParentId(),
        viewId = UrlUtils.getIdFromUrl()
    ) {
        const storeInformation = {
            view: {
                id: viewId,
                recordId: recordId,
                parentId: parentId,
            },
            store: store,
        };
        sessionStorage.setItem('storeInformation', JSON.stringify(storeInformation));
    }
    static clearStoreInformation() {
        sessionStorage.removeItem('storeInformation');
    }
    static canApplyStore(
        recordId = UrlUtils.getRecordId(),
        parentId = UrlUtils.getParentId(),
        viewId = UrlUtils.getIdFromUrl()
    ) {
        const store = this.getStoreInformation();
        const viewIdFromCookie = StringUtils.isBlank(store?.view?.id) ? null : String(store?.view?.id);
        const recordIdFromCookie = StringUtils.isBlank(store?.view?.recordId) ? null : String(store?.view?.recordId);
        const parentIdFromCookie = StringUtils.isBlank(store?.view?.parentId) ? null : String(store?.view?.parentId);

        recordId = StringUtils.isBlank(recordId) ? null : String(recordId);
        parentId = StringUtils.isBlank(parentId) ? null : String(parentId);
        viewId = StringUtils.isBlank(viewId) ? null : String(viewId);

        const viewIdsAreEquals = viewIdFromCookie === viewId;
        const recordIdsAreEquals = recordIdFromCookie === recordId;
        const parentIdsAreEquals = parentIdFromCookie === parentId;

        if (viewIdsAreEquals && recordIdsAreEquals && parentIdsAreEquals) {
            return true;
        }
        return false;
    }

    static clearFiltersInformation() {
        sessionStorage.removeItem('filtersInformation');
    }
    static canApplyFilter(
        recordId = UrlUtils.getRecordId(),
        parentId = UrlUtils.getParentId(),
        viewId = UrlUtils.getIdFromUrl()
    ) {
        const filter = this.getFiltersInformation();
        const viewIdFromCookie = StringUtils.isBlank(filter?.view?.id) ? null : String(filter?.view?.id);
        const recordIdFromCookie = StringUtils.isBlank(filter?.view?.recordId) ? null : String(filter?.view?.recordId);
        const parentIdFromCookie = StringUtils.isBlank(filter?.view?.parentId) ? null : String(filter?.view?.parentId);

        recordId = StringUtils.isBlank(recordId) ? null : String(recordId);
        parentId = StringUtils.isBlank(parentId) ? null : String(parentId);
        viewId = StringUtils.isBlank(viewId) ? null : String(viewId);

        const viewIdsAreEquals = viewIdFromCookie === viewId;
        const recordIdsAreEquals = recordIdFromCookie === recordId;
        const parentIdsAreEquals = parentIdFromCookie === parentId;

        if (viewIdsAreEquals && recordIdsAreEquals && parentIdsAreEquals) {
            return true;
        }
        return false;
    }
    static saveFilters(
        filters,
        recordId = UrlUtils.getRecordId(),
        parentId = UrlUtils.getParentId(),
        viewId = UrlUtils.getIdFromUrl()
    ) {
        const filtersInformation = {
            view: {
                id: viewId,
                recordId: recordId,
                parentId: parentId,
            },
            filters: filters,
        };
        sessionStorage.setItem('filtersInformation', JSON.stringify(filtersInformation));
    }
    static getFiltersInformation() {
        const clickedRowFromView = sessionStorage.getItem('filtersInformation');
        if (clickedRowFromView) {
            return JSON.parse(clickedRowFromView);
        }
        return null;
    }
}

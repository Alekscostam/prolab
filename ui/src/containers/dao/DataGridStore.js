import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";

export default class DataGridStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        this.cachedLastResponse = null;
        this.cachedLoadOptions = null;
    }

    getSelectAllDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, filters) {
        let params = '?';
        [
            !!filters && filters.length > 0 ? 'filter' : undefined,
            'group',
            'groupSummary',
            'parentIds',
            'requireGroupCount',
            'requireTotalCount',
            'searchExpr',
            'searchOperation',
            'searchValue',
            'select',
            'sort',
            'totalSummary',
            // 'userData',
        ].forEach((i) => {
            if (i in this.cachedLoadOptions
                && this.isNotEmpty(this.cachedLoadOptions[i])) {
                params += `${i}=${JSON.stringify(this.cachedLoadOptions[i])}&`;
            }
        });
        if (!!viewTypeArg) {
            params += "viewType=" + viewTypeArg;
        }
        let eventSelectAll = true;
        const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
        const selectAllParam = !!eventSelectAll ? `&selection=true` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}${selectAllParam}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(
            url,
            {
                method: 'GET',
            }
        ).then((res) => {
            return Promise.resolve(res);
        });
    }

    getDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, onStartCallback, onSuccessCallback, onErrorCallback) {
        if (!viewIdArg) {
            if (onSuccessCallback) {
                onSuccessCallback();
            }
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        return new CustomStore({
            key: 'ID',
            keyExpr: 'ID',
            load: (loadOptions) => {
                this.cachedLoadOptions = loadOptions;
                let params = '?';
                [
                    'filter',
                    'group',
                    'groupSummary',
                    'parentIds',
                    'requireGroupCount',
                    'requireTotalCount',
                    'searchExpr',
                    'searchOperation',
                    'searchValue',
                    'select',
                    'sort',
                    'skip',
                    'take',
                    'totalSummary',
                    // 'userData',
                ].forEach((i) => {
                    if (i in loadOptions
                        && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                if (!!viewTypeArg) {
                    params += "viewType=" + viewTypeArg;
                }
                let addSelectAllParam = false;
                if (!!onStartCallback) {
                    let result = onStartCallback();
                    if (result?.select || result?.selectAll) {
                        addSelectAllParam = true
                    }
                }
                const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
                const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
                const selectAllParam = !!addSelectAllParam ? `&selection=true` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}${selectAllParam}`;
                url = this.commonCorrectUrl(url);
                //blokuj dziwne strzały ze stora
                if (url.split("&").length - 1 <= 2 && !!this.cachedLastResponse) {
                    if (onSuccessCallback) {
                        onSuccessCallback();
                    }
                    ConsoleHelper('Prevent store fetch, url: ' + url)
                    return Promise.resolve(this.cachedLastResponse);
                }
                return this.fetch(
                    url,
                    {
                        method: 'GET',
                    }
                ).then((response) => {
                    ConsoleHelper('DataGridStore -> fetch ');
                    this.cachedLastResponse = {
                        data: response.data,
                        totalCount: response.totalCount,
                        summary: response.summary || [],
                        groupCount: response.groupCount || 0
                    };
                    if (onSuccessCallback) {
                        onSuccessCallback();
                    }
                    return this.cachedLastResponse;
                }).catch((err) => {
                    ConsoleHelper('Error fetch data grid store for view id={%s}. Error = ', viewIdArg, err);
                    if (onErrorCallback) {
                        onErrorCallback(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                });
            },
        });
    }

}

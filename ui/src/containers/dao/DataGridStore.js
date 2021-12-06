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

    getDataForCard(viewId, loadOptions) {
        // Get a token from api server using the fetch api
        let params = '?';
        [
            'filter',
            'filterId',
            'parentId',
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
            'userData',
        ].forEach((i) => {
            if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                params += `${i}=${JSON.stringify(loadOptions[i])}&`;
            }
        });
        params += 'viewType=cardView';
        return this.fetch(`${this.domain}/${this.path}/${viewId}${params}`, {
            method: 'GET',
        }).then((res) => {
            return Promise.resolve(res);
        });
    }

    getSelectAllDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, filters) {
        let params = '?';
        [
            !!filters ? 'filter' : undefined,
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
        let eventSelectAll = true;
        const viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
        const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
        const selectAllParam = !!eventSelectAll ? `&selection=true` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${recordParentIdParam}`;
        return this.fetch(
            url,
            {
                method: 'GET',
            }
        ).then((res) => {
            return Promise.resolve(res);
        });
    }

    getDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, onStart, onSuccess, onError) {
        if (!viewIdArg) {
            if (onSuccess) {
                onSuccess();
            }
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const dataGridStore = new CustomStore({
            key: 'ID',
            //keyExpr: 'ID',
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

                let addSelectAllParam = false;
                if (!!onStart) {
                    let result = onStart();
                    if (result?.select || result?.selectAll) {
                        addSelectAllParam = true
                    }
                }
                const viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
                const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam = recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
                const selectAllParam = !!addSelectAllParam ? `&selection=true` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${recordParentIdParam}`;
                //blokuj dziwne strzały ze stora
                if (url.split("&").length - 1 <= 2) {
                    if (onSuccess) {
                        onSuccess();
                    }
                    console.log('Prevent store fetch, url: ' + url)
                    return Promise.resolve(this.cachedLastResponse);
                }
                return this.fetch(
                    url,
                    {
                        method: 'GET',
                    }
                ).then((response) => {
                    ConsoleHelper('DataGridStore -> fetch ');
                    const responseData = {
                        data: response.data,
                        totalCount: response.totalCount,
                        summary: response.summary || [],
                        groupCount: response.groupCount || 0
                    };
                    this.cachedLastResponse = responseData;
                    if (onSuccess) {
                        onSuccess();
                    }
                    return this.cachedLastResponse;
                }).catch((err) => {
                    ConsoleHelper('Error fetch data grid store for view id={%s}. Error = ', viewIdArg, err);
                    if (onError) {
                        onError(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                });
            },
        });
        return dataGridStore;
    }

    isNotEmpty(value) {
        return value !== undefined && value !== null && value !== '';
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }
}

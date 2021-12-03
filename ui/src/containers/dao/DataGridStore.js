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

    getDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, onError, onSuccess, onStart) {
        if (!viewIdArg) {
            if (onSuccess) {
                onSuccess({totalSelectCount: 0});
            }
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const dataGridStore = new CustomStore({
            key: 'ID',
            //keyExpr: 'ID',
            load: (loadOptions) => {
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
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                let eventSelectAll = false;
                if (!!onStart) {
                    let result = onStart();
                    eventSelectAll = result?.selectAll
                    if (eventSelectAll) {
                        eventSelectAll = true
                    }
                }
                const viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
                const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam = recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
                const selectAllParam = !!eventSelectAll ? `&selection=true` : '';
                const url = `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${recordParentIdParam}`;
                //blokuj dziwne strzały ze stora
                if (url.split("&").length - 1 <= 2
                    || url.indexOf('searchOperation=%22contains%22') > 0) {
                    if (onSuccess) {
                        onSuccess({totalSelectCount: this.cachedLastResponse?.length});
                    }
                    console.log('Prevent store fetch')
                    return Promise.resolve(this.cachedLastResponse);
                }
                return this.fetch(
                    url,
                    {
                        method: 'GET',
                    }
                ).then((response) => {
                    let data = response.data;
                    ConsoleHelper('DataGridStore -> fetch data: ', data);
                    if (onSuccess) {
                        onSuccess({totalSelectCount: response.totalCount});
                    }
                    const responseData = {
                        data: data,
                        totalCount: response.totalCount,
                        summary: response.summary || [],
                        groupCount: response.groupCount || 0,
                    };
                    this.cachedLastResponse = responseData;
                    return this.cachedLastResponse;
                }).catch((err) => {
                    ConsoleHelper('Error fetch data grid store for view id={%s}. Error = ', viewIdArg, err);
                    if (onError) {
                        onError(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
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

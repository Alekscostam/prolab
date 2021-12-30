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

    commonCorrectUrl(correctUrl) {
        const phraseToEraseFromUrl = '&searchOperation="contains"';
        if (correctUrl.includes(phraseToEraseFromUrl)) {
            correctUrl = correctUrl.replace(phraseToEraseFromUrl, '');
        }
        return correctUrl;
    }

    getDataForCard(viewIdArg, loadOptions, recordParentIdArg, filterIdArg, kindViewArg) {
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
        const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}`;
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
        let eventSelectAll = true;
        const viewTypeParam = !!viewTypeArg ? `&viewType=${viewTypeArg}` : '';
        const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
        const selectAllParam = !!eventSelectAll ? `&selection=true` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${recordParentIdParam}${kindViewParam}`;
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

    getDataCardStore(viewIdArg, loadOptions, recordParentIdArg, filterIdArg, kindViewArg, onStart, onSuccess, onError) {
        return new CustomStore({
            key: 'ID',
            keyExpr: 'ID',
            load: (loadOptions) => {
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
                const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam = recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
                const kindViewParam = kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}`;
                url = this.commonCorrectUrl(url);
                return this.fetch(
                    url,
                    {
                        method: 'GET',
                    }
                ).then((response) => {
                    ConsoleHelper('DataCardStore -> fetch ');
                    let parsedData = response.data.map(function (item) {
                        for (var key in item) {
                            var upper = key.toUpperCase();
                            // check if it already wasn't uppercase
                            if (upper !== key) {
                                item[upper] = item[key];
                                delete item[key];
                            }
                        }
                        return item;
                    });
                    this.cachedLastResponse = {
                        data: parsedData,
                        totalCount: response.totalCount,
                        summary: response.summary || [],
                        groupCount: response.groupCount || 0
                    };
                    if (onSuccess) {
                        onSuccess();
                    }
                    return this.cachedLastResponse;
                }).catch((err) => {
                    ConsoleHelper('Error fetch data card store for view id={%s}. Error = ', viewIdArg, err);
                    if (onError) {
                        onError(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                });
            },
        });
    }


    getDataGridStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, onStart, onSuccess, onError) {
        if (!viewIdArg) {
            if (onSuccess) {
                onSuccess();
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

                let addSelectAllParam = false;
                if (!!onStart) {
                    let result = onStart();
                    if (result?.select || result?.selectAll) {
                        addSelectAllParam = true
                    }
                }
                const viewTypeParam = !!viewTypeArg ? `&viewType=${viewTypeArg}` : '';
                const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
                const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
                const selectAllParam = !!addSelectAllParam ? `&selection=true` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${recordParentIdParam}${kindViewParam}`;
                url = this.commonCorrectUrl(url);
                //blokuj dziwne strzały ze stora
                if (url.split("&").length - 1 <= 2) {
                    if (onSuccess) {
                        onSuccess();
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

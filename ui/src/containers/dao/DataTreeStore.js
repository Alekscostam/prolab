import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
        this.cachedLastResponse = null;
        this.cachedLoadOptions = null;
    }

    getSelectAllDataTreeStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, filters) {
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
        let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${recordParentIdArg}${params}${viewTypeParam}${filterIdParam}${selectAllParam}${kindViewParam}`;
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

    getDataTreeStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, onStart, onSuccess, onError) {
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
                //const viewTypeParam = !!viewTypeArg ? `&viewType=${viewTypeArg}` : '';
                const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
                //const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
                const kindViewParam = `&kindView=ViewSpec`;
                const selectAllParam = !!addSelectAllParam ? `&selection=true` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${recordParentIdArg}/data${params}${filterIdParam}${selectAllParam}${kindViewParam}`;
                url = this.commonCorrectUrl(url);
                //blokuj dziwne strzały ze stora
                if ((url.split("&").length - 1 <= 2) && !!this.cachedLastResponse) {
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
                    ConsoleHelper('DataTreeStore -> fetch ');
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
                    ConsoleHelper('Error fetch data tree store for view id={%s}. Error = ', viewIdArg, err);
                    if (onError) {
                        onError(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                });
            },
        });
    }

}

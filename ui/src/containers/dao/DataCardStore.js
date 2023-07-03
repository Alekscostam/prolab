import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';

export default class DataCardStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        this.cachedLastResponse = null;
        this.cachedLoadOptions = null;
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
        const recordParentIdParam =
            recordParentIdArg !== undefined && recordParentIdArg != null ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'GET',
        }).then((res) => {
            return Promise.resolve(res);
        });
    }

    getDataCardStore(
        viewIdArg,
        loadOptions,
        recordParentIdArg,
        filterIdArg,
        kindViewArg,
        onStartCallback,
        onSuccessCallback,
        onErrorCallback
    ) {
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
                const filterIdParam =
                    filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                const recordParentIdParam =
                    recordParentIdArg !== undefined && recordParentIdArg != null
                        ? `&parentId=${recordParentIdArg}`
                        : '';
                const kindViewParam =
                    kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}`;
                url = this.commonCorrectUrl(url);
                return this.fetch(url, {
                    method: 'GET',
                })
                    .then((response) => {
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
                            groupCount: response.groupCount || 0,
                        };
                        if (onSuccessCallback) {
                            onSuccessCallback();
                        }
                        return this.cachedLastResponse;
                    })
                    .catch((err) => {
                        ConsoleHelper('Error fetch data card store for view id={%s}. Error = ', viewIdArg, err);
                        if (onErrorCallback) {
                            onErrorCallback(err);
                        }
                        return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                    });
            },
        });
    }
}

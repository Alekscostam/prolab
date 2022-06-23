import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";

export default class DataGanttStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        this.cachedLastResponse = null;
        this.cachedLoadOptions = null;
    }

    getDataForGantt(viewIdArg, loadOptions, recordParentIdArg, filterIdArg, kindViewArg) {
        
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
        params += 'viewType=gantt';
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
            // res.data.id
            ConsoleHelper('DataGanttStore -> fetch');
            this.cachedLastResponse = {
                data: res.data,
                dependenciesData: res.dependenciesData,
                resourcesData: res.resourcesData,
                resourcesAssigmentData: res.resourcesAssigmentData,
            };
            return this.cachedLastResponse;

        });
    } 

    getDataGanttStore(viewIdArg, viewTypeArg, recordParentIdArg, filterIdArg, kindViewArg, onStartCallback, onSuccessCallback, onErrorCallback) {
        if (!viewIdArg) {
            if (onSuccessCallback) {
                onSuccessCallback();
            }
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 30});
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
                params += 'viewType=gantt';
                
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
                    
                    ConsoleHelper('DataGanntStore -> fetch ');
                     res.data.map(function (item) {
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
                        data: res.data,
                        dependenciesData: res.dependenciesData,
                        resourcesData: res.resourcesData,
                        resourcesAssigmentData: res.resourcesAssigmentData,
                    };

                    if (onSuccessCallback) {
                        onSuccessCallback();
                    }
                    return this.cachedLastResponse;
                }).catch((err) => {
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

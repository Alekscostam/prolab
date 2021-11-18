import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";

export default class DataGridStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
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

    getDataGridStore(viewIdArg, viewTypeArg, recordIdArg, filterIdArg, parentIdArg, onError, onSuccess, onStart) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const dataGridStore = new CustomStore({
            key: 'ID',
            //keyExpr: 'ID',
            load: (loadOptions) => {
                let selectAll = false;
                if (onStart) {
                    let result = onStart();
                    selectAll = result?.selectAll
                }
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
                let viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
                let filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                let recordIdParam = recordIdArg !== undefined && recordIdArg != null ? `&parentId=${recordIdArg}` : '';
                let parentIdParam = parentIdArg !== undefined && parentIdArg != null ? `&parentId=${parentIdArg}` : '';
                let selectAllParam = !!selectAll ? `&selection=true` : '';
                return this.fetch(
                    `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${recordIdParam}${selectAllParam}${parentIdParam}`,
                    {
                        method: 'GET',
                    }
                )
                    .then((response) => {
                        let data = response.data;
                        ConsoleHelper('DataGridStore -> fetch data: ', data);
                        if (onSuccess) {
                            onSuccess({totalSelectCount: response.totalCount});
                        }
                        return {
                            data: data,
                            totalCount: response.totalCount,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
                    })
                    .catch((err) => {
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

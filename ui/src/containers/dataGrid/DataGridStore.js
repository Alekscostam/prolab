import React from 'react';
// import 'devextreme/dist/css/dx.light.css';
import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';

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

    getDataGridStore(viewIdArg, viewTypeArg, recordIdArg, filterIdArg, onError, onSuccess, onStart) {
        const dataGridStore = new CustomStore({
            key: 'ID',
            //keyExpr: 'ID',
            load: (loadOptions) => {
                if (onStart) {
                    onStart();
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
                    'userData',
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                let viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
                let filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                let recordIdParam = recordIdArg !== undefined && recordIdArg != null ? `&parentId=${recordIdArg}` : '';
                //let parentIdParam = recordIdArg !== undefined && recordIdArg != null ? `&parentId=${recordIdArg}` : '';
                if (!viewIdArg) {
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
                }
                return this.fetch(
                    `${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${recordIdParam}`,
                    {
                        method: 'GET',
                    }
                )
                    .then((response) => {
                        let data = response.data;
                        console.log('DataGridStore -> fetch data: ', data);
                        if (onSuccess) {
                            onSuccess();
                        }
                        return {
                            data: data,
                            //TODO
                            totalCount: response.totalCount,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
                    })
                    .catch((err) => {
                        console.log('Error fetch data grid store for view id={%s}. Error = ', viewIdArg, err);
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

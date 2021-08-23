import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';

export default class DataGridStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        this.getDataGridStore = this.getDataGridStore.bind(this);
    }

    getDataForCard(viewId, loadOptions) {
        // Get a token from api server using the fetch api
        let params = '?';
        [
            'filter',
            'filterId',
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

    getDataGridStore(viewIdArg, viewTypeArg, filterIdArg, recordIdArg) {
        const dataGridStore = new CustomStore({
            key: 'id',
            keyExpr: 'id',
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
                    'userData',
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                // params += 'viewType=listView';
                let viewTypeParam = viewTypeArg !== undefined && viewTypeArg != null ? `&viewType=${viewTypeArg}` : '';
                let filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
                let recordIdParam = recordIdArg !== undefined && recordIdArg != null ? `&recordId=${recordIdArg}` : '';
                return this.fetch(`${this.domain}/${this.path}/${viewIdArg}${params}${viewTypeParam}${filterIdParam}${recordIdParam}`, {
                    method: 'GET',
                })
                    .then((response) => {
                        let data = response.data;
                        console.log('DataGridStore -> fetch ata: ', data);
                        return {
                            data: data,
                            //TODO
                            totalCount: response.totalCount || 50,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
                    })
                    .catch((err) => {
                        console.log("Error fetch data grid store for view id={%s}. Error = ", viewIdArg, err)
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

import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import CustomStore from 'devextreme/data/custom_store';
import 'whatwg-fetch';
import BaseService from "../../services/BaseService";

export default class DataGridStore extends BaseService {

    constructor() {
        super();
        this.path = 'viewdata';
        this.getDataGridStore = this.getDataGridStore.bind(this);
    }

    getDataGridStore(viewId) {
        const dataGridStore = new CustomStore({
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
                    'userData'
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                params = params.slice(0, -1);
                return this.fetch(`${this.domain}/${this.path}/${viewId}${params}`, {
                    method: 'GET',
                })
                    .then(response => {
                        return {
                            data: response.data,
                            totalCount: response.totalCount || 1000,
                            summary: response.summary,
                            groupCount: response.groupCount
                        };
                    })
                    .catch((err) => {
                        console.log("Error fetch data grid store for view id={%s}. Error = ", viewId, err)
                    });
            },
        });
        return dataGridStore;
    }


    isNotEmpty(value) {
        return value !== undefined && value !== null && value !== ''
    };

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

}


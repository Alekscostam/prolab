import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";
import {v4 as uuidv4} from 'uuid';

//example
//api//View/{id}/Edit/{recordId}/list/{fieldId}/data?skip={skip}&take={take}&parentId={parentId}&sort={sort}&filter={filter}
export default class EditListDataStore extends BaseService {

    constructor() {
        super();
        this.path = 'View';
    }

    getEditListDataStore(viewIdArg, viewTypeArg, recordIdArg, fieldIdArg, parentIdArg, filterIdArg, elementArg, columnIdExists, onError, onSuccess, onStart) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const editListDataStore = new CustomStore({
            key: columnIdExists ? 'ID' : 'UUID',
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
                let filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filter=${filterIdArg}` : '';
                let parentIdParam = parentIdArg !== undefined && parentIdArg != null ? `&parentId=${parentIdArg}` : '';
                let selectAllParam = !!selectAll ? `&selection=true` : '';
                return this.fetch(
                    `${this.domain}/${this.path}/${viewIdArg}/Edit/${recordIdArg}/list/${fieldIdArg}/data${params}${parentIdParam}${filterIdParam}${selectAllParam}${viewTypeParam}`,
                    {
                        method: 'POST',
                        body: JSON.stringify(elementArg),
                    }
                )
                    .then((response) => {
                        let data = response.data;
                        if (!columnIdExists) {
                            data.forEach((data) => {
                                data.UUID = uuidv4();
                            });
                        }
                        ConsoleHelper('EditListDataStore -> fetch data: ', data);
                        if (onSuccess) {
                            onSuccess({totalSelectCount: response.totalCount});
                        }
                        return {
                            data: data,
                            totalCount: response.totalCount || 1000,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
                    })
                    .catch((err) => {
                        ConsoleHelper('Error fetch data edit list data store for view id={%s}. Error = ', viewIdArg, err);
                        if (onError) {
                            onError(err);
                        }
                        return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
                    });
            },
        });
        return editListDataStore;
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

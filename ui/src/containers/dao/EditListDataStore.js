import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";
import EditListUtils from "../../utils/EditListUtils";
//example
//api//View/{id}/Edit/{recordId}/list/{fieldId}/data?skip={skip}&take={take}&parentId={parentId}&sort={sort}&filter={filter}
export default class EditListDataStore extends BaseService {

    constructor() {
        super();
        this.path = 'View';
        this.response = {}
    }

    getEditListDataStore(viewIdArg, viewTypeArg, recordIdArg, fieldIdArg, parentIdArg, filterIdArg, elementArg, setFields, onError, onSuccess, onStart) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const _key = 'CALC_CRC';
        const editListDataStore = new CustomStore({
            key: _key,
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
                const url = `${this.domain}/${this.path}/${viewIdArg}/Edit/${recordIdArg}/list/${fieldIdArg}/data${params}${parentIdParam}${filterIdParam}${selectAllParam}${viewTypeParam}`;
                if (url.indexOf(_key) > 0) {
                    //myk blokujący nadmiarowo generowane requesty przez store odnośnie selection
                    return Promise.reject('')
                } else {
                    return this.fetch(url,
                        {
                            method: 'POST',
                            body: JSON.stringify(elementArg),
                        }
                    )
                        .then((response) => {
                            console.time('CALC_CRC');
                            let data = response.data;
                            data.forEach((rowData) => {
                                if (rowData.CALC_CRC === undefined || rowData.CALC_CRC === null) {
                                    const calculateCRC = EditListUtils.calculateCRCBySetFields(rowData, setFields);
                                    rowData.CALC_CRC = calculateCRC;
                                }
                            });
                            ConsoleHelper('EditListDataStore -> fetch data');
                            console.timeEnd('CALC_CRC');
                            if (onSuccess) {
                                onSuccess({totalSelectCount: response.totalCount});
                            }
                            this.response = {
                                data: data,
                                totalCount: response.totalCount,
                                summary: response.summary || [],
                                groupCount: response.groupCount || 0,
                            }
                            return this.response;
                        })
                        .catch((err) => {
                            ConsoleHelper('Error fetch data edit list data store for view id={%s}. Error = ', viewIdArg, err);
                            if (onError) {
                                onError(err);
                            }
                            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
                        });
                }
            }
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

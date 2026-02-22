import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import EditListUtils from '../../utils/EditListUtils';
import UrlUtils from '../../utils/UrlUtils';
import TansformFiltersUtil from '../dao/util/TransformFiltersUtil';
import useStore from '../../store';
//example
//api//View/{id}/Edit/{recordId}/list/{fieldId}/data?skip={skip}&take={take}&parentId={parentId}&sort={sort}&filter={filter}
export default class EditListDataStore extends BaseService {
    constructor() {
        super();
        this.path = 'View';
        this.response = {};
        // this.cachedLoadOptions = null;
        this.lastFetchedData = null;
        this.fetchData = useStore.getState().fetchData;
    }
    // https://rdprolab.inform-tech.pl:444/PPA/api/viewdata/18932?viewType=gridView&selection=true
    // https://rdprolab.inform-tech.pl:444/PPA/api/View/18932/edit/20/list/51232/data?&parentId=0&selection=true&viewType=gridView
    // https://rdprolab.inform-tech.pl:444/PPA/api/View/18932/edit/20/list/51232/data?requireTotalCount=true&skip=0&take=60&&parentId=0&viewType=gridView
    getAllEditListDataStore(
        viewIdArg,
        viewTypeArg,
        parentIdArg,
        filterIdArg,
        recordIdArg,
        kindViewArg,
        fieldIdArg,
        filters,
        onSuccessCallback,
        point = 'edit',
        selectedRowKeys = [],
        typeArg = 'PLUGIN'
    ) {
        let params = '?';
        let filter = undefined;
        let sort = undefined;
        let group = undefined;
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
            if (i in this.cachedLoadOptions && this.isNotEmpty(this.cachedLoadOptions[i])) {
                if (TansformFiltersUtil.notExcludedForFilter(i)) {
                    params += `${i}=${JSON.stringify(filters)}&`;
                }
                switch (i) {
                    case 'filter':
                        this.cachedLoadOptions[i] = filters;
                        filter = filters;
                        break;
                    case 'group':
                        group = this.cachedLoadOptions[i];
                        break;
                    case 'sort':
                        sort = this.cachedLoadOptions[i];
                        break;
                    default:
                    // nothing
                }
            }
        });
        recordIdArg = UrlUtils.batchIdParamExist() ? UrlUtils.getBatchIdParam() : recordIdArg;
        const viewTypeParam = this.createParam(viewTypeArg, 'viewType');
        const filterIdParam = this.createParam(filterIdArg, 'filter');
        const parentIdParam = this.createParam(parentIdArg, 'parentId');
        const typeParam = this.createParam(typeArg, 'type');
        const kindViewParam = !!kindViewArg && !!parentIdParam ? `&kindView=${kindViewArg}` : '';
        const selectAllParam = `&selection=true`;
        const requestBody = {
            filter: filter,
            sort: sort,
            group: group,
            listId: selectedRowKeys,
        };
        let url = `${this.domain}/${this.path}/${viewIdArg}/${point}/${recordIdArg}/list/${fieldIdArg}/data${params}${parentIdParam}${filterIdParam}${selectAllParam}${viewTypeParam}${kindViewParam}${typeParam}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).then((res) => {
            if (onSuccessCallback) {
                onSuccessCallback(res.totalCount);
            }
            this.cachedFromSelectAll = {
                selectAll: res.totalCount === res.data.length,
                data: res.data,
                skip: res.skip,
                take: res.take,
                totalCount: res.totalCount,
            };
            return Promise.resolve(res);
        });
    }

    getEditListDataStore(
        viewIdArg,
        viewTypeArg,
        recordIdArg,
        fieldIdArg,
        parentIdArg,
        filterIdArg,
        kindViewArg,
        elementArg,
        onError,
        onSuccess,
        onStart,
        point = 'edit',
        selectedRowKeys = [],
        typeArg = 'PLUGIN'
    ) {
        useStore.getState().setFetchData(true);
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const _key = 'CALC_CRC';
        return new CustomStore({
            key: _key,
            load: (loadOptions) => {
                let selectAll = false;
                if (onStart) {
                    let result = onStart();
                    selectAll = result?.selectAll;
                }
                // this.cachedLoadOptions = loadOptions;
                const filter = loadOptions?.filter;
                const sort = loadOptions?.sort;
                const group = loadOptions?.group;
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
                        TansformFiltersUtil.replaceNotValidDateFromLoadOptions(i, loadOptions);
                        if (TansformFiltersUtil.notExcludedForFilter(i)) {
                            params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                        }
                    }
                });
                const viewTypeParam = this.createParam(viewTypeArg, 'viewType');
                const filterIdParam = this.createParam(filterIdArg, 'filter');
                const parentIdParam = this.createParam(parentIdArg, 'parentId');
                const typeParam = this.createParam(typeArg, 'type');
                const kindViewParam = !!kindViewArg && !!parentIdParam ? `&kindView=${kindViewArg}` : '';
                const selectAllParam = !!selectAll ? `&selection=true` : '';
                // const point = UrlUtils.batchIdParamExist() ? 'batch' : 'edit';
                recordIdArg = UrlUtils.batchIdParamExist() ? UrlUtils.getBatchIdParam() : recordIdArg;
                const requestBody = {
                    filter: filter,
                    sort: sort,
                    group: group,
                    data: elementArg.data,
                    listId: selectedRowKeys,
                };
                const url = `${this.domain}/${this.path}/${viewIdArg}/${point}/${recordIdArg}/list/${fieldIdArg}/data${params}${parentIdParam}${filterIdParam}${selectAllParam}${viewTypeParam}${kindViewParam}${typeParam}`;
                const crcFilter = 'CRC' + (filter?.toString() === undefined ? '' : filter.toString());
                if (crcFilter.indexOf(_key) > 0) {
                    //myk blokujący nadmiarowo generowane requesty przez store odnośnie selection
                    return Promise.reject('');
                } else {
                    return this.fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(requestBody),
                    })
                        .then((response) => {
                            this.setKeys(response.data);
                            ConsoleHelper('EditListDataStore -> fetch data');
                            if (onSuccess) {
                                onSuccess(response.data);
                            }
                            this.response = {
                                data: response.data,
                                totalCount: response.totalCount,
                                summary: response.summary || [],
                                groupCount: response.groupCount || 0,
                            };
                            this.lastFetchedData = structuredClone(this.response);
                            this.lastFetchedData.data = response.data;
                            return this.response;
                        })
                        .catch((err) => {
                            ConsoleHelper(
                                'Error fetch data edit list data store for view id={%s}. Error = ',
                                viewIdArg,
                                err
                            );
                            if (onError) {
                                onError(err);
                            }
                            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
                        });
                }
            },
        });
    }
    setKeys = (data) => {
        EditListUtils.determineKey(data);

        data.forEach((rowData, index) => {
            if (rowData.CALC_CRC === undefined || rowData.CALC_CRC === null) {
                rowData.CALC_CRC = EditListUtils.calculateCrcById(rowData);
            }
        });
    };

    findDefaultSelectedRowKeys(data, selectedRows, setFields) {
        const alreadySelected = [];
        for (const key in selectedRows) {
            const sr = selectedRows[key];
            for (const key2 in data) {
                const rowData = data[key2];
                const objToHash = EditListUtils.transformBySetFields(sr[0], setFields);
                const idIndexFromSelectedRowData = EditListUtils.findIdIndexFromSelectedRowData(objToHash);
                const elementToCompare = objToHash[idIndexFromSelectedRowData];
                const isFound = this.checkValueExists(rowData, elementToCompare);
                if (isFound) {
                    alreadySelected.push(rowData.CALC_CRC);
                    break;
                }
            }
        }
        return alreadySelected;
    }
    checkValueExists(rowData, element) {
        if (!rowData || !element) return false;
        const key = Object.keys(rowData)[0];
        let value1 = rowData[key];
        let value2 = element[key];
        if (key === 'ID') {
            value1 = Number(value1);
            value2 = Number(value2);
        }
        return value1 === value2;
    }
    createParam(param, paramName) {
        return this.shouldBeParamEmpty(param) ? '' : `&${paramName}=${param}`;
    }

    shouldBeParamEmpty(param) {
        if (UrlUtils.batchIdParamExist()) {
            return true;
        }
        if (param === undefined || param == null) {
            return true;
        }
        return false;
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

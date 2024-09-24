import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import TansformFiltersUtil from '../dao/util/TransformFiltersUtil';
import { StringUtils } from '../../utils/StringUtils';

export default class DataGridStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        // chyba depraced
        this.cachedLoadOptions = null;
        this.lastCachedGrid = null;
        this.lastFetchedData = null;
        this.cachedFromSelectAll = {
            selectAll: false,
            data: [],
        };
    }

    clearCache() {
        this.cachedFromSelectAll = {
            selectAll: false,
            data: [],
        };
    }
    clearCacheIfPossible() {
        if (this.lastCachedGrid !== window.dataGrid) {
            this.clearCache();
            this.lastCachedGrid = window.dataGrid;
        }
    }
    getSelectAllDataGridStore(
        viewIdArg,
        viewTypeArg,
        recordParentIdArg,
        filterIdArg,
        kindViewArg,
        filters,
        recordParentViewIdArg,
        isAttachmentDialog,
        isKindViewSpec,
        onSuccessCallback,
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
        if (!!viewTypeArg) {
            params += 'viewType=' + viewTypeArg;
        }
        let eventSelectAll = true;
        const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
        const selectAllParam = !!eventSelectAll ? `&selection=true` : '';
        let recordParentViewIdParam = '';
        if (isAttachmentDialog) {
            recordParentViewIdParam = !!recordParentViewIdArg ? `&parentViewId=${recordParentViewIdArg}` : '';
        }
        const viewSpec = isKindViewSpec ? `&parentKindView=viewSpec` : '';

        const requestBody = {
            filter: filter,
            sort: sort,
            group: group,
        };
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${filterIdParam}${recordParentIdParam}${recordParentViewIdParam}${kindViewParam}${viewSpec}${selectAllParam}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).then((res) => {
            if(onSuccessCallback){
                onSuccessCallback(res.totalCount)
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

    getDataGridStore(
        viewIdArg,
        viewTypeArg,
        recordParentIdArg,
        filterIdArg,
        kindViewArg,
        onStartCallback,
        onSuccessCallback,
        onErrorCallback,
        recordParentViewIdArg,
        isAttachmentDialog,
        isKindViewSpec
    ) {
        if (!viewIdArg) {
            if (onSuccessCallback) {
                onSuccessCallback();
            }
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        return new CustomStore({
            key: 'ID',
            keyExpr: 'ID',
            load: (loadOptions) => {
                if (StringUtils.isBlank(loadOptions?.take)) {
                    // Tu wchodiz tylko dla opcji grupowania, initial value na 60 oraz selectiona
                    loadOptions.take = 60;
                }
                // else{
                //     if(!StringUtils.isBlank(loadOptions?.take) && !StringUtils.isBlank(this.lastFetchedData?.totalCount)){
                //         if(loadOptions.take >  this.lastFetchedData.totalCount){
                //             return Promise.resolve(this.lastFetchedData);
                //         }
                //     }
                // } 
                this.cachedLoadOptions = loadOptions;
                let params = '?';
                const filter = loadOptions?.filter;
                const sort = loadOptions?.sort;
                const group = loadOptions?.group;
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
                        if (
                            (i === 'requireGroupCount' || i === 'requireTotalCount') &&
                            TansformFiltersUtil.isNotValidRequiredParam(loadOptions[i])
                        ) {
                            loadOptions[i] = false;
                        }
                        if (TansformFiltersUtil.notExcludedForFilter(i)) {
                            params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                        }
                    }
                });
                if (!!viewTypeArg) {
                    params += 'viewType=' + viewTypeArg;
                }
                let addSelectAllParam = false;
                if (this.lastCachedGrid === null) {
                    this.lastCachedGrid = window.dataGrid;
                }
                if (!!onStartCallback) {
                    let result = onStartCallback();
                    if (result?.select || result?.selectAll) {
                        addSelectAllParam = true;
                        return this.modifiedRows(loadOptions);
                    } else {
                        this.clearCacheIfPossible();
                    }
                }
                const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
                let recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
                if (isAttachmentDialog) {
                    recordParentIdParam =
                        recordParentIdArg === undefined || recordParentIdArg === null
                            ? ''
                            : `&parentId=${recordParentIdArg}`;
                }
                const kindViewParam = !!kindViewArg && !!recordParentIdParam ? `&kindView=${kindViewArg}` : '';
                const selectAllParam = !!addSelectAllParam ? `&selection=true` : '';
                const recordParentViewIdParam = !!recordParentViewIdArg ? `&parentViewId=${recordParentViewIdArg}` : '';
                const viewSpec = isKindViewSpec ? `&parentKindView=viewSpec` : '';

                let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${recordParentViewIdParam}${kindViewParam}${viewSpec}${selectAllParam}`;
                url = this.commonCorrectUrl(url);
                const requestBody = {
                    filter: filter,
                    sort: sort,
                    group: group,
                };
                return this.fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                })
                .then((response) => {
                    ConsoleHelper('DataGridStore -> fetch ');
                    if (onSuccessCallback) {
                        onSuccessCallback(group, response.totalCount);
                    }
                    this.lastFetchedData = {
                        data: response.data,
                        totalCount: response.totalCount,
                        summary: response.summary || [],
                        groupCount: response.groupCount || 0,
                    };
                    return this.lastFetchedData;
                })
                .catch((err) => {
                    ConsoleHelper('Error fetch data grid store for view id={%s}. Error = ', viewIdArg, err);
                    if (onErrorCallback) {
                        onErrorCallback(err);
                    }
                    return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                });
            },
        });
    }
    modifiedRows(loadOptions) {
        if (this.cachedFromSelectAll.selectAll === true) {
            const filter = loadOptions['filter'];
            if (filter === null) {
                return this.chooseAll();
            }
            return this.selectWhenIsSelectAll(loadOptions);
        } else {
            return this.selectWhenIsNotSelectAll(loadOptions);
        }
    }

    selectWhenIsNotSelectAll(loadOptions) {
        const filterIds = JSON.stringify(loadOptions['filter']);
        const selectionIds = filterIds.match(/-?\d+/g).map((id) => ({ID: id}));
        if (selectionIds instanceof Array && selectionIds.length > 0) {
            let selectionIdsResponse = {
                data: selectionIds,
                totalCount: selectionIds.length,
            };
            return Promise.resolve(selectionIdsResponse);
        }
    }

    selectWhenIsSelectAll(loadOptions) {
        const filterIds = JSON.stringify(loadOptions['filter']);
        const selectionIds = filterIds.match(/-?\d+/g).map((id) => ({ID: id}));
        let data = this.cachedFromSelectAll.data;
        selectionIds.forEach((selectionId) => {
            data = data.filter((el) => {
                return el.ID !== Number(selectionId.ID);
            });
        });
        if (selectionIds instanceof Array && selectionIds.length > 0) {
            let selectionIdsResponse = {
                data: data,
                totalCount: this.cachedFromSelectAll.totalCount,
            };
            return Promise.resolve(selectionIdsResponse);
        }
        return data;
    }

    chooseAll() {
        const selectionIdsResponse = {
            data: this.cachedFromSelectAll.data,
            totalCount: this.cachedFromSelectAll.totalCount,
        };
        return Promise.resolve(selectionIdsResponse);
    }
}

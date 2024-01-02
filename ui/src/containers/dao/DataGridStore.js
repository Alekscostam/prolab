import CustomStore from 'devextreme/data/custom_store';
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import TansformFiltersUtil from '../dao/util/TransformFiltersUtil';

export default class DataGridStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        // chyba depraced
        this.cachedLoadOptions = null;
        this.cachedFromSelectAll = {
            selectAll: false,
            data: [],
        };
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
        isKindViewSpec
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
                if (loadOptions?.take === undefined || loadOptions?.take === null) {
                    // Tu wchodiz tylko dla opcji grupowania, initial value na 60 oraz selectiona
                    loadOptions.take = 60;
                }
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
                            // TODO: fix - czasami zdazało sie ze ten komponent zwracl; nierpawidlowe warotsic w requiredGroupCount i w requiredTotalCount
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
                if (!!onStartCallback) {
                    let result = onStartCallback();

                    // console.log(loadOptions['skip']);
                    // console.log(loadOptions['take']);
                    if (result?.select || result?.selectAll) {
                        addSelectAllParam = true;
                        // TODO: zatrzymac przeiwjanie w góre. ODP to naprawi nowa wersja komponentu devextereme
                        // return;
                        return this.modifiedRows(loadOptions);
                    } else {
                        this.cachedFromSelectAll = {
                            selectAll: false,
                            data: [],
                        };
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
                //blokuje niepotrzebne requesty do backendu o ID rekordów
                return this.fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                })
                    .then((response) => {
                        ConsoleHelper('DataGridStore -> fetch ');
                        if (onSuccessCallback) {
                            onSuccessCallback();
                        }
                        return {
                            data: response.data,
                            totalCount: response.totalCount,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
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
            return this.modifiedIfIsSelectAll(loadOptions);
        } else {
            return this.modifiedIfIsNoSelectAll(loadOptions);
        }
    }

    modifiedIfIsNoSelectAll(loadOptions) {
        const filterIds = JSON.stringify(loadOptions['filter']);
        const selectionIds = filterIds.match(/-?\d+/g).map((id) => ({ID: id}));
        if (selectionIds instanceof Array && selectionIds.length > 0) {
            let selectionIdsResponse = {
                data: selectionIds,
                // skip: loadOptions['skip'],
                // take: loadOptions['take'],
                totalCount: selectionIds.length,
            };
            return Promise.resolve(selectionIdsResponse);
        }
    }

    modifiedIfIsSelectAll(loadOptions) {
        const filterIds = JSON.stringify(loadOptions['filter']);
        const selectionIds = filterIds.match(/-?\d+/g).map((id) => ({ID: id}));
        debugger;
        let data = this.cachedFromSelectAll.data;
        selectionIds.forEach((selectionId) => {
            data = data.filter((el) => {
                return el.ID !== Number(selectionId.ID);
            });
        });
        if (selectionIds instanceof Array && selectionIds.length > 0) {
            let selectionIdsResponse = {
                data: data,
                // skip: 0,
                // take: 20,
                totalCount: this.cachedFromSelectAll.totalCount,
            };
            return Promise.resolve(selectionIdsResponse);
        }
        return data;
    }

    chooseAll() {
        let selectionIdsResponse = {
            data: this.cachedFromSelectAll.data,
            // skip: this.cachedFromSelectAll.skip,
            // take: 20,
            totalCount: this.cachedFromSelectAll.totalCount,
        };
        debugger;
        // console.log(selectionIdsResponse);
        return Promise.resolve(selectionIdsResponse);
    }
}

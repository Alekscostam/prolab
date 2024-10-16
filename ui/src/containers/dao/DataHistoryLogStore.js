import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import TransformFiltersUtil from './util/TransformFiltersUtil';
import CustomStore from 'devextreme/data/custom_store';
import TansformFiltersUtil from '../dao/util/TransformFiltersUtil';

export default class DataHistoryLogStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getHistoryLogDataStore(viewIdArg, recordId, parentIdArg, kindViewArg, onError, onSuccess) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const _key = 'ID';
        return new CustomStore({
            key: _key,
            keyExpr: 'ID',
            load: (loadOptions) => {
                TransformFiltersUtil.filterValidTransform(loadOptions);
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
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        TansformFiltersUtil.replaceNotValidDateFromLoadOptions(i, loadOptions);
                        if (TansformFiltersUtil.notExcludedForFilter(i)) {
                            params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                        }
                    }
                });

                const parentIdParam =
                    parentIdArg !== undefined && parentIdArg != null ? `&parentId=${parentIdArg}` : '';

                const kindViewParam =
                    kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';

                const requestBody = {
                    filter: filter,
                    sort: sort,
                    group: group,
                };
                let url = `${this.domain}/${this.path}/${viewIdArg}/historyLog/${recordId}/data${params}${parentIdParam}${kindViewParam}`;
                url = this.commonCorrectUrl(url);
                return this.fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                })
                    .then((response) => {
                        ConsoleHelper('HistoryLogDataStore -> fetch ');
                        if (onSuccess) {
                            onSuccess();
                        }
                        return {
                            data: response.data,
                            totalCount: response.totalCount,
                            summary: response.summary || [],
                            groupCount: response.groupCount || 0,
                        };
                    })
                    .catch((err) => {
                        ConsoleHelper(
                            'Error fetch data history log list data store for view id={%s}. Error = ',
                            viewIdArg,
                            err
                        );
                        if (onError) {
                            onError(err);
                        }
                        return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0, selectAll: false});
                    });
            },
        });
    }
}

import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';

export default class DataGanttStore extends BaseService {
    constructor() {
        super();
        this.path = 'viewdata';
        this.cachedLastResponse = null;
        this.cachedLoadOptions = null;
    }

    getDataForGantt(viewIdArg, loadOptions, recordParentIdArg, filterIdArg, kindViewArg) {
        const filter = loadOptions?.filter;
        const sort = loadOptions?.sort;
        const group = loadOptions?.group;
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
            }
        });
        params += 'viewType=gantt';
        const filterIdParam = filterIdArg !== undefined && filterIdArg != null ? `&filterId=${filterIdArg}` : '';
        const recordParentIdParam = !!recordParentIdArg ? `&parentId=${recordParentIdArg}` : '';
        const kindViewParam = kindViewArg !== undefined && kindViewArg != null ? `&kindView=${kindViewArg}` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}${params}${filterIdParam}${recordParentIdParam}${kindViewParam}`;

        const requestBody = {
            filter: filter,
            sort: sort,
            group: group,
        };

        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).then((res) => {
            ConsoleHelper('DataGanttStore -> fetch');
            this.cachedLastResponse = {
                data: res.data,
                totalCount: res.totalCount,
                dependenciesData: res.dependenciesData,
                resourcesData: res.resourcesData,
                resourcesAssigmentData: res.resourcesAssigmentData,
            };
            return this.cachedLastResponse;
        });
    }
}

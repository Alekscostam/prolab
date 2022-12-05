import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import CustomStore from 'devextreme/data/custom_store';

export default class DataPluginStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getPluginExecuteDataStore(viewIdArg, pluginId, elementArg, parentIdArg, onError, onSuccess) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }

        const _key = 'ID';
        return new CustomStore({
            key: _key,
            keyExpr: 'ID',
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
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });

                const parentIdParam =
                    parentIdArg !== undefined && parentIdArg != null ? `&parentId=${parentIdArg}` : '';

                const url = `${this.domain}/${this.path}/${viewIdArg}/plugin/${pluginId}/execute/data/${params}${parentIdParam}`;

                if (url.indexOf(_key) > 0) {
                    //myk blokujący nadmiarowo generowane requesty przez store odnośnie selection
                    return Promise.reject('');
                } else {
                    return this.fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(elementArg),
                    })
                        .then((response) => {
                            this.cachedLastResponse = {
                                data: response.data,
                                totalCount: response.totalCount,
                                summary: response.summary || [],
                                groupCount: response.groupCount || 0,
                            };
                            ConsoleHelper('PluginListDataStore -> fetch data');
                            if (onSuccess) {
                                onSuccess();
                            }
                            return this.cachedLastResponse;
                        })
                        .catch((err) => {
                            ConsoleHelper(
                                'Error fetch data plugin list data store for view id={%s}. Error = ',
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

    getPluginDataStore(viewIdArg, pluginId, elementArg, parentIdArg, onError, onSuccess) {
        if (!viewIdArg) {
            return Promise.resolve({totalCount: 0, data: [], skip: 0, take: 0});
        }
        const _key = 'ID';
        return new CustomStore({
            key: _key,
            keyExpr: 'ID',
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
                ].forEach((i) => {
                    if (i in loadOptions && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });

                const parentIdParam =
                    parentIdArg !== undefined && parentIdArg != null ? `&parentId=${parentIdArg}` : '';

                const url = `${this.domain}/${this.path}/${viewIdArg}/plugin/${pluginId}/data/${params}${parentIdParam}`;
                if (url.indexOf(_key) > 0) {
                    //myk blokujący nadmiarowo generowane requesty przez store odnośnie selection
                    return Promise.reject('');
                } else {
                    return this.fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(elementArg),
                    })
                        .then((response) => {
                            this.cachedLastResponse = {
                                data: response.data,
                                totalCount: response.totalCount,
                            };

                            ConsoleHelper('PluginListDataStore -> fetch data');
                            if (onSuccess) {
                                onSuccess();
                            }
                            return this.cachedLastResponse;
                        })
                        .catch((err) => {
                            ConsoleHelper(
                                'Error fetch data plugin list data store for view id={%s}. Error = ',
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
}

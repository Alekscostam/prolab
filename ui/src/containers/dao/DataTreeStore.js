
import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import ConsoleHelper from "../../utils/ConsoleHelper";
import CustomStore from "devextreme/data/custom_store";

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    //deprecated
    getDataTreeStore(viewIdArg, parentIdArg, recordIdArg, onStart, onSuccess, onError) {
        return new CustomStore({
            key: 'ID',
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
                    // 'userData',
                ].forEach((i) => {
                    if (i in loadOptions
                        && this.isNotEmpty(loadOptions[i])) {
                        params += `${i}=${JSON.stringify(loadOptions[i])}&`;
                    }
                });
                const recordIdParam = !!recordIdArg ? `?recordId=${recordIdArg}` : '';
                // const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
                let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data${recordIdParam}${params}`;
                url = this.commonCorrectUrl(url);
                return this.fetch(
                    url,
                    {
                        method: 'GET',
                    }
                ).then((response) => {
                    ConsoleHelper('DataTreeStore -> fetch ');
                    if (onSuccess) {
                        onSuccess();
                    }
                    return {
                        data: response.data,
                        totalCount: response.totalCount,
                    };
                }).catch((err) => {
                    ConsoleHelper('Error fetch data tree store for view id={%s}. Error = ', viewIdArg, err);
                    if (onError) {
                        onError(err);
                    }
                    return Promise.resolve({totalCount: 0, data: []});
                });
            },
        });
    }

    getDataTreeStoreDirect(viewIdArg, parentIdArg, recordIdArg) {
        const recordIdParam = !!recordIdArg ? `?recordId=${recordIdArg}` : '';
        // const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data${recordIdParam}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(
            url,
            {
                method: 'GET',
            }
        ).catch((err) => {
            throw err;
        });
    }

    //override
    commonCorrectUrl(correctUrl) {
        correctUrl = correctUrl.replace(/[?&]searchOperation=["]contains["][&]?[ ]?/g, '');
        if (correctUrl.substring(correctUrl.length - 1, correctUrl.length)==='?') {
            correctUrl = correctUrl.substring(0, correctUrl.length - 1);
        }
        return correctUrl;
    }

}

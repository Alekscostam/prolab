import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import UrlUtils from "../../utils/UrlUtils";

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getDataTreeStoreDirect(viewIdArg, parentIdArg, recordIdArg) {
        const recordArray = recordIdArg.split(',');
        const recordIdParam = UrlUtils.getUrlParams('recordId', recordArray)
        // const filterIdParam = !!filterIdArg ? `&filterId=${filterIdArg}` : '';
        let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data?${recordIdParam}`;
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
        if (correctUrl.substring(correctUrl.length - 1, correctUrl.length) === '?') {
            correctUrl = correctUrl.substring(0, correctUrl.length - 1);
        }
        return correctUrl;
    }

}

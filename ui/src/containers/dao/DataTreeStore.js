import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import {decompress} from 'int-compress-string/src';
import {StringUtils} from '../../utils/StringUtils';
import Constants from '../../utils/Constants';

const pramas = `skip=0&take=${Constants.INTEGER_MAX_VALUE}`;

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getDataTreeStoreDirect(viewIdArg, parentIdArg, listIdArray) {
        const url = this.commonCorrectUrl(
            `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data?${pramas}`
        );
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({listId: decompress(listIdArray)}),
        }).catch((err) => {
            throw err;
        });
    }

    getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg, type, headerId, header) {
        let url = `${this.domain}/${this.path}/${viewIdArg}/addspec/${parentIdArg}/data?${pramas}`;
        if (!StringUtils.isBlank(type) || type !== 'DEF') {
            url += `&type=${type}&header=${header}&headerId=${headerId}`;
        }
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({}),
        }).catch((err) => {
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

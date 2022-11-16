import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import {decompress} from 'int-compress-string/src';

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getDataTreeStoreDirect(viewIdArg, parentIdArg, listIdArray) {
        let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({listId: decompress(listIdArray)}),
        }).catch((err) => {
            throw err;
        });
    }

    getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg) {
        let url = `${this.domain}/${this.path}/${viewIdArg}/addspec/${parentIdArg}/data`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'GET',
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

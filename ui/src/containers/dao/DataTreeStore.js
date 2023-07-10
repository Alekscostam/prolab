import 'devextreme/dist/css/dx.light.css';
import 'whatwg-fetch';
import BaseService from '../../services/BaseService';
import {decompress} from 'int-compress-string/src';
import {StringUtils} from '../../utils/StringUtils';
import Constants from '../../utils/Constants';
import {readObjFromCookieGlobal} from '../../utils/Cookie';
import UrlUtils from '../../utils/UrlUtils';

const pramas = `skip=0&take=${Constants.INTEGER_MAX_VALUE}`;

export default class DataTreeStore extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    getDataTreeStoreDirect(viewIdArg, parentIdArg, listIdArray) {
        if (UrlUtils.batchIdParamExist()) {
            const batchId = UrlUtils.getBatchIdParam();
            const selectedRowKeys = readObjFromCookieGlobal('selectedRowKeys');
            const idRowKeys = selectedRowKeys.map((el) => el.ID);
            const requestBody = {
                listId: idRowKeys,
            };
            let url = `${this.domain}/${this.path}/${viewIdArg}/batch/${batchId}/data?parentId=${parentIdArg}`;
            url = this.commonCorrectUrl(url);
            return this.fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
            }).catch((err) => {
                throw err;
            });
        } else {
            let url = `${this.domain}/${this.path}/${viewIdArg}/editspec/${parentIdArg}/data?${pramas}`;
            url = this.commonCorrectUrl(url);
            return this.fetch(url, {
                method: 'POST',
                body: JSON.stringify({listId: decompress(listIdArray)}),
            }).catch((err) => {
                throw err;
            });
        }
    }

    getAddSpecDataTreeStoreDirect(viewIdArg, parentIdArg, type, headerId, header) {
        let url = `${this.domain}/${this.path}/${viewIdArg}/addspec/${parentIdArg}/data?${pramas}`;

        if (!StringUtils.isBlank(type) || type !== 'DEF') {
            url += `&type=${type}&header=${header}&headerId=${headerId}`;
        }

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

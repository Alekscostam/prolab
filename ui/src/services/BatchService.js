import BaseService from './BaseService';
import UrlUtils from '../utils/UrlUtils';
import {readObjFromCookieGlobal} from '../utils/Cookie';

/*
GET zwracający dane potrzebne do wyrenderowania widoku: informacje ogólne o widoku, opcje
widoku, kolumny, przyciski, lista dokumentów oraz lista wtyczek.
 */
export default class BatchService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'view';
        this.getView = this.getView.bind(this);
        this.getViewEntry = this.getViewEntry.bind(this);
        this.getData = this.getData.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    getView(viewId, parentId) {
        const batchId = UrlUtils.getBatchIdParam();
        const selectedRowKeys = readObjFromCookieGlobal('selectedRowKeys');
        const idRowKeys = selectedRowKeys.map((el) => el.ID);
        const requestBody = {
            listId: idRowKeys,
        };
        let url = `${this.domain}/${this.path}/${viewId}/batch/${batchId}`;
        if (parentId) {
            url = url + `?parentId=${parentId}`;
        }
        return this.fetch(`${url}`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).catch((err) => {
            throw err;
        });
    }

    getViewEntry(viewId, parentId) {
        const batchId = UrlUtils.getBatchIdParam();
        const selectedRowKeys = readObjFromCookieGlobal('selectedRowKeys');
        const idRowKeys = selectedRowKeys.map((el) => el.ID);
        const requestBody = {
            listId: idRowKeys,
        };

        let paramArrays = [];
        if (!!parentId) {
            paramArrays.push(`parentId=${parentId}`);
        }

        const parameters = paramArrays.length > 0 ? '?' + paramArrays.join('&') : '';
        let url = `${this.domain}/${this.path}/${viewId}/batch/${batchId}/entry${parameters}`;
        return this.fetch(`${url}`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).catch((err) => {
            throw err;
        });
    }
    getData(viewId, parentId) {
        const batchId = UrlUtils.getBatchIdParam();
        const selectedRowKeys = readObjFromCookieGlobal('selectedRowKeys');
        const idRowKeys = selectedRowKeys.map((el) => el.ID);
        const requestBody = {
            listId: idRowKeys,
        };
        let paramArrays = [];
        if (!!parentId) {
            paramArrays.push(`parentId=${parentId}`);
        }

        const parameters = paramArrays.length > 0 ? '?' + paramArrays.join('&') : '';
        let url = `${this.domain}/${this.path}/${viewId}/batch/${batchId}/data${parameters}`;
        url = this.commonCorrectUrl(url);
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }).catch((err) => {
            throw err;
        });
    }

    save(viewId, parentId, elementToSave, confirmSave) {
        const batchId = UrlUtils.getBatchIdParam();
        let paramArrays = [];
        if (!!parentId) {
            paramArrays.push(`parentId=${parentId}`);
        }
        const parameters = paramArrays.length > 0 ? '?' + paramArrays.join('&') : '';
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/batch/${batchId}/Save${parameters}&confirmSave=${confirmSave}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    data: elementToSave,
                }),
            }
        ).catch((err) => {
            throw err;
        });
    }

    cancel(viewId, parentId, ids) {
        const batchId = UrlUtils.getBatchIdParam('batchId');
        let paramArrays = [];
        if (!!parentId) {
            paramArrays.push(`parentId=${parentId}`);
        }
        const listId = {listId: ids};
        const parameters = paramArrays.length > 0 ? '?' + paramArrays.join('&') : '';
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/batch/${batchId}/Cancel${parameters}`, {
            method: 'POST',
            body: JSON.stringify(listId),
        }).catch((err) => {
            throw err;
        });
    }
}

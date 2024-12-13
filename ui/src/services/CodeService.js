import BaseService from './BaseService';

export default class CodeService extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }
    find(viewId, parentId, kindView, body) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/find?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify(body),
        }).catch((err) => {
            throw err;
        });
    }
}

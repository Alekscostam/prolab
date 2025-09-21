import BaseService from './BaseService';

export default class AddSpecService extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }
    getView(viewId, parentId, type, header, headerId) {
        let url = `${this.domain}/${this.path}/${viewId}/addspec/${parentId}`;
        if (type !== 'DEF') {
            url += `?type=${type}&header=${header}&headerId=${headerId}`;
        }
        return this.fetch(url, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
    execute(viewId, parentId, type, headerId, header, listId, data, count) {
        let url = `${this.getDomain()}/${this.path}/${viewId}/addspec/${parentId}/execute?count=${count}`;
        if (type !== 'DEF') {
            url += `&type=${type}&header=${header}&headerId=${headerId}`;
        }
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                listId: listId,
                data: data,
            }),
        }).catch((err) => {
            throw err;
        });
    }
}

import BaseService from './BaseService';

export default class EditSpecService extends BaseService {
    constructor() {
        super();
        this.path = 'view';
        this.getViewEntry = this.getViewEntry.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }
    getView(viewId, parentId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/editspec/${parentId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
    getViewEntry(viewId, parentId, listId) {
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/editspec/${parentId}/Entry`, {
            method: 'POST',
            body: JSON.stringify({
                listId: listId,
            }),
        }).catch((err) => {
            throw err;
        });
    }
    save(viewId, parentId, elementToSave, confirmSave) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/editspec/${parentId}/Save?confirmSave=${confirmSave}`,
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
        const listId = {listId: ids};
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/editspec/${parentId}/Cancel`, {
            method: 'POST',
            body: JSON.stringify(listId),
        }).catch((err) => {
            throw err;
        });
    }
    calculate(viewId, parentId, recordId, fieldsToCalculate) {
        let url = `${this.getDomain()}/${this.path}/${viewId}/editspec/${parentId}/calculate`;
        if (recordId) {
            url = `${url}?recordId=${recordId}`;
        }
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(fieldsToCalculate),
        }).catch((err) => {
            throw err;
        });
    }
}

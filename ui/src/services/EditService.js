import BaseService from "./BaseService";

/*
Kontroler do edycji danych.
 */
export default class EditService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'view';
        this.getEdit = this.getEdit.bind(this);
    }

    getEdit(viewId, recordId, parentId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

import BaseService from "./BaseService";

/*
Kontroler do edycji danych.
 */
export default class EditService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'View';
        this.getEdit = this.getEdit.bind(this);
        this.getEditAutoFill = this.getEditAutoFill.bind(this);
    }

    getEdit(viewId, recordId, parentId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getEditAutoFill(viewId, recordId, parentId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/AutoFill${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    refreshFieldVisibility(viewId, recordId, parentId, refreshElement) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/RefreshFieldVisibility${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'POST',
            body: JSON.stringify(refreshElement),
        }).catch((err) => {
            throw err;
        });
    }

    save(viewId, recordId, parentId, elementToSave) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/Save${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'POST',
            body: JSON.stringify(elementToSave),
        }).catch((err) => {
            throw err;
        });
    }

    createObjectToSave(state) {
        let editData = state.editData;
        let arrayTmp = [];
        editData.editFields?.forEach(groupFields => {
            groupFields?.fields.forEach(field => {
                const elementTmp = {
                    fieldName: field.fieldName,
                    value: field.value
                }
                arrayTmp.push(elementTmp);
            })
        })
        return {data: arrayTmp};
    }
}

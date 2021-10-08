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

    getEditAutoFill(viewId, recordId, parentId, element) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/AutoFill${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'POST',
            body: JSON.stringify(element),
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

    save(viewId, recordId, parentId, elementToSave, confirmSave) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave
        });
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/Save${queryString}`, {
            method: 'POST',
            body: JSON.stringify(elementToSave),
        }).catch((err) => {
            throw err;
        });
    }

    delete(viewId, selectedIds) {
        let queryString = []
        for (const id in selectedIds) {
            queryString.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Delete/?${queryString.join('&')}`, {
            method: 'DELETE',
        }).catch((err) => {
            throw err;
        });
    }

    archive(viewId, recordId, parentId, elementToSave, confirmSave) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave
        });
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Archive/${queryString}`, {
            method: 'POST',
            body: JSON.stringify(elementToSave),
        }).catch((err) => {
            throw err;
        });
    }

    copy(viewId, recordId, parentId, elementToSave, confirmSave) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave
        });
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Archive/${queryString}`, {
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
                if (field.hidden != true) {
                    const elementTmp = {
                        fieldName: field.fieldName,
                        value: field.value
                    }
                    arrayTmp.push(elementTmp);
                }
            })
        })
        return {data: arrayTmp};
    }

    createObjectToAutoFill(state) {
        let editData = state.editData;
        let arrayTmp = [];
        editData.editFields?.forEach(groupFields => {
            groupFields?.fields.forEach(field => {
                if (field.autoFill == true) {
                    const elementTmp = {
                        fieldName: field.fieldName,
                        value: field.value
                    }
                    arrayTmp.push(elementTmp);
                }
            })
        })
        return {data: arrayTmp};
    }
}

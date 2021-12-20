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
        this.getEditList = this.getEditList.bind(this);
        this.refreshFieldVisibility = this.refreshFieldVisibility.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
        this.archive = this.archive.bind(this);
        this.copy = this.copy.bind(this);
        this.restore = this.restore.bind(this);
        this.createObjectToSave = this.createObjectToSave.bind(this);
        this.createObjectToAutoFill = this.createObjectToAutoFill.bind(this);
        this.createObjectToRefresh = this.createObjectToRefresh.bind(this);
        this.createObjectToEditList = this.createObjectToEditList.bind(this);
    }

    getEdit(viewId, recordId, parentId, kindView) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}${parentId ? `?parentId=${parentId}` : ''}${parentId && kindView ? `&kindView=${kindView}` : ''}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getEditAutoFill(viewId, recordId, parentId, kindView, element) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/AutoFill${parentId ? `?parentId=${parentId}` : ''}${parentId && kindView ? `&kindView=${kindView}` : ''}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }

    getEditList(viewId, recordId, parentId, fieldId, kindView, element) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/list/${fieldId}${parentId ? `?parentId=${parentId}` : ''}${parentId && kindView ? `&kindView=${kindView}` : ''}`, {
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

    archive(viewId, parentId, selectedIds) {
        let queryString = []
        if (parentId !== undefined && parentId !== null && parentId !== "") {
            queryString.push(`parentId=${parentId}`);
        }
        for (const id in selectedIds) {
            queryString.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Archive/?${queryString.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    copy(viewId, parentId, selectedIds, numberOfCopies, headerCopy, specCopy, specWithValuesCopy) {
        let queryStringTmp = []
        if (parentId !== undefined && parentId !== null && parentId !== "") {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        let queryStringParams = this.objToQueryString({
            numberOfCopies: numberOfCopies,
            headerCopy: headerCopy,
            specCopy: specCopy,
            specWithValuesCopy: specWithValuesCopy
        }) || [];
        queryStringTmp = queryStringTmp.concat(queryStringParams);
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Copy/?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    restore(viewId, selectedIds) {
        let queryString = []
        for (const id in selectedIds) {
            queryString.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Restore/${queryString}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    createObjectToSave(state) {
        let editData = state.editData;
        let arrayTmp = [];
        editData.editFields?.forEach(groupFields => {
            groupFields?.fields.forEach(field => {
                // if (field.hidden != true) {
                const elementTmp = {
                    fieldName: field.fieldName,
                    value: field.value
                }
                arrayTmp.push(elementTmp);
                // }
            })
        })
        return {data: arrayTmp};
    }

    createObjectToAutoFill(state) {
        let editData = state.editData;
        let arrayTmp = [];
        editData.editFields?.forEach(groupFields => {
            groupFields?.fields.forEach(field => {
                // if (field.autoFill == true) {
                const elementTmp = {
                    fieldName: field.fieldName,
                    value: field.value
                }
                arrayTmp.push(elementTmp);
                // }
            })
        })
        return {data: arrayTmp};
    }

    createObjectToRefresh(state) {
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

    createObjectToEditList(editData) {
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

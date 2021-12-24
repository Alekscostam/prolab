import BaseService from "./BaseService";
import MockService from "./MockService";
import moment from "moment";

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
        }).then(editDataResponse => {
            for (let editField of editDataResponse?.editFields) {
                for (let field of editField.fields) {
                    if (field?.type) {
                        field.value = MockService.getFieldValueOrMock(field.value, 'value');
                        switch (field.type) {
                            case 'D':
                                field.value = new Date(moment(field.value, 'YYYY-MM-DD'));
                                break;
                            case 'E':
                                field.value = new Date(moment(field.value, 'YYYY-MM-DD HH:mm'));
                                break;
                            case 'T':
                                field.value = new Date(moment(field.value, 'HH:mm'));
                                break;
                        }
                    }
                }
            }
            return Promise.resolve(editDataResponse);
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

    refreshFieldVisibility(viewId, recordId, parentId, kindView, element) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/RefreshFieldVisibility${parentId ? `?parentId=${parentId}` : ''}${parentId && kindView ? `&kindView=${kindView}` : ''}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }

    save(viewId, recordId, parentId, kindView, elementToSave, confirmSave) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave,
            kindView: parentId && kindView ? kindView : undefined
        });
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Edit/${recordId}/Save${queryString}`, {
            method: 'POST',
            body: JSON.stringify(elementToSave),
        }).catch((err) => {
            throw err;
        });
    }

    delete(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = []
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Delete?${queryStringTmp.join('&')}`, {
            method: 'DELETE',
        }).catch((err) => {
            throw err;
        });
    }

    archive(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = []
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Archive?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    copy(viewId, parentId, kindView, selectedIds, numberOfCopies, headerCopy, specCopy, specWithValuesCopy) {
        let queryStringTmp = []
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
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
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Copy?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    restore(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = []
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/Restore?${queryStringTmp.join('&')}`, {
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
                field = this.convertFieldsPerType(field);
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
                field = this.convertFieldsPerType(field);
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
                field = this.convertFieldsPerType(field);
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
                field = this.convertFieldsPerType(field);
                const elementTmp = {
                    fieldName: field.fieldName,
                    value: field.value
                }
                arrayTmp.push(elementTmp);
            })
        })
        return {data: arrayTmp};
    }

    convertFieldsPerType(field) {
        if (field?.type) {
            switch (field.type) {
                case 'D':
                    field.value = moment(new Date(field.value)).format('YYYY-MM-DD');
                    break;
                case 'E':
                    field.value = moment(new Date(field.value)).format('YYYY-MM-DD HH:mm');
                    break;
                case 'T':
                    field.value = moment(new Date(field.value)).format('HH:mm');
                    break;
            }
        }
        return field;
    }
}

import BaseService from './BaseService';
import moment from 'moment';
import EditRowUtils from '../utils/EditRowUtils';
import {saveAs} from 'file-saver';
import UrlUtils from '../utils/UrlUtils';
import {renderNoRefreshContentFnc} from '../App';
import {ColumnType} from '../model/ColumnType';
/*
Kontroler do edycji danych.
 */
export default class CrudService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'View';
        this.addEntry = this.addEntry.bind(this);
        this.add = this.add.bind(this);
        this.editEntry = this.editEntry.bind(this);
        this.edit = this.edit.bind(this);
        this.editAutoFill = this.editAutoFill.bind(this);
        this.editList = this.editList.bind(this);
        this.refreshFieldVisibility = this.refreshFieldVisibility.bind(this);
        this.save = this.save.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        this.delete = this.delete.bind(this);
        this.archiveEntry = this.archiveEntry.bind(this);
        this.archive = this.archive.bind(this);
        this.copyEntry = this.copyEntry.bind(this);
        this.copy = this.copy.bind(this);
        this.restoreEntry = this.restoreEntry.bind(this);
        this.attachmentEntry = this.attachmentEntry.bind(this);
        this.restore = this.restore.bind(this);
        this.createObjectDataToRequest = this.createObjectDataToRequest.bind(this);
    }

    addEntry(viewId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Add/Entry${parentId ? `?parentId=${parentId}` : ''}`,
            {
                method: 'POST',
            }
        )
            .then((addDataEntryResponse) => {
                return Promise.resolve(addDataEntryResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    add(viewId, parentId) {
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Add${parentId ? `?parentId=${parentId}` : ''}`, {
            method: 'POST',
        })
            .then((addDataResponse) => {
                return Promise.resolve(EditRowUtils.convertEditResponse(addDataResponse));
            })
            .catch((err) => {
                throw err;
            });
    }
    editEntry(viewId, recordId, parentId, kindView) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/Entry${
                parentId ? `?parentId=${parentId}` : ''
            }`,
            {
                method: 'POST',
            }
        )
            .then((editDataEntryResponse) => {
                window.location.href = UrlUtils.getUrlWithEditRowParams(recordId, parentId, viewId, kindView);
                return Promise.resolve(editDataEntryResponse);
            })
            .catch((err) => {
                throw err;
            });
    }
    // https://rdprolab.inform-tech.pl:444/Api/api/View/95/Edit/11
    edit(viewId, recordId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}${parentId ? `?parentId=${parentId}` : ''}`,
            {
                method: 'GET',
            }
        )
            .then((editDataResponse) => {
                // if (editDataResponse.editInfo.editFormType.toUpperCase() === 'SIDEPANEL') {
                if (editDataResponse.editInfo.editFormType.toUpperCase() === 'FULLSCREEN') {
                    window.location.href = window.location.href.replace('grid-view', 'edit-row-view');
                    if (renderNoRefreshContentFnc) {
                        renderNoRefreshContentFnc();
                    }
                }
                return Promise.resolve(EditRowUtils.convertEditResponse(editDataResponse));
            })
            .catch((err) => {
                throw err;
            });
    }

    editAutoFill(viewId, recordId, parentId, kindView, element) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/AutoFill${
                parentId ? `?parentId=${parentId}` : ''
            }${parentId && kindView ? `&kindView=${kindView}` : ''}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            }
        ).catch((err) => {
            throw err;
        });
    }

    editList(viewId, recordId, parentId, fieldId, kindView, element) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/list/${fieldId}${
                parentId ? `?parentId=${parentId}` : ''
            }${parentId && kindView ? `&kindView=${kindView}` : ''}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            }
        ).catch((err) => {
            throw err;
        });
    }

    getListOfHints(viewId, paramId, fieldId, element) {
        const partOfUrl = UrlUtils.batchIdParamExist() ? 'batch' : 'editspec';
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/${partOfUrl}/${paramId}/list/${fieldId}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }

    executeSpec(viewId, parentId, type, headerId, header, listId, data, count) {
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

    getPluginColumnsDefnitions(viewId, pluginId, listId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/plugin/${pluginId}${parentId ? `?parentId=${parentId}` : ''}`,
            {
                method: 'POST',
                body: JSON.stringify(listId),
            }
        )
            .then((pluginResponse) => {
                return Promise.resolve(pluginResponse);
            })
            .catch((err) => {
                throw err;
            });
    }
    getHistoryLogColumnsDefnitions(viewId, recordId, parentId, kindView) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/historyLog/${recordId}?${queryStringTmp.join('&')}`,
            {
                method: 'GET',
            }
        )
            .then((historyLogResponse) => {
                return Promise.resolve(historyLogResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    getPluginExecuteColumnsDefinitions(viewId, pluginId, requestBody, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/plugin/${pluginId}/execute${
                parentId ? `?parentId=${parentId}` : ''
            }`,
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
            }
        )
            .then((pluginResponse) => {
                return Promise.resolve(pluginResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    getDocumentDatasInfo(viewId, documentId, listId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/document/${documentId}${parentId ? `?parentId=${parentId}` : ''}
        `,
            {
                method: 'POST',
                body: JSON.stringify(listId),
            }
        )
            .then((pluginResponse) => {
                return Promise.resolve(pluginResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    generateDocument(requestBody, viewId, documentId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/document/${documentId}/execute${
                parentId ? `?parentId=${parentId}` : ''
            }`,
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
            }
        )
            .then((documentResponse) => {
                return Promise.resolve(documentResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    attachmentEntry(viewId, recordId, parentIdParam, isKindViewSpec) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/attachment/${recordId}/Entry${parentIdParam}${
                isKindViewSpec ? '&kindView=ViewSpec' : ''
            }`,
            {
                method: 'POST',
            }
        )
            .then((attachmentEntryResponse) => {
                return Promise.resolve(attachmentEntryResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    uploadAttachemnt(viewId, parentId, parentViewId, formData, isKindViewSpec) {
        const headers = {
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Sec-Fetch-Site': 'same-origin',
            Pragma: 'no-cahce',
        };

        return this.fetch(
            `${this.getDomain()}/${
                this.path
            }/${viewId}/Attachment/Upload?parentId=${parentId}&parentViewId=${parentViewId}${
                isKindViewSpec ? '&parentKindView=ViewSpec' : ''
            }`,
            {
                method: 'POST',
                body: formData,
            },
            headers
        ).catch((err) => {
            throw err;
        });
    }

    downloadAttachment(viewId, recordId) {
        const url = new URL(`${this.domain}/${this.path}/${viewId}/attachment/${recordId}/download`);
        let fileName;
        return this.fetchFileResponse(url, {
            method: 'GET',
        })
            .then((response) => {
                fileName = response.headers.get('content-disposition').split('filename=')[1].split(';')[0];
                return response.blob();
            })
            .then((blob) => {
                saveAs(blob, fileName);
            })
            .catch((err) => {
                throw err;
            });
    }

    downloadDocument(viewId, documentId, fileId, fileName) {
        const url = new URL(
            `${this.domain}/${this.path}/${viewId}/document/${documentId}/download${fileId ? `?fileId=${fileId}` : ''}`
        );

        return this.fetchFileResponse(url, {
            method: 'GET',
        })
            .then((response) => {
                return response.blob();
            })
            .then((blob) => {
                saveAs(blob, fileName);
            })
            .catch((err) => {
                throw err;
            });
    }

    refreshFieldVisibility(viewId, recordId, parentId, kindView, element) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/RefreshFieldVisibility${
                parentId ? `?parentId=${parentId}` : ''
            }${parentId && kindView ? `&kindView=${kindView}` : ''}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            }
        ).catch((err) => {
            throw err;
        });
    }

    save(viewId, recordId, parentId, kindView, kindOperation, elementToSave, confirmSave, token) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave,
            kindView: parentId && kindView ? kindView : undefined,
            kindOperation: kindOperation,
        });
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/Save${queryString}`,
            {
                method: 'POST',
                body: JSON.stringify(elementToSave),
            },
            undefined,
            token
        ).catch((err) => {
            throw err;
        });
    }

    cancel(viewId, recordId, parentId, kindView, kindOperation, elementToCancel) {
        const queryString = this.objToQueryString({
            parentId: parentId,
            kindView: parentId && kindView ? kindView : undefined,
            kindOperation: kindOperation,
        });
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/Cancel${queryString}`, {
            method: 'POST',
            body: JSON.stringify(elementToCancel),
        }).catch((err) => {
            throw err;
        });
    }

    deleteEntry(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Delete/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
        })
            .then((deleteResponse) => {
                return Promise.resolve(deleteResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    delete(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Delete?${queryStringTmp.join('&')}`, {
            method: 'DELETE',
        }).catch((err) => {
            throw err;
        });
    }

    calculateFormulaForView(viewId, recordId, params) {
        let url = `${this.getDomain()}/${this.path}/${viewId}/calculate?recordId=${recordId}${params}`;
        if (recordId === null || recordId === undefined) {
            url = `${this.getDomain()}/${this.path}/${viewId}/calculate${params}`;
        }
        return this.fetch(url, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }
    calculateFormula(viewId, parentId, recordId, fieldsToCalculate) {
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

    archiveEntry(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Archive/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    archive(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Archive?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    copyEntry(viewId, parentId, kindView, recordId) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Copy/${recordId}/Entry?${queryStringTmp.join('&')}`,
            {
                method: 'POST',
            }
        ).catch((err) => {
            throw err;
        });
    }

    copy(viewId, parentId, kindView, recordId, body) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Copy/${recordId}?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify(body),
        }).catch((err) => {
            throw err;
        });
    }

    restoreEntry(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Restore/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    restore(viewId, parentId, kindView, selectedIds) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Restore?${queryStringTmp.join('&')}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }

    publishEntry(viewId, parentId, kindView, recordId) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }

        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }

        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Publish/${recordId}/Entry?${queryStringTmp.join('&')}`,
            {
                method: 'POST',
            }
        ).catch((err) => {
            throw err;
        });
    }

    publish(viewId, parentId, kindView, selectedIds, body) {
        let queryStringTmp = [];
        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (!!parentId && !!kindView) {
            queryStringTmp.push(`kindView=${kindView}`);
        }
        let recordId = selectedIds;

        if (Array.isArray(selectedIds)) {
            recordId = selectedIds[0];
        }

        for (const id in selectedIds) {
            queryStringTmp.push(`recordID=${selectedIds[id]}`);
        }
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/Publish/${recordId}?${queryStringTmp.join('&')}`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            }
        ).catch((err) => {
            throw err;
        });
    }
    createObjectDataToRequest(state) {
        let editData = state.editData;
        let arrayTmp = [];
        for (let editField of editData?.editFields) {
            for (let panel of editField.panels) {
                for (let group of panel.groups) {
                    for (let field of group.fields) {
                        field = this.convertFieldsPerType(field);
                        const elementTmp = {
                            fieldName: field.fieldName,
                            value: field.value,
                        };
                        arrayTmp.push(elementTmp);
                    }
                }
            }
        }
        return {data: arrayTmp};
    }

    convertFieldsPerType(field) {
        try {
            if (field?.type) {
                switch (field.type) {
                    case ColumnType.B:
                        field.value = field.value === 0 || field.value === '0' || !field.value ? 0 : 1;
                        break;
                    case ColumnType.L:
                        field.value = field.value === 'N' || !field.value ? 'N' : 'T';
                        break;
                    case ColumnType.D:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'YYYY-MM-DD');
                        break;
                    case ColumnType.E:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'YYYY-MM-DD HH:mm');
                        break;
                    case ColumnType.T:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'HH:mm');
                        break;
                    default:
                }
            }
        } catch (err) {}
        return field;
    }

    dateFormatAndKeepCorrectness(fieldValue, format) {
        if (fieldValue === null || fieldValue === '' || !(fieldValue instanceof Date && !isNaN(fieldValue))) {
            return '';
        }
        return moment(new Date(fieldValue)).format(format);
    }
}

import BaseService from './BaseService';
import EditRowUtils from '../utils/EditRowUtils';
import {saveAs} from 'file-saver';
import UrlUtils from '../utils/UrlUtils';
import EditListUtils from '../utils/EditListUtils';
import ConsoleHelper from '../utils/ConsoleHelper';
import {StringUtils} from '../utils/StringUtils';
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
        this.deleteEntry = this.deleteEntry.bind(this);
        this.delete = this.delete.bind(this);
        this.archiveEntry = this.archiveEntry.bind(this);
        this.archive = this.archive.bind(this);
        this.copyEntry = this.copyEntry.bind(this);
        this.copy = this.copy.bind(this);
        this.restoreEntry = this.restoreEntry.bind(this);
        this.attachmentEntry = this.attachmentEntry.bind(this);
        this.restore = this.restore.bind(this);
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
                EditListUtils.addUuidToFields(addDataResponse);
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
    edit(viewId, recordId, parentId, param) {
        let url = `${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}`;
        if (parentId || param) {
            url += '?';
            if (parentId) {
                url += `parentId=${parentId}`;
            }
            if (param) {
                url += parentId ? `&${param}` : param;
            }
        }
        return this.fetch(url, {method: 'GET'})
            .then((editDataResponse) => {
                EditListUtils.addUuidToFields(editDataResponse);
                return Promise.resolve(EditRowUtils.convertEditResponse(editDataResponse));
            })
            .catch((err) => {
                window.location.href = UrlUtils.getUrlWithoutEditRowParams();
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
        ConsoleHelper(`/api/View/${viewId}/editspec/${paramId}/list/${fieldId}`);
        const partOfUrl = UrlUtils.batchIdParamExist() ? 'batch' : 'editspec';
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/${partOfUrl}/${paramId}/list/${fieldId}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }

    getHistoryLogColumnsDefinitions(viewId, recordId, parentId, kindView) {
        const queryStringTmp = [];
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

    getDocumentDataInfo(viewId, documentId, listId, parentId) {
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/document/${documentId}${parentId ? `?parentId=${parentId}` : ''}
        `,
            {
                method: 'POST',
                body: JSON.stringify(listId),
            }
        )
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((err) => {
                throw err;
            });
    }

    executeDocument(requestBody, viewId, documentId, parentId) {
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

    attachmentEntry(viewId, recordId, parentId, isKindViewSpec) {
        let parentIdParam = '';
        if (!StringUtils.isBlank(parentId)) {
            parentIdParam = '?parentId=' + parentId;
        } else if (StringUtils.isBlank(parentId)) {
            parentIdParam = '?parentId=' + 0;
        }
        const URL = `${this.getDomain()}/${this.path}/${viewId}/attachment/${recordId}/Entry${parentIdParam}${
            isKindViewSpec ? '&kindView=ViewSpec' : ''
        }`;
        console.log('attachmentEntry -> ' + URL);
        return this.fetch(URL, {
            method: 'POST',
        })
            .then((attachmentEntryResponse) => {
                return Promise.resolve(attachmentEntryResponse);
            })
            .catch((err) => {
                throw err;
            });
    }

    uploadAttachment(viewId, parentId, parentViewId, formData, isKindViewSpec) {
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
                const contentHeader = response.headers.get('content-disposition');
                if (contentHeader) {
                    try {
                        const utf8Match = contentHeader.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
                        const plainMatch = contentHeader.match(/filename="?([^";]+)"?/i);
                        if (utf8Match && utf8Match[1]) {
                            fileName = decodeURIComponent(utf8Match[1].trim().replace(/['"]/g, ''));
                        } else if (plainMatch && plainMatch[1]) {
                            fileName = plainMatch[1].trim();
                        }
                    } catch (e) {
                        console.warn('Błąd podczas dekodowania filename:', e);
                    }
                }
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
    getStreamResponseBodyFromDownload(viewId, documentId, fileId, fileName) {
        const url = new URL(
            `${this.domain}/${this.path}/${viewId}/document/${documentId}/download${fileId ? `?fileId=${fileId}` : ''}`
        );
        return this.fetchFileResponse(url, {
            method: 'GET',
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Delete/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify({
                listId: selectedIds,
            }),
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Delete?${queryStringTmp.join('&')}`, {
            method: 'DELETE',
            body: JSON.stringify({
                listId: selectedIds,
            }),
        }).catch((err) => {
            throw err;
        });
    }

    calculateFormulaForView(viewId, params, listIds, specListIds) {
        const url = `${this.getDomain()}/${this.path}/${viewId}/calculate${params}`;
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                listId: listIds,
                listIdSpec: specListIds,
            }),
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Archive/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify({
                listId: selectedIds,
            }),
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Archive?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify({
                listId: selectedIds,
            }),
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Restore/Entry?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify({
                listId: selectedIds,
            }),
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
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Restore?${queryStringTmp.join('&')}`, {
            method: 'POST',
            body: JSON.stringify({
                listId: selectedIds,
            }),
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
}

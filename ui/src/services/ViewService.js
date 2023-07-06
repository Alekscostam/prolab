import BaseService from './BaseService';
import moment from 'moment';
import ConsoleHelper from '../utils/ConsoleHelper';
import UrlUtils from '../utils/UrlUtils';
import {readObjFromCookieGlobal} from '../utils/Cookie';

/*
GET zwracający dane potrzebne do wyrenderowania widoku: informacje ogólne o widoku, opcje
widoku, kolumny, przyciski, lista dokumentów oraz lista wtyczek.
 */
export default class ViewService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'view';
        this.getView = this.getView.bind(this);
        this.getSubView = this.getSubView.bind(this);
        this.getAttachemntView = this.getAttachemntView.bind(this);
    }

    getView(viewId, viewType, recordParentId, kindView) {
        let paramArrays = [];
        if (!!viewType) {
            paramArrays.push(`viewType=${viewType}`);
        }
        if (!!recordParentId) {
            paramArrays.push(`parentId=${recordParentId}`);
        }
        if (!!recordParentId && !!kindView) {
            paramArrays.push(`kindView=${kindView}`);
        }
        const parameters = paramArrays.length > 0 ? '?' + paramArrays.join('&') : '';
        return this.fetch(`${this.domain}/${this.path}/${viewId}${parameters}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getAttachemntView(viewId, recordId) {
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/attachment/${recordId}`, {
            method: 'GET',
        })
            .then((attachmentResponse) => {
                return Promise.resolve(attachmentResponse);
            })
            .catch((err) => {
                throw err;
            });
    }
    // TODO: logika w serwisie hmmm tak se troszke
    getViewSpec(viewId, parentId) {
        if (UrlUtils.batchIdParamExist('batchId')) {
            let batchId = UrlUtils.getBatchIdParam('batchId');
            const selectedRowKeys = readObjFromCookieGlobal('selectedRowKeys');
            console.log(selectedRowKeys, 'selectedRowKeys');
            const idRowKeys = selectedRowKeys.map((el) => el.ID);
            const requestBody = {
                listId: idRowKeys,
            };
            let url = `${this.domain}/${this.path}/${viewId}/batch/${batchId}`;
            if (parentId) {
                url = url + `?parentId=${parentId}`;
            }
            return this.fetch(`${url}`, {
                // method: 'GET',
                method: 'POST',
                body: JSON.stringify(requestBody),
            }).catch((err) => {
                throw err;
            });
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/editspec/${parentId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getViewAddSpec(viewId, parentId, type, header, headerId) {
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

    subViewEntry(viewId, recordId, parentId) {
        let queryStringTmp = [];

        if (!!parentId) {
            queryStringTmp.push(`parentId=${parentId}`);
        }
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/subview/${recordId}/Entry?${queryStringTmp.join('&')}`,
            {
                method: 'POST',
            }
        ).catch((err) => {
            throw err;
        });
    }

    getSubView(viewId, recordId, parentId) {
        const cacheKey = JSON.stringify({viewId: parseInt(viewId), recordId: parseInt(recordId)});

        ConsoleHelper('getSubView: cacheKey=' + cacheKey);
        try {
            let cacheValue = JSON.parse(sessionStorage.getItem(cacheKey));
            if (cacheValue) {
                const expDate = cacheValue.expDate;
                const now = moment();
                if (now.isBefore(expDate)) {
                    if (cacheValue.data) {
                        ConsoleHelper('getSubView: returning data from cache');
                        return Promise.resolve(cacheValue.data);
                    }
                } else {
                    ConsoleHelper('getSubView: cache expired');
                }
            } else {
                ConsoleHelper('getSubView: cache value is empty');
            }
        } catch (err) {
            ConsoleHelper('getSubView: invalid format of cache value', err);
            sessionStorage.removeItem(cacheKey);
        }

        let url = `${this.domain}/${this.path}/${viewId}/subView/${recordId}`;
        if (parentId != null) {
            url += `?parentId=${parentId}`;
        }

        return this.fetch(url, {
            method: 'GET',
        })
            .then((result) => {
                const cacheValue = {
                    expDate: moment().add(5, 'seconds'),
                    data: result,
                };
                ConsoleHelper('getSubView: setting data to cache');
                sessionStorage.setItem(cacheKey, JSON.stringify(cacheValue));
                return Promise.resolve(result);
            })
            .catch((err) => {
                throw err;
            });
    }
}

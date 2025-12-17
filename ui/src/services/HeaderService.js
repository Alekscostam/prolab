import EditListUtils from '../utils/EditListUtils';
import EditRowUtils from '../utils/EditRowUtils';
import {StringUtils} from '../utils/StringUtils';
import UrlUtils from '../utils/UrlUtils';
import BaseService from './BaseService';

export default class HeaderService extends BaseService {
    constructor() {
        super();
        this.path = 'view';
    }

    static getQueryString(parentId, kindView, kindOperation, confirmSave, type) {
        const queryString = StringUtils.objToQueryString({
            parentId: parentId,
            confirmSave: confirmSave,
            kindView: parentId && kindView ? kindView : undefined,
            kindOperation: kindOperation,
            type: type,
        });
        return queryString;
    }

    editEntry(viewId, recordId, parentId, kindView) {
        const queryString = HeaderService.getQueryString(parentId);
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/Edit/${recordId}/Entry${queryString}`, {
            method: 'POST',
        })
            .then((editDataEntryResponse) => {
                window.location.href = UrlUtils.getUrlWithEditRowParams(recordId, parentId, viewId, kindView);
                return Promise.resolve(editDataEntryResponse);
            })
            .catch((err) => {
                throw err;
            });
    }
    editCancel(viewId, recordId, parentId, kindView, kindOperation, element, type, path = 'edit') {
        const queryString = HeaderService.getQueryString(parentId, kindView, kindOperation, undefined, type);
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/${path}/${recordId}/cancel${queryString}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }
    editSave(viewId, recordId, parentId, kindView, kindOperation, element, confirmSave, token, type, path = 'edit') {
        const queryString = HeaderService.getQueryString(parentId, kindView, kindOperation, confirmSave, type);
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/${path}/${recordId}/save${queryString}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            },
            undefined,
            token
        ).catch((err) => {
            throw err;
        });
    }
    editRefreshFieldVisibility(viewId, recordId, parentId, kindView, element, type, path = 'edit') {
        const queryString = HeaderService.getQueryString(parentId, kindView, undefined, undefined, type);
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/${path}/${recordId}/RefreshFieldVisibility${queryString}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            }
        ).catch((err) => {
            throw err;
        });
    }
    edit(viewId, recordId, parentId, param) {
        let url = `${this.getDomain()}/${this.path}/${viewId}/edit/${recordId}`;
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

    editAutoFill(viewId, recordId, parentId, kindView, element, type, path = 'edit') {
        const queryString = HeaderService.getQueryString(parentId, kindView, undefined, undefined, type);
        return this.fetch(`${this.getDomain()}/${this.path}/${viewId}/${path}/${recordId}/AutoFill${queryString}`, {
            method: 'POST',
            body: JSON.stringify(element),
        }).catch((err) => {
            throw err;
        });
    }

    editList(viewId, recordId, parentId, fieldId, kindView, element, type, path = 'edit') {
        const queryString = HeaderService.getQueryString(parentId, kindView, undefined, undefined, type);
        return this.fetch(
            `${this.getDomain()}/${this.path}/${viewId}/${path}/${recordId}/list/${fieldId}${queryString}`,
            {
                method: 'POST',
                body: JSON.stringify(element),
            }
        ).catch((err) => {
            throw err;
        });
    }
}

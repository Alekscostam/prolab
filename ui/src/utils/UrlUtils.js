import {StringUtils} from './StringUtils';

class UrlUtils {
    static getURLParameter(paramName) {
        let sURL = window.document.URL.toString();
        if (sURL.indexOf('?') > 0) {
            let arrParams = sURL.split('?');
            let arrURLParams = arrParams[1].split('&');
            let arrParamNames = new Array(arrURLParams.length);
            let arrParamValues = new Array(arrURLParams.length);
            let i = 0;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split('=');
                arrParamNames[i] = sParam[0];
                if (sParam[1] !== '') arrParamValues[i] = unescape(sParam[1]);
                else arrParamValues[i] = null;
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] === paramName) {
                    return arrParamValues[i];
                }
            }
            return null;
        }
    }
    static getParentId() {
        return this.getURLParameter('parentId');
    }
    static getBatchId() {
        return this.getURLParameter('batchId');
    }
    static getRecordId() {
        return this.getURLParameter('recordId');
    }
    static getFilterId() {
        return this.getURLParameter('filterId');
    }
    static getSubViewId() {
        return this.getURLParameter('subview');
    }
    static getViewType() {
        return this.getURLParameter('viewType');
    }
    static getKindView() {
        return this.getURLParameter('kindView');
    }
    static getEditViewId() {
        return this.getURLParameter('editViewId');
    }
    static getEditParentId() {
        return this.getURLParameter('editParentId');
    }
    static getEditRecordId() {
        return this.getURLParameter('editRecordId');
    }
    static getEditKindView() {
        return this.getURLParameter('editKindView');
    }
    static getForce() {
        return this.getURLParameter('force');
    }
    static getBc() {
        return this.getURLParameter('bc');
    }
    static getPrevParentId() {
        return this.getURLParameter('prevParentId');
    }
    static isLoginPage() {
        const textAfterHash = window.location.href.split('/#/')[1];
        const onLogoutUrl = !(textAfterHash && textAfterHash.trim() !== '');
        return onLogoutUrl;
    }
    static removeAndAddParam(paramName, idToReplace, url) {
        let deleteParamFromUrl = this.deleteParameterFromURL(url, paramName);
        let addParamToUrl = this.addParameterToURL(deleteParamFromUrl, paramName, idToReplace);
        return addParamToUrl;
    }
    static batchIdParamExist() {
        const batchId = this.getURLParameter('batchId');
        return batchId !== undefined && batchId !== null;
    }
    static parentIdParamExist() {
        const batchId = this.getURLParameter('parentId');
        return batchId !== undefined && batchId !== null;
    } 
    static recordIdParamExist() {
        const recordId = this.getURLParameter('recordId');
        return recordId !== undefined && recordId !== null;
    }
    static isBcParamExist() {
        return window.location.href.includes('bc');
    }
    static isQuestionMarkParamExist() {
        return window.location.href.includes('?');
    }
    static isKindViewParamExist() {
        return window.location.href.includes('editKindView');
    }
    static isStartPage() {
        return window.location.href.includes('start');
    }
    static getBatchIdParam() {
        return this.getURLParameter('batchId');
    }
    static urlParamExsits(param) {
        return window.location.href.includes(param);
    }
    static isEditRowOpen() {
        const editViewId = UrlUtils.getURLParameter('editViewId');
        const editParentId = UrlUtils.getURLParameter('editParentId');
        const editRecordId = UrlUtils.getURLParameter('editRecordId');
        const editKindView = UrlUtils.getURLParameter('editKindView');
        return (
            !StringUtils.isBlank(editViewId) ||
            !StringUtils.isBlank(editParentId) ||
            !StringUtils.isBlank(editRecordId) ||
            !StringUtils.isBlank(editKindView)
        );
    }
    static notDefinedPrefix(urlPrefix) {
        return urlPrefix === undefined || urlPrefix == null || urlPrefix === '';
    }
    static getIdFromUrl() {
        let splittedUrlByWildcard = window.location.href.split('?')[0];
        let elements = splittedUrlByWildcard.split('/');
        return elements[elements.length - 1];
    }
    static isEditRowView() {
        return window.location.href.includes('edit-row-view');
    }
    static isEditSpec() {
        return window.location.href.includes('edit-spec');
    }
    static isBatch() {
        return window.location.href.includes('batch');
    } 
    static isGrid() {
        return window.location.href.includes('grid-view');
    }
    static mainViewUrl() {
        return window.location.href.split('?')[0];
    }

    static getUrlWithoutEditRowParams() {
        const currentUrl = window.location.href;
        const paramsToRemove = [
            '?editParentId=' + UrlUtils.getURLParameter('editParentId'),
            '&editParentId=' + UrlUtils.getURLParameter('editParentId'),
            '?editRecordId=' + UrlUtils.getURLParameter('editRecordId'),
            '&editRecordId=' + UrlUtils.getURLParameter('editRecordId'),
            '?editKindView=' + UrlUtils.getURLParameter('editKindView'),
            '&editKindView=' + UrlUtils.getURLParameter('editKindView'),
            '?editViewId=' + UrlUtils.getURLParameter('editViewId'),
            '&editViewId=' + UrlUtils.getURLParameter('editViewId'),
        ];
        let urlWithRemovedParams = currentUrl
            .replace(paramsToRemove[0], '')
            .replace(paramsToRemove[1], '')
            .replace(paramsToRemove[2], '')
            .replace(paramsToRemove[3], '')
            .replace(paramsToRemove[4], '')
            .replace(paramsToRemove[5], '')
            .replace(paramsToRemove[6], '')
            .replace(paramsToRemove[7], '');
        return urlWithRemovedParams;
    }

    static getUrlWithEditRowParams(recordId, parentId, viewId, kindView) {
        let queryStringTmp = [];
        let firstChar = '?';
        if (UrlUtils.isQuestionMarkParamExist()) {
            firstChar = '&';
        } else if (UrlUtils.isBcParamExist()) {
            firstChar = '&';
        }
        if (!!viewId && StringUtils.isBlank(UrlUtils.getURLParameter('editViewId'))) {
            queryStringTmp.push(`editViewId=${viewId}`);
        }
        if (!!parentId && StringUtils.isBlank(UrlUtils.getURLParameter('editParentId'))) {
            queryStringTmp.push(`editParentId=${parentId}`);
        }
        if (!!recordId && StringUtils.isBlank(UrlUtils.getURLParameter('editRecordId'))) {
            queryStringTmp.push(`editRecordId=${recordId}`);
        }
        if (queryStringTmp.length !== 0) {
            queryStringTmp[0] = `${firstChar}` + queryStringTmp[0];
        }
        const currenturl = window.location.href;
        return currenturl + `${queryStringTmp.join('&')}`;
    }
    // chyba do string utils
    static notExistsQuestionMark(str) {
        return !str.includes('?');
    }

    static replaceFirstAmpersand(str) {
        const idx = str.indexOf('&');
        if (idx !== -1) {
            return str.slice(0, idx) + '?' + str.slice(idx + 1);
        } else {
            return str;
        }
    }
    static deleteParameterFromURL(url, paramName) {
        let rtn = url.split('?')[0],
            param,
            params_arr = [],
            queryString = url.indexOf('?') !== -1 ? url.split('?')[1] : '';
        if (queryString !== '') {
            params_arr = queryString.split('&');
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split('=')[0];
                if (param === paramName) {
                    params_arr.splice(i, 1);
                }
            }
            if (params_arr.length) rtn = rtn + '?' + params_arr.join('&');
        }
        return rtn;
    }

    static addParameterToURL(url, paramName, paramValue) {
        let updateMode = false;
        if (url === null || url === undefined) {
            return url;
        }
        const id1 = url.indexOf(`?${paramName}=`);
        const id2 = url.indexOf(`&${paramName}=`);
        if (id1 > 0 || id2 > 0) {
            updateMode = true;
        }
        let newUrl;
        if (updateMode) {
            let start;
            if (id1 > 0) {
                start = id1;
            } else {
                start = id2;
            }
            let end = url.indexOf('&', start + 1);
            newUrl = url.substr(0, start + 1) + paramName + '=' + paramValue;
            if (end > 0) {
                newUrl += url.substr(end);
            }
        } else {
            newUrl = url;
            if (url.indexOf('?') > 0) {
                newUrl += '&';
            } else {
                newUrl += '?';
            }
            newUrl += `${paramName}=${paramValue}`;
        }
        return newUrl;
    }
    static cutEverythingFromCurrentUrlAfterWord(word){
        return window.location.href.split(word)[0]
    }
    static getViewIdFromURL() {
        let url = window.document.URL.toString();
        var regexp = new RegExp('^.+\\/grid-view\\/([0-9]+)([\\?|\\/]+.*)?$', 'g');
        let match = regexp.exec(url);
        if (match) {
            return match[1];
        }
    }

    static navigateToExternalUrl = (url) => {
        window.open(url, '_blank');
    };

    static getShortUrlParams(paramValues) {
        let joinResult = paramValues.join(',');
        return joinResult;
    }

    static getUrlParams(paramName, paramValues) {
        let joinResult = paramValues.join('&' + paramName + '=');
        return paramName + '=' + joinResult;
    }
}

export default UrlUtils;

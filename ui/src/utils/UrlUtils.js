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
    static getBatchIdParam() {
        return this.getURLParameter('batchId');
    }

    // TODO: pewnie mozna lepiej
    static getIdFromUrl() {
        let splittedUrlByWildcard = window.location.href.split('?')[0];
        let elements = splittedUrlByWildcard.split('/');
        return elements[elements.length - 1];
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

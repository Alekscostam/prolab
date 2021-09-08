


class UrlUtils {

    static getURLParameter(paramName) {
        let sURL = window.document.URL.toString();
        if (sURL.indexOf("?") > 0) {
            let arrParams = sURL.split("?");
            let arrURLParams = arrParams[1].split("&");
            let arrParamNames = new Array(arrURLParams.length);
            let arrParamValues = new Array(arrURLParams.length);
            let i = 0;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split("=");
                arrParamNames[i] = sParam[0];
                if (sParam[1] !== "")
                    arrParamValues[i] = unescape(sParam[1]);
                else
                    arrParamValues[i] = null;
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] === paramName) {
                    return arrParamValues[i];
                }
            }
            return null;
        }
    }

    static deleteParameterFromURL(url, paramName) {
        let newUrl = url;
        const id1 = url.indexOf(`?${paramName}=`);
        const id2 = url.indexOf(`&${paramName}=`);
        //console.log(`id1=${id1}; id2=${id2}`);
        if ( id1 > 0  || id2 > 0) {				
            let start;
            if (id1 > 0) {
                start = id1;
            } else {
                start = id2;
            }
            // console.log('start=' + start);
            let end = url.indexOf('&', start + 1);
            // console.log('end=' + end);
            newUrl = url.substr(0, start);
            if (end > 0) {
                newUrl += url.substr(end);
            }

        }
        return newUrl;
    }

    static addParameterToURL(url, paramName, paramValue) {
        let updateMode = false;
        const id1 = url.indexOf(`?${paramName}=`);
        const id2 = url.indexOf(`&${paramName}=`);
        if ( id1 > 0  || id2 > 0) {
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
}

export default UrlUtils;
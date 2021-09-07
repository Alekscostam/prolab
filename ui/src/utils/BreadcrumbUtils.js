import AppPrefixUtils from './AppPrefixUtils';

const BREADCRUMB_URL_PARAM_NAME  = 'bc'; 

export class Breadcrumb {

    

    static updateView(viewInfo, viewId, recordId) {
        console.log(`Breadcrumb::updateView, viewId=${viewId}, recordId=${recordId}, viewInfo`, viewInfo);
        let currentUrl = window.document.URL.toString()
        currentUrl = currentUrl.substr(currentUrl.indexOf('/#'));
        let breadcrumb = this.readFromUrl();
        let removeMode = false;
        let tmp = [];
        breadcrumb.forEach(i => {
            let p1 = i.path ? this.deleteParameterFromURL(i.path, BREADCRUMB_URL_PARAM_NAME) : null;
            p1 = p1 ? this.deleteParameterFromURL(p1, 'ts') : null;
            let p2 = this.deleteParameterFromURL(currentUrl, BREADCRUMB_URL_PARAM_NAME);
            p2 = this.deleteParameterFromURL(p2, 'ts');

            if (p1 === p2) {
                tmp.push(i);
                removeMode = true;
            }
            if (!removeMode) {
                tmp.push(i);    
            }
        });
        breadcrumb = tmp;
        if (viewInfo) {            
            if (viewInfo.menu) {
                breadcrumb = [];
                breadcrumb.push({name: viewInfo.menu.name, id: viewInfo.menu.id, type: 'menu'});
                //TODO obsluga sub
            }            
            if (breadcrumb.filter(i => i.id === viewInfo.id && i.type === 'view').length === 0) {
                const last = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : null;
                if (last && last.type === 'view') {
                    breadcrumb.pop();
                }
                let path = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}`);
                if (recordId) {
                    path = this.addParameterToURL(path, 'recordId', recordId);
                }
                if (parseInt(viewId) !== parseInt(viewInfo.id)) {
                    path = this.addParameterToURL(path, 'subview', viewInfo.id);
                }
                breadcrumb.push({name: viewInfo.name, id: viewInfo.id, type: 'view', path});
            }
        }
        console.log('Breadcrumb::updateView, breadcrumb', breadcrumb);
        const newUrl = this.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));
        console.log('Breadcrumb::updateView, newUrl', newUrl);
        window.history.replaceState('', '', newUrl);
    }
    static updateSubView(subViewResponse, subViewId) {
        console.log('Breadcrumb::updateSubView, subViewId=' + subViewId + ', subViewResponse', subViewResponse);        
        let breadcrumb = this.readFromUrl();
        if (subViewResponse && subViewResponse.viewInfo) {
            if (breadcrumb.filter(i => i.id === subViewResponse.viewInfo.id && i.type === 'subview').length === 0) {
                const breadcrumbFieldName = subViewResponse.viewInfo.breadcrumbFieldName ? subViewResponse.viewInfo.breadcrumbFieldName : 'ID';
                const headerData = subViewResponse.headerData && subViewResponse.headerData.length > 0 ? subViewResponse.headerData[0] : null;
                let name;
                if (breadcrumbFieldName && headerData) {
                    name = '' + headerData[breadcrumbFieldName];
                }
                if (!name) {
                    name = '' + subViewId;
                }
                const path = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${subViewResponse.viewInfo.id}?recordId=${subViewId}`);            
                breadcrumb.push({name, id: subViewResponse.viewInfo.id, type: 'subview', path});
            }            
        }
        console.log('Breadcrumb::updateSubView, breadcrumb', breadcrumb);
        const newUrl = this.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));        
        console.log('Breadcrumb::updateSubView, newUrl', newUrl);
        window.history.replaceState('', '', newUrl);
    }

    static readFromUrl() {
        const encodedValue = this.getURLParameter(BREADCRUMB_URL_PARAM_NAME);
        if (encodedValue) {
            try {
                const breadcrumb = JSON.parse(this.b64_to_utf8(encodedValue));
                console.log('Breadcrumb::readFromUrl breadcrumb', breadcrumb);
                return breadcrumb;
            } catch (err) {
                console.log('Breadcrumb::readFromUrl error', err);
            }
        }
        console.log('Breadcrumb::readFromUrl breadcrumb', []);
        return [];
    }

    static currentBreadcrumbAsUrlParam() {

        const currentBredcrump = this.getURLParameter(BREADCRUMB_URL_PARAM_NAME);
        if (currentBredcrump) {
            return `&${BREADCRUMB_URL_PARAM_NAME}=${currentBredcrump}`;
        }
        return '';
    }


    static utf8_to_b64( str ) {
        return window.btoa(unescape(encodeURIComponent( str )));
    }
      
    static b64_to_utf8( str ) {
        return decodeURIComponent(escape(window.atob( str )));
    }


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
                    //alert("Parameter:" + arrParamValues[i]);
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
        console.log(`id1=${id1}; id2=${id2}`);
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
    

}
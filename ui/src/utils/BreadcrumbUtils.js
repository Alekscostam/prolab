import React from 'react';
import AppPrefixUtils from './AppPrefixUtils';
import UrlUtils from './UrlUtils';


const BREADCRUMB_URL_PARAM_NAME  = 'bc'; 
const TIMESTAMP_URL_PARAM_NAME = "ts";

export class Breadcrumb {

    

    static updateView(viewInfo, viewId, recordId) {
        console.log(`*Breadcrumb::updateView, viewId=${viewId}, recordId=${recordId}, viewInfo`, viewInfo);
        let currentUrl = window.document.URL.toString()
        currentUrl = currentUrl.substr(currentUrl.indexOf('/#'));
        let breadcrumb = this.readFromUrl();
        let removeMode = false;
        let tmp = [];
        breadcrumb.forEach(i => {
            let p1 = i.path ? UrlUtils.deleteParameterFromURL(i.path, BREADCRUMB_URL_PARAM_NAME) : null;
            p1 = p1 ? UrlUtils.deleteParameterFromURL(p1, 'ts') : null;
            let p2 = UrlUtils.deleteParameterFromURL(currentUrl, BREADCRUMB_URL_PARAM_NAME);
            p2 = UrlUtils.deleteParameterFromURL(p2, TIMESTAMP_URL_PARAM_NAME);

            if (p1 === p2) {
                tmp.push(i);
                removeMode = true;
            }
            if (removeMode) {
                console.log('Breadcrumb::updateView: remove', i);
            }
            if (!removeMode) {
                console.log('Breadcrumb::updateView: assign from previous view', i);
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
                    path = UrlUtils.addParameterToURL(path, 'recordId', recordId);
                }
                if (parseInt(viewId) !== parseInt(viewInfo.id)) {
                    path = UrlUtils.addParameterToURL(path, 'subview', viewInfo.id);
                }
                breadcrumb.push({name: viewInfo.name, id: viewInfo.id, type: 'view', path});
            }
        }
        console.log('Breadcrumb::updateView, breadcrumb', breadcrumb);
        const newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));
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
        const newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));        
        console.log('Breadcrumb::updateSubView, newUrl', newUrl);
        window.history.replaceState('', '', newUrl);
    }

    static readFromUrl() {
        const encodedValue = UrlUtils.getURLParameter(BREADCRUMB_URL_PARAM_NAME);
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

    static render() {
        const breadcrumb = this.readFromUrl();
        return (
            <React.Fragment>
                <div className="breadcrumb-panel breadcrumb-link">
                    <a href="/#/start">Strona główna</a>{' > '}
                    {breadcrumb.map(((item, id) => {
                        if (item.type === 'menu') {
                            return (
                                <React.Fragment>
                                    <span>{item.name}{' > '}</span>
                                </React.Fragment>
                                
                            )
                        } else if (item.type === 'view' || item.type === 'subview') {
                            let path = UrlUtils.addParameterToURL(item.path, BREADCRUMB_URL_PARAM_NAME, UrlUtils.getURLParameter(BREADCRUMB_URL_PARAM_NAME));
                            const timestamp = Date.now();
                            path = UrlUtils.addParameterToURL(path, TIMESTAMP_URL_PARAM_NAME, timestamp);
                            return (
                                <React.Fragment>
                                    <a href={path}>{item.name}</a>
                                    <span>{id + 1 === breadcrumb.length ? '' : ' > '}</span>
                                </React.Fragment>
                            )
                        } else {
                            return null;
                        }
                    }))}                
               </div>
            </React.Fragment>
        );
    }

    static currentBreadcrumbAsUrlParam() {
        const currentBredcrump = UrlUtils.getURLParameter(BREADCRUMB_URL_PARAM_NAME);
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

}
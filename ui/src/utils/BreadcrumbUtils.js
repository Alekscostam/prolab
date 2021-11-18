import React from 'react';
import AppPrefixUtils from './AppPrefixUtils';
import UrlUtils from './UrlUtils';
import ConsoleHelper from "./ConsoleHelper";


const BREADCRUMB_URL_PARAM_NAME = 'bc';
const TIMESTAMP_URL_PARAM_NAME = "ts";

export class Breadcrumb {


    static cutBreadcrumpToURL(breadcrumb, url) {
        url = AppPrefixUtils.locationHrefUrl(url.substr(url.indexOf('/#')));
        let removeMode = false;
        let tmp = [];
        url = UrlUtils.deleteParameterFromURL(url, BREADCRUMB_URL_PARAM_NAME);
        url = UrlUtils.deleteParameterFromURL(url, TIMESTAMP_URL_PARAM_NAME);
        ConsoleHelper(`*Breadcrumb::cutBreadcrumpToURL, url=${url}`);
        breadcrumb.forEach((i, idx) => {
            let p1 = i.path ? UrlUtils.deleteParameterFromURL(i.path, BREADCRUMB_URL_PARAM_NAME) : null;
            p1 = p1 ? UrlUtils.deleteParameterFromURL(p1, TIMESTAMP_URL_PARAM_NAME) : null;
            if (p1 === url) {
                ConsoleHelper('Breadcrumb::cutBreadcrumpToURL: (1) assign from previous view', i);
                tmp.push(i);
                removeMode = true;
            }
            if (!removeMode /*&& idx !== breadcrumb.length - 1*/) {
                ConsoleHelper('Breadcrumb::cutBreadcrumpToURL: (2) assign from previous view', i);
                tmp.push(i);
            } else {
                // eslint-disable-next-line no-undef
                ConsoleHelper('Breadcrumb::cutBreadcrumpToURL: remove', i);
            }
        });
        return tmp;
    }


    static updateView(viewInfo, viewId, recordId) {
        ConsoleHelper(`*Breadcrumb::updateView, viewId=${viewId}, recordId=${recordId}, viewInfo`, viewInfo);
        let breadcrumb = this.readFromUrl();
        let currentUrl = window.document.URL.toString()
        breadcrumb = this.cutBreadcrumpToURL(breadcrumb, currentUrl);

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
                let path = window.document.URL.toString();
                const id = path.indexOf('/#');
                path = AppPrefixUtils.locationHrefUrl(path.substring(id > 0 ? id : 0));
                path = UrlUtils.deleteParameterFromURL(path, TIMESTAMP_URL_PARAM_NAME);
                path = UrlUtils.deleteParameterFromURL(path, BREADCRUMB_URL_PARAM_NAME);
                breadcrumb.push({name: viewInfo.name, id: viewInfo.id, type: 'view', path});
            }
        }
        ConsoleHelper('Breadcrumb::updateView, breadcrumb', breadcrumb);
        const newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));
        ConsoleHelper('Breadcrumb::updateView, newUrl', newUrl);
        window.history.replaceState('', '', newUrl);
    }

    static updateSubView(subViewResponse, subViewId) {
        ConsoleHelper('Breadcrumb::updateSubView, subViewId=' + subViewId + ', subViewResponse', subViewResponse);
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
        ConsoleHelper('Breadcrumb::updateSubView, breadcrumb', breadcrumb);
        const newUrl = UrlUtils.addParameterToURL(window.document.URL.toString(), BREADCRUMB_URL_PARAM_NAME, this.utf8_to_b64(JSON.stringify(breadcrumb)));
        ConsoleHelper('Breadcrumb::updateSubView, newUrl', newUrl);
        window.history.replaceState('', '', newUrl);
    }

    static readFromUrl() {
        const encodedValue = UrlUtils.getURLParameter(BREADCRUMB_URL_PARAM_NAME);
        if (encodedValue) {
            try {
                const breadcrumb = JSON.parse(this.b64_to_utf8(encodedValue));
                ConsoleHelper('Breadcrumb::readFromUrl breadcrumb', breadcrumb);
                return breadcrumb;
            } catch (err) {
                ConsoleHelper('Breadcrumb::readFromUrl error', err);
            }
        }
        ConsoleHelper('Breadcrumb::readFromUrl breadcrumb', []);
        return [];
    }

    static cutBreaadcrumbFor(breadcrumb, url) {
        const result = [];
        if (breadcrumb) {
            let removeMode = false;
            breadcrumb.forEach(i => {
                if (i.path === url) {
                    removeMode = true;
                    result.push(i);
                }
                if (!removeMode) {
                    result.push(i);
                }
            })
        }
        return this.utf8_to_b64(JSON.stringify(result));
    }

    static render(labels) {
        ConsoleHelper('#$#$#$#$', labels);
        //const all = this.readFromUrl().length;
        const breadcrumb = this.cutBreadcrumpToURL(this.readFromUrl(), window.document.URL.toString());
        //alert('render: ' + all + " :: " + breadcrumb.length);

        const mainPage = AppPrefixUtils.locationHrefUrl('/#/start');
        return (
            <React.Fragment>
                <div className="breadcrumb-panel breadcrumb-link">
                    <a href={mainPage}>{labels['View_StartPage']}</a>{' > '}
                    {breadcrumb.map(((item, id) => {
                        if (item.type === 'menu') {
                            return (
                                <React.Fragment>
                                    <span>{item.name}{' > '}</span>
                                </React.Fragment>

                            )
                        } else if (item.type === 'view' || item.type === 'subview') {
                            let path = UrlUtils.addParameterToURL(item.path, BREADCRUMB_URL_PARAM_NAME, this.cutBreaadcrumbFor(breadcrumb, item.path));
                            //let path = item.path;
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


    static utf8_to_b64(str) {
        return window.btoa(unescape(encodeURIComponent(str)));
    }

    static b64_to_utf8(str) {
        return decodeURIComponent(escape(window.atob(str)));
    }

}
import React from 'react';
import UrlUtils from '../../utils/UrlUtils';
import PropTypes from 'prop-types';
import {Breadcrumb, BREADCRUMB_URL_PARAM_NAME, TIMESTAMP_URL_PARAM_NAME} from '../../utils/BreadcrumbUtils';
import {StringUtils} from '../../utils/StringUtils';
import {BreadCrumb} from 'primereact/breadcrumb';
import {HtmlUtils} from '../../utils/HtmlUtils';
import LocUtils from '../../utils/LocUtils';

export const BreadcrumbComponent = ({initialBreadcrumb = [], afterClick = undefined, initialMainPage = undefined}) => {
    const prepareForMainBreadcrumb = () => {
        const item = {};
        item.url = initialMainPage;
        item.className = 'main-breadcrumb';
        item.label = LocUtils.locFromStore('View_StartPage');
        item.command = () => {
            if (afterClick && shouldShowEditQuitConfirmationDialog()) {
                afterClick(() => {
                    window.location.href = item.url;
                });
            } else {
                window.location.href = item.url;
            }
        };
        return item;
    };
    const cutBreadcrumbFor = (breadcrumb, url) => {
        const result = [];
        if (breadcrumb) {
            let removeMode = false;
            breadcrumb.forEach((i) => {
                if (i.path === url) {
                    removeMode = true;
                    result.push(i);
                }
                if (!removeMode) {
                    result.push(i);
                }
            });
        }
        return Breadcrumb.utf8_to_b64(JSON.stringify(result));
    };
    const prepareForBreadcrumb = (breadcrumb) => {
        breadcrumb.forEach((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            item.label = HtmlUtils.textFromHtmlString(item.name);
            item.url = item.path;
            if (item.type === 'view' || item.type === 'subview') {
                let path = UrlUtils.addParameterToURL(
                    item.path,
                    BREADCRUMB_URL_PARAM_NAME,
                    cutBreadcrumbFor(breadcrumb, item.path)
                );
                const timestamp = Date.now();
                path = UrlUtils.addParameterToURL(path, TIMESTAMP_URL_PARAM_NAME, timestamp);
                item.url = path;
            }
            item.command = () => {
                if (StringUtils.isBlank(item.url)) {
                    return;
                }
                if (afterClick && shouldShowEditQuitConfirmationDialog() && !isLast) {
                    afterClick(() => {
                        window.location.href = item.url;
                    });
                } else {
                    window.location.href = item.url;
                }
            };
        });
        return breadcrumb;
    };
    const shouldShowEditQuitConfirmationDialog = () => {
        return UrlUtils.isBatch() || UrlUtils.isEditSpec();
    };
    return (
        <React.Fragment>
            <BreadCrumb
                model={prepareForBreadcrumb(initialBreadcrumb)}
                home={prepareForMainBreadcrumb(initialMainPage)}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />
        </React.Fragment>
    );
};

BreadcrumbComponent.propTypes = {
    afterClick: PropTypes.func,
    initialMainPage: PropTypes.string,
    initialBreadcrumb: PropTypes.array,
};

export default BreadcrumbComponent;

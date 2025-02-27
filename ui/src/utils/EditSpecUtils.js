import AppPrefixUtils from './AppPrefixUtils';
import {Breadcrumb} from './BreadcrumbUtils';
import {StringUtils} from './StringUtils';
import UrlUtils from './UrlUtils';

export class EditSpecUtils {
    static navToEditSpec(viewId, parentId, recordIdsParams) {
        const newUrl = this.editSpecUrl(viewId, parentId, recordIdsParams);
        window.location.href = newUrl;
    }
    static editSpecUrl(viewId, parentId, recordIdsParams) {
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        let prevParentId = '';
        if (!StringUtils.isBlank(UrlUtils.getParentId())) {
            prevParentId = `&prevParentId=${UrlUtils.getParentId()}`;
        }
        return AppPrefixUtils.locationHrefUrl(
            `/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordIdsParams}${prevParentId}${currentBreadcrumb}`
        );
    }
}

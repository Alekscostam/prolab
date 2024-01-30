import AppPrefixUtils from './AppPrefixUtils';
import UrlUtils from './UrlUtils';

export class EditSpecUtils {
    static navToEditSpec(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        const newUrl = this.editSpecUrl(viewId, parentId, recordIdsParams, currentBreadcrumb);
        window.location.href = newUrl;
    }
    static editSpecUrl(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        return AppPrefixUtils.locationHrefUrl(
            `/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordIdsParams}&prevParentId=${UrlUtils.getURLParameter("parentId")}${currentBreadcrumb}`
        );
    }
}

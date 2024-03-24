import AppPrefixUtils from './AppPrefixUtils';
import { StringUtils } from './StringUtils';
import UrlUtils from './UrlUtils';

export class EditSpecUtils {
    static navToEditSpec(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        const newUrl = this.editSpecUrl(viewId, parentId, recordIdsParams, currentBreadcrumb);
        window.location.href = newUrl;
    }
    static editSpecUrl(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        let prevParentId = '';
        if(!StringUtils.isBlank(UrlUtils.getURLParameter("parentId"))){
           prevParentId =  `&prevParentId=${UrlUtils.getURLParameter("parentId")}`
        }
        return AppPrefixUtils.locationHrefUrl(
            `/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordIdsParams}${prevParentId}${currentBreadcrumb}`
        );
    }
}

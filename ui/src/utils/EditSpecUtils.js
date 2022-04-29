import AppPrefixUtils from "./AppPrefixUtils";
import UrlUtils from "./UrlUtils";

export class EditSpecUtils {

    static navToEditSpec(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        const newUrl = AppPrefixUtils.locationHrefUrl(`/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordIdsParams}${currentBreadcrumb}`);
        UrlUtils.navigateToExternalUrl(newUrl);
    }

}
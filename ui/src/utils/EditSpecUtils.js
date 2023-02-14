import AppPrefixUtils from './AppPrefixUtils';

export class EditSpecUtils {
    static navToEditSpec(viewId, parentId, recordIdsParams, currentBreadcrumb) {
        const newUrl = AppPrefixUtils.locationHrefUrl(
            `/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordIdsParams}${currentBreadcrumb}`
        );
        window.location.href = newUrl;

        // UrlUtils.navigateToExternalUrl(newUrl);
    }
}

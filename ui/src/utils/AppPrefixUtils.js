import {readCookieGlobal} from "./cookie";

class AppPrefixUtils {
    static locationHrefUrl(url) {
        const REACT_APP_URL_PREFIX = readCookieGlobal("REACT_APP_URL_PREFIX");
        if (url === undefined || url === null) {
            return url;
        } else if (url.startsWith(REACT_APP_URL_PREFIX)) {
            return url;
        } else {
            return `${REACT_APP_URL_PREFIX}${url}`;
        }
    }
}

export default AppPrefixUtils;

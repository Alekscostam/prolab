import {readObjFromCookieGlobal} from './Cookie';

class AppPrefixUtils {
    static locationHrefUrl(url) {
        // url = url.replace("/#/","/")
        const REACT_APP_URL_PREFIX = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        // ConsoleHelper('REACT_APP_URL_PREFIX', REACT_APP_URL_PREFIX);
        if (url === undefined || url === null) {
            return url;
        } else if (url.startsWith(REACT_APP_URL_PREFIX)) {
            return url;
        } else {
            return `/${REACT_APP_URL_PREFIX}${url}`;
        }
    }
}

export default AppPrefixUtils;

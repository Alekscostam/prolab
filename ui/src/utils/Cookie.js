export function saveObjToCookieGlobal(cookieName, cookieValue) {
    sessionStorage.setItem(cookieName, JSON.stringify(cookieValue));
}

export function readObjFromCookieGlobal(cookieName) {
    return JSON.parse(sessionStorage.getItem(cookieName));
}

export function readValueCookieGlobal(cookieName) {
    return sessionStorage.getItem(cookieName);
}

export function removeCookieGlobal(cookieName) {
    return sessionStorage.removeItem(cookieName);
}
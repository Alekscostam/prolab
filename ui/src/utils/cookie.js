export function saveCookieGlobal(cookieName, cookieValue) {
    sessionStorage.setItem(cookieName, JSON.stringify(cookieValue));
}

export function readCookieGlobal(cookieName) {
    return JSON.parse(sessionStorage.getItem(cookieName));
}

export function removeCookieGlobal(cookieName) {
    return sessionStorage.removeItem(cookieName);
}
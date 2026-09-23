export function saveObjToCookieGlobal(cookieName, cookieValue) {
    sessionStorage.setItem(cookieName, JSON.stringify(cookieValue));
}

export function readObjFromCookieGlobal(cookieName) {
    return JSON.parse(sessionStorage.getItem(cookieName));
}

export function readValueCookieGlobal(cookieName) {
    return sessionStorage.getItem(cookieName);
}

export function saveValueToCookieGlobal(cookieName, cookieValue) {
    sessionStorage.setItem(cookieName, cookieValue);
}

export function readLocalStorage(cookieName) {
    return localStorage.getItem(cookieName);
}

export function saveLocalStorage(cookieName, cookieValue) {
    return localStorage.setItem(cookieName, cookieValue);
}
export function removeLocalStorage(cookieName) {
    return localStorage.removeItem(cookieName);
}

export function removeCookieGlobal(cookieName) {
    return sessionStorage.removeItem(cookieName);
}
export function canFitInCookie(str) {
    const byteLength = new TextEncoder().encode(str).length;
    return byteLength <= 4096;
}

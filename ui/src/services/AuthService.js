import decode from 'jwt-decode';
import moment from 'moment';
import {readObjFromCookieGlobal} from '../utils/Cookie';
import ConsoleHelper from '../utils/ConsoleHelper';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {reStateApp} from '../App';

/*
Żądanie POST służy do uwierzytelnienia użytkownika i uzyskania tokena, który służy do weryfikacji innego interfejsu API
żądanie. Token jest ważny przez określony czas, po wygaśnięciu należy poprosić o nowy.
 */
export default class AuthService {
    // Initializing important variables
    constructor(domain) {
        if (domain !== null && domain !== undefined) {
            this.domain = domain;
        } else {
            this.domain = readObjFromCookieGlobal('REACT_APP_BACKEND_URL'); // API server domain
        }
        this.fetch = this.fetch.bind(this);
        this.setUiMethods = this.setUiMethods.bind(this);
        // eslint-disable-next-line no-extend-native
        Date.prototype.toJSON = function () {
            return moment(this).format('YYYY-MM-DDTHH:mm:ssZ');
        };
        this.counter = 0;
        this.path = '';
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    setUiMethods(blockUi, unblockUi) {
        this.blockUi = blockUi;
        this.unblockUi = unblockUi;
    }

    fetch(url, options, headers, shouldAddAuthorization) {
        const method = options !== undefined ? options.method : undefined;
        // performs api calls sending the required authentication headers
        if (headers === null || headers === undefined) {
            headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cahce',
            };
        }
        if (shouldAddAuthorization === undefined || shouldAddAuthorization == null) {
            shouldAddAuthorization = true;
        }
        if (shouldAddAuthorization && this.isLoggedUser()) {
            headers['Authorization'] = this.getToken();
        }
        if (method === 'POST' || method === 'PUT') {
            this.counter += 1;
            if (this.blockUi !== undefined) {
                this.blockUi();
            }
        }
        return new Promise((resolve, reject) => {
            fetch(url, {
                headers,
                ...options,
            })
                .then((response) => this.parseJSON(response, headers))
                .then((response) => {
                    ConsoleHelper('response', response);
                    if (method === 'POST' || method === 'PUT') {
                        this.counter -= 1;
                        if (this.counter <= 0 && this.unblockUi !== undefined) {
                            this.unblockUi();
                        }
                    }
                    if (
                        response.ok &&
                        (headers === undefined ||
                            headers.accept === 'application/json' ||
                            headers.Accept === 'application/json')
                    ) {
                        return resolve(response.json, response.status);
                    } else if (response.ok) {
                        return resolve(response.body);
                    }
                    // extract the error from the server's json
                    return reject(response.json);
                })
                .catch((error) => {
                    if (method === 'POST' || method === 'PUT') {
                        this.counter -= 1;
                        if (this.counter <= 0 && this.unblockUi !== undefined) {
                            this.unblockUi();
                        }
                    }
                    if (
                        error !== undefined &&
                        error !== null &&
                        error.message !== undefined &&
                        error.message !== null &&
                        (error.message.includes('NetworkError when attempting to fetch resource') ||
                            error.message.includes('Failed to fetch'))
                    ) {
                        error.message = 'komunikacji z serwerem podczas pobierania danych.';
                    }
                    reject(error);
                });
        });
    }

    parseJSON(response, headers) {
        if (response.status) {
            return new Promise((resolve, reject) => {
                if (
                    headers === undefined ||
                    headers.accept === 'application/json' ||
                    headers.Accept === 'application/json'
                ) {
                    response.json().then(
                        (json) => {
                            resolve({
                                status: response.status,
                                ok: response.ok,
                                json,
                            });
                        },
                        (reason) => {
                            reject({
                                status: response.status,
                                ok: response.ok,
                                json: {message: reason},
                            });
                        }
                    );
                } else {
                    resolve({
                        status: response.status,
                        ok: response.ok,
                        body: response.body,
                    });
                }
            });
        } else {
            return new Promise((resolve) =>
                resolve({
                    status: response.status,
                    ok: response.ok,
                    json: {message: ''},
                })
            );
        }
    }

    //api/auth/token
    login(username, password) {
        // Get a token from api server using the fetch api
        return this.fetch(`${this.domain}/auth/token`, {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
                DeviceID: process.env.REACT_APP_NAME_DEVICE_ID,
                AppName:
                    process.env.REACT_APP_NAME_PROLAB +
                    ' ' +
                    process.env.REACT_APP_VERSION +
                    '_' +
                    process.env.REACT_APP_BUILD_NUMBER,
            }),
        }).then((res) => {
            this.setToken(res.token, res.expiration, res.user, res.refreshToken, res.sessionTimeoutInMinutes); // Setting the token in localStorage
            return Promise.resolve(res);
        });
    }

    isAlreadyTokenNotExist() {
        return localStorage.getItem('id_token') === undefined || localStorage.getItem('id_token') === null;
    }
    refresh() {
        if (this.isAlreadyTokenNotExist()) {
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
        }
        // Get a token from api server using the fetch api
        return this.fetch(
            `${this.domain}/auth/refreshToken`,
            {
                method: 'POST',
                body: JSON.stringify({
                    accessToken: localStorage.getItem('id_token'),
                    refreshToken: localStorage.getItem('id_refresh_token'),
                }),
            },
            null,
            false
        )
            .then((res) => {
                this.setRefreshedToken(res.accessToken, res.refreshToken); // Setting the token in localStorage
                if (reStateApp) {
                    reStateApp();
                }
                return Promise.resolve(res);
            })
            .catch((err) => {
                console.log(err);
                this.removeLoginCookies();
                window.location.reload();
            });
    }

    getTranslationParam(language, param) {
        let frameworkType = 'rd'.toLowerCase();
        let lang = language.toLowerCase();
        return this.fetch(`${readObjFromCookieGlobal('CONFIG_URL')}/lang/${frameworkType}_translations_${lang}.json`, {
            method: 'GET',
        })
            .then((arr) => {
                return Promise.resolve(arr.labels.find((el) => el.code.toLowerCase() === param.toLowerCase()));
            })
            .catch((err) => {
                throw err;
            });
    }

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken(); // Getting token from localstorage
        return !!token && !this.isTokenExpiredDate(); // Handwaiving here
    }
    isLoggedUser() {
        return !!localStorage.getItem('logged_user');
    }
    isTokenValidForRefresh() {
        const token = this.getToken();
        try {
            const decoded = decode(token);
            const seconds = moment().diff(new Date(decoded.created), 'seconds');
            return seconds > 30;
        } catch (err) {
            return false;
        }
    }

    isTokenExpiredDate() {
        try {
            const expirationTokenDateStr = localStorage.getItem('expiration_token');
            return !expirationTokenDateStr || new Date(expirationTokenDateStr * 1000) < Date.now();
        } catch (err) {
            return false;
        }
    }

    setToken(idToken, expirationToken, loggedUser, idRefreshToken, sessionTimeoutInMinutes) {
        localStorage.setItem('id_token', idToken);
        localStorage.setItem('expiration_token', decode(idToken).exp);
        localStorage.setItem('logged_user', JSON.stringify(loggedUser));
        localStorage.setItem('id_refresh_token', idRefreshToken);
        const sessionTimeout = moment(new Date()).add(sessionTimeoutInMinutes, 'm').toString();
        localStorage.setItem('session_timeout', sessionTimeout);
        localStorage.setItem('session_timeout_in_minutes', sessionTimeoutInMinutes);
    }
    setRefreshedToken(idToken, idRefreshToken) {
        // Saves user token to localStorage
        localStorage.setItem('id_token', idToken);
        localStorage.setItem('expiration_token', decode(idToken).exp);
        localStorage.setItem('id_refresh_token', idRefreshToken);
    }

    getSessionTimeout() {
        return localStorage.getItem('session_timeout');
    }
    getSessionTimeoutInMinutes() {
        return localStorage.getItem('session_timeout_in_minutes');
    }

    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('id_token');
    }

    getTokenExpirationDate() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('expiration_token');
    }

    logout() {
        if (!this.isAlreadyTokenNotExist()) {
            try {
                this.fetch(
                    `${this.domain}/auth/logout`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            accessToken: localStorage.getItem('id_token'),
                            refreshToken: localStorage.getItem('id_refresh_token'),
                        }),
                    },
                    null,
                    false
                )
                    .then(() => {
                        this.removeLoginCookies();
                    })
                    .catch(() => {
                        this.removeLoginCookies();
                    });
            } catch (err) {
                this.removeLoginCookies();
            }
        }
        this.removeLoginCookies();
        window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
        setTimeout(() => {
            if (reStateApp) {
                reStateApp();
            }
        }, 100);
    }
    removeLoginCookies() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expiration_token');
        localStorage.removeItem('logged_user');
        localStorage.removeItem('real_lang');
        localStorage.removeItem('session_timeout');
        localStorage.removeItem('session_timeout_in_minutes');
        localStorage.removeItem('id_refresh_token');
    }

    //TODO
    getProfile() {
        try {
            return localStorage.getItem('logged_user');
        } catch (err) {
            return {};
        }
    }

    getRoles() {
        // Using jwt-decode npm package to decode the token
        try {
            const decoded = decode(this.getToken());
            let rolesArray = [];
            if (decoded !== undefined && decoded !== null && decoded.role !== undefined && decoded.role !== null) {
                decoded.role.forEach((element) => {
                    if (element.authority !== undefined && element.authority !== null) {
                        rolesArray.push(element.authority);
                    }
                });
            }
            return rolesArray;
        } catch (err) {
            return [];
        }
    }

    isUserInRole(role) {
        const roles = this.getRoles();
        return roles.includes(role);
    }

    isUserInAnyRole(...rolesToFind) {
        const roles = this.getRoles();
        let authorized = false;
        rolesToFind.forEach((role) => {
            if (roles.includes(role)) {
                authorized = true;
            }
        });
        return authorized;
    }

    getUserId() {
        const user = this.getProfile();
        return user.userId ? user.userId : null;
    }

    expirationTimer() {
        try {
            const decoded = decode(this.getToken());
            let seconds = moment().diff(new Date(decoded.exp * 1000), 'seconds');
            return moment.utc(-seconds * 1000).format('mm [minut] ss [sekund]');
        } catch (err) {
            this.logout();
        }
    }

    getUserLang() {
        return 'PL';
    }
}

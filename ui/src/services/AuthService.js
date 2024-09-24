import decode from 'jwt-decode';
import moment from 'moment';
import {canFitInCookie, readObjFromCookieGlobal, saveObjToCookieGlobal} from '../utils/Cookie';
import ConsoleHelper from '../utils/ConsoleHelper';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {reStateApp} from '../App';
import {clearState} from '../App';
import {CookiesName} from '../model/CookieName';
import {StringUtils} from '../utils/StringUtils';


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
    getAndSetDomainIfNeccessery() {
        if (StringUtils.isBlank(this.domain) && readObjFromCookieGlobal('REACT_APP_BACKEND_URL')) {
            this.domain = readObjFromCookieGlobal('REACT_APP_BACKEND_URL');
        }
        return this.domain;
    }
    setUiMethods(blockUi, unblockUi) {
        this.blockUi = blockUi;
        this.unblockUi = unblockUi;
    }

    fetch(url, options, headers, shouldAddAuthorization = true) {
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

    login(username, password) {
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
        return StringUtils.isBlank(localStorage.getItem(CookiesName.ID_TOKEN));
    }
   
    refresh() {
        const idToken =localStorage.getItem(CookiesName.ID_TOKEN);
        const idRefreshToken =localStorage.getItem(CookiesName.ID_REFRESH_TOKEN);
        return this.fetch(
            `${this.getAndSetDomainIfNeccessery()}/auth/refreshToken`,
            {
                method: 'POST',
                body: JSON.stringify({
                    accessToken: localStorage.getItem(CookiesName.ID_TOKEN),
                    refreshToken: localStorage.getItem(CookiesName.ID_REFRESH_TOKEN),
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
                this.removeLoginCookies();
                const textAfterHash = window.location.href.split('/#/')[1];
                const onLogoutUrl = !(textAfterHash && textAfterHash.trim() !== '');
                if (!onLogoutUrl) {
                    err.idToken = idToken;
                    err.idRefreshToken = idRefreshToken;
                    localStorage.setItem(CookiesName.ERROR_AFTER_REFRESH, JSON.stringify(err));
                    setTimeout(()=>{
                        window.location.reload();
                    },100)
                }else{
                }
                return Promise.reject(err);
            });
    }

    getTranslationParam(language, param) {
        const frameworkType = 'rd'.toLowerCase();
        const lang = language.toLowerCase();
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
    isLoggedUser() {
        return !!localStorage.getItem(CookiesName.LOGGED_USER);
    }

    setToken(idToken, expirationToken, loggedUser, idRefreshToken, sessionTimeoutInMinutes) {
        if(!canFitInCookie(loggedUser?.avatar)){
            loggedUser.avatar = '';
            console.log("Avatar have to much size")
        }
        loggedUser = JSON.stringify(loggedUser);
        localStorage.setItem(CookiesName.ID_TOKEN, idToken);
        localStorage.setItem(CookiesName.ID_REFRESH_TOKEN, idRefreshToken);
        const sessionTimeout = moment(new Date()).add(sessionTimeoutInMinutes, 'm').toString();
        localStorage.setItem(CookiesName.SESSION_TIMEOUT, sessionTimeout);
        localStorage.setItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES, sessionTimeoutInMinutes);
        localStorage.setItem(CookiesName.LOGGED_USER, loggedUser);
    }
    setRefreshedToken(idToken, idRefreshToken) {
        // Saves user token to localStorage
        localStorage.setItem(CookiesName.ID_TOKEN, idToken);
        localStorage.setItem(CookiesName.ID_REFRESH_TOKEN, idRefreshToken);
    }

    getSessionTimeout() {
        return localStorage.getItem(CookiesName.SESSION_TIMEOUT);
    }

    getSessionTimeoutInMinutes() {
        return localStorage.getItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES);
    }

    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem(CookiesName.ID_TOKEN);
    }

    logout() {
        if (!this.isAlreadyTokenNotExist()) {
            try {
                this.fetch(
                    `${this.domain}/auth/logout`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            accessToken: localStorage.getItem(CookiesName.ID_TOKEN),
                            refreshToken: localStorage.getItem(CookiesName.ID_REFRESH_TOKEN),
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
            if (clearState) {
                clearState();
            }
        }, 100);
    }
    removeLoginCookies = () => {
        localStorage.removeItem(CookiesName.ID_TOKEN);
        localStorage.removeItem(CookiesName.LOGGED_USER);
        sessionStorage.removeItem(CookiesName.LOGGED_IN);
        localStorage.removeItem(CookiesName.SESSION_TIMEOUT);
        localStorage.removeItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES);
        localStorage.removeItem(CookiesName.ID_REFRESH_TOKEN);
        localStorage.removeItem(CookiesName.MENU);
        localStorage.removeItem(CookiesName.VERSION_API);
    }

    getProfile() {
        try {
            return localStorage.getItem(CookiesName.LOGGED_USER);
        } catch (err) {
            return {
                id:'',
                login:'',
                name:'',
                lang:'',
                sub:'',
                name:'',
                avatar:'',
            }
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

    getUserLang() {
        return 'PL';
    }
}

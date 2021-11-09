import decode from 'jwt-decode';
import moment from 'moment';
import {readCookieGlobal} from "../utils/Cookie";
import ConsoleHelper from "../utils/ConsoleHelper";

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
            this.domain = readCookieGlobal("REACT_APP_BACKEND_URL"); // API server domain
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

    fetch(url, options, headers) {
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
        if (this.loggedIn()) {
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
                    if (response.ok && (headers === undefined || headers.accept === 'application/json' || headers.Accept === 'application/json')) {
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
                        (error.message.includes('NetworkError when attempting to fetch resource') || error.message.includes('Failed to fetch'))
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
                if (headers === undefined || headers.accept === 'application/json' || headers.Accept === 'application/json') {
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
            }),
        }).then((res) => {
            this.setToken(res.token, res.expiration, res.user); // Setting the token in localStorage
            return Promise.resolve(res);
        });
    }

    refresh() {
        // Get a token from api server using the fetch api
        return this.fetch(`${this.domain}/refresh`, {
            method: 'GET',
        }).then((res) => {
            this.setToken(res.token, res.expiration, res.user); // Setting the token in localStorage
            return Promise.resolve(res);
        });
    }

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken(); // Getting token from localstorage
        return !!token && !this.isTokenExpiredDate(); // Handwaiving here
    }

    isTokenValidForRefresh() {
        const token = this.getToken();
        try {
            const decoded = decode(token);
            let seconds = moment().diff(new Date(decoded.created), 'seconds');
            if (seconds > 30) {
                // Checking if token is expired. N
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    isTokenExpiredDate() {
        try {
            const expirationTokenDateStr = localStorage.getItem('expiration_token');
            if (!expirationTokenDateStr || new Date(expirationTokenDateStr * 1000) < Date.now()) {
                // Checking if token is expired.
                return true;
            } else return false;
        } catch (err) {
            return false;
        }
    }

    setToken(idToken, expirationToken, loggedUser) {
        // Saves user token to localStorage
        localStorage.setItem('id_token', idToken);
        localStorage.setItem('expiration_token', decode(idToken).exp);
        localStorage.setItem('logged_user', JSON.stringify(loggedUser));
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
        // Clear user token and profile data from localStorage
        localStorage.removeItem('id_token')
        localStorage.removeItem('expiration_token')
        localStorage.removeItem('logged_user')
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
            this.logout()
        }
    }

    getUserLang() {
        return "PL";
    }
}

import moment from 'moment';
import AuthService from './AuthService';
import {readObjFromCookieGlobal} from '../utils/Cookie';
import AppPrefixUtils from '../utils/AppPrefixUtils';

export default class BaseService {
    // Initializing important variables
    constructor(domain) {
        if (domain !== null && domain !== undefined) {
            this.domain = domain;
        } else {
            this.reConfigureDomain(); // API server domain
        }
        this.fetch = this.fetch.bind(this);
        this.setUiMethods = this.setUiMethods.bind(this);
        this.auth = new AuthService(this.domain);
        // eslint-disable-next-line no-extend-native
        Date.prototype.toJSON = function () {
            return moment(this).format('YYYY-MM-DDTHH:mm:ssZ');
        };
        this.counter = 0;
    }

    reConfigureDomain() {
        this.domain = readObjFromCookieGlobal('REACT_APP_BACKEND_URL');
    }

    getDomain() {
        if (!this.domain) {
            this.reConfigureDomain();
        }
        return this.domain;
    }

    setUiMethods(blockUi, unblockUi) {
        this.blockUi = blockUi;
        this.unblockUi = unblockUi;
    }

    fetch(url, options, headers, token) {
        const method = options !== undefined ? options.method : undefined;
        // performs api calls sending the required authentication headers
        if (headers === null || headers === undefined) {
            headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
            };
        }
        if (this.auth.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.auth.getToken();
        }
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
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
                .then((response) => {
                    return this.parseJSON(response, headers);
                })
                .then((response) => {
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
                        return resolve(response.json);
                    } else if (
                        response.ok &&
                        (headers === undefined ||
                            headers.accept === 'application/octet-stream' ||
                            headers.Accept === 'application/octet-stream')
                    ) {
                        return resolve(response.blob);
                    } else if (response.ok) {
                        return resolve(response.body);
                    }
                    // extract the error from the server's json
                    return reject(response.json);
                })
                .catch((error) => {
                    if (error.status === 401) {
                        this.auth
                            .refresh()
                            .then(() => {
                                return this.fetch(url, options, headers, token).then((el) => {
                                    return resolve(el);
                                });
                            })
                            .catch((error) => {
                                this.auth.logout();
                                reject(error);
                            });
                    } else {
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
                    }
                });
        });
    }

    fetchFileResponse(url, options, headers) {
        if (headers === null || headers === undefined) {
            headers = {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Sec-Fetch-Site': 'same-origin',
                Pragma: 'no-cahce',
            };
        }
        if (this.auth.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.auth.getToken();
        }
        return new Promise((resolve, reject) => {
            fetch(url, {
                headers,
                ...options,
            })
                .then((response) => {
                    return resolve(response);
                })
                .catch((error) => {
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
                } else if (
                    headers === undefined ||
                    headers.accept === 'application/octet-stream' ||
                    headers.Accept === 'application/octet-stream'
                ) {
                    resolve({
                        status: response.status,
                        ok: response.ok,
                        blob: response.blob(),
                    });
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

    objToQueryString(obj) {
        const keyValuePairs = [];
        for (const key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
                keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
            }
        }
        return (keyValuePairs.length > 0 ? '?' : '') + keyValuePairs.join('&');
    }

    getPath() {
        return `${this.domain}/${this.path}`;
    }

    isNotEmpty(value) {
        return value !== undefined && value !== null && value !== '';
    }

    handleErrors(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    commonCorrectUrl(correctUrl) {
        const phraseToEraseFromUrl = '&searchOperation="contains"';
        if (correctUrl.includes(phraseToEraseFromUrl)) {
            correctUrl = correctUrl.replace(phraseToEraseFromUrl, '');
        }
        return correctUrl;
    }
}

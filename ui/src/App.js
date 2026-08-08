import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import DashboardContainer from './containers/dashboard/DashboardContainer';
import AuthService from './services/AuthService';
import AuthComponent from './components/AuthComponent';
import PrimeReact, {addLocale, locale as primeReactLocale} from 'primereact/api';
import '@fontsource/roboto';
import {ViewContainer} from './containers/ViewContainer';
import {createBrowserHistory} from 'history';
import {loadMessages, locale as devExpressLocale} from 'devextreme/localization';
import packageJson from '../package.json';
import ReadConfigService from './services/ReadConfigService';
import {readObjFromCookieGlobal, saveValueToCookieGlobal, saveObjToCookieGlobal} from './utils/Cookie';
import LocalizationService from './services/LocalizationService';
import config from 'devextreme/core/config';
import ConsoleHelper from './utils/ConsoleHelper';
import SubGridViewComponent from './containers/dataGrid/SubGridViewComponent';
import DivContainer from './components/DivContainer';
import {Breadcrumb} from './utils/BreadcrumbUtils';
import ActionButton from './components/ActionButton';
import {Toast} from 'primereact/toast';
import LocUtils from './utils/LocUtils';
import {EditSpecContainer} from './containers/EditSpecContainer';
import moment from 'moment';
import {StringUtils} from './utils/StringUtils';
import {BatchContainer} from './containers/BatchContainer';
import {TickerSessionDialog} from './components/prolab/TickerSessionDialog';
import UrlUtils from './utils/UrlUtils';
import {PageViewUtils} from './utils/parser/PageViewUtils';
import {ConfirmationEditQuitDialog} from './components/prolab/ConfirmationEditQuitDialog';
import {OperationType} from './enum/OperationType';
import {CookiesName} from './enum/CookieName';
import {VersionPreviewDialog} from './components/prolab/VersionPreviewDialog';
import {TranslationUtils} from './utils/TranslationUtils';
import useStore from './store';
import {SessionStoreUtils} from './utils/SessionStoreUtils';
import WebSocket from './socket/WebSocket';
import BarcodeScannerSimulator from './reader/BarcodeScannerSimulator';
import {getStore, updateHeartbeatDate} from './utils/helper/StoreHelper';
import AboutVersionService from './services/AboutVersionService';
import HeartbeatService from './services/HearbeatService';
import Widget from './components/widget/Widget';
import DashboardBiComponent from './containers/dashboard/DashboardBiComponent';
import UpdateApp from './components/prolab/UpdateApp';
import {handleEdit} from './utils/handler/EditHandler';
import CrudService from './services/CrudService';

export let clearState;
export let reStateApp;
export let renderNoRefreshContentFnc;
export let sessionExtendFnc = null;
// TODO: załącnziki w gantt
// http://localhost:3000/#/grid-view/18941?filterId=3036&viewType=gantt&bc=W3sibmFtZSI6IldhbGlkYWNqYSIsImlkIjo2MDc5LCJ0eXBlIjoibWVudSJ9LHsibmFtZSI6IkdhbnR0IHRlc3QiLCJpZCI6MTg5NDEsInR5cGUiOiJ2aWV3IiwicGF0aCI6Ii8jL2dyaWQtdmlldy8xODk0MSJ9XQ

class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();

        this.authService = new AuthService();
        this.crudService = new CrudService();
        this.lastConfigSnapshot = null;
        this.historyBrowser = this.history;
        this.selectedDataGrid = React.createRef();
        this.localizationService = new LocalizationService();
        this.heartbeatService = new HeartbeatService();
        this.viewContainer = React.createRef();
        this.editSpecContainer = React.createRef();
        this.state = {
            guiRefreshKey: 0,
            configApp: {
                lang: 'PL',
                renderForgotPassword: false,
                renderSignIn: false,
                langs: [],
                appName: undefined,
                deviceName: undefined,
                appVersion: undefined,
            },
            loadedConfiguration: false,
            enableUpdateDialog: false,
            editData: undefined,
            secondsToPopupTicker: undefined,
            confirmationQuitDialog: {
                render: false,
                menuItemClickedId: undefined,
                callBackFnc: undefined,
            },
            renderAboutVersionDialog: false,
            canRenderAboutVersionDialog: false,
            sidebarClickItemReactionEnabled: true,
            sessionMock: false,
            configUrl: null,
            user: this.authService.getProfile(),
            langs: [],
            labels: [],
            renderNoRefreshContent: false,
            viewInfoName: null,
            renderSessionTimeoutDialog: false,
            subView: null,
            operations: null,
            shortcutButtons: null,
            collapsed: false,
            timer: null,
            sessionTimeOut: null,
        };
        this._isMounted = false;
        this.simulateBarCodeScannerEnabled = false;
        this.handleLogoutBySideBar = this.handleLogoutBySideBar.bind(this);
        this.getTranslations = this.getTranslations.bind(this);
        PrimeReact.ripple = true;
        PrimeReact.zIndex = {
            modal: 1100,
            overlay: 1000,
            menu: 1000,
            tooltip: 1100,
        };
        PrimeReact.appendTo = 'self';
        config({
            editorStylingMode: 'underlined',
        });
        ConsoleHelper('App version = ' + packageJson.version);
        this.handleCollapseChange = this.handleCollapseChange.bind(this);
    }
    sortConfig(configuration) {
        if (Array.isArray(configuration)) {
            return configuration.map((item) => this.sortConfig(item));
        }

        if (configuration !== null && typeof configuration === 'object') {
            return Object.keys(configuration)
                .sort()
                .reduce((sortedConfiguration, key) => {
                    sortedConfiguration[key] = this.sortConfig(configuration[key]);

                    return sortedConfiguration;
                }, {});
        }

        return configuration;
    }

    createConfigSnapshot(configuration) {
        return JSON.stringify(this.sortConfig(configuration || {}));
    }
    checkConfigChanged(configUrl) {
        return new ReadConfigService(configUrl).getConfiguration().then((configuration) => {
            const currentConfigSnapshot = this.createConfigSnapshot(configuration);

            const changed = this.lastConfigSnapshot !== null && this.lastConfigSnapshot !== currentConfigSnapshot;

            this.lastConfigSnapshot = currentConfigSnapshot;

            return {
                changed,
                configuration,
            };
        });
    }
    setFakeSessionTimeout() {
        const myDate = new Date();
        myDate.setSeconds(myDate.getSeconds() + 60);
        localStorage.setItem(CookiesName.SESSION_TIMEOUT, myDate);
        localStorage.setItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES, 1);
    }

    simulateBarCodeScanner() {
        if (this.simulateBarCodeScannerEnabled) {
            const scanner = new BarcodeScannerSimulator({
                value: '123123123',
            });
            setInterval(() => {
                scanner.run();
                console.log('Symulacja kodu wykonana');
            }, 15000);
        }
    }
    removeWatermark = () => {
        const existing = document.querySelector('dx-license');
        if (existing) {
            return;
        }
        const observer = new MutationObserver(() => {
            const el = document.querySelector('dx-license');
            if (el) {
                el.children[1].click();
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    };

    componentDidMount() {
        this.removeWatermark();
        this.simulateBarCodeScanner();
        const webSocket = new WebSocket();
        useStore.getState().setWebSocket(webSocket);
        if (!this._isMounted) {
            if (this.state.sessionMock) {
                this.setFakeSessionTimeout();
            }
            this.setState({loadedConfiguration: false}, () => {
                this.appInitialize();
            });
            this._isMounted = true;
        }
    }
    appInitialize = () => {
        const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        const configUrl = UrlUtils.makeConfigUrl(urlPrefixCookie);
        this.extendSessionByRootClick();

        const readAboutVersion = () => this.readAboutVersion(configUrl);
        const readHistory = () => this.readHistory(configUrl);

        const refreshGui = (forceReload) => {
            return this.refreshGui(configUrl, forceReload);
        };
        const checkConfigChanged = () => {
            return this.checkConfigChanged(configUrl);
        };
        const configValue = (parameterName, defaultValue) => {
            return this.getConfigValue(configUrl, parameterName, defaultValue);
        };
        getStore().setGetConfigValue(configValue);
        getStore().setReadAboutVersion(readAboutVersion);
        getStore().setReadHistoryVersion(readHistory);
        getStore().setRefreshGui(refreshGui);
        getStore().setCheckConfigChanged(checkConfigChanged);
        this.setRestateApp();
        this.setClearState();
        this.setRenderNoRefreshContent();
        this.showSessionTimeoutIfPossible();
        this.saveCookieUrlAfterLogin();

        this.readConfigAndSaveInCookie(configUrl, () => {
            this.setState({enableUpdateDialog: true});
        }).catch((err) => {
            console.error('Error start application = ', err);
        });

        this.readAboutVersion(configUrl).catch((err) => {
            console.error('Cant read version info = ', err);
        });
    };

    readAboutVersion = (configUrl) => {
        return new AboutVersionService(configUrl).getAboutVersion().then((response) => {
            const changeLog = response && Array.isArray(response.changeLog) ? response.changeLog : [];
            getStore().setAboutVersion(changeLog);
            return changeLog;
        });
    };

    readHistory(configUrl) {
        return new AboutVersionService(configUrl).getHistory().then((response) => {
            const changeLog = response && Array.isArray(response.changeLog) ? response.changeLog : [];
            getStore().setHistoryVersion(changeLog);
            return changeLog;
        });
    }

    componentDidUpdate() {
        this.showSessionTimeoutIfPossible();
    }
    saveCookieUrlAfterLogin() {
        if (!this.authService.isLoggedUser()) {
            const currentUrl = window.location.href;
            sessionStorage.setItem(CookiesName.URL_AFTER_LOGIN, currentUrl);
        }
    }
    onpopstate = () => {
        window.onpopstate = function () {
            const menuComponents = document.getElementsByClassName('menu-component');
            if (menuComponents[0]) {
                const root = document.getElementById('root');
                if (root) {
                    root.click();
                }
            }
        };
    };
    setRestateApp() {
        reStateApp = () => {
            this.forceUpdate();
        };
    }
    setClearState() {
        clearState = () => {
            this.setState(
                {
                    renderEditQuitConfirmDialog: false,
                    renderAboutVersionDialog: false,
                },
                () => {
                    setTimeout(() => {
                        clearTimeout(this.timer);
                        this.timer = undefined;
                    }, 100);
                }
            );
        };
    }
    setRenderNoRefreshContent() {
        renderNoRefreshContentFnc = () => {
            this.setState({
                renderNoRefreshContent: false,
            });
        };
    }
    extendSessionByRootClick() {
        const bodyApp = document.getElementById('body-app');
        const root = document.getElementById('root');
        const eventForSessionExtend = () => {
            if (this.authService.isLoggedUser()) this.extendSessionIfUserExist();
            return true;
        };
        sessionExtendFnc = eventForSessionExtend;
        bodyApp.addEventListener('click', eventForSessionExtend);
        root.addEventListener('click', eventForSessionExtend);
        bodyApp.addEventListener('contextmenu', eventForSessionExtend);
        document.addEventListener('wheel', eventForSessionExtend);
        root.addEventListener('contextmenu', eventForSessionExtend);
        bodyApp.addEventListener('keydown', eventForSessionExtend);
        root.addEventListener('keydown', eventForSessionExtend);
    }
    showSessionTimeoutIfPossible = () => {
        if (this.timer === undefined || this.timer === null) {
            this.timer = setInterval(() => {
                const isLoggedUser = this.authService.isLoggedUser();
                const textAfterHash = window.location.href.split('/#/')[1];
                const onLogoutUrl = !(textAfterHash && textAfterHash.trim() !== '');
                if (isLoggedUser) {
                    this.showSessionTimedOut();
                } else {
                    if (onLogoutUrl || !isLoggedUser) {
                        this.authService.logout();
                        return;
                    }
                }
            }, 1000);
        }
    };
    showSessionTimedOut() {
        const sessionTimeout = Date.parse(localStorage.getItem(CookiesName.SESSION_TIMEOUT));
        const tickerPopupDate = new Date();
        tickerPopupDate.setSeconds(tickerPopupDate.getSeconds() + 45);
        const duration = this.getDurationToLogout();
        const timeToLeaveSession = {
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds(),
        };
        const sessionTimeOutComponentRef = document.getElementById('session-time-out-component-ref');
        if (sessionTimeOutComponentRef) {
            sessionTimeOutComponentRef.innerText = PageViewUtils.tickerSessionTimeoutFormat(timeToLeaveSession);
        }
        if (duration.seconds() < 0) {
            this.authService.logout();
        }
        this.heartBeat();
        useStore.getState().webSocket?.connect();
        if (sessionTimeout < tickerPopupDate && !this.state?.renderSessionTimeoutDialog) {
            this.setState({renderSessionTimeoutDialog: true, secondsToPopupTicker: duration.seconds()}, () => {
                setTimeout(() => {
                    this.forceUpdate();
                }, 10);
            });
        }
    }
    heartBeat = () => {
        const heartbeatTimeMinutes = getStore().heartbeatTimeMinutes;
        if (heartbeatTimeMinutes) {
            const heartbeatDate = getStore().heartbeatDate;
            const now = new Date();
            if (heartbeatDate) {
                const hbDate = new Date(heartbeatDate);
                if (now < hbDate) {
                    return;
                } else {
                    updateHeartbeatDate();
                    this.heartBeatApply();
                }
            } else {
                updateHeartbeatDate();
                this.heartBeatApply();
            }
        }
    };

    heartBeatApply = () => {
        this.heartbeatService.heartbeat().then((res) => {
            if (res?.status === 'NOK') {
                this.authService.logout();
                const message =
                    typeof res?.message === 'object'
                        ? res?.message?.text ?? res?.message?.title ?? JSON.stringify(res?.message)
                        : res?.message ?? 'Wystąpił błąd sesji';
                this.messages?.show({
                    severity: 'error',
                    sticky: false,
                    life: 10000,
                    summary: message,
                });
            }
        });
    };
    isDurationFromSessionTimeoutPositive() {
        const duration = this.getDurationToLogout();
        return duration.asMilliseconds() > 5000;
    }
    getDurationToLogout() {
        const sessionTimeout = Date.parse(localStorage.getItem(CookiesName.SESSION_TIMEOUT));
        const now = new Date();
        return moment.duration(sessionTimeout - now);
    }
    extendSessionIfUserExist(fromDialogSession, callBack) {
        const loggedUser = this.authService.isLoggedUser();
        if (loggedUser) {
            const timeInMinutes = localStorage.getItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES);
            const canExtendSession =
                (timeInMinutes && fromDialogSession) || (timeInMinutes && !this.state?.renderSessionTimeoutDialog);
            if (canExtendSession) {
                const sessionTimeout = moment(new Date()).add(timeInMinutes, 'm').toString();
                localStorage.setItem(CookiesName.SESSION_TIMEOUT, sessionTimeout);
                if (callBack) {
                    callBack();
                }
            }
        }
    }
    componentWillUnmount() {
        this.unregisteredEventForSession();
        clearTimeout(this.timer);
        this.timer = undefined;
        this._isMounted = false;
        this.authService.removeLoginCookies();
        SessionStoreUtils.clearClickedRowFromView();
    }
    unregisteredEventForSession() {
        const bodyApp = document.getElementById('body-app');
        const root = document.getElementById('root');
        try {
            if (sessionExtendFnc) {
                bodyApp.removeEventListener('click', sessionExtendFnc);
                bodyApp.removeEventListener('keydown', sessionExtendFnc);
                bodyApp.removeEventListener('scroll', sessionExtendFnc);
                root.removeEventListener('click', sessionExtendFnc);
                root.removeEventListener('keydown', sessionExtendFnc);
                root.removeEventListener('scroll', sessionExtendFnc);
                document.addEventListener('wheel', sessionExtendFnc);
            }
        } catch (err) {
            console.log(err);
        }
    }
    getConfigValue(configUrl, parameterName, defaultValue = null) {
        return new ReadConfigService(configUrl).getConfiguration().then((configuration) => {
            const value = configuration[parameterName];
            return value !== undefined && value !== null ? value : defaultValue;
        });
    }
    readConfigAndSaveInCookie(configUrl, afterSaveCookiesFnc) {
        return new ReadConfigService(configUrl).getConfiguration().then((configuration) => {
            document.title = !StringUtils.isBlank(configuration.APP_FULL_NAME)
                ? configuration.APP_FULL_NAME
                : configuration.APP_NAME;
            const lang = configuration.LANG;
            const langs = configuration.LANG_LIST;
            const renderForgotPassword = !StringUtils.isBlank(configuration?.FORTOGPASSWORD_VIEWID);
            const renderSignIn = !StringUtils.isBlank(configuration?.SIGNIN_VIEWID);
            const canRenderAboutVersionDialog = !StringUtils.isBlank(configuration?.SHOW_VERSION_DIALOG)
                ? Boolean(configuration?.SHOW_VERSION_DIALOG)
                : false;
            const deviceName = configuration.DEVICE_NAME;
            const disableLoginPage = configuration.DISABLE_LOGIN_PAGE;
            const appName = configuration.APP_NAME;
            const captcha = configuration.CAPTCHA;
            const showHintListButtons = configuration.SHOW_HINT_LIST_BUTTONS;
            const showMerge = configuration.SHOW_MERGE;
            const rememberMe = configuration.REMEMBER_ME;
            const barCodeShowMethod = configuration.BAR_CODE_SHOW_METHOD;
            const heartbeatTimeMinutes = configuration.HEARTBEAT_TIME_MINUTES;
            const draggableGridEnabled = configuration.DRAGGABLE_GRID_ENABLED;
            const chatAi = configuration.CHAT_AI;
            const wssUrl = configuration.WSS_URL;
            const updateApp = configuration.UPDATE_APP;
            const biWorkingMode = configuration.BI_WORKING_MODE;
            const biReloadInMiliseconds = configuration.BI_RELOAD_IN_MILISECONDS;
            const biBeUrl = configuration.BI_BE_URL;
            const showMarkupOnHtmlEditor = configuration.SHOW_MARKUP_ON_HTML_EDITOR;
            const appVersion = packageJson.version + '_' + process.env.REACT_APP_BUILD_NUMBER;
            this.setState({
                canRenderAboutVersionDialog: canRenderAboutVersionDialog,
                configApp: {
                    lang,
                    langs,
                    renderForgotPassword,
                    renderSignIn,
                    appName,
                    deviceName,
                    appVersion,
                },
            });
            getStore().setUpdateApp(updateApp);
            getStore().setDisableLoginPage(disableLoginPage);
            getStore().setBiWorkingMode(biWorkingMode);
            getStore().setBiReloadInMiliseconds(biReloadInMiliseconds);
            getStore().setBiBeUrl(biBeUrl);
            getStore().setWssUrl(wssUrl);
            getStore().setCaptcha(captcha);
            getStore().setRememberMe(rememberMe);
            getStore().setBarCodeShowMethod(barCodeShowMethod);
            getStore().setHeartbeatTimeMinutes(heartbeatTimeMinutes);
            getStore().setDraggableGridEnabled(draggableGridEnabled);
            getStore().setMessages(this.messages);
            getStore().setShowHintListButtons(showHintListButtons);
            getStore().setShowMerge(showMerge);
            getStore().setAppVersion(appVersion);
            getStore().setChatAi(chatAi);
            getStore().setAppName(appName);
            getStore().setDeviceName(deviceName);
            getStore().setShowMarkupOnHtmlEditor(showMarkupOnHtmlEditor);
            saveObjToCookieGlobal(CookiesName.APP_VERSION, appVersion);
            saveObjToCookieGlobal(CookiesName.DEVICE_NAME, deviceName);
            saveObjToCookieGlobal(CookiesName.APP_NAME, appName);
            saveObjToCookieGlobal(CookiesName.REACT_APP_BACKEND_URL, configuration.REACT_APP_BACKEND_URL);
            saveObjToCookieGlobal(CookiesName.REACT_APP_URL_PREFIX, configuration.REACT_APP_URL_PREFIX);
            saveObjToCookieGlobal(CookiesName.CONFIG_URL, configUrl);
            if (afterSaveCookiesFnc) {
                afterSaveCookiesFnc();
            }
            this.setState(
                {
                    loadedConfiguration: true,
                    config: configuration,
                    configUrl: configUrl,
                },
                () => {
                    if (this.authService.isLoggedUser()) {
                        this.getLocalization(configUrl);
                    }
                }
            );
        });
    }

    handleLogoutByTokenExpired(forceByButton) {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null, renderNoRefreshContent: false});
            if (!forceByButton) {
                this.messages?.show({
                    severity: 'error',
                    sticky: false,
                    life: 10000,
                    summary: LocUtils.locFromStoreWithDefault('Logout_User', 'Sesja wygasła'),
                    detail: LocUtils.locFromStoreWithDefault(
                        'Session_Expired',
                        'Nastąpiło wylogowanie użytkownika z powodu przekroczenia czasu bezczynności użytkownika'
                    ),
                });
            }
        }
    }

    closeConfirmationEditQuitDialog = (callBackFnc) => {
        this.setState(
            (prevState) => ({
                ...prevState,
                sidebarClickItemReactionEnabled: false,
                confirmationQuitDialog: {
                    menuItemClickedId: undefined,
                    callBackFnc: undefined,
                    render: false,
                },
            }),
            () => {
                this.setState({
                    sidebarClickItemReactionEnabled: true,
                });
                if (callBackFnc) {
                    callBackFnc();
                }
            }
        );
    };
    showEditQuitConfirmDialog(menuItemClickedId, callBackFnc) {
        this.setState((prevState) => ({
            ...prevState,
            confirmationQuitDialog: {
                menuItemClickedId,
                callBackFnc,
                render: true,
            },
        }));
    }
    acceptConfirmationEditQuitDialog = () => {
        const menuItemClickedId = this.state.confirmationQuitDialog?.menuItemClickedId;
        if (!StringUtils.isBlank(menuItemClickedId)) {
            this.closeConfirmationEditQuitDialog(() => {
                const itemToClick = document.getElementById(`menu_link_item_${menuItemClickedId}`);
                if (itemToClick) {
                    itemToClick.click();
                }
                this.setState({
                    sidebarClickItemReactionEnabled: true,
                });
            });
        } else {
            const callBackFnc = this.state.confirmationQuitDialog?.callBackFnc;
            this.closeConfirmationEditQuitDialog(callBackFnc);
        }
    };

    handleLogoutBySideBar() {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null, renderNoRefreshContent: false});
        }
    }
    refreshGui = (configUrl, forceReload = false) => {
        if (!forceReload) {
            return this.getLocalization(configUrl);
        }

        return this.authService
            .refresh()
            .catch((error) => {
                console.error('Nie udało się odświeżyć sesji przed przeładowaniem GUI:', error);
            })
            .then(() => {
                return this.getLocalization(configUrl);
            })
            .then((labels) => {
                return new Promise((resolve) => {
                    this.setState(
                        (prevState) => ({
                            guiRefreshKey: prevState.guiRefreshKey + 1,
                        }),
                        () => {
                            resolve(labels);
                        }
                    );
                });
            });
    };
    getLocalization(configUrl) {
        this.localizationService.reConfigureDomain();

        if (this.authService.isLoggedUser()) {
            try {
                const loggedUser = JSON.parse(localStorage.getItem(CookiesName.LOGGED_USER));

                const language = loggedUser && loggedUser.lang ? loggedUser.lang.toLowerCase() : 'pl';

                return this.getTranslations(configUrl, language);
            } catch (error) {
                console.error('Nie udało się odczytać języka użytkownika:', error);

                if (localStorage.getItem(CookiesName.LOGGED_USER) === null) {
                    this.authService.logout();
                }

                return Promise.reject(error);
            }
        }

        return this.getTranslations(configUrl, 'pl');
    }
    getTranslations(configUrl, language) {
        const localizationService = new LocalizationService(configUrl);
        const realLang = (language || 'pl').toLowerCase();
        const shortLang = realLang.substr(0, 2);

        return localizationService.getTranslationsFromFile('rd', realLang).then((response) => {
            const config = this.state.config || {};
            const langs = Array.isArray(config.LANG_LIST) ? config.LANG_LIST : [];
            const labels = {};
            const responseLabels = response && Array.isArray(response.labels) ? response.labels : [];

            responseLabels.forEach((label) => {
                labels[label.code] = label.caption;
            });

            return Promise.all([
                localizationService.getTranslationsFromFile('dev', realLang),
                localizationService.getTranslationsFromFile('primi', realLang),
            ]).then(([devExpressTranslation, primeReactTranslation]) => {
                const devTranslations = devExpressTranslation || {};

                responseLabels.forEach((label) => {
                    devTranslations[label.code] = label.caption;
                });

                loadMessages({
                    [shortLang]: devTranslations,
                });

                devExpressLocale(shortLang);

                if (primeReactTranslation && primeReactTranslation[shortLang]) {
                    addLocale(shortLang, primeReactTranslation[shortLang]);

                    primeReactLocale(shortLang);
                }

                useStore.getState().setLabels(labels);

                return new Promise((resolve) => {
                    this.setState(
                        {
                            langs: langs,
                            labels: labels,
                        },
                        () => {
                            resolve(labels);
                        }
                    );
                });
            });
        });
    }
    canRenderLogin = () => {
        return !this.authService.isLoggedUser();
    };

    renderLoginOrStartPage = (props) => {
        if (this.canRenderLogin()) {
            return this.renderLoginContainer(props);
        }
        if (!UrlUtils.isStartPage()) {
            window.location.href = window.location.href + 'start';
        }
    };

    renderLoginContainer(props) {
        return (
            <Login
                {...props}
                appState={this.state}
                onAfterLogin={() => {
                    const configUrl = UrlUtils.makeConfigUrl('');
                    this.readConfigAndSaveInCookie(configUrl, () => {
                        sessionStorage.setItem(CookiesName.LOGGED_IN, true);
                        const urlAfterLogin = sessionStorage.getItem(CookiesName.URL_AFTER_LOGIN);
                        sessionStorage.removeItem(CookiesName.URL_AFTER_LOGIN);
                        this.setState(
                            {
                                user: this.authService.getProfile().sub,
                                collapsed: false,
                            },
                            () => {
                                if (this.state.sessionMock) {
                                    this.setFakeSessionTimeout();
                                }
                                this.getLocalization(this.state.configUrl);
                                if (!StringUtils.isBlank(urlAfterLogin)) window.location.href = urlAfterLogin;
                            }
                        );
                    });
                }}
            />
        );
    }

    handleCollapseChange(collapsed) {
        this.setState({collapsed: collapsed});
    }

    canBeSubViewRender() {
        const {subView} = this.state;
        const parentIdExists = UrlUtils.parentIdParamExist();
        const recordIdExists = UrlUtils.recordIdParamExist();
        return !!subView && !StringUtils.isBlank(subView.headerColumns) && parentIdExists && recordIdExists;
    }

    enabledTopComponents() {
        const authService = this.authService;
        const isNotLogged = !authService.isLoggedUser();
        if (isNotLogged) {
            return false;
        }
        return true;
    }

    addButton = () => {
        const foundedOpADD = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_BUTTON);
        const foundedOpADDSpec = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_SPEC_BUTTON);
        if (foundedOpADD || foundedOpADDSpec) {
            const opADD = TranslationUtils.getOrCreateOpButton(
                this.state.operations,
                OperationType.OP_ADD_BUTTON,
                foundedOpADD ? foundedOpADD?.label : foundedOpADDSpec?.label
            );
            return (
                <ActionButton
                    rendered={opADD}
                    label={opADD?.label}
                    handleClick={(e) => {
                        this.viewContainer?.current?.addView(e);
                    }}
                />
            );
        }
    };

    showSidebar() {
        if (UrlUtils.isLoginPage()) {
            return false;
        }
        if (!UrlUtils.isLoginPage()) {
            if (this.authService.isLoggedUser()) {
                return true;
            }
        }
        return false;
    }

    getOpButton() {
        const foundedOpADD = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_BUTTON);
        const foundedOpADDSpec = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_SPEC_BUTTON);
        if (foundedOpADD || foundedOpADDSpec) {
            return TranslationUtils.getOrCreateOpButton(
                this.state.operations,
                OperationType.OP_ADD,
                foundedOpADD ? foundedOpADD?.label : foundedOpADDSpec?.label
            );
        }
        return null;
    }
    addSubViewClickedToParameter = () => {
        UrlUtils.addParameterToCurrentURL('isSubViewClicked', true);
    };
    render() {
        const authService = this.authService;
        const loggedIn = authService.isLoggedUser();
        return (
            <React.Fragment key={'gui-' + this.state.guiRefreshKey}>
                {this.state.enableUpdateDialog && loggedIn && (
                    <UpdateApp
                        disableLoginPageAction={() => {
                            authService.logout();
                        }}
                    />
                )}
                {this.state.renderAboutVersionDialog && this.state.canRenderAboutVersionDialog && (
                    <VersionPreviewDialog
                        visible={this.state.renderAboutVersionDialog}
                        onHide={() => {
                            this.setState({
                                renderAboutVersionDialog: false,
                            });
                        }}
                    />
                )}
                {this.state.renderSessionTimeoutDialog && (
                    <TickerSessionDialog
                        secondsToPopup={this.state.secondsToPopupTicker}
                        authService={authService}
                        visible={this.state.renderSessionTimeoutDialog}
                        onProlongSession={() => {
                            authService.refresh().then(() => {
                                this.extendSessionIfUserExist(true, () => {
                                    this.setState({
                                        renderSessionTimeoutDialog: false,
                                    });
                                });
                            });
                        }}
                        onLogout={() => {
                            authService.removeLoginCookies();
                            this.setState(
                                {
                                    renderSessionTimeoutDialog: false,
                                },
                                () => {
                                    this.handleLogoutByTokenExpired(true);
                                }
                            );
                        }}
                    />
                )}
                {this.state.confirmationQuitDialog?.render && (
                    <ConfirmationEditQuitDialog
                        onHide={this.closeConfirmationEditQuitDialog}
                        onAccept={this.acceptConfirmationEditQuitDialog}
                        visible={this.state.confirmationQuitDialog?.render}
                    />
                )}
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                {this.state.loadedConfiguration ? (
                    <HashRouter
                        history={this.historyBrowser}
                        getUserConfirmation={(message, callback) => {
                            const allowTransition = window.confirm(message);
                            callback(allowTransition);
                        }}
                    >
                        <div className={`${loggedIn ? 'app' : ''}`}>
                            {this.showSidebar() && (
                                <Sidebar
                                    onEditClick={(id) => {
                                        const parentId = UrlUtils.getParentId();
                                        const kindView = UrlUtils.getKindView();
                                        if (getStore().baseViewHandleEdit) {
                                            getStore().baseViewHandleEdit(id, undefined, parentId, kindView, undefined);
                                            if (getStore().baseViewBlockUi) getStore().baseViewBlockUi();
                                        }
                                    }}
                                    authService={this.authService}
                                    historyBrowser={this.historyBrowser}
                                    handleLogoutUser={() => this.handleLogoutBySideBar()}
                                    onShowEditQuitConfirmDialog={(menuItemClickedId) =>
                                        this.showEditQuitConfirmDialog(menuItemClickedId)
                                    }
                                    onShowAboutVersionDialog={() => {
                                        this.setState({
                                            renderAboutVersionDialog: true,
                                        });
                                    }}
                                    onClickItemHrefReactionEnabled={this.state.sidebarClickItemReactionEnabled}
                                    collapsed={true}
                                    handleCollapseChange={(e) => this.handleCollapseChange(e)}
                                />
                            )}
                            <main>
                                <div className={`${loggedIn ? 'container-fluid' : ''}`}>
                                    {this.state.renderNoRefreshContent && this.enabledTopComponents() ? (
                                        <React.Fragment>
                                            {Breadcrumb.render((callBackFnc) =>
                                                this.showEditQuitConfirmDialog(null, callBackFnc)
                                            )}
                                            <DivContainer colClass='row base-container-header'>
                                                <DivContainer
                                                    id='header-left'
                                                    colClass='col-xl-10 col-lg-10 col-md-9 col-sm-12'
                                                >
                                                    <div className='font-medium mb-2 view-info-name'>
                                                        {this.state.viewInfoName}
                                                    </div>
                                                </DivContainer>
                                                <DivContainer
                                                    id='header-right'
                                                    colClass='col-xl-2 col-lg-2 col-md-3 col-sm-12 to-right mb-2'
                                                    style={{paddingRight: '30px'}}
                                                >
                                                    {this.viewContainer?.current?.getGridViewType()?.toUpperCase() ===
                                                        'CARDVIEW' &&
                                                        this.getOpButton() && (
                                                            <ActionButton
                                                                rendered={true}
                                                                label={this.getOpButton().label}
                                                                handleClick={(e) => {
                                                                    this.viewContainer?.current?.addView(e);
                                                                }}
                                                            />
                                                        )}
                                                </DivContainer>
                                                <DivContainer id='header-content' colClass='col-12'></DivContainer>
                                            </DivContainer>
                                            <div style={{marginRight: '30px'}}>
                                                {this.canBeSubViewRender() ? (
                                                    <SubGridViewComponent
                                                        key={'sub'}
                                                        className='from-app'
                                                        handleOnInitialized={(ref) => (this.selectedDataGrid = ref)}
                                                        subView={this.state.subView}
                                                        handleRightHeadPanelContent={(e) => {
                                                            if (e.type === OperationType.OP_EDIT) {
                                                                this.addSubViewClickedToParameter();
                                                                this.viewContainer?.current?.editSubView(e);
                                                            } else if (e.type === OperationType.OP_ATTACHMENTS) {
                                                                this.addSubViewClickedToParameter();
                                                                this.viewContainer?.current?.handleRightHeadPanelContent(
                                                                    e
                                                                );
                                                            } else {
                                                                this.viewContainer?.current?.handleRightHeadPanelContent(
                                                                    e
                                                                );
                                                            }
                                                            saveValueToCookieGlobal(CookiesName.REFRESH_SUB_VIEW, true);
                                                        }}
                                                        handleOnEditClick={(e) => {
                                                            this.addSubViewClickedToParameter();
                                                            this.viewContainer?.current?.editSubView(e);
                                                            saveValueToCookieGlobal(CookiesName.REFRESH_SUB_VIEW, true);
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        </React.Fragment>
                                    ) : null}
                                    <Switch>
                                        <Route exact path='/' render={(props) => this.renderLoginOrStartPage(props)} />
                                        <Route
                                            exact
                                            path='/dashbi'
                                            render={(props) => {
                                                return <DashboardBiComponent />;
                                            }}
                                        />
                                        <Route path='/login' render={(props) => this.renderLoginContainer(props)} />
                                        {this.state.user && (
                                            <React.Fragment>
                                                <Route
                                                    path='/start'
                                                    render={() => {
                                                        return (
                                                            <AuthComponent
                                                                viewMode={'VIEW'}
                                                                historyBrowser={this.historyBrowser}
                                                            >
                                                                <DashboardContainer
                                                                    key={'Dashboard'}
                                                                    handleRenderNoRefreshContent={(
                                                                        renderNoRefreshContent
                                                                    ) => {
                                                                        this.setState({
                                                                            renderNoRefreshContent:
                                                                                renderNoRefreshContent,
                                                                        });
                                                                    }}
                                                                />
                                                            </AuthComponent>
                                                        );
                                                    }}
                                                />

                                                <Route
                                                    path='/grid-view/:id'
                                                    render={(props) => {
                                                        return (
                                                            <AuthComponent
                                                                viewMode={'VIEW'}
                                                                historyBrowser={this.historyBrowser}
                                                            >
                                                                <ViewContainer
                                                                    ref={this.viewContainer}
                                                                    id={props.match.params.id}
                                                                    handleRenderNoRefreshContent={(
                                                                        renderNoRefreshContent
                                                                    ) => {
                                                                        this.setState({
                                                                            renderNoRefreshContent:
                                                                                renderNoRefreshContent,
                                                                        });
                                                                    }}
                                                                    handleViewInfoName={(viewInfoName) => {
                                                                        this.setState({viewInfoName: viewInfoName});
                                                                    }}
                                                                    handleSubView={(subView) => {
                                                                        this.setState({subView: subView});
                                                                    }}
                                                                    handleOperations={(operations) => {
                                                                        this.setState({operations: operations});
                                                                    }}
                                                                    handleShortcutButtons={(shortcutButtons) => {
                                                                        this.setState({
                                                                            shortcutButtons: shortcutButtons,
                                                                        });
                                                                    }}
                                                                    collapsed={this.state.collapsed}
                                                                />
                                                            </AuthComponent>
                                                        );
                                                    }}
                                                />

                                                <Route
                                                    path='/edit-spec/:id'
                                                    render={(props) => {
                                                        return (
                                                            <AuthComponent
                                                                viewMode={'VIEW'}
                                                                historyBrowser={this.historyBrowser}
                                                            >
                                                                <EditSpecContainer
                                                                    onShowEditQuitConfirmDialog={(callBackFnc) =>
                                                                        this.showEditQuitConfirmDialog(
                                                                            null,
                                                                            callBackFnc
                                                                        )
                                                                    }
                                                                    ref={this.editSpecContainer}
                                                                    id={props.match.params.id}
                                                                    collapsed={this.state.collapsed}
                                                                    handleRenderNoRefreshContent={(
                                                                        renderNoRefreshContent
                                                                    ) => {
                                                                        this.setState({
                                                                            renderNoRefreshContent:
                                                                                renderNoRefreshContent,
                                                                        });
                                                                    }}
                                                                />
                                                            </AuthComponent>
                                                        );
                                                    }}
                                                />
                                                <Route
                                                    path='/batch/:id'
                                                    key={`batch`}
                                                    render={(props) => {
                                                        return (
                                                            <AuthComponent
                                                                viewMode={'VIEW'}
                                                                historyBrowser={this.historyBrowser}
                                                            >
                                                                <BatchContainer
                                                                    onShowEditQuitConfirmDialog={(callBackFnc) =>
                                                                        this.showEditQuitConfirmDialog(
                                                                            null,
                                                                            callBackFnc
                                                                        )
                                                                    }
                                                                    ref={this.editSpecContainer}
                                                                    id={props.match.params.id}
                                                                    handleRenderNoRefreshContent={(
                                                                        renderNoRefreshContent
                                                                    ) => {
                                                                        this.setState({
                                                                            renderNoRefreshContent:
                                                                                renderNoRefreshContent,
                                                                        });
                                                                    }}
                                                                    collapsed={this.state.collapsed}
                                                                />
                                                            </AuthComponent>
                                                        );
                                                    }}
                                                />
                                            </React.Fragment>
                                        )}
                                    </Switch>
                                </div>
                            </main>
                        </div>
                    </HashRouter>
                ) : (
                    <React.Fragment>
                        {LocUtils.locFromStoreWithDefault('App_Loading', 'Proszę czekać, trwa ładowanie aplikacji....')}
                    </React.Fragment>
                )}
                {useStore.getState().chatAi?.ENABLED && <Widget />}
            </React.Fragment>
        );
    }
}

export default App;

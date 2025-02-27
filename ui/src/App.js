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

export let clearState;
export let reStateApp;
export let renderNoRefreshContentFnc;
export let sessionPrelongFnc = null;
// TODO: załącnziki w gantt
// http://localhost:3000/#/grid-view/18941?filterId=3036&viewType=gantt&bc=W3sibmFtZSI6IldhbGlkYWNqYSIsImlkIjo2MDc5LCJ0eXBlIjoibWVudSJ9LHsibmFtZSI6IkdhbnR0IHRlc3QiLCJpZCI6MTg5NDEsInR5cGUiOiJ2aWV3IiwicGF0aCI6Ii8jL2dyaWQtdmlldy8xODk0MSJ9XQ

class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.authService = new AuthService();
        this.historyBrowser = this.history;
        this.selectedDataGrid = React.createRef();
        this.localizationService = new LocalizationService();
        this.viewContainer = React.createRef();
        this.editSpecContainer = React.createRef();
        this.state = {
            configApp: {
                lang: 'PL',
                renderForgotPassword: false,
                renderSignIn: false,
                langs: [],
                appName: undefined,
                deviceName: undefined,
                appVersion: undefined,
                captchaShow: undefined,
                captchaKey: undefined,
            },
            loadedConfiguration: false,
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
            rednerSessionTimeoutDialog: false,
            subView: null,
            operations: null,
            shortcutButtons: null,
            collapsed: false,
            timer: null,
            sessionTimeOut: null,
        };
        this._isMounted = false;
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
    setFakeSessionTimeout() {
        const myDate = new Date();
        myDate.setSeconds(myDate.getSeconds() + 60);
        localStorage.setItem(CookiesName.SESSION_TIMEOUT, myDate);
        localStorage.setItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES, 1);
    }
    componentDidMount() {
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
        this.prelongSessionByRootClick();
        this.setRestateApp();
        this.setClearState();
        this.setRenderNoRefreshContent();
        this.showSessionTimeoutIfPossible();
        this.readConfigAndSaveInCookie(configUrl).catch((err) => {
            console.error('Error start application = ', err);
        });
    };
    componentDidUpdate() {
        this.showSessionTimeoutIfPossible();
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
    prelongSessionByRootClick() {
        const bodyApp = document.getElementById('body-app');
        const root = document.getElementById('root');
        const eventForSessionPrelong = () => {
            if (this.authService.isLoggedUser()) this.prelongSessionIfUserExist();
            return true;
        };
        sessionPrelongFnc = eventForSessionPrelong;
        bodyApp.addEventListener('click', eventForSessionPrelong);
        root.addEventListener('click', eventForSessionPrelong);
        bodyApp.addEventListener('contextmenu', eventForSessionPrelong);
        document.addEventListener('wheel', eventForSessionPrelong);
        root.addEventListener('contextmenu', eventForSessionPrelong);
        bodyApp.addEventListener('keydown', eventForSessionPrelong);
        root.addEventListener('keydown', eventForSessionPrelong);
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
            sessionTimeOutComponentRef.innerText = PageViewUtils.tickerSessionTimeoutFormat(
                timeToLeaveSession,
                this.state.labels
            );
        }
        if (duration.seconds() < 0) {
            this.authService.logout();
        }
        if (sessionTimeout < tickerPopupDate && !this.state?.rednerSessionTimeoutDialog) {
            this.setState({rednerSessionTimeoutDialog: true, secondsToPopupTicker: duration.seconds()}, () => {
                setTimeout(() => {
                    // czasami buguje sie w podiwdoku wiec taki restate
                    this.forceUpdate();
                }, 10);
            });
        }
    }
    isDurationFromSessionTimeoutPositive() {
        const duration = this.getDurationToLogout();
        return duration.asMilliseconds() > 5000;
    }
    getDurationToLogout() {
        const sessionTimeout = Date.parse(localStorage.getItem(CookiesName.SESSION_TIMEOUT));
        const now = new Date();
        return moment.duration(sessionTimeout - now);
    }
    prelongSessionIfUserExist(fromDialogSession, callBack) {
        const loggedUser = this.authService.isLoggedUser();
        if (loggedUser) {
            const timeInMinutes = localStorage.getItem(CookiesName.SESSION_TIMEOUT_IN_MINUTES);
            const canPrelongSession =
                (timeInMinutes && fromDialogSession) || (timeInMinutes && !this.state?.rednerSessionTimeoutDialog);
            if (canPrelongSession) {
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
    }
    unregisteredEventForSession() {
        const bodyApp = document.getElementById('body-app');
        const root = document.getElementById('root');
        try {
            if (sessionPrelongFnc) {
                bodyApp.removeEventListener('click', sessionPrelongFnc);
                bodyApp.removeEventListener('keydown', sessionPrelongFnc);
                bodyApp.removeEventListener('scroll', sessionPrelongFnc);
                root.removeEventListener('click', sessionPrelongFnc);
                root.removeEventListener('keydown', sessionPrelongFnc);
                root.removeEventListener('scroll', sessionPrelongFnc);
                document.addEventListener('wheel', sessionPrelongFnc);
            }
        } catch (err) {
            console.log(err);
        }
    }

    readConfigAndSaveInCookie(configUrl, afterSaveCookiesFnc) {
        return new ReadConfigService(configUrl).getConfiguration().then((configuration) => {
            const lang = configuration.LANG;
            const langs = configuration.LANG_LIST;
            const renderForgotPassword = !StringUtils.isBlank(configuration?.FORTOGPASSWORD_VIEWID);
            const renderSignIn = !StringUtils.isBlank(configuration?.SIGNIN_VIEWID);
            const canRenderAboutVersionDialog = !StringUtils.isBlank(configuration?.SHOW_VERSION_DIALOG)
                ? Boolean(configuration?.SHOW_VERSION_DIALOG)
                : false;
            const deviceName = configuration.DEVICE_NAME;
            const appName = configuration.APP_NAME;
            const captchaShow = configuration.CAPTCHA_SHOW;
            const showHintListButtons = configuration.SHOW_HINT_LIST_BUTTONS;
            const showDashboardHeaders = configuration.SHOW_DASHBOARD_HEADERS;
            const showMarkupOnHtmlEditor = configuration.SHOW_MARKUP_ON_HTML_EDITOR;
            const showAddFromDashboard = configuration.SHOW_ADD_FROM_DASHBOARD;
            const captchaKey = configuration.CAPTCHA_KEY;
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
                    captchaShow,
                    captchaKey,
                },
            });
            useStore.getState().setShowDashboardHeaders(showDashboardHeaders);
            useStore.getState().setShowHintListButtons(showHintListButtons);
            useStore.getState().setShowAddFromDashboard(showAddFromDashboard);
            useStore.getState().setAppVersion(appVersion);
            useStore.getState().setAppName(appName);
            useStore.getState().setDeviceName(deviceName);
            useStore.getState().setShowMarkupOnHtmlEditor(showMarkupOnHtmlEditor);
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

    handleLogoutByTokenExpired(forceByButton, labels) {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null, renderNoRefreshContent: false});
            if (!forceByButton) {
                this.messages?.show({
                    severity: 'error',
                    sticky: false,
                    life: 10000,
                    summary: LocUtils.loc(labels, 'Logout_User', 'Sesja wygasła'),
                    detail: LocUtils.loc(
                        labels,
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
    getLocalization(configUrl) {
        this.localizationService.reConfigureDomain();
        if (this.authService.isLoggedUser()) {
            try {
                const language = JSON.parse(localStorage.getItem(CookiesName.LOGGED_USER)).lang.toLowerCase();
                // const language = 'ENG';
                this.getTranslations(configUrl, language);
            } catch (ex) {
                console.error(ex);
                if (localStorage.getItem(CookiesName.LOGGED_USER) === null) {
                    this.authService.logout();
                }
            }
        } else {
            this.getTranslations(configUrl, 'pl');
        }
    }
    getTranslations(configUrl, language) {
        const localizationService = new LocalizationService(configUrl);
        localizationService.getTranslationsFromFile('rd', language.toLowerCase()).then((res) => {
            const config = this.state.config;
            const langs = config.LANG_LIST;
            const realLang = language;
            const labels = {};
            if (res.labels) {
                res.labels.forEach((label) => (labels[label.code] = label.caption));
            }
            this.setState({langs, labels});
            const shortLang = realLang.toLowerCase().substr(0, 2);
            localizationService.getTranslationsFromFile('dev', realLang).then((devExpressTranslation) => {
                res.labels.forEach((label) => {
                    devExpressTranslation[label.code] = label.caption;
                });
                loadMessages({
                    [shortLang]: devExpressTranslation,
                });
                devExpressLocale(shortLang);
            });
            localizationService.getTranslationsFromFile('primi', realLang).then((primeReactTranslation) => {
                addLocale(shortLang, primeReactTranslation[shortLang]);
                primeReactLocale(shortLang);
            });
            useStore.getState().setLabels(labels);
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
                labels={this.state.labels}
                appState={this.state}
                onAfterLogin={() => {
                    const configUrl = UrlUtils.makeConfigUrl('');
                    this.readConfigAndSaveInCookie(configUrl, () => {
                        sessionStorage.setItem(CookiesName.LOGGED_IN, true);
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
        const {labels} = this.state;
        const foundedOpADD = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_BUTTON);
        const foundedOpADDSpec = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_SPEC_BUTTON);
        if (foundedOpADD || foundedOpADDSpec) {
            const opADD = TranslationUtils.getOrCreateOpButton(
                this.state.operations,
                labels,
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
        const {labels} = this.state;
        const foundedOpADD = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_BUTTON);
        const foundedOpADDSpec = TranslationUtils.getOpButton(this.state.operations, OperationType.OP_ADD_SPEC_BUTTON);
        if (foundedOpADD || foundedOpADDSpec) {
            return TranslationUtils.getOrCreateOpButton(
                this.state.operations,
                labels,
                OperationType.OP_ADD,
                foundedOpADD ? foundedOpADD?.label : foundedOpADDSpec?.label
            );
        }
        return null;
    }

    render() {
        const authService = this.authService;
        const {labels} = this.state;
        const loggedIn = authService.isLoggedUser();
        return (
            <React.Fragment>
                {this.state.renderAboutVersionDialog && this.state.canRenderAboutVersionDialog && (
                    <VersionPreviewDialog
                        onHide={() => {
                            this.setState({
                                renderAboutVersionDialog: false,
                            });
                        }}
                    />
                )}
                {this.state.rednerSessionTimeoutDialog && (
                    <TickerSessionDialog
                        secondsToPopup={this.state.secondsToPopupTicker}
                        labels={labels}
                        authService={authService}
                        visible={this.state.rednerSessionTimeoutDialog}
                        onProlongSession={() => {
                            console.log('refreshFromTickerSession');
                            authService.refresh().then(() => {
                                this.prelongSessionIfUserExist(true, () => {
                                    this.setState({
                                        rednerSessionTimeoutDialog: false,
                                    });
                                });
                            });
                        }}
                        onLogout={() => {
                            authService.removeLoginCookies();
                            this.setState(
                                {
                                    rednerSessionTimeoutDialog: false,
                                },
                                () => {
                                    this.handleLogoutByTokenExpired(true, labels);
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
                        labels={labels}
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
                                    authService={this.authService}
                                    historyBrowser={this.historyBrowser}
                                    handleLogoutUser={(forceByButton) =>
                                        this.handleLogoutBySideBar(forceByButton, this.state.labels)
                                    }
                                    onShowEditQuitConfirmDialog={(menuItemClickedId) =>
                                        this.showEditQuitConfirmDialog(menuItemClickedId)
                                    }
                                    onShowAboutVersionDialog={() => {
                                        this.setState({
                                            renderAboutVersionDialog: true,
                                        });
                                    }}
                                    onClickItemHrefReactionEnabled={this.state.sidebarClickItemReactionEnabled}
                                    labels={this.state.labels}
                                    collapsed={true}
                                    handleCollapseChange={(e) => this.handleCollapseChange(e)}
                                />
                            )}
                            <main>
                                <div className={`${loggedIn ? 'container-fluid' : ''}`}>
                                    {this.state.renderNoRefreshContent && this.enabledTopComponents() ? (
                                        <React.Fragment>
                                            {Breadcrumb.render(labels, (callBackFnc) =>
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
                                                        labels={labels}
                                                        handleRightHeadPanelContent={(e) => {
                                                            if (e.type === OperationType.OP_EDIT) {
                                                                this.viewContainer?.current?.editSubView(e);
                                                            } else {
                                                                this.viewContainer?.current?.handleRightHeadPanelContent(
                                                                    e
                                                                );
                                                            }
                                                            saveValueToCookieGlobal(CookiesName.REFRESH_SUB_VIEW, true);
                                                        }}
                                                        handleOnEditClick={(e) => {
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
                                                                    labels={labels}
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
                                                                    labels={labels}
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
                                                                    labels={labels}
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
                                                                    labels={labels}
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
                        {LocUtils.loc(labels, 'App_Loading', 'Proszę czekać, trwa ładowanie aplikacji....')}
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

export default App;

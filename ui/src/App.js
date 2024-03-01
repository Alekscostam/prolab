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
import AppPrefixUtils from './utils/AppPrefixUtils';
import packageJson from '../package.json';
import ReadConfigService from './services/ReadConfigService';
import {readObjFromCookieGlobal, saveValueToCookieGlobal, saveObjToCookieGlobal} from './utils/Cookie';
import LocalizationService from './services/LocalizationService';
import config from 'devextreme/core/config';
import ConsoleHelper from './utils/ConsoleHelper';
import SubGridViewComponent from './containers/dataGrid/SubGridViewComponent';
import DivContainer from './components/DivContainer';
import {Breadcrumb} from './utils/BreadcrumbUtils';
import {DataGridUtils} from './utils/component/DataGridUtils';
import ActionButton from './components/ActionButton';
import {Toast} from 'primereact/toast';
import LocUtils from './utils/LocUtils';
import {EditSpecContainer} from './containers/EditSpecContainer';
import moment from 'moment';
import {StringUtils} from './utils/StringUtils';
import {BatchContainer} from './containers/BatchContainer';
import {TickerSessionDialog} from './components/prolab/TickerSessionDialog';
import EditRowViewComponent from './components/prolab/EditRowViewComponent';
import UrlUtils from './utils/UrlUtils';
import {PageViewUtils} from './utils/parser/PageViewUtils';
import {ConfirmationEditQuitDialog} from './components/prolab/ConfirmationEditQuitDialog';
import AppContext from './context/AppContext';

// export const
export let reStateApp;
export let renderNoRefreshContentFnc;
export let sessionPrelongFnc = null;
export let addBtn = null;
// TODO: pole logiczne w działa zle w grupwoaniu na hederek
// TODO: nie ma block UI na widok kafelek
// TODO: w załacnzikach usunąć doklejanie urla
// TODO: zablokowac ekran w gancie w edycji
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
            loadedConfiguration: false,
            editData: undefined,
            secondsToPopupTicker: undefined,
            menuItemClickedId: undefined,
            renderEditQuitConfirmDialog: false,
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
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
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

    setFakeSeesionTimeout() {
        const myDate = new Date();
        myDate.setSeconds(myDate.getSeconds() + 60);
        localStorage.setItem('session_timeout', myDate);
        localStorage.setItem('session_timeout_in_minutes', 1);
    }
    componentDidMount() {
        if (this.state.sessionMock) {
            this.setFakeSeesionTimeout();
        }
        const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        const configUrl = this.makeConfigUrl(urlPrefixCookie);
        this.showSessionTimeoutIfPossible();
        this.prelongSeesionByRootClick();
        this.setRestateApp();
        this.setRenderNoRefreshContent();
        this.readConfigAndSaveInCookie(configUrl).catch((err) => {
            console.error('Error start application = ', err);
        });
    }
    componentDidUpdate() {
        this.showSessionTimeoutIfPossible();
    }

    makeConfigUrl(urlPrefix) {
        let browseUrl = window.location.href;
        const id = browseUrl.indexOf('/#');
        if (id > 0) {
            browseUrl = browseUrl.substring(0, id + 1);
        }
        return UrlUtils.notDefinedPrefix(urlPrefix)
            ? browseUrl
            : browseUrl.trim().match('^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)', '')[0] + '/' + urlPrefix;
    }

    setRestateApp() {
        reStateApp = () => {
            this.forceUpdate();
        };
    }
    setRenderNoRefreshContent() {
        renderNoRefreshContentFnc = () => {
            this.setState({
                renderNoRefreshContent: false,
            });
        };
    }
    prelongSeesionByRootClick() {
        const root = document.getElementById('root');
        const eventForSessionPrelong = () => {
            if (this.authService.isLoggedUser()) this.prelongSessionIfUserExist();
            return true;
        };
        sessionPrelongFnc = eventForSessionPrelong;
        root.addEventListener('click', eventForSessionPrelong);
        root.addEventListener('contextmenu', eventForSessionPrelong);
        root.addEventListener('keydown', eventForSessionPrelong);
    }
    showSessionTimeoutIfPossible() {
        if (this.timer === undefined || this.timer === null) {
            this.timer = setInterval(() => {
                const isExpired = this.authService.isTokenExpiredDate();
                const textAfterHash = window.location.href.split('/#/')[1];
                const onLogoutUrl = !(textAfterHash && textAfterHash.trim() !== '');
                if (isExpired) {
                    if (this.authService.isLoggedUser()) {
                        if (onLogoutUrl) {
                            this.authService.removeLoginCookies();
                        }
                    }
                } else {
                    if (this.authService.isLoggedUser()) {
                        this.showSessionTimedOut();
                    } else {
                        this.authService.logout();
                    }
                }
            }, 1000);
        }
    }

    showSessionTimedOut() {
        const sessionTimeout = Date.parse(localStorage.getItem('session_timeout'));
        const now = new Date();
        const tickerPopupDate = new Date();
        tickerPopupDate.setSeconds(tickerPopupDate.getSeconds() + 45);
        const duration = moment.duration(sessionTimeout - now);
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
        if (sessionTimeout < tickerPopupDate && !this.state?.rednerSessionTimeoutDialog) {
            this.setState({rednerSessionTimeoutDialog: true, secondsToPopupTicker: duration.seconds()}, () => {
                setTimeout(() => {
                    // czasami buguje sie w podiwdoku wiec taki restate
                    this.forceUpdate();
                }, 10);
            });
        }
    }

    prelongSessionIfUserExist(fromDialogSession, callBack) {
        const loggedUser = this.authService.isLoggedUser();
        if (loggedUser) {
            const timeInMinutes = localStorage.getItem('session_timeout_in_minutes');
            const canPrelongSession =
                (timeInMinutes && fromDialogSession) || (timeInMinutes && !this.state?.rednerSessionTimeoutDialog);
            if (canPrelongSession) {
                const sessionTimeout = moment(new Date()).add(timeInMinutes, 'm').toString();
                localStorage.setItem('session_timeout', sessionTimeout);
                if (callBack) {
                    callBack();
                }
            }
        }
    }

    componentWillUnmount() {
        this.unregisteredEventForSession();
        clearTimeout(this.timer);
        this.authService.removeLoginCookies();
    }
    unregisteredEventForSession() {
        const root = document.getElementById('root');
        try {
            if (sessionPrelongFnc) {
                root.removeEventListener('click', sessionPrelongFnc);
                root.removeEventListener('keydown', sessionPrelongFnc);
            }
        } catch (err) {
            console.log(err);
        }
    }

    readConfigAndSaveInCookie(configUrl) {
        return new ReadConfigService(configUrl).getConfiguration().then((configuration) => {
            saveObjToCookieGlobal('REACT_APP_BACKEND_URL', configuration.REACT_APP_BACKEND_URL);
            saveObjToCookieGlobal('REACT_APP_URL_PREFIX', configuration.REACT_APP_URL_PREFIX);
            saveObjToCookieGlobal('CONFIG_URL', configUrl);
            this.setState(
                {
                    loadedConfiguration: true,
                    config: configuration,
                    configUrl: configUrl,
                },
                () => {
                    if (this.authService.loggedIn()) {
                        this.getLocalization(configUrl);
                    }
                }
            );
        });
    }

    handleLogoutUser(forceByButton, labels) {
        // puste poki co
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

    handleLogoutBySideBar() {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null, renderNoRefreshContent: false});
        }
    }

    getLocalization(configUrl) {
        this.localizationService.reConfigureDomain();
        if (this.authService.loggedIn()) {
            try {
                const language = JSON.parse(localStorage.getItem('logged_user')).lang.toLowerCase();
                this.getTranslations(configUrl, language);
            } catch (ex) {
                console.log(ex);
                if (localStorage.getItem('logged_user') === null) {
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
        });
    }

    readTextFile(file, callback) {
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType('application/json');
        rawFile.open('GET', file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status === '200') {
                callback(rawFile.responseText);
            }
        };
        rawFile.send(null);
    }

    renderLoginContainer(props) {
        return (
            <Login
                {...props}
                onAfterLogin={() => {
                    this.setState(
                        {
                            user: this.authService.getProfile().sub,
                            collapsed: false,
                        },
                        () => {
                            if (this.state.sessionMock) {
                                this.setFakeSeesionTimeout();
                            }
                            this.getLocalization(this.state.configUrl);
                        }
                    );
                }}
            />
        );
    }
    handleCollapseChange(collapsed) {
        this.setState({collapsed: collapsed});
    }
    haveSubViewColumns() {
        const {subView} = this.state;
        return !!subView && !StringUtils.isBlank(subView.headerColumns);
    }
    enabledSidebar() {
        const authService = this.authService;
        const tokenExpired = authService.isTokenExpiredDate();
        if (UrlUtils.isEditRowView()) {
            return false;
        }
        if (tokenExpired) {
            return false;
        }
        return true;
    }
    onShowEditQuitConfirmDialog(menuItemClickedId) {
        this.setState(() => ({
            menuItemClickedId,
            renderEditQuitConfirmDialog: true,
        }));
    }
    addButton = () => {
        const {labels} = this.state;
        const opADD = DataGridUtils.putToOperationsButtonIfNeccessery(this.state.operations, labels, 'OP_ADD', 'Dodaj');
        return (
            <ActionButton
                rendered={opADD}
                label={opADD?.label}
                handleClick={(e) => {
                    this.viewContainer?.current?.addView(e);
                }}
            />
        );
    };

    render() {
        const authService = this.authService;
        const {labels} = this.state;
        const loggedIn = authService.loggedIn();
        return (
            <React.Fragment>
                <AppContext.Provider value={{}}>
                    {this.state.rednerSessionTimeoutDialog && (
                        <TickerSessionDialog
                            secondsToPopup={this.state.secondsToPopupTicker}
                            labels={labels}
                            authService={this.authService}
                            visible={this.state.rednerSessionTimeoutDialog}
                            onProlongSession={() => {
                                this.authService.refresh().then(() => {
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

                    {this.state.renderEditQuitConfirmDialog && (
                        <ConfirmationEditQuitDialog
                            onHide={() => {
                                this.setState({
                                    renderEditQuitConfirmDialog: false,
                                    menuItemClickedId: undefined,
                                });
                            }}
                            onAccept={() => {
                                const menuItemClickedId = this.state.menuItemClickedId;
                                this.setState(
                                    {
                                        renderEditQuitConfirmDialog: false,
                                        sidebarClickItemReactionEnabled: false,
                                        menuItemClickedId: undefined,
                                    },
                                    () => {
                                        const itemToClick = document.getElementById(
                                            `menu_link_item_${menuItemClickedId}`
                                        );
                                        if (itemToClick) {
                                            itemToClick.click();
                                        }
                                        this.setState({
                                            sidebarClickItemReactionEnabled: true,
                                        });
                                    }
                                );
                            }}
                            visible={this.state.renderEditQuitConfirmDialog}
                            labels={labels}
                            menuItemId={this.state.menuItemClickedId}
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
                                {this.enabledSidebar() && (
                                    <Sidebar
                                        authService={this.authService}
                                        historyBrowser={this.historyBrowser}
                                        handleLogoutUser={(forceByButton) =>
                                            this.handleLogoutBySideBar(forceByButton, this.state.labels)
                                        }
                                        onShowEditQuitConfirmDialog={(menuItemClickedId) =>
                                            this.onShowEditQuitConfirmDialog(menuItemClickedId)
                                        }
                                        onClickItemHrefReactionEnabled={this.state.sidebarClickItemReactionEnabled}
                                        labels={this.state.labels}
                                        collapsed={this.state.collapsed}
                                        handleCollapseChange={(e) => this.handleCollapseChange(e)}
                                    />
                                )}
                                <main>
                                    <div className={`${loggedIn ? 'container-fluid' : ''}`}>
                                        {this.state.renderNoRefreshContent && this.enabledSidebar() ? (
                                            <React.Fragment>
                                                {Breadcrumb.render(labels)}
                                                <DivContainer colClass='row base-container-header'>
                                                    <DivContainer id='header-left' colClass='col-11'>
                                                        <div className='font-medium mb-2 view-info-name'>
                                                            {this.state.viewInfoName}
                                                        </div>
                                                    </DivContainer>
                                                    <DivContainer id='header-content' colClass='col-12'></DivContainer>
                                                </DivContainer>
                                                <div style={{marginRight: '30px'}}>
                                                    {this.haveSubViewColumns() ? (
                                                        <SubGridViewComponent
                                                            key={'sub'}
                                                            handleOnInitialized={(ref) => (this.selectedDataGrid = ref)}
                                                            subView={this.state.subView}
                                                            labels={labels}
                                                            handleRightHeadPanelContent={(e) => {
                                                                this.viewContainer?.current?.handleRightHeadPanelContent(
                                                                    e
                                                                );
                                                                saveValueToCookieGlobal('refreshSubView', true);
                                                            }}
                                                            handleOnEditClick={(e) => {
                                                                this.viewContainer?.current?.editSubView(e);
                                                                saveValueToCookieGlobal('refreshSubView', true);
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                            </React.Fragment>
                                        ) : null}
                                        <Switch>
                                            <Route
                                                exact
                                                path='/'
                                                render={(props) => this.renderLoginContainer(props)}
                                            />
                                            <Route path='/login' render={(props) => this.renderLoginContainer(props)} />
                                            {this.state.user && (
                                                <React.Fragment>
                                                    <Route
                                                        key={`edit-row-view`}
                                                        path='/edit-row-view/:id'
                                                        render={() => {
                                                            return (
                                                                <AuthComponent
                                                                    viewMode={'VIEW'}
                                                                    historyBrowser={this.historyBrowser}
                                                                    handleLogout={(forceByButton) =>
                                                                        this.handleLogoutUser(forceByButton)
                                                                    }
                                                                >
                                                                    <EditRowViewComponent
                                                                        key={'edit-row-component'}
                                                                        labels={labels}
                                                                        historyBrowser={this.historyBrowser}
                                                                        editData={this.state.editData}
                                                                        editDataChange={(editData) => {
                                                                            this.setState({
                                                                                editData: editData,
                                                                            });
                                                                        }}
                                                                    ></EditRowViewComponent>
                                                                </AuthComponent>
                                                            );
                                                        }}
                                                    />
                                                    <Route
                                                        path='/start'
                                                        render={() => {
                                                            return (
                                                                <AuthComponent
                                                                    viewMode={'VIEW'}
                                                                    historyBrowser={this.historyBrowser}
                                                                    handleLogout={(forceByButton) =>
                                                                        this.handleLogoutUser(forceByButton)
                                                                    }
                                                                >
                                                                    <DashboardContainer
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
                                                                    handleLogout={(forceByButton) =>
                                                                        this.handleLogoutUser(forceByButton)
                                                                    }
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
                                                                    handleLogout={(forceByButton) =>
                                                                        this.handleLogoutUser(forceByButton)
                                                                    }
                                                                >
                                                                    <EditSpecContainer
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
                                                                    handleLogout={(forceByButton) =>
                                                                        this.handleLogoutUser(forceByButton)
                                                                    }
                                                                >
                                                                    <BatchContainer
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
                </AppContext.Provider>
            </React.Fragment>
        );
    }
}

export default App;

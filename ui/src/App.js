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
import {Dialog} from 'primereact/dialog';
import {Button} from 'react-bootstrap';
import {StringUtils} from './utils/StringUtils';

let clickEventSeesion = null;
class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.authService = new AuthService();
        this.historyBrowser = this.history;
        this.selectedDataGrid = React.createRef();
        // this.progressBarRef = React.createRef();
        this.localizationService = new LocalizationService();
        this.viewContainer = React.createRef();
        this.editSpecContainer = React.createRef();
        this.state = {
            loadedConfiguration: false,
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
            // tickerForEndSession: null,
            sessionTimeOut: null,
        };
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleLogoutBySideBar = this.handleLogoutBySideBar.bind(this);
        this.getTranslations = this.getTranslations.bind(this);
        //primereact config
        PrimeReact.ripple = true;
        PrimeReact.zIndex = {
            modal: 1100, // dialog, sidebar
            overlay: 1000, // dropdown, overlaypanel
            menu: 1000, // overlay menus
            tooltip: 1100, // tooltip
        };
        PrimeReact.appendTo = 'self'; // Default value is null(document.body).
        //dexexpress localization

        // loadMessages({
        //     'pl': translationPL,
        //     'en' : translationENG,
        //     'de' : translationDE,
        // });
        config({
            editorStylingMode: 'underlined',
        });
        ConsoleHelper('App version = ' + packageJson.version);
        this.handleCollapseChange = this.handleCollapseChange.bind(this);
    }

    // componentDidMount() {
    //     let browseUrl = window.location.href;
    //     const id = browseUrl.indexOf('/#');
    //     if (id > 0) {
    //         browseUrl = browseUrl.substring(0, id + 1);
    //     }
    //     let configUrl;
    //     const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
    //     if (urlPrefixCookie === undefined || urlPrefixCookie == null || urlPrefixCookie === '') {
    //         configUrl = browseUrl;
    //         // .trim()
    //         // .replaceAll("/#/", "/")
    //         // .replaceAll("/#", "")
    //         // .replaceAll("#/", "");
    //     } else {
    //         configUrl = browseUrl.trim().match('^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)', '')[0] + '/' + urlPrefixCookie;
    //     }

    //     this.readConfigAndSaveInCookie(configUrl).catch((err) => {
    //         console.error('Error start application = ', err);
    //     });

    //     this.timer = setInterval(() => {
    //         const sessionTimeout = Date.parse(localStorage.getItem('session_timeout'));
    //         let t = new Date();
    //         t.setSeconds(t.getSeconds() + 30);
    //         console.log(!this.state?.rednerSessionTimeoutDialog);
    //         if (sessionTimeout < t && !this.state?.rednerSessionTimeoutDialog) {
    //             // this.setState({rednerSessionTimeoutDialog: true});
    //             // this.handleLogoutByTokenExpired();
    //         }
    //     }, 1000);

    //     const root = document.getElementById('root');
    //     const clickEventForSession = function () {
    //         const user = localStorage.getItem('logged_user');
    //         if (user) {
    //             const timeInMinutes = localStorage.getItem('session_timeout_in_minutes');
    //             if (timeInMinutes && !this.state?.rednerSessionTimeoutDialog) {
    //                 const sessionTimeout = moment(new Date()).add(timeInMinutes, 'm').toString();
    //                 localStorage.setItem('session_timeout', sessionTimeout);
    //             }
    //         }
    //         return true;
    //     };
    //     clickEventSeesion = clickEventForSession;
    //     root.addEventListener('click', clickEventForSession);
    // }

    componentDidMount() {
        let browseUrl = window.location.href;
        const id = browseUrl.indexOf('/#');
        if (id > 0) {
            browseUrl = browseUrl.substring(0, id + 1);
        }
        let configUrl;
        const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        if (urlPrefixCookie === undefined || urlPrefixCookie == null || urlPrefixCookie === '') {
            configUrl = browseUrl;
            // .trim()
            // .replaceAll("/#/", "/")
            // .replaceAll("/#", "")
            // .replaceAll("#/", "");
        } else {
            configUrl = browseUrl.trim().match('^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)', '')[0] + '/' + urlPrefixCookie;
        }

        this.readConfigAndSaveInCookie(configUrl).catch((err) => {
            console.error('Error start application = ', err);
        });

        this.timer = setInterval(() => {
            const sessionTimeout = Date.parse(localStorage.getItem('session_timeout'));
            if (sessionTimeout < new Date()) {
                this.handleLogoutByTokenExpired();
            }
        }, 3000);

        const root = document.getElementById('root');
        const clickEventForSession = function () {
            const user = localStorage.getItem('logged_user');
            if (user) {
                const timeInMinutes = localStorage.getItem('session_timeout_in_minutes');
                if (timeInMinutes) {
                    const sessionTimeout = moment(new Date()).add(timeInMinutes, 'm').toString();
                    localStorage.setItem('session_timeout', sessionTimeout);
                }
            }
            return true;
        };
        clickEventSeesion = clickEventForSession;
        root.addEventListener('click', clickEventForSession);
    }
    componentWillUnmount() {
        this.unregisteredClickEventForSession();
        clearTimeout(this.timer);
        // clearTimeout(this.tickerForEndSession);
    }
    unregisteredClickEventForSession() {
        const root = document.getElementById('root');
        try {
            if (clickEventSeesion) {
                root.removeEventListener('click', clickEventSeesion);
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
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
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
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
        }
    }

    getLocalization(configUrl) {
        this.localizationService.reConfigureDomain();
        if (this.authService.loggedIn()) {
            const language = JSON.parse(localStorage.getItem('logged_user')).lang.toLowerCase();
            this.getTranslations(configUrl, language);
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
            /* init dev express translations */
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
            /* init primereact translations */
            localizationService.getTranslationsFromFile('primi', realLang).then((primeReactTranslation) => {
                addLocale(shortLang, primeReactTranslation[shortLang]);
                primeReactLocale(shortLang);
            });
        });
    }

    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
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

    // renderTickerForEndSession() {
    //     let seconds = 60;
    //     if (localStorage.getItem('ticker-startc') !== 'true') {
    //         localStorage.setItem('ticker-startc', 'true');
    //         this.tickerForEndSession = setInterval(() => {
    //             seconds--;
    //             document.getElementById('time-ticker').innerText = seconds;
    //             if (seconds <= 0) {
    //                 clearInterval(this.tickerForEndSession);
    //                 localStorage.setItem('ticker-startc', 'false');
    //                 this.setState({rednerSessionTimeoutDialog: false});
    //                 this.handleLogoutByTokenExpired();
    //             }
    //         }, 1000);
    //     }
    // }

    haveSubViewColumns() {
        const {subView} = this.state;
        return !!subView && !StringUtils.isBlank(subView.headerColumns);
    }

    render() {
        const authService = this.authService;
        const {labels} = this.state;
        const loggedIn = authService.loggedIn();
        let opADD = DataGridUtils.containsOperationsButton(this.state.operations, 'OP_ADD');
        return (
            <React.Fragment>
                {/* {this.state.rednerSessionTimeoutDialog && (
                    <Dialog
                        id='sessionTimeoutDialog'
                        header={'Sesja wygasa'}
                        footer={
                            <React.Fragment>
                                <div>
                                    <Button
                                        type='button'
                                        onClick={() => {
                                            const timeInMinutes = localStorage.getItem('session_timeout_in_minutes');
                                            if (timeInMinutes && !this.state?.rednerSessionTimeoutDialog) {
                                                const sessionTimeout = moment(new Date())
                                                    .add(timeInMinutes, 'm')
                                                    .toString();
                                                localStorage.setItem('session_timeout', sessionTimeout);
                                            }
                                            this.onHide();
                                        }}
                                        label={LocUtils.loc(this.props.labels, 'Publish_next', 'Dalej')}
                                    >
                                        Przedłuż
                                    </Button>
                                </div>
                            </React.Fragment>
                        }
                        minX={'1200px'}
                        visible={this.state.rednerSessionTimeoutDialog}
                        resizable={false}
                        breakpoints={{'1260px': '75vw', '840px': '100vw'}}
                        onHide={() => this.onHide()}
                    >
                        {this.renderTickerForEndSession()}
                        Czas do wygaśniecia sesji <span id='time-ticker '>23</span>
                    </Dialog>
                )} */}

                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                {this.state.loadedConfiguration ? (
                    <HashRouter
                        history={this.historyBrowser}
                        getUserConfirmation={(message, callback) => {
                            // this is the default behavior
                            const allowTransition = window.confirm(message);
                            callback(allowTransition);
                        }}
                    >
                        <div className={`${loggedIn ? 'app' : ''}`}>
                            {loggedIn ? (
                                <Sidebar
                                    authService={this.authService}
                                    historyBrowser={this.historyBrowser}
                                    handleLogoutUser={(forceByButton) =>
                                        this.handleLogoutBySideBar(forceByButton, this.state.labels)
                                    }
                                    labels={this.state.labels}
                                    collapsed={this.state.collapsed}
                                    handleCollapseChange={(e) => this.handleCollapseChange(e)}
                                />
                            ) : null}
                            <main>
                                <div className={`${loggedIn ? 'container-fluid' : ''}`}>
                                    {this.state.renderNoRefreshContent ? (
                                        <React.Fragment>
                                            {Breadcrumb.render(labels)}
                                            <DivContainer colClass='row base-container-header'>
                                                <DivContainer id='header-left' colClass='col-11'>
                                                    <div className='font-medium mb-4'> {this.state.viewInfoName}</div>
                                                </DivContainer>
                                                <DivContainer id='header-right' colClass='col-1 to-right'>
                                                    <ActionButton
                                                        rendered={opADD}
                                                        label={opADD?.label}
                                                        handleClick={(e) => {
                                                            this.viewContainer?.current?.addView(e);
                                                        }}
                                                    />
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
                                                            this.viewContainer?.current?.handleRightHeadPanelContent(e);
                                                            saveValueToCookieGlobal('refreshSubView', true);
                                                        }}
                                                        handleOnEditClick={(e) => {
                                                            //TODO antypattern :P
                                                            this.viewContainer?.current?.editSubView(e);
                                                            saveValueToCookieGlobal('refreshSubView', true);
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        </React.Fragment>
                                    ) : null}
                                    <Switch>
                                        <Route exact path='/' render={(props) => this.renderLoginContainer(props)} />
                                        <Route path='/login' render={(props) => this.renderLoginContainer(props)} />
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
                                                            handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                this.setState({
                                                                    renderNoRefreshContent: renderNoRefreshContent,
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
                                                            handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                this.setState({
                                                                    renderNoRefreshContent: renderNoRefreshContent,
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
                                                                this.setState({shortcutButtons: shortcutButtons});
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
                                                            handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                this.setState({
                                                                    renderNoRefreshContent: renderNoRefreshContent,
                                                                });
                                                            }}
                                                        />
                                                    </AuthComponent>
                                                );
                                            }}
                                        />
                                        <Route
                                            path='/batch/:id'
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
                                                            handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                this.setState({
                                                                    renderNoRefreshContent: renderNoRefreshContent,
                                                                });
                                                            }}
                                                        />
                                                    </AuthComponent>
                                                );
                                            }}
                                        />
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

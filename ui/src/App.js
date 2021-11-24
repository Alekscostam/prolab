import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import DashboardContainer from './containers/DashboardContainer';
import AuthService from './services/AuthService';
import AuthComponent from './components/AuthComponent';
import PrimeReact, {addLocale, locale as primeReactLocale} from 'primereact/api';
import "@fontsource/roboto"
import {ViewContainer} from "./containers/ViewContainer";
import {createBrowserHistory} from 'history';
import {loadMessages, locale as devExpressLocale} from "devextreme/localization";
import AppPrefixUtils from "./utils/AppPrefixUtils";
import packageJson from '../package.json';
import ReadConfigService from "./services/ReadConfigService";
import {readCookieGlobal, saveCookieGlobal} from "./utils/Cookie";
import LocalizationService from './services/LocalizationService';
import config from "devextreme/core/config";
import ConsoleHelper from "./utils/ConsoleHelper";
import SelectedGridViewComponent from "./containers/dataGrid/SelectedGridViewComponent";
import DivContainer from "./components/DivContainer";
import {Breadcrumb} from "./utils/BreadcrumbUtils";
import {GridViewUtils} from "./utils/GridViewUtils";
import ActionButton from "./components/ActionButton";

class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.authService = new AuthService();
        this.historyBrowser = this.history;
        this.localizationService = new LocalizationService();
        this.state = {
            loadedConfiguration: false,
            configUrl: null,
            user: this.authService.getProfile(),
            langs: [],
            labels: [],
            renderNoRefreshContent: false,
            viewInfoName: null,
            subView: null,
            operations: null,
            shortcutButtons: null
        };
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        //primereact config
        PrimeReact.ripple = true;
        PrimeReact.zIndex = {
            modal: 1100,    // dialog, sidebar
            overlay: 1000,  // dropdown, overlaypanel
            menu: 1000,     // overlay menus
            tooltip: 1100   // tooltip
        }
        PrimeReact.appendTo = 'self'; // Default value is null(document.body).
        //dexexpress localization

        // loadMessages({
        //     'pl': translationPL,
        //     'en' : translationENG,
        //     'de' : translationDE,
        // });     
        config({
            editorStylingMode: 'underlined'
        });
        ConsoleHelper("App version = " + packageJson.version);
    }


    componentDidMount() {
        let browseUrl = window.location.href;
        const id = browseUrl.indexOf('/#');
        if (id > 0) {
            browseUrl = browseUrl.substring(0, id + 1);
        }
        let configUrl;
        const urlPrefixCookie = readCookieGlobal("REACT_APP_URL_PREFIX");
        if (urlPrefixCookie === undefined || urlPrefixCookie == null || urlPrefixCookie === '') {
            configUrl = browseUrl
            // .trim()
            // .replaceAll("/#/", "/")
            // .replaceAll("/#", "")
            // .replaceAll("#/", "");
        } else {
            configUrl = browseUrl
                .trim()
                .match("^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)", "")[0] + '/' + urlPrefixCookie;
        }

        this.readConfigAndSaveInCookie(configUrl)
            .catch(err => {
                console.error("Error start application = ", err)
            });
    }

    readConfigAndSaveInCookie(configUrl) {
        return new ReadConfigService(configUrl).getConfiguration().then(configuration => {
            saveCookieGlobal("REACT_APP_BACKEND_URL", configuration.REACT_APP_BACKEND_URL);
            saveCookieGlobal("REACT_APP_URL_PREFIX", configuration.REACT_APP_URL_PREFIX);
            this.setState({
                loadedConfiguration: true,
                config: configuration,
                configUrl: configUrl,
            }, () => {
                if (this.authService.loggedIn()) {
                    this.getLocalization(configUrl);
                }
            });
        })
    }

    handleLogoutUser() {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null, renderNoRefreshContent: false});
            const logoutUrl = AppPrefixUtils.locationHrefUrl('/#/');
            window.location.href = logoutUrl;
        }
    }

    getLocalization(configUrl) {
        this.localizationService.reConfigureDomain();
        const lang = this.authService.getUserLang();
        this.localizationService.localization(lang)
            .then(resp => {
                const langs = resp.langList;
                const labels = {};
                if (resp.labels) {
                    resp.labels.forEach(label => labels[label.code] = label.caption)
                }
                this.setState({langs, labels});
                const localizationService = new LocalizationService(configUrl);
                /* init dev express translations */
                const shortLang = lang.toLowerCase().substr(0, 2);
                localizationService.getTranslationsFromFile('dev', lang)
                    .then(devExpressTranslation => {
                        resp.labels.forEach(label => {
                            devExpressTranslation[label.code] = label.caption;
                        })
                        loadMessages({
                            [shortLang]: devExpressTranslation,
                        });
                        devExpressLocale(shortLang);
                    });
                /* init primereact translations */
                localizationService.getTranslationsFromFile('primi', lang)
                    .then(primeReactTranslation => {
                        addLocale(shortLang, primeReactTranslation[shortLang]);
                        primeReactLocale(shortLang);
                    });
            })
            .catch(err => {
                ConsoleHelper(`App:getLocalization error`, err);
            })
    }

    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status === "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }

    renderLoginContainer(props) {
        return (
            <Login {...props}
                   onAfterLogin={() => {
                       this.setState({
                           user: this.authService.getProfile().sub,
                           collapsed: false
                       }, () => {
                           this.getLocalization(this.state.configUrl);
                       });
                   }}/>
        )
    }

    render() {
        const authService = this.authService;
        const {labels} = this.state;
        const loggedIn = authService.loggedIn();
        let opADD = GridViewUtils.containsOperationButton(this.state.operations, 'OP_ADD');
        return (
            <React.Fragment>
                {this.state.loadedConfiguration ?
                    <HashRouter history={this.historyBrowser} getUserConfirmation={(message, callback) => {
                        // this is the default behavior
                        const allowTransition = window.confirm(message);
                        callback(allowTransition);
                    }}>
                        <div className={`${loggedIn ? 'app' : ''}`}>
                            {loggedIn ?
                                <Sidebar
                                    authService={this.authService}
                                    historyBrowser={this.historyBrowser}
                                    handleLogoutUser={this.handleLogoutUser}
                                    labels={this.state.labels}
                                /> : null}
                            <main>
                                <div className={`${loggedIn ? 'container-fluid' : ''}`}>
                                    {this.state.renderNoRefreshContent ? <React.Fragment>
                                        {Breadcrumb.render(labels)}
                                        <DivContainer colClass='row base-container-header'>
                                            <DivContainer id='header-left' colClass='col-11'>
                                                <div className='font-medium mb-4'> {this.state.viewInfoName}</div>
                                            </DivContainer>
                                            <DivContainer id='header-right' colClass='col-1 to-right'>
                                                <ActionButton rendered={opADD} label={opADD?.label}/>
                                            </DivContainer>
                                            <DivContainer id='header-content' colClass='col-12'>
                                            </DivContainer>
                                        </DivContainer>
                                        {!!this.state.subView ?
                                            <SelectedGridViewComponent
                                                handleOnInitialized={(ref) => this.selectedDataGrid = ref}
                                                subView={this.state.subView}
                                                labels={labels}/> : null}
                                    </React.Fragment> : null}
                                    <Switch>
                                        <Route exact path='/' render={(props) => this.renderLoginContainer(props)}/>
                                        <Route path='/login' render={(props) => this.renderLoginContainer(props)}/>
                                        <Route exact path='/start'
                                               render={(props) => {
                                                   return (
                                                       <AuthComponent viewMode={'VIEW'}
                                                                      historyBrowser={this.historyBrowser}
                                                                      handleLogout={() => this.handleLogoutUser()}
                                                       >
                                                           <DashboardContainer labels={labels}
                                                                               handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                                   this.setState({renderNoRefreshContent: renderNoRefreshContent})
                                                                               }}/>
                                                       </AuthComponent>
                                                   )
                                               }}/>
                                        <Route path='/grid-view/:id'
                                               render={(props) => {
                                                   return (
                                                       <AuthComponent viewMode={'VIEW'}
                                                                      historyBrowser={this.historyBrowser}
                                                                      handleLogout={() => this.handleLogoutUser()}>
                                                           <ViewContainer
                                                               id={props.match.params.id}
                                                               labels={labels}
                                                               handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                                                                   this.setState({renderNoRefreshContent: renderNoRefreshContent})
                                                               }}
                                                               handleViewInfoName={(viewInfoName) => {
                                                                   this.setState({viewInfoName: viewInfoName})
                                                               }}
                                                               handleSubView={(subView) => {
                                                                   this.setState({subView: subView})
                                                               }}
                                                               handleOperations={(operations => {
                                                                   this.setState({operations: operations})
                                                               })}
                                                               handleShortcutButtons={(shortcutButtons => {
                                                                   this.setState({shortcutButtons: shortcutButtons})
                                                               })}
                                                           />
                                                       </AuthComponent>
                                                   )
                                               }}/>
                                    </Switch>
                                </div>
                            </main>
                        </div>
                    </HashRouter> :
                    <React.Fragment>
                        Proszę czekać, trwa ładowanie aplikacji....
                    </React.Fragment>}

            </React.Fragment>
        );
    }

}

export default App;

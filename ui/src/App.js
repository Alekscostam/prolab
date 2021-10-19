import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import StartContainer from './containers/StartContainer';
import AuthService from './services/AuthService';
import AuthComponent from './components/AuthComponent';
import PrimeReact, {addLocale, locale as primeReactLocale} from 'primereact/api';
import "@fontsource/roboto"
import {GridViewContainer} from "./containers/dataGrid/GridViewContainer";
import {createBrowserHistory} from 'history';
import {loadMessages, locale as devExpressLocale} from "devextreme/localization";
import AppPrefixUtils from "./utils/AppPrefixUtils";
import packageJson from '../package.json';
import ReadConfigService from "./services/ReadConfigService";
import {readCookieGlobal, saveCookieGlobal} from "./utils/Cookie";
import LocalizationService from './services/LocalizationService';
import config from "devextreme/core/config";

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
        console.log("App version = " + packageJson.version);
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
            this.setState({user: null});
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
                console.log(`App:getLocalization error`, err);
            })
    }

    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
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
        return (
            <React.Fragment>
                {this.state.loadedConfiguration ?
                    <HashRouter history={this.historyBrowser}>
                        <div className={`${authService.loggedIn() ? 'app' : ''}`}>
                            {authService.loggedIn() ?
                                <Sidebar
                                    authService={this.authService}
                                    historyBrowser={this.historyBrowser}
                                    handleLogoutUser={this.handleLogoutUser}
                                    labels={this.state.labels}
                                /> : null}
                            <main>
                                <div className={`${authService.loggedIn() ? 'container-fluid' : ''}`}>
                                    <Switch>
                                        <Route exact path='/' render={(props) => this.renderLoginContainer(props)}/>
                                        <Route path='/login' render={(props) => this.renderLoginContainer(props)}/>
                                        <Route exact path='/start'
                                               render={(props) => {
                                                   return (
                                                       <AuthComponent viewMode={'VIEW'}
                                                                      historyBrowser={this.historyBrowser}
                                                       >
                                                           <StartContainer/>
                                                       </AuthComponent>
                                                   )
                                               }}/>
                                        <Route path='/grid-view/:id'
                                               render={(props) => {
                                                   return (
                                                       <AuthComponent viewMode={'VIEW'}
                                                                      historyBrowser={this.historyBrowser}>
                                                           <GridViewContainer
                                                               id={props.match.params.id}
                                                               labels={labels}
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

import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import StartContainer from './containers/StartContainer';
import AuthService from './services/AuthService';
import AuthComponent from './components/AuthComponent';
import UserService from "./services/UserService";
import PrimeReact from 'primereact/api';
import "@fontsource/roboto"
import {GridViewContainer} from "./containers/dataGrid/GridViewContainer";
import {createBrowserHistory} from 'history';
import {loadMessages} from "devextreme/localization";
import {translationPL} from "./utils/translations";
import AppPrefixUtils from "./utils/AppPrefixUtils";
import packageJson from '../package.json';
import ReadConfigService from "./services/ReadConfigService";
import {readCookieGlobal, saveCookieGlobal} from "./utils/cookie";

class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.authService = new AuthService();
        this.userService = new UserService();
        this.historyBrowser = this.history;
        this.state = {
            loadedConfiguration: false,
            configUrl: null,
            user: this.authService.getProfile(),
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
        loadMessages({
            'en': translationPL
        });
        console.log("App version = " + packageJson.version);
    }

    componentDidMount() {
        let browseUrl = window.location.href;
        let configUrl;
        const urlPrefixCookie = readCookieGlobal("REACT_APP_URL_PREFIX");
        if (urlPrefixCookie !== undefined && urlPrefixCookie != null && urlPrefixCookie !== "/") {
            configUrl = browseUrl
                .trim()
                .replaceAll("/#/", "")
                .replaceAll("/#", "")
                .replaceAll("#/", "");
        } else {
            configUrl = browseUrl
                .trim()
                .match("^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)", "")[0] + urlPrefixCookie;
        }
        new ReadConfigService(configUrl).getConfiguration().then(configuration => {
            this.setState({
                loadedConfiguration: true,
                config: configuration,
                configUrl: configUrl,
            }, () => {
                saveCookieGlobal("REACT_APP_BACKEND_URL", configuration.REACT_APP_BACKEND_URL);
                saveCookieGlobal("REACT_APP_URL_PREFIX", configuration.REACT_APP_URL_PREFIX);
            });
        }).catch(err => {
            console.error("Error start application = ", err)
        })
    }

    handleLogoutUser() {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null});
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
        }
    }

    render() {
        const authService = this.authService;
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
                                /> : null}
                            <main>
                                <div className={`${authService.loggedIn() ? 'container-fluid' : ''}`}>
                                    <Switch>
                                        <Route exact path='/'
                                               render={(props) => (<Login {...props}
                                                                          onAfterLogin={() => {
                                                                              this.setState({
                                                                                  user: this.authService.getProfile().sub,
                                                                                  collapsed: false
                                                                              });
                                                                          }}/>)}/>
                                        <Route path='/login' render={(props) => (<Login {...props} onAfterLogin={() => {
                                            this.setState({user: this.authService.getProfile().sub, collapsed: false});
                                        }}/>)}/>
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
                                                           <GridViewContainer id={props.match.params.id}
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

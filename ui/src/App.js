import $ from 'jquery';
import React, {Component} from 'react';
import {Router, Route, Switch} from 'react-router-dom';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import StartContainer from './containers/StartContainer';
import AuthService from './services/AuthService';
import AuthComponent from './components/AuthComponent';
import UserService from "./services/UserService";
import PrimeReact from 'primereact/api';
import "@fontsource/roboto"
import {GridViewContainer} from "./containers/GridViewContainer";
import {createBrowserHistory} from 'history';
import {loadMessages} from "devextreme/localization";
import {translationPL} from "./utils/translations";

class App extends Component {
    constructor() {
        super();
        this.history = createBrowserHistory();
        this.authService = new AuthService();
        this.userService = new UserService();
        this.historyBrowser = this.history;
        this.state = {
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
    }

    componentDidMount() {
    }

    handleLogoutUser() {
        this.authService.logout();
        if (this.state.user) {
            this.setState({user: null});
        }
        //window.location.href = '/';
        this.historyBrowser.push('/');
    }

    render() {
        const authService = this.authService;
        return (
            <React.Fragment>
                <Router history={this.historyBrowser}>
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
                                    <Route exact path='/' render={(props) => (<Login {...props} onAfterLogin={() => {
                                        this.setState({user: this.authService.getProfile().sub, collapsed: false});
                                    }}/>)}/>
                                    <Route path='/login' render={(props) => (<Login {...props} onAfterLogin={() => {
                                        this.setState({user: this.authService.getProfile().sub, collapsed: false});
                                    }}/>)}/>
                                    <Route exact path='/start'
                                           render={(props) => {
                                               return (
                                                   <AuthComponent viewMode={'VIEW'}
                                                                  historyBrowser={this.historyBrowser}>
                                                       <StartContainer/>
                                                   </AuthComponent>
                                               )
                                           }}/>
                                    <Route path='/grid-view/:id'
                                           render={(props) => {
                                               return (
                                                   <AuthComponent viewMode={'VIEW'}
                                                                  historyBrowser={this.historyBrowser}>
                                                       <GridViewContainer id={props.match.params.id}/>
                                                   </AuthComponent>
                                               )
                                           }}/>
                                </Switch>
                            </div>
                        </main>
                    </div>
                </Router>
            </React.Fragment>
        );
    }
}

export default App;

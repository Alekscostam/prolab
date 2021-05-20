import $ from 'jquery';
import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import CookiesContainer from './containers/deprecated/CookiesContainer';
import HelpContainer from './containers/deprecated/HelpContainer';
import Sidebar from './containers/layout/Sidebar';
import Login from './containers/LoginContainer';
import SettingContainer from './containers/SettingContainer';
import SettingListContainer from './containers/SettingListContainer';
import StartContainer from './containers/StartContainer';
import UserContainer from './containers/UserContainer';
import UserListContainer from './containers/UserListContainer';
import AuthService from './services/AuthService';
import withAuth from './utils/withAuth';
import UserService from "./services/UserService";
import PrimeReact from 'primereact/api';
import "@fontsource/roboto"

class App extends Component {
    constructor() {
        super();
        this.authService = new AuthService();
        this.userService = new UserService();
        this.state = {
            user: this.authService.getProfile(),
            collapsed: false,
            toggled: false,
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

    }

    handleToggleSidebar() {
        this.setState((prevState) => ({toggled: !prevState.toggled}));
    }

    handleCollapsedChange() {
        this.setState((prevState) => ({collapsed: !prevState.collapsed}), () => {
            if (this.state.collapsed) {
                $(".pro-sidebar-inner").css('position', 'relative');
            } else {
                $(".pro-sidebar-inner").css('position', 'fixed');
            }
        });
    }

    handleLogoutUser(url) {
        const lastUseToken = this.authService.getToken();
        this.authService.logout();
        if (url) {
            window.location.href = '/#login?location=' + url;
        } else {
            window.location.href = '/#/login?force=true';
        }
        if (this.state.user) {
            this.setState({user: null});
        }
        if (lastUseToken !== undefined && lastUseToken !== null) {
            this.userService.logout(lastUseToken);
        }
    }

    render() {
        const authService = this.authService;
        return (
            <React.Fragment>
                <Router>
                    <div className={`${authService.loggedIn() ? 'app' : ''}`}>
                        <Sidebar
                            collapsed={this.state.collapsed}
                            toggled={this.state.toggled}
                            loggedUser={this.state.user}
                            handleToggleSidebar={this.handleToggleSidebar.bind(this)} O
                            handleCollapsedChange={this.handleCollapsedChange.bind(this)}
                            handleLogoutUser={this.handleLogoutUser.bind(this)}
                            authService={this.authService}
                        />
                        <main>
                            <div className={`${authService.loggedIn() ? 'container-fluid' : ''}`}>
                                <Switch>
                                    <Route exact path='/' render={(props) => (<Login {...props} onAfterLogin={() => {
                                        this.setState({user: this.authService.getProfile().sub, collapsed:false});
                                    }}/>)}/>
                                    <Route path='/login' render={(props) => (<Login {...props} onAfterLogin={() => {
                                        this.setState({user: this.authService.getProfile().sub, collapsed:false});
                                    }}/>)}/>
                                    <Route exact path='/start'
                                           component={withAuth(StartContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/help-page'
                                           component={withAuth(HelpContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/cookies-page' component={CookiesContainer}/>
                                    <Route exact path='/user-list'
                                           component={withAuth(UserListContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/user/create'
                                           component={withAuth(UserContainer, 'NEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/user/details/:id'
                                           component={withAuth(UserContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/user/edit/:id'
                                           component={withAuth(UserContainer, 'EDIT', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/setting-list'
                                           component={withAuth(SettingListContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/setting/details/:id'
                                           component={withAuth(SettingContainer, 'VIEW', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
                                    <Route exact path='/setting/edit/:id'
                                           component={withAuth(SettingContainer, 'EDIT', ['ROLE_ADMIN', 'ROLE_DISPATCHER'], this.handleLogoutUser)}/>
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

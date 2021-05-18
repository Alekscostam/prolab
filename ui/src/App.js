import $ from 'jquery';
import React, {Component} from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import CookieConsent from './components/CookieConsent';
import CookiesContainer from './containers/CookiesContainer';
import HelpContainer from './containers/HelpContainer';
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
                <CookieConsent
                    location='bottom'
                    buttonText='Akceptuję'
                    cookieName='cookiePolicy'
                    style={{background: 'rgba(0, 0, 0, 0.8)'}}
                    buttonStyle={{
                        background: '#1c3275',
                        color: 'white',
                        fontSize: '16px',
                        fontFamily: 'Ubuntu',
                        fontWeight: 500,
                        borderRadius: '3px'
                    }}
                    expires={150}>
                    Nasz serwis wykorzystuje pliki cookies. Możesz zrezygnować ze zbierania informacji poprzez pliki
                    cookies, zmieniając ustawienia Twojej
                    przeglądarki - w takim przypadku nie gwarantujemy poprawnego działania serwisu.
                </CookieConsent>
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
                                        this.setState({user: this.authService.getProfile().sub});
                                    }}/>)}/>
                                    <Route path='/login' render={(props) => (<Login {...props} onAfterLogin={() => {
                                        this.setState({user: this.authService.getProfile().sub});
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

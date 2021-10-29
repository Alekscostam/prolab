import React from 'react';
import AuthService from "../services/AuthService";
import * as PropTypes from "prop-types";
import Address from "./Address";
import AppPrefixUtils from "../utils/AppPrefixUtils";


class AuthComponent extends React.Component {

    constructor(props) {
        super(props);
        this.authService = new AuthService();
        this.state = {
            user: null,
        };
    }

    componentDidMount() {
        let {
            roles,
            viewMode,
            historyBrowser
        } = this.props;
        if (!this.authService.loggedIn()) {
            this.props.handleLogout();
        } else {
            const userRoles = this.authService.getRoles();
            let authorized = false;
            if (roles !== undefined && roles !== null) {
                roles.forEach((role) => {
                    if (userRoles.includes(role)) {
                        authorized = true;
                    }
                });
            } else {
                authorized = true;
            }
            if (authorized) {
                try {
                    const profile = this.authService.getProfile();
                    this.setState({
                        user: profile,
                        viewMode: viewMode
                    });
                } catch (err) {
                    console.log('Error authorized. Exception=', err)
                    this.authService.logout();
                    historyBrowser.replace('/');
                }
            } else {
                historyBrowser.replace('/403');
            }
        }
    }

    componentDidUpdate() {
        if (!this.authService.loggedIn()) {
            this.props.handleLogout();
        }
    }

    render() {
        if (true) {
            return (
                <React.Fragment>
                    {this.props.children}
                </React.Fragment>
            );
        } else {
            return null;
        }
    }
}

Address.defaultProps = {};

AuthComponent.propTypes = {
    historyBrowser: PropTypes.any.isRequired,
    roles: PropTypes.any,
    handleLogout: PropTypes.func
}

export default AuthComponent;

import React from 'react';
import {BreadcrumbsItem} from 'react-breadcrumbs-dynamic';
import BreadcrumbsComponent from './layouts/BreadcrumbsComponent';
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
            console.log('You not login in !!!')
            //Old
            //historyBrowser.push('/');
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
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

    render() {
        if (true) {
            return (
                <React.Fragment>
                    <BreadcrumbsItem icon='account-box' to='/start' className='p-link'> Strona
                        główna </BreadcrumbsItem>
                    <BreadcrumbsComponent/>
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
}

export default AuthComponent;

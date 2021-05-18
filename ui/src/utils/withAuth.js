import React, { Component } from 'react';
import AuthService from '../services/AuthService';
import FooterComponent from '../components/layouts/FooterComponent';
import HeaderComponent from '../components/layouts/HeaderComponent';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';
import BreadcrumbsComponent from '../components/layouts/BreadcrumbsComponent';
export default function withAuth(AuthComponent, viewMode, roles, logoutFunc) {
	const authService = new AuthService();

	return class AuthWrapped extends Component {
		constructor() {
			super();
			this.state = {
				user: null,
			};
		}

		componentDidMount() {
			if (!authService.loggedIn()) {
				if (logoutFunc) {
					logoutFunc(this.props.location.pathname);
				} else {
					this.props.history.replace('/login?location=' + this.props.location.pathname);
				}
			} else {
				const userRoles = authService.getRoles();
				let authorized = false;
				if (roles !== undefined) {
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
						const profile = authService.getProfile();
						this.setState({
							user: profile,
							viewMode: viewMode,
							id: this.props.match.params.id,
						});
					} catch (err) {
						authService.logout();
						this.props.history.replace('/login');
					}
				} else {
					this.props.history.replace('/403');
				}
			}
		}

		render() {
			if (this.state.user) {
				return (
					<React.Fragment>
						<BreadcrumbsItem icon='account-box' to='/start' className='p-link'> Strona główna </BreadcrumbsItem>
						<HeaderComponent logout={logoutFunc} />
						<BreadcrumbsComponent />
						<AuthComponent
							history={this.props.history}
							currentUser={this.state.user}
							viewMode={this.state.viewMode}
							id={this.state.id}
						/>
						<FooterComponent />
					</React.Fragment>
				);
			} else {
				return null;
			}
		}
	};
}

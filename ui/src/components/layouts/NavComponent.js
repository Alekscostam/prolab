import React, { Component } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Breadcrumbs } from 'react-breadcrumbs-dynamic';
import { NavLink, withRouter } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { DivContainer } from './../DivContainer';

class NavComponent extends Component {
	constructor(props, context) {
		super(props, context);
		this.authService = new AuthService();
	}

	renderNavLink(eventKey, label, pathPrefix, rendered) {
		this.path = window.location.href;
		return rendered ? (
			<Nav.Link eventKey={eventKey}>
				<div className='m_button_ghost'>
					<div className={`m_button ${this.path.includes(pathPrefix) ? 'red' : 'blue'} dashboard`}>
						<div className='menu-icon'>
							<img src={`/images/ico_${eventKey}.svg`} alt={label} />
						</div>
						<div className='button-label'>
							<span>{label}</span>
						</div>
					</div>
				</div>
			</Nav.Link>
		) : null;
	}

	renderAfterAuth() {
		this.path = window.location.href;
		return (
			<React.Fragment>
				<Navbar expand='sm' className='nav-background' collapseOnSelect='true'>
					<DivContainer colClass="container">
						<Navbar.Toggle aria-controls='basic-navbar-nav' />
						<Navbar.Collapse id='basic-navbar-nav' className='col-md-12'>
							<Nav className='row' onSelect={(k) => this.handleSelect(k)}>
								{this.renderNavLink('start', 'Strona główna', 'start', true)}
								{this.renderNavLink('station-list', 'Stacje', 'station', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('user-list', 'Użytkownicy', 'user', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('manage-account', 'Moje konto', 'manage-account', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('setting-list', 'Parametry aplikacji', 'setting', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('email-template-list', 'Szablony wiadomości', 'email-template', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('event-log-list', 'Dziennik zdarzeń', 'event-log', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
								{this.renderNavLink('help-page', 'Pomoc', 'help-page', this.authService.isUserInAnyRole('ROLE_ADMIN', 'ROLE_DISPATCHER'))}
							</Nav>
						</Navbar.Collapse>
					</DivContainer>
				</Navbar>
			</React.Fragment>
		);
	}

	handleSelect(eventKey) {
		switch (eventKey) {
			case 'start':
				this.props.history.push('/start');
				break;
			case 'help-page':
				this.props.history.push('/help-page');
				break;
			case 'station-list':
				this.props.history.push('/station-list');
				break;
			case 'user-list':
				this.props.history.push('/user-list');
				break;
			case 'event-log-list':
				this.props.history.push('/event-log-list');
				break;
			case 'setting-list':
				this.props.history.push('/setting-list');
				break;
			case 'email-template-list':
				this.props.history.push('/email-template-list');
				break;
			case 'manage-account':
				this.props.history.push('/manage-account');
				break;
			default:
				this.props.history.push('/start');
				break;
		}
	}

	renderBeforeAuth() {
		return <div className='header-separator background-gradient' />;
	}

	render() {
		if (this.authService.loggedIn()) {
			return this.renderAfterAuth();
		} else {
			return this.renderBeforeAuth();
		}
	}
}

export default withRouter(NavComponent);

import PropTypes from 'prop-types';
import React from 'react';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';
import BaseListContainer from '../baseContainers/BaseListContainer';
import CriteriaDropdownComponent from '../components/criteria/CriteriaDropdownComponent';
import CriteriaTextComponent from '../components/criteria/CriteriaTextComponent';
import UserService from '../services/UserService';

class UserListContainer extends BaseListContainer {
	constructor(props) {
		super(props, new UserService());
		this.state = {
			list: [],
			loading: true,
			size: 0,
			first: 0,
			criteria: this.getCleanSearchCriteria(),
			statusOptions: [],
			roleTypeOptions: [],
		};
	}

	updateSearchCriteria(criteria) {
		return {
			login: criteria.login,
			firstName: criteria.firstName,
			lastName: criteria.lastName,
			roleType: criteria.roleType,
			status: criteria.status,
			firstResult: criteria.firstResult,
			maxResult: criteria.maxResult,
			sortField: criteria.sortField,
			sortAsc: criteria.sortAsc,
		};
	}

	getCleanSearchCriteria() {
		return {
			login: '',
			firstName: '',
			lastName: '',
			roleType: undefined,
			status: undefined,
			id: null,
			firstResult: 0,
			maxResult: 10,
			sortField: 'login',
			sortAsc: true,
		};
	}

	initializeFromBackend() {
		this.enumService
			.getEnumList('UserActivityStatus')
			.then((statusOptions) =>
				this.setState({
					statusOptions,
				})
			)
			.catch(() => {
				this.showErrorMessage('Nie udało się pobrać listy statusów');
			});
		this.enumService
			.getEnumList('RoleType')
			.then((roleTypeOptions) =>
				this.setState({
					roleTypeOptions,
				})
			)
			.catch(() => {
				this.showErrorMessage('Nie udało się pobrać listy ról');
			});
	}

	getCriteriaName() {
		return 'user-list-sc';
	}

	getContainerListName() {
		return 'user-list-container';
	}

	renderCriteria() {
		return (
			<div className='row'>
				<CriteriaTextComponent
					id='login-sc'
					name='login'
					label={'Login AD'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.login}
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
				<CriteriaTextComponent
					id='firstName-sc'
					name='firstName'
					label={'Imię'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.firstName}
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
				<CriteriaTextComponent
					id='lastName-sc'
					name='lastName'
					label={'Nazwisko'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.lastName}
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
				<CriteriaDropdownComponent
					id='roleType-sc'
					name='roleType'
					showClear
					label={'Rola'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.roleType}
					options={this.state.roleTypeOptions}
					placeholder='Wszystkie'
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
				<CriteriaDropdownComponent
					id='status-sc'
					name='status'
					showClear
					label={'Status'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.status}
					options={this.state.statusOptions}
					placeholder='Wszystkie'
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
			</div>
		);
	}

	prepareColumns() {
		return [
			{ field: 'login', header: 'Login AD', sortable: true },
			{ field: 'firstName', header: 'Imię', sortable: true },
			{ field: 'lastName', header: 'Nazwisko', sortable: true },
			{ field: 'roleType', header: 'Rola', sortable: true, body: this.enumTemplate.bind(this, 'roleType') },
			{ field: 'status', header: 'Status', sortable: true, body: this.enumTemplate.bind(this, 'status') },
			{
				key: 'actions',
				header: 'Szczegóły',
				body: this.actionTemplate,
				className: 'table-column-action',
			},
		];
	}

	prepareHeaderItems() {
		return this.isUserInRole('ROLE_ADMIN')
			? [
				{
					label: 'Nowe konto użytkownika',
					href: this.props.newUrl,
					type: 'BUTTON',
					className: 'float-right',
					variant: 'blue',
					iconName: 'mdi-plus',
					iconSide: 'left',
					iconColor: 'white',
				},
			]
			: [];
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/user-list'>{'Użytkownicy'}</BreadcrumbsItem>
				{this.renderView()}
			</div>
		);
	}
}

UserListContainer.defaultProps = {
	detailUrl: '/#/user/details',
	newUrl: '/#/user/create',
};

UserListContainer.propTypes = {
	detailUrl: PropTypes.string,
	newUrl: PropTypes.string,
};

export default UserListContainer;

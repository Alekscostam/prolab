import PropTypes from 'prop-types';
import React from 'react';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';
import BaseDetailsContainer from '../baseContainers/BaseDetailsContainer';
import InputDropdownComponent from '../components/inputs/InputDropdownComponent';
import InputTextComponent from '../components/inputs/InputTextComponent';
import YesNoDialog from '../components/YesNoDialog';
import UserService from '../services/UserService';

class UserContainer extends BaseDetailsContainer {
	constructor(props) {
		super(props, new UserService());
		this.state = {
			loading: true,
			elementId: props.id,
			element: {
				login: '',
				firstName: '',
				lastName: '',
				email: '',
				phoneNumber: '',
				roleType: undefined,
				status: { enumValue: 'ACTIVE', label: 'Aktywny' },
			},
			showConfirmBlockDialog: false,
			showConfirmUnblockDialog: false,
			statusOptions: [],
			roleTypeOptions: [],
		};
		this.blockAccount = this.blockAccount.bind(this);
		this.unblockAccount = this.unblockAccount.bind(this);
		this.showBlockConfirmation = this.showBlockConfirmation.bind(this);
		this.hideBlockConfirmation = this.hideBlockConfirmation.bind(this);
		this.showUnblockConfirmation = this.showUnblockConfirmation.bind(this);
		this.hideUnblockConfirmation = this.hideUnblockConfirmation.bind(this);
	}

	updateElement(data) {
		this.setState(
			{
				element: {
					id: data.id,
					login: data.login,
					firstName: data.firstName,
					lastName: data.lastName,
					phoneNumber: data.phoneNumber,
					email: data.email,
					roleType: data.roleType,
					status: data.status,
				},
			},
			() => {
				this.initAfterSetElement();
			}
		);
	}

	initBeforeSetElement() {
		this.enumService
			.getEnumList('UserActivityStatus')
			.then((statusOptions) =>
				this.setState({
					statusOptions,
				})
			).catch(() => {
				this.showErrorMessage('Nie udało się pobrać listy statusów');
			});
		this.enumService
			.getEnumList('RoleType')
			.then((roleTypeOptions) =>
				this.setState({
					roleTypeOptions,
				})
			).catch(() => {
				this.showErrorMessage('Nie udało się pobrać listy ról');
			});
	}

	showBlockConfirmation() {
		this.setState({ showConfirmBlockDialog: true });
	}

	hideBlockConfirmation() {
		this.setState({ showConfirmBlockDialog: false });
	}

	showUnblockConfirmation() {
		this.setState({ showConfirmUnblockDialog: true });
	}

	hideUnblockConfirmation() {
		this.setState({ showConfirmUnblockDialog: false });
	}

	blockAccount() {
		this.blockUi();
		this.service
			.blockAccount(this.state.element.id)
			.then((result) => {
				this.showSuccessMessage('Zablokowane konto użytkownika');
				this.updateElement(result);
				this.hideBlockConfirmation();
				this.unblockUi();
			})
			.catch((err) => {
				this.showErrorMessage('Nie udało się zablokować konta użytkownika');
				this.hideBlockConfirmation();
				this.unblockUi();
			});
	}

	unblockAccount() {
		this.blockUi();
		this.service
			.unblockAccount(this.state.element.id)
			.then((result) => {
				this.showSuccessMessage('Odblokowano konto użytkownika');
				this.updateElement(result);
				this.hideUnblockConfirmation();
				this.unblockUi();
			})
			.catch((err) => {
				this.showErrorMessage('Nie udało się odblokować konta użytkownika');
				this.hideUnblockConfirmation();
				this.unblockUi();
			});
	}

	//override
	prepareEditButton(rendered, label) {
		const { editUrl, viewMode } = this.props;
		const { element } = this.state;
		return {
			label: label !== undefined ? label : 'Edytuj',
			type: 'BUTTON',
			variant: '',
			className: 'float-right',
			href: `${editUrl}/${element.id}`,
			rendered: viewMode === 'VIEW' && this.isUserInRole('ROLE_ADMIN'),
			iconName: 'mdi-pencil',
			iconSide: 'left',
			iconSize: 'm',
		};
	}

	prepareFooterItems() {
		const { backUrl, cancelUrl, viewMode } = this.props;
		const { elementId } = this.state;
		let goBackUrl;
		if (viewMode === 'NEW') {
			goBackUrl = backUrl;
		} else {
			goBackUrl = `${cancelUrl}/${elementId}`;
		}
		return [
			{ label: 'Anuluj', href: goBackUrl, rendered: viewMode === 'NEW' || viewMode === 'EDIT' },
			{
				label: 'Zapisz',
				className: 'float-right',
				onClick: this.handleFormSubmit,
				rendered: this.isUserInRole('ROLE_ADMIN') && (viewMode === 'NEW' || viewMode === 'EDIT'),
			},
			{
				label: 'Zablokuj konto',
				className: 'float-right mr-2',
				onClick: this.showBlockConfirmation,
				rendered: this.isUserInRole('ROLE_ADMIN') && viewMode === 'VIEW' && this.state.element.status !== undefined
					&& this.props.currentUser.sub !== this.state.element.login
					&& this.state.element.status.enumValue === 'ACTIVE',
			},
			{
				label: 'Odblokuj konto',
				className: 'float-right mr-2',
				onClick: this.showUnblockConfirmation,
				rendered: this.isUserInRole('ROLE_ADMIN') && viewMode === 'VIEW' && this.state.element.status !== undefined
					&& (this.state.element.status.enumValue === 'INACTIVE' || this.state.element.status.enumValue === 'BLOCKED'),
			}
		];
	}

	prepareHeaderItems() {
		const { viewMode } = this.props;
		return [
			{
				label: viewMode === 'NEW' ? 'Nowy użytkownik' : 'Szczegóły użytkownika',
				type: 'LABEL',
				className: '',
			},
			this.prepareEditButton(viewMode === 'VIEW' && this.isUserInRole('ROLE_ADMIN')),
		];
	}

	getBackLabel() {
		return 'Wróć do listy';
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/user-list' className='p-link'>
					{'Użytkownicy'}
				</BreadcrumbsItem>
				{this.props.viewMode === 'VIEW' ? <BreadcrumbsItem to='/user/details'>{'Szczegóły'}</BreadcrumbsItem> : null}
				{this.props.viewMode === 'EDIT' ? <BreadcrumbsItem to='/user/edit'>{'Edycja'}</BreadcrumbsItem> : null}
				{this.props.viewMode === 'NEW' ? <BreadcrumbsItem to='/user/create'>{'Nowy'}</BreadcrumbsItem> : null}
				<YesNoDialog visible={this.state.showConfirmBlockDialog} header='Zablokowanie użytkownika' name='visible'
					onChange={(type, x, target) => { if (target.value) { this.blockAccount(); } else { this.hideBlockConfirmation(); } }}
					onHide={() => { this.hideBlockConfirmation(); }}>
					Czy na pewno chcesz zablokować użytkownika?
				</YesNoDialog>
				<YesNoDialog visible={this.state.showConfirmUnblockDialog} header='Odblokowanie użytkownika' name='visible'
					onChange={(type, x, target) => { if (target.value) { this.unblockAccount(); } else { this.hideUnblockConfirmation(); } }}
					onHide={() => { this.hideUnblockConfirmation(); }}>
					Czy na pewno chcesz odblokować użytkownika?
				</YesNoDialog>
				{this.renderView()}
			</div>
		);
	}

	renderDetails() {
		return (
			<React.Fragment>
				<div className='row'>
					<InputTextComponent
						id='login'
						name='login'
						label={'Login AD'}
						colClass='col-md-4'
						value={this.state.element.login}
						validator={this.validator}
						validators='required|max:50'
						onChange={this.handleChange}
						viewMode={this.props.viewMode === 'EDIT' ? 'VIEW' : this.props.viewMode}
					/>

					<InputTextComponent
						id='firstName'
						name='firstName'
						label={'Imię'}
						colClass='col-md-4'
						value={this.state.element.firstName}
						validator={this.validator}
						validators='required|max:100'
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
					/>

					<InputTextComponent
						id='lastName'
						name='lastName'
						label={'Nazwisko'}
						colClass='col-md-4'
						value={this.state.element.lastName}
						validator={this.validator}
						validators='required|max:100'
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
					/>

					<InputTextComponent id='email'
						name='email'
						label={'Email'}
						colClass='col-md-4'
						value={this.state.element.email}
						validator={this.validator}
						validators='required|email|max:100'
						onChange={this.handleChange}
						viewMode={this.props.viewMode} />

					<InputTextComponent
						id='phoneNumber'
						name='phoneNumber'
						label={'Telefon'}
						colClass='col-md-4'
						value={this.state.element.phoneNumber}
						validator={this.validator}
						validators='phone|max:12'
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
						max={12}
					/>

					<InputDropdownComponent
						id='roleType'
						name='roleType'
						label={'Rola'}
						colClass='col-md-4'
						value={this.state.element.roleType}
						validator={this.validator}
						options={this.state.roleTypeOptions}
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
						optionLabel='label'
						dataKey='enumValue'
						validators='required'
						valueView={this.state.element.roleType ? this.state.element.roleType.label : ''}
					/>

					<InputDropdownComponent
						id='status'
						name='status'
						label={'Status'}
						colClass='col-md-4'
						value={this.state.element.status}
						validator={this.validator}
						options={this.state.statusOptions}
						onChange={null}
						viewMode={'VIEW'}
						optionLabel='label'
						dataKey='enumValue'
						validators='not_required'
						rendered={this.props.viewMode !== 'NEW'}
						valueView={this.state.element.status ? this.state.element.status.label : ''}
					/>

				</div>
			</React.Fragment>
		);
	}
}

UserContainer.defaultProps = {
	backUrl: '/#/user-list',
	cancelUrl: '/#/user/details',
	editUrl: '/#/user/edit',
};

UserContainer.propTypes = {
	backUrl: PropTypes.string,
	cancelUrl: PropTypes.string,
	editUrl: PropTypes.string,
};

export default UserContainer;

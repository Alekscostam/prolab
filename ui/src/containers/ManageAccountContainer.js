import PropTypes from 'prop-types';
import React from 'react';
import BaseDetailsContainer from '../baseContainers/BaseDetailsContainer';
import InputTextComponent from '../components/inputs/InputTextComponent';
import UserService from '../services/UserService';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';

class ManageUserContainer extends BaseDetailsContainer {
	constructor(props) {
		super(props, new UserService());
		this.state = {
			loading: true,
			passwordChange: false,
			element: {
				id: undefined,
				phoneNumber: '',
				email: '',
			},
		};
		this.backLinkRendered = false;
	}

	updateElement(data) {
		this.setState(
			{
				element: {
					id: data.id,
					phoneNumber: data.phoneNumber,
					email: data.email,
				},
			},
			() => this.initAfterSetElement()
		);
	}

	setElement() {
		this.blockUi();
		this.service
			.getMyAccount()
			.then((data) => {
				this.setState({ loading: false }, () => this.updateElement(data));
			})
			.catch((err) => {
				this.handleGetDetailsError(err);
			});
	}

	getAddSucces() {
		return 'Konto zostało utworzone';
	}

	getUpdateSucces() {
		return 'Konto zostało zaktualizowane';
	}

	createOrUpdate() {
		const { element } = this.state;
		this.scrollToTop();
		if (this._isMounted) {
			this.service
				.updateMyAccount(element)
				.then(() => {
					this.showSuccessMessage(this.getUpdateSucces(), 10000);
					this.setState((prevState) => ({
						element: {
							...prevState.element,
							oldPassword: '',
							newPassword: '',
							confirmPassword: '',
							passwordChange: false,
						},
					}));
				})
				.catch((err) => {
					this.showErrorMessage(err.message, 10000);
				});
		}
	}

	getBackLabel() {
		return 'Wróć';
	}

	prepareHeaderItems() {
		return [
			{
				label: 'Zarządzanie kontem',
				type: 'LABEL',
				className: '',
			},
		];
	}

	prepareFooterItems() {
		return [
			{
				label: 'Zapisz',
				className: 'float-right',
				onClick: this.handleFormSubmit,
			},
		];
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/manage-account' className='p-link'>
					{'Zarządzanie kontem'}
				</BreadcrumbsItem>
				{this.renderView()}
			</div>
		);
	}

	renderDetails() {
		return (
			<React.Fragment>
				<div className='row'>
					<InputTextComponent
						id='phoneNumber'
						name='phoneNumber'
						label={'Telefon'}
						colClass='col-md-4'
						value={this.state.element.phoneNumber}
						validator={this.validator}
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
						max={12}
						validators='required|phone'
					/>
					<InputTextComponent id='email'
						name='email'
						label={'Email'}
						colClass='col-md-4'
						value={this.state.element.email}
						validator={this.validator}
						validators='required|email'
						onChange={this.handleChange} viewMode='EDIT' />
				</div>
			</React.Fragment>
		);
	}
}

ManageUserContainer.defaultProps = {
	viewMode: 'EDIT',
};

ManageUserContainer.propTypes = {
	viewMode: PropTypes.string.isRequired,
};

export default ManageUserContainer;

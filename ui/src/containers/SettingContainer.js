import PropTypes from 'prop-types';
import React from 'react';
import {BreadcrumbsItem} from 'react-breadcrumbs-dynamic';
import BaseDetailsContainer from '../baseContainers/BaseDetailsContainer';
import InputDropdownComponent from '../components/inputs/InputDropdownComponent';
import InputTextComponent from '../components/inputs/InputTextComponent';
import SettingService from '../services/SettingService';

class SettingContainer extends BaseDetailsContainer {
	constructor(props) {
		super(props, new SettingService());
		this.state = {
			loading: true,
			elementId: props.id,
			element: {
				value: '',
				type: undefined,
			},
			settingParameterTypeOptions: [],
		};
	}

	updateElement(data) {
		this.setState(
			{
				element: {
					id: data.id,
					active: data.active,
					value: data.value,
					type: data.type,
					password: data.password,
				},
			},
			() => {
				this.initAfterSetElement();
			}
		);
	}

	getContainerListName() {
		return 'setting-list-container';
	}
	getUpdateSucces(){
		return 'Parametr został zaktualizowany';
	}
	initBeforeSetElement() {
	this.service
			.getSettingTypes()
			.then((settingParameterTypeOptions) =>
				this.setState({
					settingParameterTypeOptions,
				})
			)
			.catch(() => {
				this.showErrorMessage('Nie udało się pobrać listy parametrów');
			});
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
				rendered: viewMode === 'NEW' || viewMode === 'EDIT',
			},
		];
	}

	prepareHeaderItems() {
		const { viewMode } = this.props;
		return [
			{
				label: viewMode === 'NEW' ? 'Nowy parametr systemowy' : 'Szczegóły parametru systemowego',
				type: 'LABEL',
				className: '',
			},
			this.prepareEditButton(viewMode === 'VIEW'),
		];
	}

	getBackLabel() {
		return 'Wróć do listy';
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/setting-list' className='p-link'>
					{'Parametry aplikacji'}
				</BreadcrumbsItem>
				{this.props.viewMode === 'VIEW' ? <BreadcrumbsItem to='/setting/details'>{'Szczegóły'}</BreadcrumbsItem> : null}
				{this.props.viewMode === 'EDIT' ? <BreadcrumbsItem to='/setting/edit'>{'Edycja'}</BreadcrumbsItem> : null}
				{this.props.viewMode === 'NEW' ? <BreadcrumbsItem to='/setting/create'>{'Nowy'}</BreadcrumbsItem> : null}
				{this.renderView()}
			</div>
		);
	}

	renderDetails() {
		return (
			<React.Fragment>
				<div className='row'>
					<InputDropdownComponent
						id='type'
						name='type'
						label={'Typ parametru'}
						colClass='col-md-4'
						value={this.state.element.type}
						validator={this.validator}
						options={this.state.settingParameterTypeOptions}
						onChange={this.handleChange}
						viewMode={this.props.viewMode === 'EDIT' ? 'VIEW' : this.props.viewMode}
						optionLabel='label'
						dataKey='value'
						valueView={this.state.element.type ? this.state.element.type.label : ''}
					/>
					<InputTextComponent
						id='value'
						name='value'
						label={'Wartość'}
						colClass='col-md-6'
						value={this.state.element.value}
						validator={this.validator}
						onChange={this.handleChange}
						viewMode={this.props.viewMode}
						rendered={!this.state.element.password}
						validators={this.state.element?.type?.enumValue && this.state.element.type.enumValue === 'ANVIM_PRICE_UPDATE_TIME' ?  'time':'required' }
					/>
				</div>
			</React.Fragment>
		);
	}
}

SettingContainer.defaultProps = {
	backUrl: '/#/setting-list',
	cancelUrl: '/#/setting/details',
	editUrl: '/#/setting/edit',
};

SettingContainer.propTypes = {
	backUrl: PropTypes.string,
	cancelUrl: PropTypes.string,
	editUrl: PropTypes.string,
};

export default SettingContainer;

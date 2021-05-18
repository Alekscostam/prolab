import React from 'react';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';
import PropTypes from 'prop-types';
import BaseListContainer from '../baseContainers/BaseListContainer';
import SettingService from '../services/SettingService';
import CriteriaDropdownComponent from '../components/criteria/CriteriaDropdownComponent';

class SettingListContainer extends BaseListContainer {
	constructor(props) {
		super(props, new SettingService());
		this.state = {
			list: [],
			loading: true,
			size: 0,
			first: 0,
			criteria: this.getCleanSearchCriteria(),
			settingParameterTypeOptions: [],
		};
	}


	updateSearchCriteria(criteria) {
		return {
			type: criteria.type,
			active: criteria.active,
			id: criteria.id,
			entityUuid: criteria.entityUuid,
			firstResult: criteria.firstResult,
			maxResult: criteria.maxResult,
			sortField: criteria.sortField,
			sortAsc: criteria.sortAsc,
		};
	}
	
	getCriteriaName() {
		return 'setting-list-sc';
	}

	getContainerListName() {
		return 'setting-list-container';
	}
	getCleanSearchCriteria() {
		return {
			type: null,
			active: true,
			id: null,
			entityUuid: null,
			firstResult: 0,
			maxResult: 10,
			sortField: 'id',
			sortAsc: true,
		};
	}

	initializeFromBackend() {
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

	getCriteriaName() {
		return 'setting-list-sc';
	}

	getContainerListName() {
		return 'setting-list-container';
	}

	renderCriteria() {
		return (
			<div className='row'>
				<CriteriaDropdownComponent
					id='type-sc'
					name='type'
					showClear
					label={'Nazwa'}
					colClass='col-lg-4 col-sm-6'
					value={this.state.criteria.type}
					options={this.state.settingParameterTypeOptions}
					placeholder='Wszystkie'
					onChange={this.handleChangeSc}
					validator={this.validator}
				/>
			</div>
		);
	}

	prepareColumns() {
		return [
			{ field: 'id', header: 'ID', sortable: true, width: '90px' },
			{ field: 'type', header: 'Nazwa', sortable: true, body: this.enumTemplate.bind(this, 'type') },
			{ field: 'value', header: 'Wartość', sortable: true },
			{
				key: 'actions',
				header: 'Szczegóły',
				body: this.actionTemplate,
				className: 'table-column-action',
			},
		];
	}

	//override
	enumTemplate(field, rowData) {
		if (rowData[field] && rowData[field].label) {
			return rowData[field].label;
		}
		return '';
	}

	prepareHeaderItems() {
		return [
		];
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/setting-list'>{'Parametry aplikacji'}</BreadcrumbsItem>
				{this.renderView()}
			</div>
		);
	}
}

SettingListContainer.defaultProps = {
	detailUrl: '/#/setting/details',
	newUrl: '/#/setting/create',
};

SettingListContainer.propTypes = {
	detailUrl: PropTypes.string,
	newUrl: PropTypes.string,
};

export default SettingListContainer;

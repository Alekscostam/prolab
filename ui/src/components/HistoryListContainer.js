import React from 'react';
import PropTypes from 'prop-types';

import BaseListContainer from '../baseContainers/BaseListContainer';
import BaseService from '../baseContainers/BaseService';
import DivContainer from './DivContainer';
import RodoUserComponent from './RodoUserComponent';

// eslint-disable-next-line import/no-extraneous-dependencies
/*
import {
	BaseListContainer,
	BaseService,
	DivContainer,
	RodoUserComponent,
} from 'react-gui-common';
*/


class HistoryService extends BaseService {
	constructor(domain) {
		super(domain);
		this.path = 'audit';
	}

	getList(searchCriteria) {
		const criteria = {};
		Object.assign(criteria, searchCriteria);
		criteria.sortField = this.fieldToSortField(criteria.sortField);
		return this.fetch(`${this.domain}/${this.path}/history`, {
			method: 'POST',
			body: JSON.stringify(criteria),
		}).then(res => {
			return Promise.resolve(res);
		});
	}

	fieldToSortField(field) {
		switch (field) {
			default:
				return 'ID';
		}
	}
}

class HistoryListContainer extends BaseListContainer {
	constructor(props) {
		super(props, new HistoryService(props.baseRestApiUrl));
		this.state = {
			list: [],
			loading: true,
			size: 0,
			first: 0,
			criteria: {
				id: props.objectId,
				type: props.objectType,
				page: 0,
				limit: 10,
			},
		};
	}

	componentDidMount() {
		this._isMounted = true;
		this.refreshTable();
		// eslint-disable-next-line no-undef
		$('div.p-datatable div.p-paginator-top input').attr('aria-label', 'Liczba pozycji na stronie');
	}

	createdByTemplate(rowData) {
		const user = rowData.createdBy;
		return (
			<RodoUserComponent
				value={user}
				baseRestApiUrl={this.props.baseRestApiUrl}
				viewType="LIST"
			/>
		);
	}

	commentTemplate(rowData) {
		const details = rowData.details;
		const changeLog = rowData.detailsExt;
		if (changeLog && changeLog.changes) {
			return (
				<DivContainer colClass="row">
					<div className="col-12 font-weight-bold">Lista zmian:</div>
					<div className="col-6 font-weight-bold">Nazwa pola</div>
					<div className="col-3 font-weight-bold">Stara wartość</div>
					<div className="col-3 font-weight-bold">Nowa wartość</div>
					{changeLog.changes.map((c, i) => {
						return (
							<div className="col-12">
								<div className="row">
									<div className="col-6">{i + 1}. {c.fieldName}</div>
									<div className="col-3">{c.oldValue ? c.oldValue : '<brak>'}</div>
									<div className="col-3">{c.newValue ? c.newValue : '<brak>'}</div>
								</div>
							</div>
						);
					})}
			</DivContainer>
			);
		} else {
			return details;
		}
	}

	render() {
		let columns;
		if (this.props.columns === null) {
			columns = [
				{
					field: 'createDate',
					header: 'Data modyfikacji',
					body: this.dateTemplate.bind(this, 'createDate', 'DD-MM-YYYY HH:mm:ss'),
				},
				{
					field: 'authorTemplate',
					header: 'Autor zmiany',
					// body: this.objectJoinTemplate.bind(this, ['userFirstName', 'userLastName'], ' '),
					body: this.createdByTemplate.bind(this),
				},
				{ field: 'eventTypeText', header: 'Operacja' },
				{
					field: 'details',
					header: 'Komentarz',
					body: this.commentTemplate.bind(this),
					width: '45%',
				},
			];
			if (this.props.showStatus) {
				columns.splice(3, 0, {
					field: 'referenceStatus',
					header: 'Status',
				});
			}
		} else {
			columns = this.props.columns;
		}
		return <DivContainer colClass="col-12">{this.renderDataTable(columns)}</DivContainer>;
	}
}

HistoryListContainer.defaultProps = {
	baseRestApiUrl: 'http://localhost:8080/o/rest-api',
	showStatus: false,
	columns: null,
};

HistoryListContainer.propTypes = {
	baseRestApiUrl: PropTypes.string.isRequired,
	columns: PropTypes.object,
	objectId: PropTypes.number.isRequired,
	objectType: PropTypes.string.isRequired,
	showStatus: PropTypes.bool,
};

export default HistoryListContainer;

/* eslint-disable react/jsx-handler-names */
import React from 'react';
import {DataTable} from 'primereact/datatable';
import Paginator from 'primereact/paginator';

export class CustomDataTable extends DataTable {
	createPaginator(position, totalRecords) {
		const className = `p-paginator-${position}`;
		return (
			<Paginator
				first={this.getFirst()}
				rows={this.getRows()}
				pageLinkSize={this.props.pageLinkSize}
				className={className}
				onPageChange={this.onPageChange}
				template={this.props.paginatorTemplate}
				totalRecords={totalRecords}
				rowsPerPageOptions={this.props.rowsPerPageOptions}
				currentPageReportTemplate={this.props.currentPageReportTemplate}
				leftContent={this.props.paginatorLeft}
				rightContent={this.props.paginatorRight}
				alwaysShow={this.props.alwaysShowPaginator}
			/>
		);
	}
}

export default CustomDataTable;

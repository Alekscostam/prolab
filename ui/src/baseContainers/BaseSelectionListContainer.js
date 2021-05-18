/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-handler-names */
import {Column} from 'primereact/column';
import React from 'react';
import DivContainer from '../components/DivContainer';
import BaseListContainer from './BaseListContainer';
import {PropTypes} from 'prop-types';
import {Dropdown} from 'primereact/dropdown';
import {DataTable} from 'primereact/datatable';

class BaseSelectionListContainer extends BaseListContainer {
    constructor(props, service) {
        super(props);
        this.service = service;
    }

    renderDataTable(columns) {
        const {criteria, first, list, loading, size} = this.state;
        const dynamicColumns = columns.map((col) => {
            return (
                <Column
                    selectionMode={col.selectionMode}
                    key={col.key ? col.key : col.field}
                    field={col.field}
                    header={col.header}
                    body={col.body}
                    className={col.className}
                    sortable={col.sortable}
                    style={col.width !== undefined ? {width: col.width} : null}
                />
            );
        });
        const rowsPerPageOptions = [5, 10, 20, 50, 100];
        const rowsPerPageOptionsObj = [{value: 5}, {value: 10}, {value: 20}, {value: 50}, {value: 100}];
        return (
            <DivContainer colClass='row'>
                <DivContainer>
                    <div className='p-datatable p-component p-datatable-responsive ade-table'>
                        <div className='p-paginator p-component p-unselectable-text p-paginator-top'>
                            <label id={'limit-label-id'} className='easy_label' htmlFor={'limit-input'}>
                                Pokaż na stronie
                            </label>
                            <Dropdown
                                ariaLabel={'Pokaż na stronie'}
                                key={'limit'}
                                id={'limit'}
                                inputId={'limit-input'}
                                name={'limit'}
                                //style={{ width: '100%' }}
                                value={this.state.criteria.limit}
                                options={rowsPerPageOptions}
                                onChange={(e) => this.handleChangeSc(e, 'value', () => this.handleChangeLimitObj(e))}
                                filter={false}
                                showClear={false}
                            />
                        </div>
                    </div>
                    <div className="datatable-responsive">
                        <DataTable
                            key='data-table'
                            emptyMessage='Brak rekordów do wyświetlenia'
                            className="p-datatable-responsive"
                            responsive
                            value={list}
                            paginator
                            rows={this.state?.criteria?.limitObj?.value || 10}
                            totalRecords={size}
                            lazy
                            first={first}
                            onPage={this.handlePage}
                            rowsPerPageOptions={rowsPerPageOptions}
                            onSort={this.handleSort}
                            sortField={criteria.sortField}
                            sortOrder={criteria.sortAsc ? 1 : -1}
                            loading={loading}
                            paginatorPosition='bottom'
                            currentPageReportTemplate={
                                size !== 0
                                    ? `Pozycje od ${first + 1} do ${first + criteria.maxResult > size ? size : first + criteria.maxResult} z ${size} łącznie`
                                    : '0 pozycji'
                            }
                            paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'
                            pageLinkSize={5}
                            onSelectionChange={this.props.handleOnSelectionChange}
                            selection={this.props.selection}
                            dataKey="id"
                            expandedRows={this.props.expandedRows}
                            onRowToggle={this.props.handleOnRowToggle}
                            onRowExpand={this.props.handleOnRowExpand}
                            onRowCollapse={this.props.handleOnRowCollapse}
                            rowExpansionTemplate={this.props.rowExpansionTemplate}
                            rowClassName={this.props.rowClassName}
                        >
                            {this.props.rowExpansionTemplate ? (
                                <Column expander headerStyle={{width: '3em'}}></Column>) : null}
                            {this.props.viewMode === "VIEW" || this.props.disableSelection === true ? null : (
                                <Column selectionMode={this.props.selectionMode}
                                        headerStyle={{width: '3em'}}></Column>)}
                            {dynamicColumns}
                        </DataTable>
                    </div>
                </DivContainer>
            </DivContainer>
        );
    }
}

BaseSelectionListContainer.defaultProps = {
    selection: undefined,
    selectionMode: "single",
    handleOnSelectionChange: undefined,
    //--------------------------------
    rowExpansionTemplate: undefined,
    handleOnRowToggle: undefined,
    handleOnRowExpand: undefined,
    handleOnRowCollapse: undefined,
    disableSelection: undefined,
}

BaseSelectionListContainer.propTypes = {
    selection: PropTypes.array.isRequired,
    selectionMode: PropTypes.string,
    handleOnSelectionChange: PropTypes.func.isRequired,
    disableSelection: PropTypes.bool,
    //------------------------------------------------
    rowExpansionTemplate: PropTypes.array,
    handleOnRowToggle: PropTypes.array,
    handleOnRowExpand: PropTypes.array,
    handleOnRowCollapse: PropTypes.array,
};

export default BaseSelectionListContainer;

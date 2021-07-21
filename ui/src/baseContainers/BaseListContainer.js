/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-handler-names */
import React from 'react';
// import { DataTable } from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Card} from 'primereact/card';
import PropTypes from 'prop-types';
import {Messages} from 'primereact/messages';
import BaseContainer from './BaseContainer';
import ActionButton from '../components/ActionButton';
import ActionLink from '../components/ActionLink';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import {Dropdown} from 'primereact/dropdown';
import {DataTable} from 'primereact/datatable';
import {Accordion, AccordionTab} from 'primereact/accordion';
import AppPrefixUtils from "../utils/AppPrefixUtils";

class BaseListContainer extends BaseContainer {
    constructor(props, service) {
        super(props);
        this.service = service;
        this.actionTemplate = this.actionTemplate.bind(this);
        this.booleanTemplate = this.booleanTemplate.bind(this);
        this.handleGoToDetail = this.handleGoToDetail.bind(this);
        this.handleGoToNew = this.handleGoToNew.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePage = this.handlePage.bind(this);
        this.readCriteriaFromCookie = this.readCriteriaFromCookie.bind(this);
        this.readMessage = this.readMessage.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.renderDataTable = this.renderDataTable.bind(this);
        this.renderCriteria = this.renderCriteria.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.prepareColumns = this.prepareColumns.bind(this);
        this.getList = this.getList.bind(this);
        this.renderView = this.renderView.bind(this);
        this.getCleanSearchCriteria = this.getCleanSearchCriteria.bind(this);
        this.getCleanSearchCriteriaPrototype = this.getCleanSearchCriteriaPrototype.bind(this);
        this.updateSearchCriteria = this.updateSearchCriteria.bind(this);
        this.updateSearchCriteriaPrototype = this.updateSearchCriteriaPrototype.bind(this);
        this.onAfterGetList = this.onAfterGetList.bind(this);
        this.handleChangeLimitObj = this.handleChangeLimitObj.bind(this);
        this.cleanSearchCriteria = this.cleanSearchCriteria.bind(this);
        this.renderSeparator = this.renderSeparator.bind(this);
        this.defaultLoading = true;
        if (service !== undefined && service !== null) {
            this.service.setUiMethods(this.blockUi, this.unblockUi);
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.initializeFromBackend();
        if (this.defaultLoading) {
            this.readCriteriaFromCookie();
        }
        this.readMessage();
    }

    readCriteriaFromCookie() {
        const criteria =
            this.readCookie(this.getCriteriaName()) !== undefined && this.readCookie(this.getCriteriaName()) != null
                ? this.updateSearchCriteriaPrototype(JSON.parse(this.readCookie(this.getCriteriaName())))
                : this.getCleanSearchCriteriaPrototype();
        this.removeCookie(this.getCriteriaName());
        if (this._isMounted) {
            criteria.limit = criteria.limit ? criteria.limit : 5;
            this.setState(
                {
                    loading: true,
                    criteria,
                    first: criteria.firstResult,
                },
                () => {
                    this.refreshTable();
                }
            );
        }
    }

    refreshTable() {
        this.getList();
    }

    onAfterGetList() {
    }

    getList() {
        const {criteria} = this.state;
        this.service
            .getList(criteria)
            .then((data) => {
                if (this._isMounted) {
                    this.setState(
                        {
                            list: data.content,
                            loading: false,
                            size: data.totalElements,
                        },
                        () => this.onAfterGetList()
                    );
                }
            })
            .catch((err) => {
                if (this._isMounted) {
                    this.setState(
                        {
                            list: [],
                            loading: false,
                            size: 0,
                        },
                        () => {
                            this.showErrorMessage('Wystąpił błąd systemu. Nie udało się pobrać listy.', 10000);
                        }
                    );
                }
            });
    }

    getCleanSearchCriteria() {
        return {
            firstResult: 0,
            maxResult: 10,
            limitObj: {value: 10},
            sortField: 'id',
            sortAsc: true,
            limit: 10
        };
    }

    getCleanSearchCriteriaPrototype() {
        const criteria = this.getCleanSearchCriteria();
        criteria.limitObj = {value: criteria.maxResult};
        return criteria;
    }

    cleanSearchCriteria() {
        this.setState({criteria: this.getCleanSearchCriteriaPrototype()}, () => this.handleFormSubmit());
    }

    updateSearchCriteria(criteria) {
        return {
            firstResult: criteria.firstResult,
            maxResult: criteria.maxResult,
            limitObj: {value: criteria.maxResult},
            sortField: criteria.sortField,
            sortAsc: criteria.sortAsc,
            limit: criteria.maxResult
        };
    }

    updateSearchCriteriaPrototype(criteria) {
        criteria = this.updateSearchCriteria(criteria);
        criteria.limitObj = {value: criteria.maxResult};
        criteria.limit = criteria.maxResult
        return criteria;
    }

    getCriteriaName() {
        return 'list-sc';
    }

    initializeFromBackend() {
    }

    handleSort(event) {
        if (this._isMounted) {
            this.setState(
                (prevState) => ({
                    loading: true,
                    criteria: {
                        ...prevState.criteria,
                        sortField: event.sortField,
                        sortAsc: event.sortOrder > 0,
                    },
                }),
                () => this.refreshTable()
            );
        }
    }

    handlePage(event) {
        if (this._isMounted) {
            this.setState(
                (prevState) => ({
                    loading: true,
                    first: event.first,
                    criteria: {
                        ...prevState.criteria,
                        firstResult: event.first,
                        maxResult: event.rows,
                        limitObj: {value: event.rows},
                        limit: event.rows
                    },
                }),
                () => this.refreshTable()
            );
        }
    }

    handleValidForm() {
        this.setState(
            (prevState) => ({
                blocking: false,
                loading: true,
                first: 0,
                criteria: {
                    ...prevState.criteria,
                    firstResult: 0,
                },
            }),
            () => this.refreshTable()
        );
    }

    getContainerListName() {
        return 'list-container';
    }

    readMessage() {
        const messageFromStorage = this.readCookie(this.getContainerListName());
        if (messageFromStorage !== undefined && messageFromStorage != null) {
            const message = JSON.parse(messageFromStorage);
            this.removeCookie(this.getContainerListName());
            if (
                message.severity !== undefined &&
                message.severity != null &&
                message.summary !== undefined &&
                message.summary != null &&
                message.detail !== undefined &&
                message.detail != null
            ) {
                this.showMessage(message.severity, message.summary, message.detail);
            }
        }
    }

    handleGoToDetail(href, e) {
        e.preventDefault();
        this.blockUi();
        const {criteria} = this.state;
        this.saveCookie(this.getCriteriaName(), JSON.stringify(criteria));
        window.location.href = AppPrefixUtils.locationHrefUrl(href);
    }

    handleGoToNew(e) {
        e.preventDefault();
        this.blockUi();
        const {newUrl} = this.props;
        const {criteria} = this.state;
        this.saveCookie(this.getCriteriaName(), JSON.stringify(criteria));
        window.location.href = AppPrefixUtils.locationHrefUrl(newUrl);
    }

    actionTemplate(rowData) {
        const {detailUrl} = this.props;
        const href = `${detailUrl}/${rowData?.id}`;
        return (
            <ActionLink
                label={'Szczegóły'}
                handleClick={this.handleGoToDetail.bind(this, href)}
                variant='blue'
                className='p-link hover-underline'
                key={'view-button'}
                iconSize='xs'
                iconName='mdi-arrow-right'
                iconColor='blue'
            />
        );
    }

    booleanTemplate(field, rowData) {
        if (rowData && rowData[field] !== null && rowData[field] !== undefined && rowData[field] === true) {
            return 'TAK';
        } else return 'NIE';
    }

    addButton() {
        const {newUrl} = this.props;
        return <ActionButton label={'Dodaj'} handleClick={this.handleGoToDetail.bind(this, newUrl)}
                             key={'add-button'}/>;
    }

    handleChangeSc(event, optionValue, onAfterSetState) {
        const varName = event.target.name;
        let varValue = event.checked !== undefined ? event.checked : event.target.value;
        if (varValue === '' || varValue === null) {
            varValue = undefined;
        }
        if (optionValue !== null && optionValue !== undefined) {
            let varValueEnum = undefined;
            if (varValue) {
                varValueEnum = varValue[optionValue];
            }
            if (this._isMounted) {
                this.setState(
                    (prevState) => ({
                        criteria: {
                            ...prevState.criteria,
                            [`${varName}Obj`]: varValue,
                            [varName]: varValueEnum,
                        },
                    }),
                    onAfterSetState ? onAfterSetState : null
                );
            }
        } else {
            if (this._isMounted) {
                this.setState(
                    (prevState) => ({
                        criteria: {
                            ...prevState.criteria,
                            [varName]: varValue,
                        },
                    }),
                    onAfterSetState ? onAfterSetState : null
                );
            }
        }
    }

    handleChangeLimitObj(v) {
        this.setState(
            (prevState) => ({
                first: 0,
                criteria: {
                    ...prevState.criteria,
                    firstResult: 0,
                    maxResult: v.value,
                    maxResultObj: v.value,
                    limit: v.value
                },
            }),
            () => this.refreshTable()
        );
    }

    renderDataTable(columns) {
        const {criteria, first, list, loading, size} = this.state;
        const dynamicColumns = columns.map((col) => {
            return (
                <Column
                    key={col.key ? col.key : col.field}
                    field={col.field}
                    sortField={col.sortField !== undefined ? col.sortField : col.field}
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
                {this.renderPagination(rowsPerPageOptions)}
                <div className="datatable-responsive">
                    <DataTable
                        key='data-table'
                        emptyMessage='Brak rekordów do wyświetlenia'
                        className="p-datatable-responsive"
                        responsive
                        value={list}
                        paginator
                        rows={criteria.maxResult}
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
                        pageLinkSize={5}>
                        {dynamicColumns}
                    </DataTable>
                </div>
            </DivContainer>
        );
    }

    renderPagination(rowsPerPageOptions) {
        return <div className='p-datatable p-component p-datatable-responsive ade-table'>
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
    }

    prepareColumns() {
        return [];
    }

    renderCriteria() {
        return <DivContainer colClass='row'/>;
    }

    renderSeparator() {
        return <DivContainer colClass='col-12 separator-container'>
            <DivContainer colClass='row'>
                <DivContainer colClass='separator'></DivContainer>
            </DivContainer>
        </DivContainer>
    }

    onKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleFormSubmit();
        }
    }

    renderView() {
        return (
            <DivContainer colClass=''>
                {this.renderSeparator()}
                <Messages id="custom-messages" ref={(el) => (this.messages = el)}></Messages>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <Card header={this.renderHeader()}>
                        <DivContainer colClass='row'>
                            <Accordion>
                                <AccordionTab header="Kryteria filtrowania">
                                    <form
                                        className='form-search-criteria'
                                        onSubmit={(e) => {
                                            this.handleFormSubmit(e);
                                        }}
                                        onKeyDown={e => this.onKeyDown(e)}
                                        //avoid setting red border just after the page has loaded (red border because of undefined required value in FF)
                                        noValidate>
                                        <DivContainer colClass='col-12'>
                                            {this.renderCriteria()}
                                            <DivContainer colClass='row'>
                                                <DivContainer colClass='col-md-12'>
                                                    <ActionButton className='float-right' label='Filtruj'
                                                                  handleClick={this.handleFormSubmit}/>
                                                    <ActionButton className='float-right mr-2' label='Wyczyść'
                                                                  handleClick={this.cleanSearchCriteria}/>
                                                </DivContainer>
                                            </DivContainer>
                                        </DivContainer>
                                    </form>
                                </AccordionTab>
                            </Accordion>
                        </DivContainer>
                        {this.renderDataTable(this.prepareColumns())}
                    </Card>
                </BlockUi>
            </DivContainer>
        );
    }
}

BaseListContainer.defaultProps = {
    roles: '',
};

BaseListContainer.propTypes = {
    detailUrl: PropTypes.string,
    newUrl: PropTypes.string,
    roles: PropTypes.string,
};

export default BaseListContainer;

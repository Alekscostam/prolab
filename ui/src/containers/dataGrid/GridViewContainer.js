import React from 'react';
import {ViewValidatorUtils} from "../../utils/parser/ViewValidatorUtils";
import DataGrid, {
    Column,
    FilterPanel,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    LoadPanel,
    RemoteOperations,
    Scrolling,
    Sorting
} from 'devextreme-react/data-grid';
import ViewService from "../../services/ViewService";
import {readCookieGlobal} from "../../utils/cookie";
import {Cookie} from "../../utils/constants";
import BaseContainer from "../../baseContainers/BaseContainer";
import ViewDataService from "../../services/ViewDataService";
import DataGridStore from "./DataGridStore";
import PropTypes from "prop-types";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class GridViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        console.log('GridViewContainer -> constructor')
        super(props);
        this.viewService = new ViewService();
        this.viewDataService = new ViewDataService();
        this.dataGridStore = new DataGridStore();
        this.state = {
            loading: true,
            elementId: props.id,
            viewMode: props.viewMode,
            parsedView: {},
            parsedViewData: {},
            menuItem: null,
            gridViewColumns: []
        };
        this.dataGrid = null;
    }

    componentDidMount() {
        console.log('GridViewContainer -> componentDidMount')
        this._isMounted = true;
        this.downloadData();
        this.readCriteriaFromCookie();

    }

    readCriteriaFromCookie() {
        let menuItemTmp = readCookieGlobal(Cookie.CURRENT_SELECTED_MENU_ITEM)
        this.setState({menuItem: menuItemTmp})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('GridViewContainer -> componentDidUpdate prevProps id={%s} id={%s}', prevProps.id, this.props.id)
        if (prevProps.id !== this.props.id) {
            this.downloadData();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    downloadData() {
        const id = this.props.id;
        this.setState({
            loading: true
        }, () => {
            this.viewService.getView(id).then(responseData => {
                if (this._isMounted) {
                    ViewValidatorUtils.validation(responseData)
                    let gridViewColumnsTmp = [];
                    new Array(responseData.gridColumns).forEach(gridColumns => {
                        gridColumns?.forEach(group => {
                            group.columns?.forEach(column => {
                                gridViewColumnsTmp.push(column);
                            });
                        });
                    });
                    this.setState({
                        loading: false,
                        elementId: this.props.id,
                        parsedView: responseData,
                        gridViewColumns: gridViewColumnsTmp,
                    }, () => {
                        /*
                        this.dataGridStore.getDataGridStore(id).then(responseData => {
                            this.setState({
                                loading: false,
                                parsedData: responseData
                            });
                        }).catch(err => {
                            console.error('Error getViewData in GridView. Exception = ', err)
                            this.setState({
                                loading: false
                            }, () => {
                                this.showErrorMessage("Nie udało się pobrać danych strony o id: " + id);
                            });
                        });
                         */
                    });
                }
            }).catch(err => {
                console.error('Error getView in GridView. Exception = ', err)
                this.setState({
                    loading: false
                }, () => {
                    this.showErrorMessage("Nie udało się pobrać danych strony o id: " + id);
                });
            });
        });
    }

    getDefaultSortOrder(value) {
        if (value !== undefined && value !== null) {
            switch (value.toUpperCase()) {
                case true:
                    return 'asc';
                case false:
                    return 'desc';
                default:
                    return null;
            }
        }
        return null;
    }

    getType(type) {

    }

    //override
    getBreadcrumbsName() {
        let menuItemCookie = readCookieGlobal(Cookie.CURRENT_SELECTED_MENU_ITEM)
        return menuItemCookie?.name || 'Unnamed';
    }

    //override
    getViewInfoName() {
        return this.state.parsedView?.viewInfo?.name;
    }

    //override
    renderContent() {
        const showGroupPanel = this.state.parsedView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.state.parsedView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.state.parsedView?.gridOptions?.columnAutoWidth || false;
        const rowAutoHeight = this.state.parsedView?.gridOptions?.rowAutoHeight || false;
        const allowedPageSizes = [5, 10, 50, 100, 'all'];
        //TODO headerAutoHeight
        const headerAutoHeight = this.state.parsedView?.gridOptions?.headerAutoHeight || false;
        return (
            <React.Fragment>
                {this.state.loading ? null : <React.Fragment>
                    <DataGrid
                        id="grid-container"
                        keyExpr="id"
                        ref={(ref) => this.dataGrid = ref}
                        showBorders={true}
                        wordWrapEnabled={rowAutoHeight}
                        columnAutoWidth={columnAutoWidth}
                        dataSource={this.dataGridStore.getDataGridStore(this.props.id)}
                        remoteOperations={true}
                        allowColumnReordering={true}
                        allowColumnResizing={true}
                        showColumnLines={true}
                        showRowLines={true}
                    >
                        <RemoteOperations groupPaging={true} filtering={true} summary={true} sorting={true}
                                          paging={true}/>

                        <FilterRow visible={true}/>
                        <FilterPanel visible={true}/>
                        <HeaderFilter visible={true} allowSearch={true}/>

                        <Grouping autoExpandAll={groupExpandAll}/>
                        <GroupPanel visible={showGroupPanel}/>
                        <Sorting mode="multiple"/>

                        <Scrolling mode="infinite"/>
                        <LoadPanel enabled={true}/>

                        {/*
                        <Scrolling rowRenderingMode='virtual'></Scrolling>
                        <Paging defaultPageSize={10}/>
                        <Pager
                            visible={true}
                            allowedPageSizes={allowedPageSizes}
                            displayMode={this.state.displayMode}
                            showPageSizeSelector={this.state.showPageSizeSelector}
                            showInfo={this.state.showInfo}
                            showNavigationButtons={this.state.showNavButtons}/>
                        */}
                        {this.state.gridViewColumns.map((c) => {
                            if (c.visible)
                                return <Column id={`data_grid_id_${c.id}`}
                                               key={`data_grid_key_${c.id}`}
                                               name={c.label}
                                               dataField={c.fieldName.toString().toLowerCase()}
                                               visible={c.visible}
                                               allowSorting={c.isSort}
                                               allowGrouping={c.isSort}
                                               allowFiltering={c.isFilter}
                                               width={columnAutoWidth ? undefined : c.width}
                                               sortIndex={c.sortIndex}
                                               defaultSortOrder={this.getDefaultSortOrder(c.sortOrder)}>
                                    <HeaderFilter visible={c.isFilter} groupInterval={10000}/>
                                </Column>
                            return null;
                        })}
                    </DataGrid>
                </React.Fragment>}
            </React.Fragment>
        );
    }

};

GridViewContainer.defaultProps = {
    viewMode: 'VIEW'
};

GridViewContainer.propTypes = {
    id: PropTypes.number.isRequired,
    backendUrl: PropTypes.string.isRequired,
};
import React from 'react';
import {ViewValidatorUtils} from "../utils/parser/ViewValidatorUtils";
import DataGrid, {Column, FilterRow, HeaderFilter, Sorting} from 'devextreme-react/data-grid';
import ViewService from "../services/ViewService";
import PropTypes from "prop-types";
import {readCookieGlobal} from "../utils/cookie";
import {Cookie} from "../utils/constants";
import BaseContainer from "../baseContainers/BaseContainer";
//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class GridViewContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        console.log('GridViewContainer -> constructor')
        super(props);
        this.viewService = new ViewService();
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
                        parsedView: responseData,
                        gridViewColumns: gridViewColumnsTmp,
                    }, () => {
                        this.viewService.getViewData(this.props.id).then(responseData => {
                            this.state = {
                                loading: false
                            }
                        }).catch(err => {
                            console.error('Error getViewData in GridView. Exception = ', err)
                            this.setState({
                                loading: false
                            }, () => {
                                this.showErrorMessage("Nie udało się pobrać danych strony o id: " + id);
                            });
                        });
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
        const columnAutoWidth = this.state.parsedView?.gridOptions?.columnAutoWidth || false;
        return (
            <React.Fragment>
                <DataGrid
                    id="grid-container"
                    keyExpr="id"
                    ref={(ref) => this.dataGrid = ref}
                    showBorders={true}
                    wordWrapEnabled={true}
                    columnAutoWidth={columnAutoWidth}
                >
                    <FilterRow visible={true}/>
                    <HeaderFilter visible={true}/>
                    <Sorting mode="multiple"/>
                    {this.state.gridViewColumns.map((c) =>
                        <Column key={c.id}
                                name={c.label}
                                dataField={c.fieldName}
                                visible={c.visible}
                                allowSorting={c.isSort}
                                allowGrouping={c.isSort}
                                allowFiltering={c.isFilter}
                                width={columnAutoWidth ? undefined : c.width}
                                sortIndex={c.sortIndex}
                                defaultSortOrder={this.getDefaultSortOrder(c.sortOrder)}>
                            <HeaderFilter visible={c.isFilter} groupInterval={10000}/>
                        </Column>
                    )}
                </DataGrid>
            </React.Fragment>
        );
    }
}

GridViewContainer.defaultProps = {
    viewMode: 'VIEW',
};

GridViewContainer.propTypes = {
    id: PropTypes.number.isRequired,
    viewMode: PropTypes.string.isRequired
};
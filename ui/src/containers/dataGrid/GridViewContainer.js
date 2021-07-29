import React from 'react';
import {ViewValidatorUtils} from "../../utils/parser/ViewValidatorUtils";
import DataGrid, {
    Button,
    Column, Editing,
    FilterPanel,
    FilterRow,
    Grouping,
    GroupPanel,
    HeaderFilter,
    Pager,
    Paging,
    RemoteOperations,
    Scrolling,
    Selection,
    Sorting
} from 'devextreme-react/data-grid';
import ViewService from "../../services/ViewService";
import BaseContainer from "../../baseContainers/BaseContainer";
import ViewDataService from "../../services/ViewDataService";
import DataGridStore from "./DataGridStore";
import PropTypes from "prop-types";
import ShortcutsButton from "../../components/ShortcutsButton";
import HeaderButton from "../../components/HeaderButton";
import ActionButton from "../../components/ActionButton";
import DivContainer from "../../components/DivContainer";
import ActionButtonWithMenu from "../../components/ActionButtonWithMenu";
import SelectionPanel from "../../components/SelectionPanel";
import {GridViewUtils} from "../../utils/GridViewUtils";
import Constants from "../../utils/constants";
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
        this.dataGrid = null;
        this.state = {
            loading: true,
            elementId: props.id,
            viewMode: props.viewMode,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowKeys: []
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
    }

    componentDidMount() {
        console.log('GridViewContainer -> componentDidMount')
        this._isMounted = true;
        this.downloadData();
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
            this.viewService.getView(id).then(responseView => {
                if (this._isMounted) {
                    ViewValidatorUtils.validation(responseView)
                    console.log('GridViewContainer -> fetch data: ', responseView)
                    let gridViewColumnsTmp = [];
                    let pluginsListTmp = [];
                    let documentsListTmp = [];
                    let oppAddButtonTmp = GridViewUtils.containsOperationButton(responseView.operations, 'OP_ADD');
                    new Array(responseView.gridColumns).forEach(gridColumns => {
                        gridColumns?.forEach(group => {
                            group.columns?.forEach(column => {
                                column.groupName = group.groupName;
                                column.freeze = group.freeze;
                                gridViewColumnsTmp.push(column);
                            });
                        });
                    });
                    console.log('GridViewContainer -> fetch columns: ', gridViewColumnsTmp)
                    for (let plugin in responseView?.pluginsList) {
                        pluginsListTmp.push({
                            id: responseView?.pluginsList[plugin].id,
                            label: responseView?.pluginsList[plugin].label,
                            /*    command:(e) => {
                                alert(e)
                            } */
                        });
                    }
                    for (let document in responseView?.documentsList) {
                        documentsListTmp.push({
                            id: responseView?.documentsList[document].id,
                            label: responseView?.documentsList[document].label,
                            /*    command:(e) => {
                                alert(e)
                            } */
                        });
                    }
                    this.setState({
                        loading: false,
                        elementId: this.props.id,
                        parsedGridView: responseView,
                        gridViewColumns: gridViewColumnsTmp,
                        oppAddButton: oppAddButtonTmp,
                        pluginsList: pluginsListTmp,
                        documentsList: documentsListTmp,
                        selectedRowKeys: []
                    }, () => {
                        this.setState({loading: false,});
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

    //override
    getBreadcrumbsName() {
        return this.getViewInfoName() || 'Unnamed';
    }

    //override
    getViewInfoName() {
        return this.state.parsedGridView?.viewInfo?.name;
    }

    onSelectionChanged({selectedRowKeys}) {
        this.setState({
            selectedRowKeys: selectedRowKeys
        });
    }

    renderMyCommand() {
        return <a href="#" onClick={this.logMyCommandClick}>My command</a>
    }

    //TODO dopracować
    /*
    Typ kolumny:
        C – Znakowy
        N – Numeryczny/Liczbowy
        B – Logiczny (0/1)
        L – Logiczny (T/N)
        D – Data
        E – Data + czas
        T – Czas
        O – Opisowe
        I – Obrazek
        IM – Obrazek multi
        H - Hyperlink
     */
    specifyColumnType(type) {
        if (type) {
            switch (type) {
                case 'C':
                    return 'string';
                case 'N':
                    return 'number';
                case 'B':
                    return 'boolean';
                case 'L':
                    return 'boolean';
                case 'D':
                    return 'datetime';
                case 'E':
                    return 'datetime';
                case 'T':
                    return 'datetime';
                case 'O':
                case 'I':
                case 'IM':
                case 'H':
                    return 'string';
            }
        }
        return undefined;
    }

    //TODO dopracować
    specifyColumnFormat(format) {
        if (format) {
            switch (format) {
                case 'D':
                    return Constants.DATE_FORMAT.DATE_FORMAT;
                case 'E':
                    return Constants.DATE_FORMAT.DATE_TIME_FORMAT;
                case 'T':
                    return Constants.DATE_FORMAT.TIME_FORMAT;
            }
        }
        return undefined;
    }

    renderGridCell(data) {
        return <a href={data.text} target='_blank' rel='noopener noreferrer'>Website</a>;
    }

    customizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            columns?.forEach(column => {
                if (column.name === "_ROWNUMBER") {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinition = this.state.gridViewColumns?.filter(value => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase());
                    const columnTmp = columnDefinition[0];
                    if (columnTmp) {
                        column.visible = columnTmp?.visible;
                        //column.allowCollapsing = true;
                        //column.allowEditing = false;
                        //column.allowExporting = false;
                        column.allowFiltering = columnTmp?.isFilter;
                        column.allowFixing = true;
                        column.allowGrouping = columnTmp?.isGroup;
                        //column.allowHiding = true;
                        column.allowReordering = true;
                        column.allowResizing = true;
                        column.allowSorting = columnTmp?.isSort;
                        //column.autoExpandGroup = true;
                        //showInColumnChooser: true
                        //trueText: "prawda"
                        //encodeHtml: true
                        //falseText: "false"
                        //filterOperations: undefined
                        column.headerId = 'column_' + INDEX_COLUMN + '_' + columnTmp?.fieldName?.toLowerCase();
                        //column.parseValue: ƒ parseValue(text)
                        //defaultCalculateCellValue: ƒ calculateCellValue(data, skipDeserialization)
                        //defaultCalculateFilterExpression: ƒ ()
                        //defaultCreateFilterExpression: ƒ (filterValue)
                        //defaultParseValue: ƒ parseValue(text)
                        //defaultSetCellValue: ƒ defaultSetCellValue(data, value)
                        //calculateCellValue: ƒ calculateCellValue(data, skipDeserialization)
                        //calculateFilterExpression: ƒ ()
                        //createFilterExpression: ƒ (filterValue)
                        //TODO zmienić
                        column.width = columnTmp?.width || 100;
                        column.name = columnTmp?.fieldName;
                        column.caption = columnTmp?.label;
                        column.dataType = this.specifyColumnType(columnTmp?.type);
                        column.format = this.specifyColumnFormat(columnTmp?.type);
                        column.fixed = columnTmp.freeze !== undefined && columnTmp.freeze !== null ? (columnTmp.freeze?.toLowerCase() === "left" || columnTmp.freeze?.toLowerCase() === "right") : false;
                        column.fixedPosition = !!columnTmp.freeze ? columnTmp.freeze?.toLowerCase() : null;
                        INDEX_COLUMN++;
                    } else {
                        column.visible = false;
                    }
                }
            });
        } else {
            //when no data
            this.state.gridViewColumns.forEach(columnDefinition => {
                if (columnDefinition.visible === true) {
                    let column = {}
                    column.allowFiltering = false;
                    column.allowFixing = false;
                    column.allowGrouping = false;
                    column.allowSorting = false;
                    column.width = columnDefinition?.width;
                    column.name = columnDefinition?.fieldName;
                    column.caption = columnDefinition?.label;
                    columns.push(column)
                }
            })
        }
    }

    showHeaderButtons() {
        return this.state.oppAddButton !== null;
    }

    //override
    renderContent() {
        const showGroupPanel = this.state.parsedGridView?.gridOptions?.showGroupPanel || false;
        const groupExpandAll = this.state.parsedGridView?.gridOptions?.groupExpandAll || false;
        const columnAutoWidth = this.state.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.state.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const allowedPageSizes = [5, 10, 50, 100, 'all'];
        //TODO headerAutoHeight
        const headerAutoHeight = this.state.parsedGridView?.gridOptions?.headerAutoHeight || false;
        const dataGridStore = this.dataGridStore.getDataGridStore(this.props.id);
        const customizedColumns = this.customizeColumns;
        return (
            <React.Fragment>
                {this.state.loading ? null : <React.Fragment>
                    <DivContainer>
                        {this.showHeaderButtons() ?
                            <HeaderButton>
                                {this.state.oppAddButton === null ? null :
                                    <ActionButton label={this.state.oppAddButton?.label}
                                                  className="float-right"></ActionButton>}
                            </HeaderButton> : null}
                        <ShortcutsButton items={this.state.parsedGridView?.shortcutButtons}>

                            {this.state.documentsList?.length > 0 ?
                                <ActionButtonWithMenu id="button_documents"
                                                      className="mr-2"
                                                      iconName='mdi-file-document'
                                                      items={this.state.documentsList}
                                                      title="Pluginy"/> : null}
                            {this.state.pluginsList?.length > 0 ?
                                <ActionButtonWithMenu id="button_plugins"
                                                      className="mr-2"
                                                      iconName='mdi-puzzle'
                                                      items={this.state.pluginsList}
                                                      title="Dokumenty"/> : null}
                        </ShortcutsButton>

                        <SelectionPanel selectedRowKeys={this.state.selectedRowKeys}
                                        operations={this.state.parsedGridView?.operations}
                                        handleDelete={() => {
                                            //TODO
                                            console.log('handleDelete')
                                        }}
                                        handleRestore={() => {
                                            //TODO
                                            console.log('handleRestore')
                                        }}
                                        handleCopy={() => {
                                            //TODO
                                            console.log('handleCopy')
                                        }}
                                        handleArchive={() => {
                                            //TODO
                                            console.log('handleArchive')
                                        }}/>
                        <DataGrid
                            id="grid-container"
                            className="grid-container"
                            keyExpr="id"
                            ref={(ref) => this.dataGrid = ref}
                            dataSource={dataGridStore}
                            customizeColumns={customizedColumns}
                            wordWrapEnabled={rowAutoHeight}
                            columnAutoWidth={columnAutoWidth}
                            remoteOperations={true}
                            allowColumnReordering={true}
                            allowColumnResizing={true}
                            showColumnLines={true}
                            showRowLines={true}
                            showBorders={true}
                            columnHidingEnabled={false}
                            width="100%"
                            rowAlternationEnabled={false}
                            onSelectionChanged={(selectedRowKeys) => {
                                this.setState({
                                    selectedRowKeys: selectedRowKeys?.selectedRowKeys
                                })
                            }}>
                            <RemoteOperations groupPaging={true} filtering={true} summary={true}
                                              sorting={true}
                                              paging={true}/>

                            <FilterRow visible={true}/>
                            <FilterPanel visible={true}/>
                            <HeaderFilter visible={true} allowSearch={true}/>

                            <Grouping autoExpandAll={groupExpandAll}/>
                            <GroupPanel visible={showGroupPanel}/>

                            <Sorting mode="multiple"/>

                            <Selection
                                mode="multiple"
                                selectAllMode='allPages'
                                showCheckBoxesMode='onClick'
                            />

                            {/* zobaczymy który typ paginacji wybiorą
                            <Scrolling mode="infinite"/>
                            <LoadPanel enabled={true}/>
                            */}

                            <Paging defaultPageSize={10}/>
                            <Pager
                                visible={true}
                                allowedPageSizes={allowedPageSizes}
                                displayMode={this.state.displayMode}
                                showPageSizeSelector={this.state.showPageSizeSelector}
                                showInfo={this.state.showInfo}
                                showNavigationButtons={this.state.showNavButtons}/>

                            <Editing mode="cell"/>

                            {/* tak nie działa :(
                            {this.state.gridViewColumns.map((c) => {
                                if (c.visible)
                                    return <React.Fragment>
                                        <Column id={`data_grid_id_${c.id}`}
                                                key={`data_grid_key_${c.id}`}
                                                name={c.label}
                                                dataField={c.fieldName.toString().toLowerCase()}
                                                visible={c.visible}
                                                allowSorting={c.isSort}
                                                allowGrouping={c.isSort}
                                                allowFiltering={c.isFilter}
                                                width={columnAutoWidth ? undefined : c.width}
                                                sortIndex={c.sortIndex}
                                                defaultSortOrder={this.getDefaultSortOrder(c.sortOrder)}

                                        >
                                            <HeaderFilter visible={c.isFilter} groupInterval={10000}/>
                                        </Column>
                                    </React.Fragment>
                                return null;
                            })}
                         */}

                        </DataGrid>
                    </DivContainer>
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
    backendUrl: PropTypes.string.isRequired
};
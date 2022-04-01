import React from "react";
import ConsoleHelper from "../../utils/ConsoleHelper";
import moment from "moment";
import Constants from "../../utils/Constants";
import {GridViewUtils} from "../../utils/GridViewUtils";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import ReactDOM from "react-dom";
import OperationsButtons from "../../components/prolab/OperationsButtons";
import {EntryResponseUtils} from "../../utils/EntryResponseUtils";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import {Column} from "devextreme-react/data-grid";

class BaseViewComponent extends React.Component {

    calculateCustomFilterExpression(value, operations, target, columnDefinition) {
        ConsoleHelper('calculateFilterExpression:: value: %s operations: %s target: %s columnDefinition: %s', value, operations, target, JSON.stringify(columnDefinition))
        try {
            if (!!columnDefinition) {
                if (operations === "between") {
                    let dateFormatted1 = this.formatDateFilterExpression(columnDefinition.type, value[0]);
                    let dateFormatted2 = this.formatDateFilterExpression(columnDefinition.type, value[1]);
                    return this.customFilterExpression(operations, columnDefinition.fieldName, [dateFormatted1, dateFormatted2]);
                } else {
                    const dateFormatted = this.formatDateFilterExpression(columnDefinition.type, value);
                    return this.customFilterExpression(operations, columnDefinition.fieldName, dateFormatted);
                }
            }
        } catch (err) {
            return undefined;
        }
    }

    formatDateFilterExpression(type, value) {
        const dateMoment = moment(value);
        if (type === "D") {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_FORMAT_MOMENT)
        } else if (type === "E") {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_TIME_FORMAT_MOMENT)
        } else {
            throw new Error('BAD_TYPE');
        }
    }

    customFilterExpression(operations, fieldName, dateFormatted) {
        switch (operations) {
            case '=':
                return [[fieldName, '=', dateFormatted]];
            case '<>':
                return [[fieldName, '<>', dateFormatted]];
            case '<':
                return [[fieldName, '<', dateFormatted]];
            case '>':
                return [[fieldName, '>', dateFormatted]];
            case '<=':
                return [[fieldName, '<=', dateFormatted]];
            case '>=':
                return [[fieldName, '>=', dateFormatted]];
            case 'between':
                return [[fieldName, '>=', dateFormatted[0]], 'and', [fieldName, '<=', dateFormatted[1]]];
            default:
                return undefined;
        }
    }

    menuWidth(showButton, widthTmp) {
        if (showButton) {
            widthTmp += 35;
        } else {
            widthTmp += 5;
        }
        return widthTmp;
    }

    postCustomizeColumns = (columns) => {
        let INDEX_COLUMN = 0;
        if (columns?.length > 0) {
            //when viewData respond a lot of data
            columns.filter((column) => column.visible === true)?.forEach((column) => {
                if (column.name === '_ROWNUMBER') {
                    //rule -> hide row with autonumber
                    column.visible = false;
                } else {
                    //match column after field name from view and viewData service
                    let columnDefinitionArray = this.props.gridViewColumns?.filter((value) => value.fieldName?.toUpperCase() === column.dataField?.toUpperCase());
                    const columnDefinition = columnDefinitionArray[0];
                    if (columnDefinition) {
                        column.visible = columnDefinition?.visible;
                        column.allowFiltering = columnDefinition?.isFilter;
                        column.allowFixing = true;
                        column.allowGrouping = columnDefinition?.isGroup;
                        column.allowReordering = true;
                        column.allowResizing = true;
                        column.allowSorting = columnDefinition?.isSort;
                        column.visibleIndex = columnDefinition?.columnOrder;
                        column.headerId = 'column_' + INDEX_COLUMN + '_' + columnDefinition?.fieldName?.toLowerCase();
                        //TODO zmienić
                        column.width = columnDefinition?.width || 100;
                        column.name = columnDefinition?.fieldName;
                        column.caption = columnDefinition?.label;
                        column.dataType = GridViewUtils.specifyColumnType(columnDefinition?.type);
                        column.format = GridViewUtils.specifyColumnFormat(columnDefinition?.type);
                        // column.editorOptions = GridViewUtils.specifyEditorOptions(columnDefinition?.type);
                        column.cellTemplate = GridViewUtils.cellTemplate(columnDefinition);
                        column.fixed = columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right' : false;
                        column.fixedPosition = !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
                        if (!!columnDefinition.groupIndex && columnDefinition.groupIndex > 0) {
                            column.groupIndex = columnDefinition.groupIndex;
                        }
                        if (columnDefinition?.type === 'D' || columnDefinition?.type === 'E') {
                            column.calculateFilterExpression = (value, selectedFilterOperations, target) => this.calculateCustomFilterExpression(value, selectedFilterOperations, target, columnDefinition)
                        }
                        column.headerFilter = {groupInterval: null}
                        column.renderAsync = true;
                        INDEX_COLUMN++;
                    } else {
                        column.visible = false;
                    }
                }
            });
            let operationsRecord = this.props.parsedGridView?.operationsRecord;
            let operationsRecordList = this.props.parsedGridView?.operationsRecordList;
            if (!(operationsRecord instanceof Array)) {
                operationsRecord = [];
                operationsRecord.push(this.props.parsedGridView?.operationsRecord)
            }
            if (operationsRecord instanceof Array && operationsRecord.length > 0) {
                columns?.push({
                    caption: '',
                    fixed: true,
                    width: 10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0)),
                    fixedPosition: 'right',
                    cellTemplate: (element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        const subViewId = this.props.elementSubViewId;
                        const kindView = this.props.elementKindView;
                        const recordId = info.row?.data?.ID;
                        const parentId = this.props.elementRecordId;
                        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
                        let viewId = this.props.id;
                        viewId = GridViewUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.render(<div style={{textAlign: 'center', display: 'flex'}}>
                            <OperationsButtons labels={this.labels}
                                               operations={operationsRecord}
                                               operationList={operationsRecordList}
                                               info={info}
                                               handleEdit={() => {
                                                        let result = this.props.handleBlockUi();
                                                        if (result) {
                                                            this.crudService
                                                                .editEntry(viewId, recordId, parentId, kindView, '')
                                                                .then((entryResponse) => {
                                                                    EntryResponseUtils.run(entryResponse, () => {
                                                                        if (!!entryResponse.next) {
                                                                            this.crudService
                                                                                .edit(viewId, recordId, parentId, kindView)
                                                                                .then((editDataResponse) => {
                                                                                    this.setState({
                                                                                        editData: editDataResponse
                                                                                    }, () => {
                                                                                        this.props.handleShowEditPanel(editDataResponse);
                                                                                    });
                                                                                })
                                                                                .catch((err) => {
                                                                                    this.props.showErrorMessages(err);
                                                                                });
                                                                        } else {
                                                                            this.props.handleUnblockUi();
                                                                        }
                                                                    }, () => this.props.handleUnblockUi());
                                                                }).catch((err) => {
                                                                this.props.showErrorMessages(err);
                                                            });
                                                        }
                                                    }}
                                               hrefSubview={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`)}
                                               handleHrefSubview={() => {
                                                        let newUrl = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${!!currentBreadcrumb ? currentBreadcrumb : ``}`);
                                                        window.location.assign(newUrl);
                                                    }}
                                               handleArchive={() => {
                                                        this.props.handleArchiveRow(recordId)
                                                    }}
                                               handleCopy={() => {
                                                        this.props.handleCopyRow(recordId)
                                                    }}
                                               handleDelete={() => {
                                                        this.props.handleDeleteRow(recordId)
                                                    }}
                                               handleRestore={() => {
                                                        this.props.handleRestoreRow(recordId)
                                                    }}/>
                        </div>, element);
                    },
                });
            }
        } else {
            //when no data
            this.props.gridViewColumns.forEach((columnDefinition) => {
                if (columnDefinition.visible === true) {
                    let column = {};
                    column.allowFiltering = false;
                    column.allowFixing = false;
                    column.allowGrouping = false;
                    column.allowSorting = false;
                    column.width = columnDefinition?.width;
                    column.name = columnDefinition?.fieldName;
                    column.caption = columnDefinition?.label;
                    columns.push(column);
                }
            });
        }
    };

    preGenerateColumnsDefinition() {
        let columns = [];
        this.props.gridViewColumns?.forEach((columnDefinition, INDEX_COLUMN) => {
            let sortOrder;
            if (!!columnDefinition?.sortIndex && columnDefinition?.sortIndex > 0 && !!columnDefinition?.sortOrder) {
                sortOrder = columnDefinition?.sortOrder?.toLowerCase();
            }
            columns.push(<Column
                key={INDEX_COLUMN}
                dataField={columnDefinition.fieldName}
                sortOrder={sortOrder}
                sortIndex={columnDefinition?.sortIndex}
            />);
        })
        return columns;
    }

    waitForSuccess() {
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

}

export default BaseViewComponent;
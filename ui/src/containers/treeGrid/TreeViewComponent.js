import React from 'react';
import PropTypes from "prop-types";
import CrudService from "../../services/CrudService";
import ConsoleHelper from "../../utils/ConsoleHelper";
import {TreeList} from "devextreme-react";
import {
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
    LoadPanel,
    Scrolling,
    Selection,
    Sorting
} from "devextreme-react/tree-list";
import {RemoteOperations} from "devextreme-react/data-grid";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import ReactDOM from "react-dom";
import OperationsButtons from "../../components/prolab/OperationsButtons";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import UrlUtils from "../../utils/UrlUtils";
import {EntryResponseUtils} from "../../utils/EntryResponseUtils";
import {
    MemoizedBoolInput,
    MemoizedChar,
    MemoizedLogicInput,
    MemoizedNumericInput,
    MemoizedPasswordInput,
    TreeListUtils
} from "../../utils/component/TreeListUtils";
import EditRowUtils from "../../utils/EditRowUtils";
import {InputText} from "primereact/inputtext";
import UploadMultiImageFileBase64 from "../../components/prolab/UploadMultiImageFileBase64";
import moment from "moment/moment";
//
//    https://js.devexpress.com/Documentation/Guide/UI_Components/TreeList/Getting_Started_with_TreeList/
//


class TreeViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        ConsoleHelper('TreeViewComponent -> constructor');
        this.state = {
            value: '',
        }
    }

    render() {
        const columnAutoWidth = this.props.parsedGridView?.gridOptions?.columnAutoWidth || true;
        const rowAutoHeight = this.props.parsedGridView?.gridOptions?.rowAutoHeight || false;
        const headerAutoHeight = this.props.parsedGridView?.gridOptions?.headerAutoHeight || false;
        //odkomentowac dla mock
        //const multiSelect = true;
        //multiSelect dla podpowiedzi
        const multiSelect = this.props.parsedGridView?.gridOptions?.multiSelect;
        const multiSelection = (multiSelect === undefined || multiSelect === null || !!multiSelect);
        const showSelection = this.waitForSuccess() ? false : this.props.showSelection;
        const showColumnHeaders = this.props.showColumnHeaders;
        const showColumnLines = this.props.showColumnLines;
        const showRowLines = this.props.showRowLines;
        //myk zeby nie pojawiałą sie ramka tabelki przy wczytywaniu
        const showBorders = this.waitForSuccess() ? false : this.props.showBorders;
        const showFilterRow = this.props.showFilterRow;
        const dataTreeHeight = this.props.dataTreeHeight || false;
        const selectAll = this.props.allowSelectAll;
        const allowSelectAll = (selectAll === undefined || selectAll === null || !!selectAll);
        const selectedRowKeys = this.props.selectedRowKeys;
        return (<React.Fragment>
            <TreeList
                id='tree-container'
                keyExpr='ID'
                className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                ref={(ref) => {  this.props.handleOnTreeList(ref)   }}
                dataSource={this.props.parsedGridViewData}
                customizeColumns={this.postCustomizeColumns}
                wordWrapEnabled={rowAutoHeight}
                columnAutoWidth={columnAutoWidth}
                columnResizingMode='widget'
                allowColumnReordering={true}
                allowColumnResizing={true}
                showColumnLines={showColumnLines}
                showRowLines={showRowLines}
                showBorders={showBorders}
                showColumnHeaders={showColumnHeaders}
                columnHidingEnabled={false}
                height={dataTreeHeight ? (dataTreeHeight + 'px') : '100%'}
                width={columnAutoWidth ? '100%' : undefined}
                rowAlternationEnabled={false}
                selectedRowKeys={selectedRowKeys}
                onSelectionChanged={(e) => this.props.handleSelectedRowKeys(e.selectedRowKeys)}
                renderAsync={true}
                selectAsync={false}
                cacheEnabled={true}
                onInitialized={(ref) => {
                    // if (!!this.props.handleOnInitialized) this.props.handleOnInitialized(ref);
                }}
                onContentReady={(e) => {
                    //myczek na rozjezdzajace sie linie wierszy w dataTree
                    // $(document).ready(function () {
                    // e.component.resize();
                    // });
                }}
                rootValue={0}
                parentIdExpr="_ID_PARENT"
                onEditingStart={(e) => {
                   let fieldValue = e.data[e.column?.dataField];
                   switch (e.column.dataType){
                       case "date":
                           this.setState({value:new Date(moment(fieldValue).format("YYYY/MM/DD"))});
                           break;
                       case "datetime":
                           this.setState({value:new Date(moment(fieldValue).format("YYYY/MM/DD"))});
                           break;
                       default:
                           this.setState({value:fieldValue});
                           break;
                   }
                }}

            >
                <Editing allowUpdating={true} mode="cell"  />
                <RemoteOperations
                    filtering={false}
                    summary={false}
                    sorting={false}
                    paging={false}
                    grouping={false}
                    groupPaging={false}
                />

                <FilterRow visible={showFilterRow} applyFilter={true}/>

                <HeaderFilter visible={true} allowSearch={true} stylingMode={'outlined'}/>

                <Sorting mode='multiple'/>

                <Selection mode={showSelection ? (multiSelection ? 'multiple' : 'single') : 'none'}
                           selectAllMode='allPages'
                           showCheckBoxesMode='always'
                           allowSelectAll={allowSelectAll}/>

                <Scrolling mode="infinite" showScrollbar={true} />

                <LoadPanel enabled={true}
                           showIndicator={true}
                           shadingColor="rgba(0,0,0,0.4)"
                           showPane={false}
                           position="absolute"/>
                {this.preGenerateColumnsDefinition()}
            </TreeList>
        </React.Fragment>);
    }

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
                editCellRender={(cellInfo) => this.editCellRender(cellInfo, columnDefinition)}

            />);
        })
        return columns;
    }

    matchColumnDefinitionByFieldName(columnDataField) {
        let columnDefinitionArray = this.props.gridViewColumns?.filter((value) => value.fieldName?.toUpperCase() === columnDataField?.toUpperCase());
        return columnDefinitionArray[0];
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
                    //match column by field name from view and viewData service
                    const columnDefinition = this.matchColumnDefinitionByFieldName(column.dataField);
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
                        column.dataType = TreeListUtils.specifyColumnType(columnDefinition?.type);
                        column.format = TreeListUtils.specifyColumnFormat(columnDefinition?.type);


                        column.cellTemplate = TreeListUtils.cellTemplate(columnDefinition, );
                        // column.cellTemplate = (cellInfo) => this.editCellRender(cellInfo, columnDefinition, () => { });

                        column.fixed = columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right' : false;
                        column.fixedPosition = !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
                        if (!!columnDefinition.groupIndex && columnDefinition.groupIndex > 0) {
                            column.groupIndex = columnDefinition.groupIndex;
                        }
                        if (columnDefinition?.type === 'D' || columnDefinition?.type === 'E') {
                            column.calculateFilterExpression = (value, selectedFilterOperations, target) => this.calculateCustomFilterExpression(value, selectedFilterOperations, target, columnDefinition)
                        }
                        column.headerFilter = {groupInterval: null}
                        column.renderAsync = false;
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
                        viewId = TreeListUtils.getRealViewId(subViewId, viewId);
                        ReactDOM.render(<div style={{textAlign: 'center', display: 'flex'}}>
                            <OperationsButtons labels={this.labels}
                                               operations={operationsRecord}
                                               operationList={operationsRecordList}
                                               info={info}
                                               handleEdit={() => {
                                                   if (this.props.parsedGridView?.viewInfo?.kindView === 'ViewSpec') {
                                                       let newUrl = AppPrefixUtils.locationHrefUrl(`/#/edit-spec/${viewId}?parentId=${parentId}&recordId=${recordId}${currentBreadcrumb}`);
                                                       UrlUtils.navigateToExternalUrl(newUrl);
                                                   } else {
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
                                                   }
                                               }}
                                               hrefSubview={AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`)}
                                               handleHrefSubview={() => {
                                                   let result = this.props.handleBlockUi();
                                                   if (result) {
                                                       let newUrl = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${!!currentBreadcrumb ? currentBreadcrumb : ``}`);
                                                       window.location.assign(newUrl);
                                                   }
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
                                               }}
                                               handleFormula={() => {
                                                   alert('TODO')
                                               }}
                                               handleHistory={() => {
                                                   alert('TODO')
                                               }}
                                               handleAttachments={() => {
                                                   alert('TODO')
                                               }}
                                               handleBlockUi={() => {
                                                   this.props.handleAddLevel(recordId);
                                               }}
                                               handleUp={() => {
                                                   this.props.handleUp(recordId);
                                               }}
                                               handleDown={() => {
                                                   this.props.handleDown(recordId);
                                               }}
                                               handleAddLevel={() => {
                                                   this.props.handleBlockUi();
                                               }}
                            />
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

    editCellRender(cellInfo, columnDefinition, onClickEditListCallback) {
        const field = columnDefinition;
        // const rowId = cellInfo.data.ID;
        const fieldIndex = field.id;
        const editable = field?.edit ? 'editable-border' : '';
        const required = field.requiredValue && field.visible && !field.hidden;
        const validationMsg = this.validator ? this.validator.message(`${EditRowUtils.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
        const validate = !!validationMsg ? 'p-invalid' : '';
        const validateCheckbox = !!validationMsg ? 'p-invalid-checkbox' : '';
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        const refreshFieldVisibility = !!field?.refreshFieldVisibility;
        switch (field?.type) {
            case 'C':
                return <MemoizedChar field={field} inputValue={this.state.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate}
                                     selectionList={selectionList} onChangeCallback={(e) => { this.setState({value: e.target?.value}) }} onBlurCallback={() => {cellInfo.setValue(this.state.value) }}
                                     onClickEditListCallback={onClickEditListCallback}/>
            case 'P'://P - hasło
                return <MemoizedPasswordInput field={field} inputValue={this.state.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate}
                                             selectionList={selectionList} onChangeCallback={(e) => { this.setState({value: e.target?.value}) }} onBlurCallback={() => {cellInfo.setValue(this.state.value) }}
                                             onClickEditListCallback={onClickEditListCallback}/>
            case "N"://N – Numeryczny/Liczbowy
                return <MemoizedNumericInput field={field} inputValue={this.state.value} fieldIndex={fieldIndex} editable={editable} autoFill={autoFill} required={required} validate={validate}
                                     selectionList={selectionList} onChangeCallback={(e) => { this.setState({value: e.target?.value}) }} onBlurCallback={() => {cellInfo.setValue(this.state.value) }}
                                     onClickEditListCallback={onClickEditListCallback}/>
            case 'B'://B – Logiczny (0/1)
                return <MemoizedBoolInput field={field} inputValue={this.state.value} fieldIndex={fieldIndex} editable={editable} autoFillCheckbox={autoFillCheckbox} required={required} validateCheckbox={validateCheckbox}
                                          onChangeCallback={(e) => {
                                              e.refreshFieldVisibility = refreshFieldVisibility;
                                              this.setState({
                                                  value: e.target?.checked ? "T" : "N"
                                              }, () => {
                                                  cellInfo.setValue(this.state.value);
                                              });
                                          }}
                />
            case 'L'://L – Logiczny (T/N)
                return <MemoizedLogicInput field={field} inputValue={this.state.value} fieldIndex={fieldIndex} editable={editable} autoFillCheckbox={autoFillCheckbox} required={required} validateCheckbox={validateCheckbox}
                                    onChangeCallback={(e) => {
                                        e.refreshFieldVisibility = refreshFieldVisibility;
                                        this.setState({
                                            value: e.target?.checked ? "T" : "N"
                                        }, () => {
                                            cellInfo.setValue(this.state.value);
                                        });
                                    }}
                />
            case 'D'://D – Data
                return TreeListUtils.dateInput(field, this.state.value, fieldIndex, editable, autoFill, required, validate,
                    (e) => {
                        this.setState({
                            value: e.target?.value
                        },()=>{
                            cellInfo.setValue(this.state.value);
                        });
                    },
                    () => {
                        cellInfo.setValue(this.state.value);
                    });
            case 'E'://E – Data + czas
                return TreeListUtils.dateTimeInput(field, this.state.value, fieldIndex, editable, autoFill, required, validate,
                    (e) => {
                        this.setState({
                            value: e.target?.value
                        },()=>{
                            cellInfo.setValue(this.state.value);
                        });
                    },
                    () => {
                        cellInfo.setValue(this.state.value);
                    });
            case 'T'://T – Czas
                return TreeListUtils.timeInput(field, this.state.value, fieldIndex, editable, autoFill, required, validate,
                    (e) => {
                        this.setState({
                            value: e.target?.value
                        },()=>{
                            cellInfo.setValue(this.state.value);
                        });
                    },
                    () => {
                        cellInfo.setValue(this.state.value);
                    });
            case 'O'://O – Opisowe
                return TreeListUtils.editorDescription(field, this.state.value, fieldIndex, editable, autoFill, required, validate,
                    (e) => {
                        this.setState({value: e});
                    },
                    () => {
                        cellInfo.setValue(this.state.value);
                    });
            case 'I'://I – Obrazek
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <UploadMultiImageFileBase64 multiple={false}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    // onSuccessB64={(e) => onChangeCallback('IMAGE64', {
                                                    //         fieldName: field.fieldName,
                                                    //         base64: e
                                                    //     },
                                                    //     rowId,
                                                    //     info)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <UploadMultiImageFileBase64 multiple={true}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    // onSuccessB64={(e) => onChangeCallback('MULTI_IMAGE64', {
                                                    //         fieldName: field.fieldName,
                                                    //         base64: e
                                                    //     },
                                                    //     rowId,
                                                    //     info)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${editable} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               // onChange={e =>
                               //     onChangeCallback ? onChangeCallback('TEXT', e, rowId, info) : null
                               // }
                               // onBlur={e => onBlurCallback ? onBlurCallback('TEXT', e, rowId, info) : null}
                               disabled={!field.edit}
                               required={required}
                    />
                    <a href={field.value} style={{float: 'right'}} rel="noreferrer"
                       target='_blank'>
                        {field.label}
                    </a>
                </React.Fragment>)

        }

    }

    waitForSuccess() {
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

}

TreeViewComponent.defaultProps = {
    parsedGridView: [],
    selectedRowKeys: [],
    showColumnLines: true,
    showRowLines: true,
    showBorders: true,
    showColumnHeaders: true,
    showFilterRow: true,
    showSelection: true,
    allowSelectAll: true
};

TreeViewComponent.propTypes = {
    id: PropTypes.number.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    selectedRowKeys: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    handleOnTreeList: PropTypes.func.isRequired,
    handleOnInitialized: PropTypes.func,
    handleSelectedRowKeys: PropTypes.func,
    handleArchiveRow: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired, //other
    handleAddLevel: PropTypes.func.isRequired,
    handleUp: PropTypes.func.isRequired,
    handleDown: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showInfoMessages: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    showColumnHeaders: PropTypes.bool,
    showColumnLines: PropTypes.bool,
    showRowLines: PropTypes.bool,
    showBorders: PropTypes.bool,
    showFilterRow: PropTypes.bool,
    showSelection: PropTypes.bool,
    dataTreeHeight: PropTypes.number,
    allowSelectAll: PropTypes.bool
};

export default TreeViewComponent;

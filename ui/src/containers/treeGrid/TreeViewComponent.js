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
import {EntryResponseUtils} from "../../utils/EntryResponseUtils";
import {
    MemoizedBoolInput,
    MemoizedDateInput,
    MemoizedDateTimeInput,
    MemoizedEditorDescription,
    MemoizedLogicInput,
    MemoizedNumericInput,
    MemoizedText,
    MemoizedTimeInput,
    TreeListUtils
} from "../../utils/component/TreeListUtils";
import EditRowUtils from "../../utils/EditRowUtils";
import UploadMultiImageFileBase64 from "../../components/prolab/UploadMultiImageFileBase64";
import EditListComponent from "../../components/prolab/EditListComponent";
import EditListUtils from "../../utils/EditListUtils";
import EditListDataStore from "../dao/EditListDataStore";
//
//    https://js.devexpress.com/Documentation/Guide/UI_Components/TreeList/Getting_Started_with_TreeList/
//
class TreeViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        this.crudService = new CrudService();
        this.editListDataStore = new EditListDataStore();
        ConsoleHelper('TreeViewComponent -> constructor');
        this.state = {
            editListField: {},
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            selectedRowData: [],
            defaultSelectedRowKeys: [],
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        return prevProps.id !== prevState.id && prevProps.elementRecordId !== prevState.elementRecordId;
    }

    handleSelectedRowData(selectedRowData) {
        ConsoleHelper("TreeViewComponent::handleSelectedRowData obj=" + JSON.stringify(selectedRowData))
        const setFields = this.state.parsedGridView.setFields;
        let transformedRowsData = [];
        let transformedRowsCRC = [];
        for (let selectedRows in selectedRowData) {
            let selectedRow = selectedRowData[selectedRows];
            let transformedSingleRowData = EditListUtils.transformBySetFields(selectedRow, setFields)
            let CALC_CRC = EditListUtils.calculateCRC(transformedSingleRowData)
            ConsoleHelper("transformedRowsData = {} hash = {} ", transformedSingleRowData, CALC_CRC);
            transformedRowsData.push(transformedSingleRowData);
            transformedRowsCRC.push(CALC_CRC);
        }
        this.setState({selectedRowData: transformedRowsData, defaultSelectedRowKeys: transformedRowsCRC})
    }

    editListVisible(cellInfo, columnDefinition) {
        ConsoleHelper('TreeViewComponent::editListVisible')
        // let editInfo = this.props.editData?.editInfo;
        // let kindView = this.props.kindView;
        let editListObject = this.crudService.createObjectToEditList(this.props.parsedGridViewData[0])
        this.setState({
            loading: true,
            dataGridStoreSuccess: false
        }, () => {
            console.log(cellInfo);
            console.log(columnDefinition);
            const viewId = this.props.id;
            const parentId = this.props.elementParentId;
            const recordId = cellInfo.row?.data?.ID;
            const fieldId = columnDefinition.id;
            this.crudService
                .editSpecList(viewId, parentId, fieldId, editListObject)
                .then((responseView) => {
                    let selectedRowDataTmp = [];
                    //CRC key
                    let defaultSelectedRowKeysTmp = [];
                    const editData = this.props.editData;
                    const setFields = responseView.setFields;
                    const separatorJoin = responseView.options?.separatorJoin || ',';
                    let countSeparator = 0;
                    // setFields.forEach((field) => {
                    //     EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                    //         const fieldValue = ('' + foundFields.value).split(separatorJoin);
                    //         if (fieldValue.length > countSeparator) {
                    //             countSeparator = fieldValue.length;
                    //         }
                    //     });
                    // });
                    // for (let index = 0; index < countSeparator; index++) {
                    //     let singleSelectedRowDataTmp = [];
                    //     setFields.forEach((field) => {
                    //         EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                    //             let fieldTmp = {};
                    //             const fieldValue = ('' + foundFields.value).split(separatorJoin);
                    //             fieldTmp[field.fieldList] = fieldValue[index];
                    //             singleSelectedRowDataTmp.push(fieldTmp);
                    //         });
                    //     });
                    //     selectedRowDataTmp.push(singleSelectedRowDataTmp);
                    //     let CALC_CRC = EditListUtils.calculateCRC(singleSelectedRowDataTmp)
                    //     defaultSelectedRowKeysTmp.push(CALC_CRC);
                    // }
                    ConsoleHelper("TreeViewComponent::ListVisible:: defaultSelectedRowKeys = %s hash = %s ", JSON.stringify(selectedRowDataTmp), JSON.stringify(defaultSelectedRowKeysTmp))
                    let filtersListTmp = [];
                    this.setState(() => ({
                            gridViewType: responseView?.viewInfo?.type,
                            parsedGridView: responseView,
                            gridViewColumns: responseView.gridColumns,
                            filtersList: filtersListTmp,
                            packageRows: responseView?.viewInfo?.dataPackageSize
                            // selectedRowData: selectedRowDataTmp,
                            // defaultSelectedRowKeys: defaultSelectedRowKeysTmp
                        }),
                        () => {
                            let res = this.editListDataStore.getEditListDataStore(
                                viewId,
                                'gridView',
                                recordId,
                                fieldId,
                                parentId,
                                null,
                                null,
                                editListObject,
                                setFields,
                                //onError
                                (err) => {
                                    this.props.showErrorMessages(err);
                                },
                                //onSuccess
                                () => {
                                    this.setState({
                                        dataGridStoreSuccess: true
                                    });
                                },
                                //onStart
                                () => {
                                    return {selectAll: this.state.selectAll};
                                }
                            );
                            this.setState({
                                loading: false,
                                parsedGridViewData: res,
                                editListField: cellInfo,
                                editListVisible: true
                            });
                        }
                    );
                }).catch((err) => {
                console.error('Error getEditList in TreeViewComponent. Exception = ', err);
                this.props.showErrorMessages(err);
            });
        });
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
            <EditListComponent visible={this.state.editListVisible}
                               field={this.state.editListField}
                               parsedGridView={this.state.parsedGridView}
                               parsedGridViewData={this.state.parsedGridViewData}
                               gridViewColumns={this.state.gridViewColumns}
                               onHide={() => this.setState({editListVisible: false})}
                               handleBlockUi={() => {
                                   this.handleBlockUi();
                                   return true;
                               }}
                               handleUnblockUi={() => this.props.handleUnblockUi()}
                               handleOnChosen={(editListData, field) => {
                                   ConsoleHelper('EditRowComponent::handleOnChosen = ', JSON.stringify(editListData))
                                   // let editInfo = this.props.editData?.editInfo;
                                   // editInfo.field = field;
                                   // this.props.onEditList(editInfo, editListData);
                                   // cellInfo.setValue(e.value)
                               }}
                               showErrorMessages={(err) => this.props.showErrorMessages(err)}
                               dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                               selectedRowData={this.state.selectedRowData}
                               defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                               handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                               labels={this.props.labels}
            />
            <TreeList
                id='spec-edit'
                keyExpr='ID'
                className={`tree-container${headerAutoHeight ? ' tree-header-auto-height' : ''}`}
                ref={(ref) => {
                    this.props.handleOnTreeList(ref)
                }}
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
                rootValue={0}
                parentIdExpr="_ID_PARENT"
            >
                <Editing allowUpdating={true} mode="cell"/>
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
                {/*- virtual działa szybko ale wyżera heap przeglądarki
                   - normal długo wczytuje ale heap jest stabilniejszy
                 */}
                <Scrolling showScrollbar={true} useNative={true} mode={'virtual'}/>

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
                sortOrder={sortOrder}
                dataField={columnDefinition?.fieldName}
                sortIndex={columnDefinition?.sortIndex}
                cssClass={columnDefinition?.edit ? 'editable-cell' : undefined}
                allowEditing={columnDefinition?.edit}
                cellRender={this.isSpecialCell(columnDefinition?.type) ? (cellInfo, columnDefinition) => this.cellRenderSpecial(cellInfo, columnDefinition) : undefined}
                editCellRender={(cellInfo) => this.editCellRender(cellInfo, columnDefinition, () => {
                    this.editListVisible(cellInfo, columnDefinition);
                })}
            />);
        })
        return columns;
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
                        column.width = columnDefinition?.width || 100;
                        column.name = columnDefinition?.fieldName;
                        column.caption = columnDefinition?.label;
                        column.dataType = TreeListUtils.specifyColumnType(columnDefinition?.type);
                        column.format = TreeListUtils.specifyColumnFormat(columnDefinition?.type);
                        column.fixed = columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right' : false;
                        column.fixedPosition = !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
                        column.renderAsync = false;
                        //own properties
                        column.ownType = columnDefinition?.type;
                        column.ownFieldId = columnDefinition?.id;
                        column.ownFieldName = columnDefinition?.fieldName;
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
                                                   if (TreeListUtils.isKindViewSpec(this.props.parsedGridView)) {
                                                       TreeListUtils.openEditSpec(viewId, parentId, [recordId], currentBreadcrumb,
                                                           () => this.props.handleUnblockUi(),
                                                           (err) => this.props.showErrorMessages(err));
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
                                               handleEditSpec={() => {
                                                   TreeListUtils.openEditSpec(viewId, parentId, [recordId], currentBreadcrumb,
                                                       () => this.props.handleUnblockUi(),
                                                       (err) => this.props.showErrorMessages(err));
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

    isSpecialCell(type) {
        try {
            switch (type) {
                case 'H':
                case 'O':
                case 'I':
                case 'IM':
                    return true;
                default:
                    return false;
            }
        } catch (ex) {
        }
        return false;
    }

    cellRenderSpecial(cellInfo, columnDefinition) {
        try {
            const _bgColor = cellInfo.data['_BGCOLOR'];
            let bgColorFinal = 'white';
            const specialBgColor = cellInfo.data['_BGCOLOR_' + cellInfo.column?.dataField];
            if (!!specialBgColor) {
                bgColorFinal = specialBgColor;
            } else {
                if (!!_bgColor) {
                    bgColorFinal = _bgColor;
                }
            }
            const _fontcolor = cellInfo.data['_FONTCOLOR'];
            let fontColorFinal = 'black';
            const specialFontColor = cellInfo.data['_FONTCOLOR_' + cellInfo.column?.dataField];
            if (!!specialFontColor) {
                fontColorFinal = specialFontColor;
            } else {
                if (!!_fontcolor) {
                    fontColorFinal = _fontcolor;
                }
            }
            switch (cellInfo.column.ownType) {
                case 'H':
                    try {
                        return <a
                            style={{
                                display: 'contents',
                                color: fontColorFinal,
                                background: bgColorFinal
                            }}
                            href={cellInfo?.text}
                            target='_blank'
                            rel='noopener noreferrer'>
                            {cellInfo?.text}
                        </a>;
                    } catch (err) {
                        ConsoleHelper('Error render hyperlink. Exception=', err)
                    }
                case 'O':
                    try {
                        return <span
                            style={{
                                color: fontColorFinal,
                                background: bgColorFinal
                            }}
                            dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                        />
                    } catch (err) {
                        ConsoleHelper('Error render htmloutput. Exception=', err)
                    }
                case 'IM':
                    try {
                        return !!cellInfo?.text ? <img height={100} src={`data:image/jpeg;base64,${cellInfo?.text}`}/> :
                            <div/>
                    } catch (err) {
                        ConsoleHelper('Error render single-image. Exception=', err)
                    }
                case 'I':
                    try {
                        return !!cellInfo?.text ? cellInfo?.text?.split(',').map(img => {
                            return <img height={100} src={`data:image/jpeg;base64,${img}`}/>
                        }) : <div/>
                    } catch (err) {
                        ConsoleHelper('Error render multi-image. Exception=', err)
                    }
                default:
                    return undefined;
            }
        } catch (err) {
            ConsoleHelper('Error global cell render. Exception=', err)
        }
    }

    editCellRender(cellInfo, columnDefinition, onClickEditListCallback) {
        //mock
        //columnDefinition.edit = true;
        const field = columnDefinition;
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
                return <MemoizedText field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                     fieldIndex={fieldIndex} mode={'text'} editable={editable} autoFill={autoFill}
                                     required={required} validate={validate}
                                     selectionList={selectionList} onClickEditListCallback={onClickEditListCallback}/>
            case 'P'://P - hasło
                return <MemoizedText field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                     fieldIndex={fieldIndex} mode={'password'} editable={editable} autoFill={autoFill}
                                     required={required} validate={validate}
                                     selectionList={selectionList} onClickEditListCallback={onClickEditListCallback}/>
            case "N"://N – Numeryczny/Liczbowy
                return <MemoizedNumericInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                             fieldIndex={fieldIndex} editable={editable} autoFill={autoFill}
                                             required={required} validate={validate}
                                             selectionList={selectionList}
                                             onClickEditListCallback={onClickEditListCallback}/>
            case 'B'://B – Logiczny (0/1)
                return <MemoizedBoolInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                          fieldIndex={fieldIndex} editable={editable}
                                          autoFillCheckbox={autoFillCheckbox} required={required}
                                          validateCheckbox={validateCheckbox}/>
            case 'L'://L – Logiczny (T/N)
                return <MemoizedLogicInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                           fieldIndex={fieldIndex} editable={editable}
                                           autoFillCheckbox={autoFillCheckbox} required={required}
                                           validateCheckbox={validateCheckbox}/>
            case 'D'://D – Data
                return <MemoizedDateInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                          fieldIndex={fieldIndex} editable={editable} autoFill={autoFill}
                                          required={required} validate={validate}/>
            case 'E'://E – Data + czas
                return <MemoizedDateTimeInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                              fieldIndex={fieldIndex} editable={editable} autoFill={autoFill}
                                              required={required} validate={validate}/>
            case 'T'://T – Czas
                return <MemoizedTimeInput field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                          fieldIndex={fieldIndex} editable={editable} autoFill={autoFill}
                                          required={required} validate={validate}/>
            case 'O'://O – Opisowe
                return <MemoizedEditorDescription field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                                  fieldIndex={fieldIndex} editable={editable} autoFill={autoFill}
                                                  required={required} validate={validate}/>
            case 'IM'://I – Obrazek
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <UploadMultiImageFileBase64 multiple={false}
                                                    displayText={""}
                                                    initBase64={cellInfo.value}
                                                    onSuccessB64={(e) => {
                                                        cellInfo.setValue(e)
                                                    }}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'I'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <UploadMultiImageFileBase64 multiple={true}
                                                    displayText={""}
                                                    initBase64={cellInfo.value}
                                                    onSuccessB64={(e) => {
                                                        cellInfo.setValue(e)
                                                    }}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return <MemoizedText field={field} cellInfo={cellInfo} inputValue={cellInfo.value}
                                     fieldIndex={fieldIndex} mode={'link'} editable={editable} autoFill={autoFill}
                                     required={required} validate={validate}
                                     selectionList={selectionList} onClickEditListCallback={onClickEditListCallback}/>
        }
    }

    waitForSuccess() {
        return this.props.dataTreeStoreSuccess === false || this.props.gridViewColumns?.length === 0;
    }

    matchColumnDefinitionByFieldName(columnDataField) {
        let columnDefinitionArray = this.props.gridViewColumns?.filter((value) => value.fieldName?.toUpperCase() === columnDataField?.toUpperCase());
        return columnDefinitionArray[0];
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
    elementParentId: PropTypes.number.isRequired,
    elementRecordId: PropTypes.number.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    selectedRowKeys: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    labels: PropTypes.object.isRequired,
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
    allowSelectAll: PropTypes.bool,
};

export default TreeViewComponent;

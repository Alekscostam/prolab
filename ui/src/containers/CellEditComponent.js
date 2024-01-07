import React from 'react';
import EditRowUtils from '../utils/EditRowUtils';

import ConsoleHelper from '../utils/ConsoleHelper';
import EditListUtils from '../utils/EditListUtils';
import CrudService from '../services/CrudService';
import PropTypes from 'prop-types';
import UploadMultiImageFileBase64 from '../components/prolab/UploadMultiImageFileBase64';
import {
    MemoizedBoolInput,
    MemoizedDateInput,
    MemoizedDateTimeInput,
    MemoizedLogicInput,
    MemoizedNumericInput,
    MemoizedText,
    MemoizedTimeInput,
} from '../utils/component/TreeListUtils';
import EditListDataStore from './dao/EditListDataStore';
import EditListComponent from '../components/prolab/EditListComponent';
import UrlUtils from '../utils/UrlUtils';
import {EditorDialog} from '../components/prolab/EditorDialog';
import {StringUtils} from '../utils/StringUtils';

class CellEditComponent extends React.Component {
    // editListDataStore = new EditListComponent();
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.editListDataStore = new EditListDataStore();
        this.crudService = new CrudService();
        this.state = {
            cellInfo: undefined,
            editListVisible: false,
            editListField: undefined,
            editListRecordId: undefined,
            editViewColumns: undefined,
            parsedEditListView: undefined,
            selectedRowDataEditList: undefined,
            parsedEditListViewData: undefined,
        };
        ConsoleHelper('CellEditComponent -> constructor');
    }

    render() {
        return <React.Fragment></React.Fragment>;
    }

    onHideEditor(callBack) {
        document.getElementById('header-left').click();
        this.setState({editorDialogVisisble: false});
        if (callBack) callBack();
    }

    editorComponent = () => {
        //TODO: meyjbe should be here this.state.editorDialogVisisble &&
        return (
            <EditorDialog
                value={this.state.cellInfo.value}
                visible={this.state.editorDialogVisisble}
                onHide={() => {
                    this.onHideEditor(this.props.onHideEditorCallback);
                }}
                onSave={(el) => {
                    let cellInfo = this.state.cellInfo;
                    cellInfo.setValue(el);
                    setTimeout(function () {
                        const elements = Array.from(
                            document.querySelectorAll(`td[aria-describedby=${cellInfo.column.headerId}]`)
                        ).filter((el) => !el.classList.contains('dx-editor-cell'));
                        elements[cellInfo.rowIndex].children[0].innerText = StringUtils.textFromHtmlString(el);
                    }, 0);
                    this.onHideEditor();
                }}
            ></EditorDialog>
        );
    };
    editListComponent = () => {
        return (
            this.state.editListVisible && (
                <EditListComponent
                    className
                    visible={this.state.editListVisible}
                    field={this.state.editListField}
                    parsedGridView={this.state.parsedEditListView}
                    parsedGridViewData={this.state.parsedEditListViewData}
                    gridViewColumns={this.state.editViewColumns}
                    // TODO: onHide zamyka widok paintRow
                    onHide={() => {
                        this.setState({editListVisible: false});
                        if (this.props.onCloseEditList) {
                            this.props.onCloseEditList();
                        }
                    }}
                    handleBlockUi={() => {
                        this.handleBlockUi();
                        return true;
                    }}
                    handleUnselectAll={this.props?.handleUnselectAll}
                    handleUnblockUi={() => this.props.handleUnblockUi()}
                    handleOnChosen={(fieldsToUpdate) => {
                        try {
                            ConsoleHelper('EditRowComponent::handleOnChosen = ', JSON.stringify(fieldsToUpdate));
                            let rowReplacementCopy = Object.assign(
                                {},
                                this.findRowDataById(this.state.editListRecordId)
                            );
                            for (const field in fieldsToUpdate) {
                                const fieldToUpdate = fieldsToUpdate[field].fieldEdit;
                                const newValue = fieldsToUpdate[field].fieldValue;
                                if (newValue !== null) {
                                    rowReplacementCopy[fieldToUpdate] = newValue;
                                }
                            }
                            this.props.modifyParsedGridViewData(rowReplacementCopy);
                        } finally {
                            this.props.handleUnblockUi();
                        }
                    }}
                    showErrorMessages={(err) => this.props.showErrorMessages(err)}
                    dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                    selectedRowData={this.state.selectedRowDataEditList}
                    defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                    handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                    labels={this.props.labels}
                />
            )
        );
    };

    handleSelectedRowData = (selectedRowDataEditList) => {
        ConsoleHelper('EditableComponent::handleSelectedRowData obj=' + JSON.stringify(selectedRowDataEditList));
        const setFields = this.state.parsedEditListView.setFields;
        let transformedRowsData = [];
        let transformedRowsCRC = [];
        for (let selectedRows in selectedRowDataEditList) {
            let selectedRow = selectedRowDataEditList[selectedRows];
            let transformedSingleRowData = EditListUtils.transformBySetFields(selectedRow, setFields);
            let CALC_CRC = EditListUtils.calculateCRC(transformedSingleRowData);
            ConsoleHelper('transformedRowsData = {} hash = {} ', transformedSingleRowData, CALC_CRC);
            transformedRowsData.push(transformedSingleRowData);
            transformedRowsCRC.push(CALC_CRC);
        }
        this.setState({selectedRowDataEditList: transformedRowsData, defaultSelectedRowKeys: transformedRowsCRC});
    };

    findRowDataById = (recordId) => {
        let editData = this.props.parsedGridViewData.filter((item) => {
            return item.ID === recordId;
        });
        return editData[0];
    };

    editListVisible = (recordId, fieldId) => {
        ConsoleHelper('EditableComponent::editListVisible');
        this.props.handleBlockUi();
        this.setState(
            {
                loading: true,
                dataGridStoreSuccess: false,
            },
            () => {
                const viewId = this.props.id;
                const paramId = UrlUtils.batchIdParamExist() ? UrlUtils.getBatchIdParam() : this.props.elementParentId;
                const currentEditListRow = this.props.parsedGridViewData.filter((item) => {
                    return item.ID === recordId;
                });

                const editListBodyObject = EditListUtils.createBodyToEditList(currentEditListRow[0]);
                this.crudService
                    .editSpecList(viewId, paramId, fieldId, editListBodyObject)
                    .then((responseView) => {
                        const setFields = responseView.setFields;
                        const separatorJoin = responseView.options?.separatorJoin || ',';
                        const editData = this.findRowDataById(recordId);
                        let selectedRowDataTmp = [];
                        let defaultSelectedRowKeysTmp = [];
                        let countSeparator = 0;
                        setFields.forEach((field) => {
                            EditListUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                                const fieldValue = ('' + foundFields.value).split(separatorJoin);
                                if (fieldValue.length > countSeparator) {
                                    countSeparator = fieldValue.length;
                                }
                            });
                        });
                        for (let index = 0; index < countSeparator; index++) {
                            let singleSelectedRowDataTmp = [];
                            setFields.forEach((field) => {
                                EditListUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                                    let fieldTmp = {};
                                    const fieldValue = ('' + foundFields.value).split(separatorJoin);
                                    fieldTmp[field.fieldList] = fieldValue[index];
                                    singleSelectedRowDataTmp.push(fieldTmp);
                                });
                            });
                            selectedRowDataTmp.push(singleSelectedRowDataTmp);
                            let CALC_CRC = EditListUtils.calculateCRC(singleSelectedRowDataTmp);
                            defaultSelectedRowKeysTmp.push(CALC_CRC);
                        }
                        ConsoleHelper(
                            'EditableComponent::editListVisible:: defaultSelectedRowKeys = %s hash = %s ',
                            JSON.stringify(selectedRowDataTmp),
                            JSON.stringify(defaultSelectedRowKeysTmp)
                        );
                        this.setState(
                            () => ({
                                gridViewType: responseView?.viewInfo?.type,
                                parsedEditListView: responseView,
                                editViewColumns: responseView.gridColumns,
                                filtersList: [],
                                packageRows: responseView?.viewInfo?.dataPackageSize,
                                selectedRowDataEditList: selectedRowDataTmp,
                                defaultSelectedRowKeys: defaultSelectedRowKeysTmp,
                            }),
                            () => {
                                try {
                                    let res = this.editListDataStore.getEditListDataStore(
                                        viewId,
                                        'gridView',
                                        recordId,
                                        fieldId,
                                        paramId,
                                        null,
                                        null,
                                        editListBodyObject,
                                        setFields,
                                        //onError
                                        (err) => {
                                            this.props.showErrorMessages(err);
                                        },
                                        //onSuccess
                                        () => {
                                            this.setState({
                                                dataGridStoreSuccess: true,
                                            });
                                        },
                                        //onStart
                                        () => {
                                            return {selectAll: this.state.selectAll};
                                        }
                                    );
                                    this.setState({
                                        loading: false,
                                        parsedEditListViewData: res,
                                        editListRecordId: recordId,
                                        editListVisible: true,
                                    });
                                } finally {
                                    this.props.handleUnblockUi();
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        console.error('Error getEditList in EditableComponent. Exception = ', err);
                        this.props.showErrorMessages(err);
                    });
            }
        );
    };

    editCellRender = (cellInfo, columnDefinition, onOperationClick) => {
        //mock
        //columnDefinition.edit = true;
        const field = columnDefinition;
        const fieldIndex = field.id;
        const editable = field?.edit ? 'editable-border' : '';
        const required = field.requiredValue && field.visible && !field.hidden;
        const validationMsg = this.validator
            ? this.validator.message(
                  `${EditRowUtils.getType(field.type)}${fieldIndex}`,
                  field.label,
                  field.value,
                  required ? 'required' : 'not_required'
              )
            : null;
        const validate = !!validationMsg ? 'p-invalid' : '';
        const validateCheckbox = !!validationMsg ? 'p-invalid-checkbox' : '';
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const downFill = field?.downFill;
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        //const refreshFieldVisibility = !!field?.refreshFieldVisibility;
        switch (field?.type) {
            case 'C':
                if (cellInfo.column.dataField?.includes('WART') && cellInfo.data?.PIERW_TYP?.includes('N')) {
                    return (
                        <MemoizedNumericInput
                            field={field}
                            cellInfo={cellInfo}
                            inputValue={cellInfo.value}
                            fieldIndex={fieldIndex}
                            editable={editable}
                            autoFill={autoFill}
                            required={required}
                            validate={validate}
                            selectionList={selectionList}
                            onOperationClick={onOperationClick}
                            downFill={downFill}
                        />
                    );
                }
                return (
                    <MemoizedText
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        mode={'text'}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                        selectionList={selectionList}
                        onOperationClick={onOperationClick}
                        downFill={downFill}
                    />
                );
            case 'P': //P - hasło
                return (
                    <MemoizedText
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        mode={'password'}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                        selectionList={selectionList}
                        onOperationClick={onOperationClick}
                        downFill={downFill}
                    />
                );
            case 'N': //N – Numeryczny/Liczbowy
                return (
                    <MemoizedNumericInput
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                        selectionList={selectionList}
                        onOperationClick={onOperationClick}
                        downFill={downFill}
                    />
                );
            case 'B': //B – Logiczny (0/1)
                return (
                    <MemoizedBoolInput
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFillCheckbox={autoFillCheckbox}
                        required={required}
                        validateCheckbox={validateCheckbox}
                        onOperationClick={onOperationClick}
                    />
                );
            case 'L': //L – Logiczny (T/N)
                return (
                    <MemoizedLogicInput
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFillCheckbox={autoFillCheckbox}
                        required={required}
                        validateCheckbox={validateCheckbox}
                        onOperationClick={onOperationClick}
                    />
                );
            case 'D': //D – Data
                return (
                    <MemoizedDateInput
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                    />
                );
            case 'E': //E – Data + czas
                return (
                    <MemoizedDateTimeInput
                        labels={this.props.labels}
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                        refDateTime={this.refDateTime}
                    />
                );
            case 'T': //T – Czas
                return (
                    <MemoizedTimeInput
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                    />
                );
            case 'O': //O – Opisowe
                if (!this.state.editorDialogVisisble) {
                    this.setState({editorDialogVisisble: true, cellInfo: cellInfo});
                }
                return null;

            case 'IM': //IM – Obrazek multi
                return (
                    <React.Fragment>
                        <div className={`image-base ${autoFill} ${validate}`}>
                            <UploadMultiImageFileBase64
                                multiple={false}
                                displayText={''}
                                initBase64={cellInfo.value}
                                whiteBtnColor={true}
                                deleteBtn={true}
                                onDeleteChange={() => {
                                    cellInfo.setValue([]);
                                }}
                                onSuccessB64={(e) => {
                                    const image = document.getElementsByClassName(`image-base ${autoFill} ${validate}`);
                                    if (image) {
                                        setTimeout(function () {
                                            const rowIndex = cellInfo.rowIndex;
                                            const elements = document.querySelectorAll(
                                                'td[aria-describedby=column_0_undefined-fixed]'
                                            );
                                            const realRowIndex = rowIndex + 1;

                                            const row = document.querySelectorAll(
                                                'tr[aria-rowindex="' + realRowIndex + '"][class*="dx-column-lines"]'
                                            )[0];
                                            const element = elements[realRowIndex];
                                            if (element) {
                                                element.style.height = row.clientHeight + 'px';
                                            }
                                        }, 1);
                                    }
                                    cellInfo.setValue(e);
                                }}
                                onError={(e) => this.props.onError(e)}
                            />
                        </div>
                    </React.Fragment>
                );
            case 'I': //I – Obrazek
                return (
                    <React.Fragment>
                        <div className={`image-base ${autoFill} ${validate}`}>
                            <UploadMultiImageFileBase64
                                multiple={false}
                                displayText={''}
                                deleteBtn={true}
                                whiteBtnColor={true}
                                onDeleteChange={() => {
                                    cellInfo.setValue('');
                                }}
                                initBase64={cellInfo.value}
                                onSuccessB64={(e) => {
                                    const image = document.getElementsByClassName(
                                        `image-base ${autoFill} ${validate}`
                                    )[0];
                                    if (image) {
                                        setTimeout(function () {
                                            const rowIndex = cellInfo.rowIndex;
                                            const elements = document.querySelectorAll(
                                                'td[aria-describedby=column_0_undefined-fixed]'
                                            );
                                            const realRowIndex = rowIndex + 1;

                                            const row = document.querySelectorAll(
                                                'tr[aria-rowindex="' + realRowIndex + '"][class*="dx-column-lines"]'
                                            )[0];
                                            const element = elements[realRowIndex];
                                            if (element) {
                                                element.style.height = row.clientHeight + 'px';
                                            }
                                        }, 1);
                                    }
                                    cellInfo.setValue(e[0]);
                                }}
                                onError={(e) => this.props.onError(e)}
                            />
                        </div>
                    </React.Fragment>
                );
            case 'H': //H - Hyperlink
                return (
                    <MemoizedText
                        field={field}
                        cellInfo={cellInfo}
                        inputValue={cellInfo.value}
                        fieldIndex={fieldIndex}
                        mode={'link'}
                        editable={editable}
                        autoFill={autoFill}
                        required={required}
                        validate={validate}
                        selectionList={selectionList}
                        downFill={downFill}
                        onOperationClick={onOperationClick}
                    />
                );
            default:
                return undefined;
        }
    };
}

CellEditComponent.defaultProps = {
    onCloseEditList: () => {},
};

CellEditComponent.propTypes = {
    onCloseEditList: PropTypes.func,
    onHideEditorCallback: PropTypes.func,
};

export default CellEditComponent;

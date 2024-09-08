import React, {Component} from 'react';
import EditRowUtils from '../utils/EditRowUtils';

import ConsoleHelper from '../utils/ConsoleHelper';
import EditListUtils from '../utils/EditListUtils';
import CrudService from '../services/CrudService';
import PropTypes from 'prop-types';
import {
    MemoizedBoolInput,
    MemoizedDateInput,
    MemoizedDateTimeInput,
    MemoizedLogicInput,
    MemoizedNumericInput,
    MemoizedText,
    MemoizedTimeInput,
} from '../utils/component/TreeListUtils';
import EditListDataStore from './dao/DataEditListStore';
import EditListComponent from '../components/prolab/EditListComponent';
import UrlUtils from '../utils/UrlUtils';
import {EditorDialog} from '../components/prolab/EditorDialog';
import {StringUtils} from '../utils/StringUtils';
import ImageViewerComponent from '../components/ImageViewerComponent';
import {ColumnType} from '../model/ColumnType';

class CellEditComponent extends Component {
    constructor(props) {
        super(props);
        this.labels = this.props;
        this.dataGrid = null;
        this.editListDataStore = new EditListDataStore();
        this.crudService = new CrudService();
        this.trashClicked = React.createRef(false);
        this.currentClickedCell = React.createRef();
        this.state = {
            cellInfo: undefined,
            editListVisible: false,
            imageBtnClicked: false,
            editListField: undefined,
            editListRecordId: undefined,
            editViewColumns: undefined,
            parsedEditListView: undefined,
            selectedRowDataEditList: undefined,
            parsedEditListViewData: undefined,
            imageViewer: {
                imageBtnClicked: false, //optional
                imageViewDialogVisisble: false,
                editable: false,
                imageBase64: undefined,
                header: undefined,
            },
            editorViewer: {
                editorDialogVisisble: false,
                editable: false,
                value: undefined,
                header: undefined,
            },
        };
        ConsoleHelper('CellEditComponent -> constructor');
    }

    modifyCurrentClickedCell(id) {
        this.currentClickedCell.current = id;
    }

    render() {
        return <React.Fragment></React.Fragment>;
    }

    forceLeaveEditMode() {
        document.getElementById('header-left').click();
    }

    onHideEditor() {
        this.forceLeaveEditMode();
        this.setState({
            editorViewer: {
                editorDialogVisisble: false,
                editable: false,
                value: undefined,
                header: undefined,
            },
        });
        this.onHideEditorCallback();
    }

    componentDidMount() {
        document.addEventListener('contextmenu', (event) => {
            if (event.target.classList.contains('dx-cell-focus-disabled')) {
                event.preventDefault();
            }
            if (event.target?.offsetParent?.classList?.contains('dx-cell-focus-disabled')) {
                event.preventDefault();
            }
        });
    }

    editorComponent = (editable, eViewier) => {
        const cellInfoValue = eViewier?.value ? eViewier.value : this.state.cellInfo.value;
        const cellInfoHeader = eViewier?.header ? eViewier.header : this.state.cellInfo.value;
        const {editorViewer} = this.state;
        return (
            editorViewer?.editorDialogVisisble && (
                <EditorDialog
                    header={cellInfoHeader}
                    editable={editable}
                    value={cellInfoValue}
                    visible={editorViewer?.editorDialogVisisble}
                    onHide={() => {
                        this.onHideEditor();
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
                />
            )
        );
    };

    onHideImageViewer() {
        this.forceLeaveEditMode();
        setTimeout(() => {
            this.setState(
                {
                    imageViewer: {
                        imageViewDialogVisisble: false,
                        editable: false,
                        imageBase64: '',
                    },
                },
                () => {
                    this.onHideImageCallBack();
                }
            );
        }, 0);
    }
    // to overdie
    onHideEditorCallback() {}
    // to overdie
    onHideImageCallBack() {}
    imageViewerComponent = () => {
        const {imageViewer} = this.state;
        return (
            imageViewer?.imageViewDialogVisisble && (
                <ImageViewerComponent
                    editable={imageViewer.editable}
                    header={imageViewer.header}
                    onHide={() => {
                        this.onHideImageViewer();
                    }}
                    onApprove={(base64) => {
                        const cellInfo = this.state.cellInfo;
                        cellInfo.setValue(base64);
                        this.onHideImageViewer();
                    }}
                    base64={
                        StringUtils.isBlank(imageViewer.imageBase64)
                            ? ''
                            : imageViewer.imageBase64.replace('data:image/jpeg;base64,', '')
                    }
                    viewBase64={imageViewer.imageBase64}
                    labels={this.labels}
                    visible
                />
            )
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
    handleSelectedRowData(e) {
        const setFields = this.state.parsedEditListView.setFields;
        const prevSelectedRowData = this.state.selectedRowData;
        const multiSelect = this.state?.parsedGridView?.gridOptions?.multiSelect;
        const result =  EditListUtils.selectedRowData(e, setFields, prevSelectedRowData, multiSelect);
        this.setState({selectedRowDataEditList: result.rowsData, defaultSelectedRowKeys: result.rowsCrc});
    }

    // to overide
    findRowDataById(recordId) {}

    // to overide
    currentEditListRow(recordId) {}

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
                const currentEditListRow = this.currentEditListRow(recordId);
                const editListBodyObject = EditListUtils.createBodyToEditList(currentEditListRow[0]);
                this.crudService
                    .getListOfHints(viewId, paramId, fieldId, editListBodyObject)
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
                                    const res = this.editListDataStore.getEditListDataStore(
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
                                        },
                                        selectedRowDataTmp
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
        switch (field?.type) {
            case ColumnType.C:
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
                        validatorFunction={(value)=>{
                            if(cellInfo.column.dataField?.includes('WART') && cellInfo.data?.PIERW_TYP?.includes('N')){
                                let result = value.replace(/,/g, '.');  // Zamiana przecinków na kropki
                                result = result.replace(/([.\-+<>])\1+/g, '$1'); // Usuwanie nadmiarowych znaków specjalnych (w tym kropek) występujących obok siebie
                                result = result.replace(/[^0-9.\-+<>]/g, ''); // Zdefiniowanie dozwolonych znaków
                                result = result.replace(/(?<!\d)\./g, '0.'); // Dodanie zera przed kropką, jeśli przed kropką nie ma cyfry
                                result = result.replace(/\.(?=[+\-<>])/g, '.0'); //Dodanie zera po kropce przed znakami specjalnymi 
                                result = result.replace(/(\d+)\.(\d*\.)+/g, '$1.$2').replace(/(\d*\.\d*)\./g, '$1'); //Usunięcie nadmiarowych kropek w liczbach
                                return result;
                            }
                            return value;
                        }}
                        selectionList={selectionList}
                        onOperationClick={onOperationClick}
                        downFill={downFill}
                    />
                );
            case ColumnType.P: //P - hasło
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
            case ColumnType.N: //N – Numeryczny/Liczbowy
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
            case ColumnType.B: //B – Logiczny (0/1)
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
            case ColumnType.L: //L – Logiczny (T/N)
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
            case ColumnType.D: //D – Data
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
            case ColumnType.E: //E – Data + czas
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
            case ColumnType.T: //T – Czas
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
            case ColumnType.O: //O – Opisowe
                if (!this.state?.editorViewer?.editorDialogVisisble) {
                    this.setState({
                        editorViewer: {
                            editorDialogVisisble: true,
                            header: cellInfo.column?.caption,
                        },
                        cellInfo,
                    });
                }
                return null;
            case ColumnType.IM: //IM – Obrazki
            case ColumnType.I: //I – Obrazek
                if (!this.trashClicked.current && !this.state?.imageViewer?.imageViewDialogVisisble) {
                    this.setState({
                        imageViewer: {
                            imageViewDialogVisisble: true,
                            imageBase64: cellInfo.value,
                            editable: true,
                            header: cellInfo.column?.caption,
                        },
                        cellInfo,
                    });
                }
                return (
                    <React.Fragment>
                        <div
                            id='trash-button'
                            onClick={() => {
                                this.trashClicked.current = false;
                                cellInfo.setValue('');
                            }}
                            className={`image-base ${autoFill} ${validate}`}
                        ></div>
                    </React.Fragment>
                );
            case ColumnType.H: //H - Hyperlink
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

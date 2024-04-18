/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../components/DivContainer';
import {InputText} from 'primereact/inputtext';
import BaseContainer from '../baseContainers/BaseContainer';
import {Dropdown} from 'primereact/dropdown';
import {Calendar} from 'primereact/calendar';
import SimpleReactValidator from '../components/validator';
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {Validator} from 'devextreme-react';
import {Button} from 'primereact/button';
import {RequiredRule} from 'devextreme-react/validator';
import moment from 'moment';
import EditListUtils from '../utils/EditListUtils';
import UploadMultiImageFileBase64 from '../components/prolab/UploadMultiImageFileBase64';
import {Checkbox} from 'primereact/checkbox';
import ConsoleHelper from '../utils/ConsoleHelper';
import EditRowUtils from '../utils/EditRowUtils';
import MockService from '../services/MockService';
import LocUtils from '../utils/LocUtils';
import CrudService from '../services/CrudService';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {Password} from 'primereact/password';
import {InputType} from '../model/InputType';
import {ColumnType} from '../model/ColumnType';

let clickCount = 0;
let timeout;
// TODO: tego switcha przezucic fdo osobnej kalsy switch (field.type) {
export class BaseRowComponent extends BaseContainer {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            loading: true,
            preventSave: false,
            numberFormat: {
                isValidNumberFormat: true,
                prevNumber: undefined,
            },
        };

        this.yesNoTypes = [
            {name: 'Tak', code: 'T'},
            {name: 'Nie', code: 'N'},
        ];
        this.sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
        this.fontValues = [
            'Arial',
            'Courier New',
            'Georgia',
            'Impact',
            'Lucida Console',
            'Tahoma',
            'Times New Roman',
            'Verdana',
        ];
        this.headerValues = [false, 1, 2, 3, 4, 5];
        this.messages = React.createRef();
        this.calendarDateTimeRef = React.createRef();
        this.selectionListValuesToJson = this.selectionListValuesToJson.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.validateDate = this.validateDate.bind(this);
        this.editListVisible = this.editListVisible.bind(this);
        this.fieldsMandatoryLabel = LocUtils.loc(
            this.props.labels,
            'Fields_Mandatory_Label',
            'Wypełnij wszystkie wymagane pola'
        );
    }

    handleCancel() {
        this.props.onHide();
    }

    selectionListValuesToJson(selectionListValues) {
        let selectionListValuesJson = [];
        for (let index = 0; index < selectionListValues.length; index++) {
            let one = {name: selectionListValues[index]};
            selectionListValuesJson.push(one);
        }
        return selectionListValuesJson;
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.setState({preventSave: false}, () => {
                this.blockUi(this.handleValidForm);
            });
        } else {
            this.setState({preventSave: true}, () => {
                this.validator.showMessages();
                this.props.showErrorMessages(this.fieldsMandatoryLabel);
                // rerender to show messages for the first time
                this.scrollToError = true;
                this.preventSave = true;
                this.forceUpdate();
            });
        }
    }

    handleValidForm() {}

    renderField(field, fieldIndex, groupName) {
        const visibleDocumentCriteria = this.props?.visibleDocumentPanel;

        const onChange = this.getOnChange();
        const onBlur = this.getOnBlur();
        const required = field.requiredValue && field.visible && !field.hidden;
        let validationMsg = this.validator
            ? this.validator.message(
                  `${EditRowUtils.getType(field.type)}${fieldIndex}`,
                  field.label,
                  field.value,
                  required ? 'required' : 'not_required'
              )
            : null;
        switch (field.type) {
            case ColumnType.D: //D – Data
                field.value = !!field.value ? moment(field.value, 'YYYY-MM-DD').toDate() : null;
                break;
            case ColumnType.E: //E – Data + czas
                field.value = !!field.value ? moment(field.value, 'YYYY-MM-DD HH:mm:ss').toDate() : null;
                break;
            case ColumnType.T: //T – Czas
                field.value = !!field.value ? moment(field.value, 'HH:mm:ss').toDate() : null;
                break;
            default:
                break;
        }

        let visibleAndHiddenResult = true;

        if (!visibleDocumentCriteria) {
            visibleAndHiddenResult = field.visible && !field.hidden;
        }

        return (
            <React.Fragment>
                {visibleAndHiddenResult ? (
                    <DivContainer colClass={'row mb-2'}>
                        <DivContainer>
                            <div id={`field_${fieldIndex}`} className='field'>
                                <div
                                    className={validationMsg ? 'validation-msg invalid' : 'validation-msg'}
                                    aria-live='assertive'
                                >
                                    {this.renderInputComponent(
                                        field,
                                        fieldIndex,
                                        onChange,
                                        onBlur,
                                        groupName,
                                        required,
                                        validationMsg,
                                        () => {
                                            !visibleDocumentCriteria && this.editListVisible(field);
                                        }
                                    )}
                                    {validationMsg}
                                </div>
                            </div>
                        </DivContainer>
                    </DivContainer>
                ) : null}
            </React.Fragment>
        );
    }
    getOnChange() {
        return this.props.onChange
            ? this.props.onChange
            : (text, event, groupName, info) => {
                  this.onChange(text, event, groupName, info);
              };
    }
    getOnBlur() {
        return this.props.onBlur
            ? this.props.onBlur
            : (text, event, groupName, info) => {
                  this.onBlur(text, event, groupName, info);
              };
    }
    editListVisible(field) {
        ConsoleHelper('EditRowComponent::editListVisible');
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.props.kindView;
        const editListObject = this.service.createObjectDataToRequest(this.props);
        this.setState(
            {
                loading: true,
                dataGridStoreSuccess: false,
            },
            () => {
                this.service
                    .editList(editInfo.viewId, editInfo.recordId, editInfo.parentId, field.id, kindView, editListObject)
                    .then((responseView) => {
                        let selectedRowDataTmp = [];
                        //CRC key
                        let defaultSelectedRowKeysTmp = [];
                        const editData = this.props.editData;
                        const setFields = responseView.setFields;
                        const separatorJoin = responseView.options?.separatorJoin || ',';
                        let countSeparator = 0;
                        setFields.forEach((field) => {
                            EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                                const fieldValue = ('' + foundFields.value).split(separatorJoin);
                                if (fieldValue.length > countSeparator) {
                                    countSeparator = fieldValue.length;
                                }
                            });
                        });
                        for (let index = 0; index < countSeparator; index++) {
                            let singleSelectedRowDataTmp = [];
                            setFields.forEach((field) => {
                                EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
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
                            'EditRowComponent::ListVisible:: defaultSelectedRowKeys = %s hash = %s ',
                            JSON.stringify(selectedRowDataTmp),
                            JSON.stringify(defaultSelectedRowKeysTmp)
                        );
                        let filtersListTmp = [];
                        this.setState(
                            () => ({
                                gridViewType: responseView?.viewInfo?.type,
                                parsedGridView: responseView,
                                gridViewColumns: responseView.gridColumns,
                                filtersList: filtersListTmp,
                                packageRows: responseView?.viewInfo?.dataPackageSize,
                                selectedRowData: selectedRowDataTmp,
                                defaultSelectedRowKeys: defaultSelectedRowKeysTmp,
                            }),
                            () => {
                                const res = this.editListDataStore.getEditListDataStore(
                                    editInfo.viewId,
                                    'gridView',
                                    editInfo.recordId,
                                    field.id,
                                    editInfo.parentId,
                                    null,
                                    kindView,
                                    editListObject,
                                    setFields,
                                    (err) => {
                                        this.props.showErrorMessages(err);
                                    },
                                    () => {
                                        this.setState({
                                            dataGridStoreSuccess: true,
                                        });
                                    },
                                    () => {
                                        return {selectAll: this.state.selectAll};
                                    }
                                );
                                this.setState({
                                    loading: false,
                                    parsedGridViewData: res,
                                    editListField: field,
                                    editListVisible: true,
                                });
                            }
                        );
                    })
                    .catch((err) => {
                        console.error('Error getEditList in EditRowComponent. Exception = ', err);
                        this.props.showErrorMessages(err);
                    });
            }
        );
    }
    validateDate(field) {
        let date = field.value;
        if (Object.prototype.toString.call(date) === '[object Date]') {
            if (date instanceof Date && !isNaN(date)) {
                return date;
            } else {
                return null;
            }
        }
    }

    doubleClickFakeEvent(e, element) {
        this.calendarDateTimeRef.current.hideOverlay();
    }

    renderInputComponent(field, fieldIndex, onChange, onBlur, groupName, required, validatorMsgs, onClickEditList) {
        //mock functionality
        const visibleDocumentCriteria = this.props?.visibleDocumentPanel;
        field.edit = MockService.getFieldEnableDisableOrMock(field.edit, 'edit');
        field.autoFill = MockService.getFieldEnableDisableOrMock(field.autoFill, 'autoFill');
        field.autoFillOnlyEmpty = MockService.getFieldEnableDisableOrMock(field.autoFillOnlyEmpty, 'autoFillOnlyEmpty');
        field.requiredValue = MockService.getFieldEnableDisableOrMock(required, 'requiredValue');
        field.refreshFieldVisibility = MockService.getFieldEnableDisableOrMock(
            field.refreshFieldVisibility,
            'refreshFieldVisibility'
        );
        field.selectionList = MockService.getFieldEnableDisableOrMock(field.selectionList, 'selectionList');
        field.visible = MockService.getFieldEnableDisableOrMock(field.visible, 'visible');
        //end mock functionality
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const editable = field?.edit ? 'editable-border' : 'not-editable';
        const validate = !!validatorMsgs ? 'p-invalid' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const validateCheckbox = !!validatorMsgs ? 'p-invalid-checkbox' : '';
        const labelColor = !!field.labelColor ? field.labelColor : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        let selectionListValues = field?.selectionListValues;

        let info = this.props.editData?.editInfo;

        if (visibleDocumentCriteria && selectionListValues) {
            selectionListValues = this.selectionListValuesToJson(selectionListValues);
        }

        switch (field.type) {
            case ColumnType.C:
            default:
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`field_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <div>
                            {!!selectionList && visibleDocumentCriteria ? (
                                <Dropdown
                                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                    name={field.fieldName}
                                    className={`${autoFill} ${editable} ${validate}`}
                                    style={{width: '100%'}}
                                    value={field.value}
                                    options={selectionListValues}
                                    onChange={(e) => (onChange ? onChange(InputType.DROPDOWN, e) : null)}
                                    appendTo='self'
                                    showClear
                                    filter
                                    filterBy={'name'}
                                    optionLabel='name'
                                    optionValue='name'
                                    //   disabled={!field.edit}
                                    disabled={field.edit}
                                    required={required}
                                />
                            ) : (
                                <div className={`${selectionList}`}>
                                    <InputText
                                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                        name={field.fieldName}
                                        className={` ${editable} ${autoFill} ${validate}`}
                                        style={{width: '100%'}}
                                        type='text'
                                        value={field.value}
                                        onChange={(e) =>
                                            onChange ? onChange(InputType.TEXT, e, groupName, info) : null
                                        }
                                        onBlur={(e) => (onBlur ? onBlur(InputType.TEXT, e, groupName, info) : null)}
                                        disabled={!field.edit}
                                        required={required}
                                    />
                                    {!!selectionList ? (
                                        <Button
                                            type='button'
                                            onClick={onClickEditList}
                                            icon='mdi mdi-format-list-bulleted'
                                            className='p-button-secondary'
                                        />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            case ColumnType.P: //P - hasło
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`field_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <div className={`${selectionList}`}>
                            <Password
                                id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                name={field.fieldName}
                                className={`${autoFill} ${editable} ${validate}`}
                                style={{width: '100%'}}
                                type='text'
                                value={field.value}
                                onChange={(e) => (onChange ? onChange(InputType.TEXT, e, groupName, info) : null)}
                                onBlur={(e) => (onBlur ? onBlur(InputType.TEXT, e, groupName, info) : null)}
                                disabled={!field.edit}
                                required={required}
                                feedback={false}
                            />
                            {!!selectionList ? (
                                <Button
                                    type='button'
                                    onClick={onClickEditList}
                                    icon='mdi mdi-format-list-bulleted'
                                    className='p-button-secondary'
                                />
                            ) : null}
                        </div>
                    </React.Fragment>
                );
            case ColumnType.N:
                return (
                    <React.Fragment>
                        <label htmlFor={`field_${fieldIndex}`} title={MockService.printField(field)}>
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <div>
                            {!!selectionList && visibleDocumentCriteria ? (
                                <Dropdown
                                    id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                    name={field.fieldName}
                                    className={`${autoFill} ${editable} ${validate}`}
                                    style={{width: '100%'}}
                                    value={field.value}
                                    options={selectionListValues}
                                    onChange={(e) => (onChange ? onChange(InputType.DROPDOWN, e) : null)}
                                    appendTo='self'
                                    showClear
                                    filter
                                    filterBy={'name'}
                                    optionLabel='name'
                                    optionValue='name'
                                    disabled={!field.edit}
                                    required={required}
                                />
                            ) : (
                                <div className={`${selectionList}`}>
                                    <InputText
                                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                        name={field.fieldName}
                                        onBeforeInput={(e) => {
                                            if (e.currentTarget.value !== '') {
                                                if (e.data === '-') {
                                                    this.setState({
                                                        numberFormat: {
                                                            isValidNumberFormat: false,
                                                            prevNumber: e.currentTarget.value,
                                                        },
                                                    });
                                                }
                                            }
                                        }}
                                        className={`${autoFill} ${editable} ${validate}`}
                                        style={{width: '100%'}}
                                        value={field.value}
                                        type='number'
                                        onChange={(e) => {
                                            if (
                                                this.state?.numberFormat?.isValidNumberFormat === false &&
                                                e.target.value === ''
                                            ) {
                                                e.target.value = this.state.numberFormat.prevNumber;
                                            }
                                            this.setState({
                                                numberFormat: {
                                                    isValidNumberFormat: true,
                                                    prevNumber: undefined,
                                                },
                                            });

                                            if (onChange) {
                                                onChange(InputType.TEXT, e, groupName, info);
                                            }
                                        }}
                                        onBlur={(e) => (onBlur ? onBlur(InputType.TEXT, e, groupName, info) : null)}
                                        disabled={!field.edit}
                                        required={required}
                                    />
                                    {!!selectionList ? (
                                        <Button
                                            type='button'
                                            onClick={onClickEditList}
                                            icon='mdi mdi-format-list-bulleted'
                                            className='p-button-secondary'
                                        />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            case ColumnType.B: //B – Logiczny (0/1)
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`bool_field_${fieldIndex}`}
                            title={MockService.printField(field)}
                            style={{color: labelColor}}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <br />
                        <div
                            style={{display: 'inline-block'}}
                            className={`${autoFillCheckbox} ${editable} ${validateCheckbox}`}
                        >
                            <Checkbox
                                id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                name={field.fieldName}
                                onChange={(e) => {
                                    if (this.props.onChange) {
                                        e.refreshFieldVisibility = field.refreshFieldVisibility;
                                        this.props.onChange(InputType.CHECKBOX, e, groupName, info);
                                    } else {
                                        if (typeof onChange === 'function')
                                            onChange(InputType.CHECKBOX, e, groupName, info);
                                    }
                                }}
                                checked={
                                    field.value === true || DataGridUtils.conditionForTrueValueForBoolType(field.value)
                                }
                                disabled={!field.edit}
                                required={required}
                            />
                        </div>
                    </React.Fragment>
                );
            case ColumnType.L: // L – Logiczny (T/N)
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`yes_no_field_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <Dropdown
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            value={field.value}
                            options={this.yesNoTypes}
                            onChange={(e) => (onChange ? onChange(InputType.DROPDOWN, e, groupName, info) : null)}
                            appendTo='self'
                            showClear
                            optionLabel='name'
                            optionValue='code'
                            dataKey='code'
                            disabled={!field.edit}
                            required={required}
                        />
                    </React.Fragment>
                );
            case ColumnType.D: //D – Data
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`date_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <Calendar
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            value={field.value}
                            dateFormat='yy-mm-dd'
                            onChange={(e) => (onChange ? onChange(InputType.DATE, e, groupName, info) : null)}
                            appendTo={document.body}
                            disabled={!field.edit}
                            required={required}
                            showButtonBar
                            showIcon
                            mask='9999-99-99'
                        ></Calendar>
                    </React.Fragment>
                );
            case ColumnType.E: //E – Data + czas
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`date_time_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <Calendar
                            ref={this.calendarDateTimeRef}
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            showTime
                            hourFormat='24'
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            value={this.validateDate(field)}
                            dateFormat='yy-mm-dd'
                            onSelect={(e) => {
                                clickCount++;
                                if (clickCount === 1) {
                                    console.log('pojedyncze kliknięcie zostało wykonane!');
                                    timeout = setTimeout(function () {
                                        clickCount = 0;
                                    }, 300); // Ustaw interwał czasowy na oczekiwanie na drugie kliknięcie (np. 300ms)
                                } else if (clickCount >= 2) {
                                    this.doubleClickFakeEvent(e, this);
                                    clearTimeout(timeout);
                                    clickCount = 0;
                                }
                            }}
                            onChange={(e) => (onChange ? onChange(InputType.DATETIME, e, groupName, info) : null)}
                            appendTo={document.body}
                            disabled={!field.edit}
                            required={required}
                            showButtonBar
                            showIcon
                            mask='9999-99-99 99:99'
                        ></Calendar>
                    </React.Fragment>
                );
            case ColumnType.T: //T – Czas
                return (
                    <React.Fragment>
                        <label
                            htmlFor={`time_${fieldIndex}`}
                            style={{color: labelColor}}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <Calendar
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            timeOnly
                            showTime
                            hourFormat='24'
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            value={field.value}
                            appendTo={document.body}
                            onChange={(e) => (onChange ? onChange(InputType.TIME, e, groupName, info) : null)}
                            disabled={!field.edit}
                            required={required}
                            showButtonBar
                            showIcon
                            mask='99:99'
                        ></Calendar>
                    </React.Fragment>
                );
            case ColumnType.O: //O – Opisowe
                return (
                    <React.Fragment>
                        <label
                            style={{color: labelColor}}
                            htmlFor={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <HtmlEditor
                            id={`editor_${fieldIndex}`}
                            onContentReady={(e) => {
                                e.element.className =
                                    'editor editable-border dx-show-invalid-badge dx-htmleditor dx-htmleditor-custom-underlined dx-widget';
                            }}
                            className={`editor ${autoFill} ${editable} ${validate}`}
                            defaultValue={field.value}
                            onValueChange={(e) => {
                                let event = {
                                    name: field.fieldName,
                                    value: e,
                                };
                                onChange(InputType.EDITOR, event, groupName, info);
                            }}
                            onFocusOut={(e) => (onBlur ? onBlur(InputType.EDITOR, e, groupName, info) : null)}
                            validationMessageMode='always'
                            disabled={!field.edit}
                            required={required}
                        >
                            {' '}
                            {required ? (
                                <Validator>
                                    <RequiredRule message={`Pole jest wymagane`} />
                                </Validator>
                            ) : null}
                            <MediaResizing enabled={true} />
                            <Toolbar multiline={false}>
                                <Item name='undo' />
                                <Item name='redo' />
                                <Item name='separator' />
                                <Item name='size' acceptedValues={this.sizeValues} />
                                <Item name='font' acceptedValues={this.fontValues} />
                                <Item name='header' acceptedValues={this.headerValues} />
                                <Item name='separator' />
                                <Item name='bold' />
                                <Item name='italic' />
                                <Item name='strike' />
                                <Item name='underline' />
                                <Item name='subscript' />
                                <Item name='superscript' />
                                <Item name='separator' />
                                <Item name='alignLeft' />
                                <Item name='alignCenter' />
                                <Item name='alignRight' />
                                <Item name='alignJustify' />
                                <Item name='separator' />
                                <Item name='orderedList' />
                                <Item name='bulletList' />
                                <Item name='separator' />
                                <Item name='color' />
                                <Item name='background' />
                                <Item name='separator' />
                                <Item name='insertTable' />
                                <Item name='deleteTable' />
                                <Item name='insertRowAbove' />
                                <Item name='insertRowBelow' />
                                <Item name='deleteRow' />
                                <Item name='insertColumnLeft' />
                                <Item name='insertColumnRight' />
                                <Item name='deleteColumn' />
                            </Toolbar>
                        </HtmlEditor>
                    </React.Fragment>
                );
            case ColumnType.I: //I – Obrazek
                return (
                    <React.Fragment>
                        <div className={`image-base ${autoFill} ${validate}`}>
                            <label
                                style={{color: labelColor}}
                                htmlFor={`image_${fieldIndex}`}
                                title={MockService.printField(field)}
                            >
                                {field.label}
                                {required ? '*' : ''}
                            </label>
                            <br />
                            <UploadMultiImageFileBase64
                                multiple={false}
                                deleteBtn={true}
                                onDeleteChange={() => {
                                    onChange(
                                        InputType.IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: '',
                                        },
                                        groupName,
                                        info
                                    );
                                }}
                                displayText={''}
                                alt={field.label}
                                initBase64={field.value}
                                onSuccessB64={(e) =>
                                    onChange(
                                        InputType.IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: e,
                                        },
                                        groupName,
                                        info
                                    )
                                }
                                onError={(e) => this.props.onError(e)}
                            />
                        </div>
                    </React.Fragment>
                );
            case ColumnType.IM: //IM – Obrazek multi
                return (
                    <React.Fragment>
                        <div className={`image-base ${autoFill} ${validate}`}>
                            <label
                                style={{color: labelColor}}
                                htmlFor={`image_${fieldIndex}`}
                                title={MockService.printField(field)}
                            >
                                {field.label}
                                {required ? '*' : ''}
                            </label>
                            <br />
                            <UploadMultiImageFileBase64
                                deleteBtn={true}
                                multiple={true}
                                onDeleteChange={() => {
                                    onChange(
                                        InputType.MULTI_IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: '',
                                        },
                                        groupName,
                                        info
                                    );
                                }}
                                displayText={''}
                                alt={field.label}
                                initBase64={field.value}
                                onSuccessB64={(e) =>
                                    onChange(
                                        InputType.MULTI_IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: e,
                                        },
                                        groupName,
                                        info
                                    )
                                }
                                onError={(e) => this.props.onError(e)}
                            />
                        </div>
                    </React.Fragment>
                );
            case ColumnType.H: //H - Hyperlink
                return (
                    <React.Fragment>
                        <label
                            style={{color: labelColor}}
                            htmlFor={`field_${fieldIndex}`}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <InputText
                            id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            name={field.fieldName}
                            className={`${autoFill} ${editable} ${validate}`}
                            style={{width: '100%'}}
                            type='text'
                            value={field.value}
                            onChange={(e) => (onChange ? onChange(InputType.TEXT, e, groupName, info) : null)}
                            onBlur={(e) => (onBlur ? onBlur(InputType.TEXT, e, groupName, info) : null)}
                            disabled={!field.edit}
                            required={required}
                        />
                        <a href={field.value} style={{float: 'right'}} rel='noreferrer' target='_blank'>
                            {field.label}
                        </a>
                    </React.Fragment>
                );
        }
    }

    getMessages() {
        return this.messages;
    }

    getFiles(files) {
        ConsoleHelper(files[0].base64);
    }
}

BaseRowComponent.defaultProps = {};

BaseRowComponent.propTypes = {
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    showErrorMessages: PropTypes.func.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEditList: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
    onError: PropTypes.func,
    labels: PropTypes.object.isRequired,
};

export default BaseRowComponent;

import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../components/DivContainer';
import {InputText} from 'primereact/inputtext';
import BaseContainer from '../baseContainers/BaseContainer';
import {Dropdown} from 'primereact/dropdown';
import {Calendar} from 'primereact/calendar';
import SimpleReactValidator from '../components/validator';
import HtmlEditor, {Item, MediaResizing, TableResizing, Toolbar} from 'devextreme-react/html-editor';
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
import {InputType} from '../enum/InputType';
import {ColumnType} from '../enum/ColumnType';
import {StringUtils} from '../utils/StringUtils';
import {RequestUtils} from '../utils/RequestUtils';
import Constants from '../utils/Constants';
import {InputTextarea} from 'primereact/inputtextarea';
import MarkupDialogComponent from '../components/prolab/MarkupDialogComponent';
import useStore from '../store';
import EditListDataStore from '../containers/dao/DataEditListStore';
// const mentionsConfig = [
//     {
//         dataSource: [
//             {
//                 text: 'John Heart',
//                 team: 'Engineering',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/John-Heart.png',
//             },
//             {
//                 text: 'Kevin Carter',
//                 team: 'Engineering',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Kevin-Carter.png',
//             },
//             {
//                 text: 'Olivia Peyton',
//                 team: 'Management',
//                 icosn: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Olivia-Peyton.png',
//             },
//             {
//                 text: 'Robert Reagan',
//                 team: 'Management',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Robert-Reagan.png',
//             },
//             {
//                 text: 'Cynthia Stanwick',
//                 team: 'Engineering',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Cynthia-Stanwick.png',
//             },
//             {
//                 text: 'Brett Wade ',
//                 team: 'Analysis',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Brett-Wade.png',
//             },
//             {
//                 text: 'Greta Sims',
//                 team: 'QA',
//                 icon: 'https://js.devexpress.com/React/Demos/WidgetsGallery/JSDemos/images/mentions/Greta-Sims.png',
//             },
//         ],
//         searchExpr: 'text',
//         displayExpr: 'text',
//         valueExpr: 'text',
//     },
// ];
let clickCount = 0;
let timeout;
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

            editListField: {},
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            gridViewTypes: [],
        };
        this.editListDataStore = new EditListDataStore();
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
        this.refsTextAreaArray = [];
        this.headerValues = [false, 1, 2, 3, 4, 5];
        this.messages = React.createRef();
        this.calendarDateTimeRef = React.createRef();
        this.selectionListValuesToJson = this.selectionListValuesToJson.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.validateDate = this.validateDate.bind(this);
        this.editListVisible = this.editListVisible.bind(this);

        // this.tagBoxStore = new DataTagBoxStore();
        this.fieldsMandatoryLabel = LocUtils.loc(
            this.props.labels,
            'Fields_Mandatory_Label',
            'Wypełnij wszystkie wymagane pola'
        );
    }
    isReadOnly = () => {
        const editData = this.props.editData;
        return editData?.editInfo?.readOnly;
    };
    canRegisterKeyDownEvent() {
        const kindOperation = this.props.editData?.editInfo?.kindOperation;
        if (kindOperation) {
            if (kindOperation.toUpperCase() === 'ADD') {
                return true;
            }
        }
        return false;
    }
    componentDidMount() {
        super.componentDidMount();
        if (this.canRegisterKeyDownEvent()) {
            this.registerKeydownEvent();
        }
    }
    registerKeydownEvent() {
        document.addEventListener('keydown', this.keydownEvent);
    }
    unregisterKeydownEvent() {
        document.removeEventListener('keydown', this.keydownEvent);
    }
    keydownEvent = (event) => {
        if (event.key === 'F5' || event.keyCode === 116) {
            this.handleCancel();
            this.unregisterKeydownEvent();
        }
    };
    componentWillUnmount() {
        super.componentWillUnmount();
        this.unregisterKeydownEvent();
    }

    handleCancel() {
        if (typeof this.props.onHide === 'function') this.props.onHide();
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
    canRenderInputComponent(field) {
        const visibleDocumentPanel = this.props?.visibleDocumentPanel;
        if (!visibleDocumentPanel) {
            return field.visible && !field.hidden;
        }
        return true;
    }
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
        field = this.fieldTypeTransform(field);
        return (
            <React.Fragment>
                {this.canRenderInputComponent(field) ? (
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
    getWidthSizeSidebar(editFields) {
        let size = 45;
        if (editFields) {
            const panels = editFields[0]?.panels;
            if (panels) {
                size = panels[0]?.size ? panels[0]?.size : size;
            }
        }
        return {width: `${size}%`};
    }
    canPushRowData(value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        if (typeof value !== 'number' && !(value instanceof Date)) {
            if (StringUtils.isEmpty(value)) {
                return false;
            }
        }
        return true;
    }
    addMarkupItem(field, currentToolbarItems, onChange, e, groupUuid, info) {
        const markup = {
            name: 'markup',
            widget: 'dxButton',
            showText: 'inMenu',
            options: {
                icon: 'variable',
                hint: LocUtils.locFromStoreWithDefault('Show_markup', 'Show markup'),
                text: LocUtils.locFromStoreWithDefault('Show_markup', 'Show markup'),
                onClick: (e) => {
                    MarkupDialogComponent.render({
                        onAccept: (value) => {
                            const event = {name: field.fieldName, value: value};
                            onChange('EDITOR', event, groupUuid, info);
                            e.component.option('value', value);
                        },
                        initValue: field.value,
                    });
                },
            },
        };
        e.component.option('toolbar.items', [...currentToolbarItems, markup]);
    }

    editListVisible(field) {
        this.blockUi();
        ConsoleHelper('EditHeaderComponent::editListVisible');
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.props.kindView;
        const editListObject = RequestUtils.createObjectDataToRequest(this.props);
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
                        let defaultSelectedRowKeysTmp = [];
                        const editData = this.props.editData;
                        const setFields = structuredClone(responseView.setFields);
                        const separatorJoin = responseView.options?.separatorJoin || ',';
                        let countSeparator = 0;
                        setFields.forEach((field) => {
                            EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                                if (this.canPushRowData(foundFields.value)) {
                                    const fieldValue = ('' + foundFields.value).split(separatorJoin);
                                    if (fieldValue.length > countSeparator) {
                                        countSeparator = fieldValue.length;
                                    }
                                }
                            });
                        });
                        for (let index = 0; index < countSeparator; index++) {
                            let singleSelectedRowDataTmp = [];
                            setFields.forEach((field) => {
                                EditRowUtils.searchField(editData, field.fieldEdit, (foundFields) => {
                                    let fieldTmp = {};
                                    if (this.canPushRowData(foundFields.value)) {
                                        const fieldValue = ('' + foundFields.value).split(separatorJoin);
                                        fieldTmp[field.fieldList] = fieldValue[index];
                                        singleSelectedRowDataTmp.push(fieldTmp);
                                    }
                                });
                            });

                            if (singleSelectedRowDataTmp.length !== 0) {
                                let CALC_CRC = EditListUtils.calculateCRC([singleSelectedRowDataTmp[0]]);
                                singleSelectedRowDataTmp[0].CALC_CRC = CALC_CRC;
                                selectedRowDataTmp.push(singleSelectedRowDataTmp);
                                defaultSelectedRowKeysTmp.push(CALC_CRC);
                            }
                        }
                        let filtersListTmp = [];
                        this.setState({
                            gridViewType: responseView?.viewInfo?.type,
                            parsedGridView: responseView,
                            gridViewColumns: responseView.gridColumns,
                            filtersList: filtersListTmp,
                            packageRows: responseView?.viewInfo?.dataPackageSize,
                            selectedRowData: selectedRowDataTmp,
                            defaultSelectedRowKeys: defaultSelectedRowKeysTmp,
                            editListField: field,
                            editListVisible: true,
                        });
                    })
                    .catch((err) => {
                        console.error('Error getEditList in EditHeaderComponent. Exception = ', err);
                        this.props.showErrorMessages(err);
                        this.unblockUi();
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
        return date;
    }

    doubleClickFakeEvent(fieldIndex) {
        const dataTimeComponent = document.getElementById(`date_time_${fieldIndex}`);
        if (dataTimeComponent) {
            if (dataTimeComponent.children.length >= 2) {
                const calendarBtn = dataTimeComponent?.children[1];
                if (calendarBtn) {
                    calendarBtn.click();
                }
            }
        }
    }
    handleOnChange = (field, value, onChange) => {
        if (onChange) {
            onChange();
            if (!StringUtils.isBlank(value)) {
                field.value = value;
            }
        }
    };
    handleOnBlur = (field, value, onBlur) => {
        if (onBlur) {
            onBlur();
            if (!StringUtils.isBlank(value)) {
                field.value = value;
            }
        }
    };

    isDisabled = (field) => {
        if (field.readOnly) {
            return true;
        }
        return !field.edit;
    };

    renderInputComponent(field, fieldIndex, onChange, onBlur, groupUuid, required, validatorMsgs, onClickEditList) {
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
        const editable = !this.isDisabled(field) ? 'editable-border' : 'not-editable';
        const validate = !!validatorMsgs ? 'p-invalid' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const validateCheckbox = !!validatorMsgs ? 'p-invalid-checkbox' : '';
        const labelColor = !!field.labelColor ? field.labelColor : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        const info = this.props.editData?.editInfo;
        let selectionListValues = field?.selectionListValues;
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
                                    disabled={this.isDisabled(field)}
                                    required={required}
                                />
                            ) : (
                                <div className={`${selectionList} ${editable}`}>
                                    <InputText
                                        id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                        name={field.fieldName}
                                        className={`${editable} ${autoFill} ${validate}`}
                                        style={{width: '100%'}}
                                        type='text'
                                        value={field.value}
                                        onChange={(e) => {
                                            this.handleOnChange(field, e?.target?.value, () => {
                                                onChange(InputType.TEXT, e, groupUuid, info);
                                            });
                                        }}
                                        required={required}
                                        disabled={this.isDisabled(field)}
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
                        <div className={`${selectionList} ${editable}`}>
                            <Password
                                id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                name={field.fieldName}
                                className={`${autoFill} ${editable} ${validate}`}
                                style={{width: '100%'}}
                                type='text'
                                value={field.value}
                                onChange={(e) =>
                                    this.handleOnChange(field, e?.target?.value, () =>
                                        onChange(InputType.TEXT, e, groupUuid, info)
                                    )
                                }
                                disabled={this.isDisabled(field)}
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
                                    disabled={this.isDisabled(field)}
                                    required={required}
                                />
                            ) : (
                                <div className={`${selectionList} ${editable}`}>
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
                                        onChange={(e) => {
                                            let value = structuredClone(e.target.value);
                                            value = value.replace(/,/g, '.');
                                            const isNumber = !isNaN(parseFloat(value)) && isFinite(value);
                                            if (isNumber || StringUtils.isBlank(value) || value === '') {
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
                                                    this.handleOnChange(field, e?.target?.value, () =>
                                                        onChange(InputType.TEXT, e, groupUuid, info)
                                                    );
                                                }
                                            } else {
                                                e.target.value = e.target.value
                                                    .replace(/[^0-9,]/g, '')
                                                    .replace(/(,.*)[,]/g, '$1');
                                                if (onChange) {
                                                    this.handleOnChange(field, e?.target?.value, () =>
                                                        onChange(InputType.TEXT, e, groupUuid, info)
                                                    );
                                                }
                                            }
                                        }}
                                        disabled={this.isDisabled(field)}
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
                                        this.props.onChange(InputType.CHECKBOX, e, groupUuid, info);
                                    } else {
                                        if (typeof onChange === 'function') {
                                            if (!StringUtils.isBlank(e)) {
                                                e.refreshFieldVisibility = field.refreshFieldVisibility;
                                                onChange(InputType.CHECKBOX, e, groupUuid, info);
                                            }
                                        }
                                    }
                                }}
                                checked={
                                    field.value === true || DataGridUtils.conditionForTrueValueForBoolType(field.value)
                                }
                                disabled={this.isDisabled(field)}
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
                            onChange={(e) => (onChange ? onChange(InputType.DROPDOWN, e, groupUuid, info) : null)}
                            appendTo='self'
                            showClear
                            optionLabel='name'
                            optionValue='code'
                            dataKey='code'
                            disabled={this.isDisabled(field)}
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
                            value={this.validateDate(field)}
                            dateFormat='yy-mm-dd'
                            onChange={(e) => (onChange ? onChange(InputType.DATE, e, groupUuid, info) : null)}
                            appendTo={document.body}
                            disabled={this.isDisabled(field)}
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
                            id={`label-${EditRowUtils.getType(field.type)}${fieldIndex}`}
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
                                    timeout = setTimeout(function () {
                                        clickCount = 0;
                                    }, 300); // Ustaw interwał czasowy na oczekiwanie na drugie kliknięcie (np. 300ms)
                                } else if (clickCount >= 2) {
                                    this.doubleClickFakeEvent(fieldIndex);
                                    clearTimeout(timeout);
                                    clickCount = 0;
                                }
                            }}
                            onChange={(e) => (onChange ? onChange(InputType.DATETIME, e, groupUuid, info) : null)}
                            appendTo={document.body}
                            disabled={this.isDisabled(field)}
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
                            appendTo={document.body}
                            onChange={(e) => {
                                if (onChange) {
                                    if (e.originalEvent.currentTarget.value.includes('_')) {
                                        return;
                                    }
                                    onChange(InputType.TIME, e, groupUuid, info);
                                }
                            }}
                            disabled={this.isDisabled(field)}
                            required={required}
                            showButtonBar
                            showIcon
                            value={this.validateDate(field)}
                            mask={'99:99'}
                        ></Calendar>
                    </React.Fragment>
                );
            case ColumnType.O:
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
                        <InputTextarea
                            name={field.fieldName}
                            disabled={this.isDisabled(field)}
                            required={required}
                            autoResize
                            style={{resize: 'none'}}
                            value={field.value}
                            rows={1}
                            className={`col-12 ${autoFill} ${editable} ${validate}`}
                            onChange={(e) => {
                                if (onChange) {
                                    onChange(InputType.AREA, e, groupUuid, info);
                                }
                            }}
                            onBlur={(e) => (onBlur ? onBlur(InputType.AREA, e, groupUuid, info) : null)}
                        />
                    </React.Fragment>
                );
            case ColumnType.CH:
                const listOfHintsNotExists = !!!selectionList;
                const manualEditingDisabled = !field?.edit;
                const customClass = listOfHintsNotExists && manualEditingDisabled ? 'no-border-p-inputgroup' : editable;
                return (
                    <div>
                        <label
                            style={{color: labelColor}}
                            htmlFor={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                            title={MockService.printField(field)}
                        >
                            {field.label}
                            {required ? '*' : ''}
                        </label>
                        <div className={`${selectionList} ${customClass} `}>
                            <div
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    minHeight: !!selectionList ? '40px' : '18px',
                                    padding: '2px 6px 2px 6px',
                                }}
                                title={StringUtils.textFromHtmlString(field.value)}
                                dangerouslySetInnerHTML={{__html: field.value}}
                            ></div>
                            {!!selectionList ? (
                                <Button
                                    type='button'
                                    onClick={onClickEditList}
                                    icon='mdi mdi-format-list-bulleted'
                                    className='p-button-secondary'
                                />
                            ) : null}
                        </div>
                    </div>
                );

            case ColumnType.OH:
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
                        <div>
                            <HtmlEditor
                                // mentions={mentionsConfig}
                                key={`html-editor_${fieldIndex}-${groupUuid}`}
                                ref={(el) => (this.refsTextAreaArray[fieldIndex] = el)}
                                id={`editor_${fieldIndex}-${groupUuid}`}
                                onContentReady={(e) => {
                                    const showMarkupOnHtmlEditor = useStore.getState().showMarkupOnHtmlEditor;
                                    if (showMarkupOnHtmlEditor) {
                                        const currentToolbarItems = e.component.option('toolbar.items');
                                        const itemExists = currentToolbarItems.some((item) => item.name === 'markup');
                                        if (!itemExists) {
                                            this.addMarkupItem(
                                                field,
                                                currentToolbarItems,
                                                onChange,
                                                e,
                                                groupUuid,
                                                info
                                            );
                                        }
                                    }
                                    const editable = field?.edit ? '' : 'not-editable';
                                    e.element.className = `editor ${editable} dx-show-invalid-badge dx-htmleditor dx-htmleditor-custom-underlined dx-widget`;
                                }}
                                style={{width: '100%'}}
                                className={`editor ${autoFill} ${validate}`}
                                defaultValue={field.value}
                                value={field.value}
                                onValueChange={(e) => {
                                    const afterNormalize = e;
                                    const currentValue = field.value;
                                    if (currentValue === afterNormalize) {
                                        return;
                                    }
                                    const event = {
                                        name: field.fieldName,
                                        value: afterNormalize,
                                    };
                                    onChange(InputType.EDITOR, event, groupUuid, info);
                                }}
                                onValueChanged={(e) => {
                                    const afterNormalize = e.value;
                                    const currentValue = field.value;
                                    if (currentValue === afterNormalize) {
                                        return;
                                    }
                                    e.component.option('value', afterNormalize);
                                }}
                                onFocusOut={(e) => {
                                    if (onBlur) {
                                        onBlur(InputType.EDITOR, e, groupUuid, info);
                                    }
                                }}
                                validationMessageMode='always'
                                disabled={this.isDisabled(field)}
                                required={required}
                            >
                                <TableResizing enabled={true} />
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
                                    <Item name='blockquote' />
                                    <Item name='codeBlock' />
                                    <Item name='image' />
                                    <Item name='link' />
                                    <Item name='clear' />
                                    <Item name='insertHeaderRow' />
                                    <Item name='cellProperties' />
                                    <Item name='tableProperties' />
                                </Toolbar>
                            </HtmlEditor>
                        </div>
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
                                className={`${editable}`}
                                multiple={false}
                                deleteBtn={field?.edit}
                                onDeleteChange={() => {
                                    onChange(
                                        InputType.IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: '',
                                        },
                                        groupUuid,
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
                                        groupUuid,
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
                                className={`${editable}`}
                                deleteBtn={field?.edit}
                                multiple={true}
                                onDeleteChange={() => {
                                    onChange(
                                        InputType.MULTI_IMAGE64,
                                        {
                                            fieldName: field.fieldName,
                                            base64: '',
                                        },
                                        groupUuid,
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
                                        groupUuid,
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
                            onChange={(e) => (onChange ? onChange(InputType.TEXT, e, groupUuid, info) : null)}
                            onBlur={(e) => (onBlur ? onBlur(InputType.TEXT, e, groupUuid, info) : null)}
                            disabled={this.isDisabled(field)}
                            required={required}
                        />
                        <a href={field.value} style={{float: 'right'}} rel='noreferrer' target='_blank'>
                            {field.label}
                        </a>
                    </React.Fragment>
                );
        }
    }
    fieldTypeTransform(field) {
        switch (field.type) {
            case ColumnType.D: //D – Data
                field.value = !!field.value ? moment(field.value, Constants.DATE_FORMAT.YYYY_MM_DD).toDate() : null;
                break;
            case ColumnType.E: //E – Data + czas
                field.value = !!field.value
                    ? moment(field.value, Constants.DATE_FORMAT.YYYY_MM_DD_HHmmss).toDate()
                    : null;
                break;
            case ColumnType.T: //T – Czas
                field.value = !!field.value ? moment(field.value, Constants.DATE_FORMAT.HH_mm_ss).toDate() : null;
                break;
            default:
                break;
        }
        return field;
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

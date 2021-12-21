/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from "../DivContainer";
import {InputText} from "primereact/inputtext";
import BaseContainer from "../../baseContainers/BaseContainer";
import {Panel} from "primereact/panel";
import ShortcutButton from "./ShortcutButton";
import {GridViewUtils} from "../../utils/GridViewUtils";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import SimpleReactValidator from "../validator";
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {Validator} from "devextreme-react";
import {RequiredRule} from "devextreme-react/validator";
import moment from 'moment';
import EditService from "../../services/EditService";
import {Sidebar} from "primereact/sidebar";
import UploadMultiImageFileBase64 from "./UploadMultiImageFileBase64";
import {Checkbox} from "primereact/checkbox";
import ConsoleHelper from "../../utils/ConsoleHelper";
import {Button} from "primereact/button";
import EditListComponent from "./EditListComponent";
import {Toast} from "primereact/toast";
import EditRowUtils from "../../utils/EditRowUtils";
import EditListDataStore from "../../containers/dao/EditListDataStore";
import EditListUtils from "../../utils/EditListUtils";

export class EditRowComponent extends BaseContainer {

    constructor(props) {
        super(props);
        this.service = new EditService();

        this.state = {
            loading: true,
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            gridViewTypes: [],
            gridViewType: null,
            dataGridStoreSuccess: false,
            selectedRowData: [],
            defaultSelectedRowKeys: []
        };

        this.editListDataStore = new EditListDataStore();
        this.editListDataGrid = null;

        this.booleanTypes = [
            {name: 'Tak', code: '1'},
            {name: 'Nie', code: '0'},
        ];
        this.yesNoTypes = [
            {name: 'Tak', code: 'T'},
            {name: 'Nie', code: 'N'},
        ];
        this.sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
        this.fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
        this.headerValues = [false, 1, 2, 3, 4, 5];
        this.preventSave = false;
        this.handleAutoFill = this.handleAutoFill.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.editListVisible = this.editListVisible.bind(this);
    }

    handleSelectedRowData(selectedRowData) {
        ConsoleHelper("EditRowComponent::handleSelectedRowData obj=" + JSON.stringify(selectedRowData))
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

    editListVisible(field) {
        ConsoleHelper('EditRowComponent::editListVisible')
        let editInfo = this.props.editData?.editInfo;
        let kindView = this.props.kindView;
        let editListObject = this.service.createObjectToEditList(this.props.editData)
        this.setState({
            loading: true,
            dataGridStoreSuccess: false
        }, () => {
            this.service
                .getEditList(editInfo.viewId, editInfo.recordId, editInfo.parentId, field.id, kindView, editListObject)
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
                        let CALC_CRC = EditListUtils.calculateCRC(singleSelectedRowDataTmp)
                        defaultSelectedRowKeysTmp.push(CALC_CRC);
                    }
                    ConsoleHelper("EditRowComponent::EditRowComponenteditListVisible:: defaultSelectedRowKeys = %s hash = %s ", JSON.stringify(selectedRowDataTmp), JSON.stringify(defaultSelectedRowKeysTmp))
                    let filtersListTmp = [];
                    this.setState(() => ({
                            gridViewType: responseView?.viewInfo?.type,
                            parsedGridView: responseView,
                            gridViewColumns: responseView.gridColumns,
                            filtersList: filtersListTmp,
                            packageRows: responseView?.viewInfo?.dataPackageSize,
                            selectedRowData: selectedRowDataTmp,
                            defaultSelectedRowKeys: defaultSelectedRowKeysTmp
                        }),
                        () => {
                            let res = this.editListDataStore.getEditListDataStore(
                                editInfo.viewId,
                                'gridView',
                                editInfo.recordId,
                                field.id,
                                editInfo.parentId,
                                null,
                                kindView,
                                editListObject,
                                setFields,
                                //onError
                                (err) => {
                                    this.showErrorMessages(err);
                                },
                                //onSuccess
                                () => {
                                    this.setState({
                                        //performance :)
                                        // totalSelectCount: response.totalSelectCount,
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
                                editListVisible: true
                            });
                        }
                    );
                }).catch((err) => {
                console.error('Error getEditList in EditRowComponent. Exception = ', err);
                this.showErrorMessages(err);
            });
        });
    }

    render() {
        const operations = this.props.editData?.operations;
        const opSave = GridViewUtils.containsOperationButton(operations, 'OP_SAVE');
        const opFill = GridViewUtils.containsOperationButton(operations, 'OP_FILL');
        const opCancel = GridViewUtils.containsOperationButton(operations, 'OP_CANCEL');
        let editData = this.props.editData;
        let visibleEditPanel = this.props.visibleEditPanel;
        let editListVisible = this.state.editListVisible;
        return <React.Fragment>
            <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)}/>
            <EditListComponent visible={editListVisible}
                               parsedGridView={this.state.parsedGridView}
                               parsedGridViewData={this.state.parsedGridViewData}
                               gridViewColumns={this.state.gridViewColumns}
                               onHide={() => this.setState({editListVisible: false})}
                               handleBlockUi={() => {
                                   this.blockUi();
                                   return true;
                               }}
                               handleUnblockUi={() => this.unblockUi}
                               handleOnChosen={(editListData) => {
                                   ConsoleHelper('EditRowComponent::handleOnChosen = ', JSON.stringify(editListData))
                                   let editInfo = this.props.editData?.editInfo;
                                   this.props.onEditList(editInfo, editListData);
                               }}
                               showErrorMessages={(err) => this.showErrorMessages(err)}
                               dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                               selectedRowData={this.state.selectedRowData}
                               defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                               handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
            />
            <Sidebar
                id='right-sidebar'
                visible={visibleEditPanel}
                modal={true}
                style={{width: '45%'}}
                position='right'
                onHide={() => this.props.onHide(!visibleEditPanel)}
                icons={() => (
                    <React.Fragment>
                        <div id='label' className="label"
                             style={{flex: 'auto'}}>{editData?.editInfo?.viewName}</div>
                        <div id='buttons' style={{textAlign: 'right'}}>
                            <ShortcutButton id={'opSave'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleFormSubmit}
                                            title={opSave?.label}
                                            label={opSave?.label}
                                            rendered={opSave}/>
                            <ShortcutButton id={'opFill'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleAutoFill}
                                            title={opFill?.label}
                                            label={opFill?.label}
                                            rendered={opFill}/>
                            <ShortcutButton id={'opCancel'}
                                            className={`grid-button-panel mt-1 mb-1 mr-1`}
                                            handleClick={this.handleCancel}
                                            title={opCancel?.label}
                                            label={opCancel?.label}
                                            rendered={opCancel}/>
                        </div>
                    </React.Fragment>
                )}
            >
                <form onSubmit={this.handleFormSubmit} noValidate>
                    <div id="row-edit" className="row-edit-container">
                        {this.preventSave ? <div id="validation-panel" className="validation-panel">
                            Wypełnij wszystkie wymagane pola
                        </div> : null}
                        {editData?.editFields?.map((group, index) => {
                                return this.renderGroup(group, index)
                            }
                        )}
                    </div>
                </form>
            </Sidebar>
        </React.Fragment>
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.preventSave = false;
            this.blockUi(this.handleValidForm);
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.preventSave = true;
            this.forceUpdate();
        }
    }

    handleValidForm() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleAutoFill() {
        let editInfo = this.props.editData?.editInfo;
        let kindView = this.props.kindView;
        this.props.onAutoFill(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        let editInfo = this.props.editData?.editInfo;
        this.props.onCancel(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    renderGroup(group, groupIndex) {
        return <React.Fragment>
            <Panel id={`group_${groupIndex}`} className={'mb-6'} header={group.groupName} toggleable={group.isExpanded}>
                <DivContainer>
                    {group.fields?.map((field, index) => {
                            return this.renderField(group.groupName, field, index)
                        }
                    )}
                </DivContainer>
            </Panel>
        </React.Fragment>;
    }

    renderField(groupName, field, fieldIndex) {
        const {onChange} = this.props;
        const {onBlur} = this.props;
        const required = field.requiredValue;
        let validationMsg = this.validator ? this.validator.message(`${EditRowUtils.getType(field.type)}${fieldIndex}`, field.label, field.value, required ? 'required' : 'not_required') : null;
        switch (field.type) {
            case 'D'://D – Data
                field.value = !!field.value ? moment(field.value, "YYYY-MM-DD").toDate() : null;
                break;
            case 'E'://E – Data + czas
                field.value = !!field.value ? moment(field.value, "YYYY-MM-DD HH:mm:ss").toDate() : null;
                break;
            case 'T'://T – Czas
                field.value = !!field.value ? moment(field.value, "HH:mm:ss").toDate() : null;
                break;
            default:
                break;
        }
        return <React.Fragment>
            {field.visible && !field.hidden ?
                <DivContainer colClass={'row mb-2'}>
                    <DivContainer>
                        <div id={`field_${fieldIndex}`} className='field'>
                            <div className={validationMsg ? 'validation-msg invalid' : 'validation-msg'}
                                 aria-live="assertive">
                                {this.renderInputComponent(field, fieldIndex, onChange, onBlur, groupName, required, validationMsg, () => {
                                    this.editListVisible(field);
                                })}
                                {validationMsg}
                            </div>
                        </div>
                    </DivContainer>
                </DivContainer>
                : null}
        </React.Fragment>;
    }

    renderInputComponent(field, fieldIndex, onChange, onBlur, groupName, required, validatorMsgs, onClickEditList) {
        const autoFill = field?.autoFill ? 'autofill-border' : '';
        const validate = !!validatorMsgs ? 'p-invalid' : '';
        const autoFillCheckbox = field?.autoFill ? 'autofill-border-checkbox' : '';
        const validateCheckbox = !!validatorMsgs ? 'p-invalid-checkbox' : '';
        const labelColor = !!field.labelColor ? field.labelColor : '';
        const selectionList = field?.selectionList ? 'p-inputgroup' : null;
        let editInfo = this.props.editData?.editInfo;
        //odkomentowac dla mocka
        field.edit = true;
        switch (field.type) {
            case 'C'://C – Znakowy
            default:
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <div className={`${selectionList}`}>
                        <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                   name={field.fieldName}
                                   className={`${autoFill} ${validate}`}
                                   style={{width: '100%'}}
                                   type="text"
                                   value={field.value}
                                   onChange={e => onChange ? onChange('TEXT', e, groupName, editInfo) : null}
                                   onBlur={e => onBlur ? onBlur('TEXT', e, groupName, editInfo) : null}
                                   disabled={!field.edit}
                                   required={required}
                        />
                        {!!selectionList ? <Button type="button" onClick={onClickEditList} icon="pi pi-question-circle"
                                                   className="p-button-secondary"/> : null}
                    </div>
                </React.Fragment>);
            case "N"://N – Numeryczny/Liczbowy
                return (<React.Fragment>
                    <label htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <div className={`${selectionList}`}>
                        <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                                   name={field.fieldName}
                                   className={`${autoFill} ${validate}`}
                                   style={{width: '100%'}}
                                   value={field.value}
                                   type="number"
                                   onChange={e => onChange ? onChange('TEXT', e, groupName, editInfo) : null}
                                   onBlur={e => onBlur ? onBlur('TEXT', e, groupName, editInfo) : null}
                                   disabled={!field.edit}
                                   required={required}
                                   padControl="false"
                        />
                        {!!selectionList ? <Button type="button" onClick={onClickEditList} icon="pi pi-question-circle"
                                                   className="p-button-secondary"/> : null}
                    </div>
                </React.Fragment>);
            case 'B'://B – Logiczny (0/1)
                return (<React.Fragment>
                    <label htmlFor={`bool_field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <br/>
                    <Checkbox id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFillCheckbox} ${validateCheckbox}`}
                              onChange={e => onChange ? onChange('CHECKBOX', e, groupName, editInfo) : null}
                              checked={field.value === true || GridViewUtils.conditionForTrueValueForBoolType(field.value)}
                              disabled={!field.edit}
                              required={required}>
                    </Checkbox>
                </React.Fragment>);
            case 'L'://L – Logiczny (T/N)
                return (<React.Fragment>
                    <label htmlFor={`yes_no_field_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Dropdown id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              options={this.yesNoTypes}
                              onChange={e => onChange ? onChange('DROPDOWN', e, groupName, editInfo) : null}
                              appendTo="self"
                              showClear
                              optionLabel="name"
                              optionValue="code"
                              dataKey="code"
                              disabled={!field.edit}
                              required={required}/>
                </React.Fragment>);
            case 'D'://D – Data
                return (<React.Fragment>
                    <label htmlFor={`date_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              onChange={e => onChange ? onChange('DATE', e, groupName, editInfo) : null}
                              appendTo="self"
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'E'://E – Data + czas
                return (<React.Fragment>
                    <label htmlFor={`date_time_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              dateFormat="yy-mm-dd"
                              appendTo="self"
                              onChange={e => onChange ? onChange('DATETIME', e, groupName, editInfo) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'T'://T – Czas
                return (<React.Fragment>
                    <label htmlFor={`time_${fieldIndex}`}
                           style={{color: labelColor}}>{field.label}{required ? '*' : ''}</label>
                    <Calendar id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                              timeOnly
                              showTime
                              hourFormat="24"
                              name={field.fieldName}
                              className={`${autoFill} ${validate}`}
                              style={{width: '100%'}}
                              value={field.value}
                              appendTo="self"
                              onChange={e => onChange ? onChange('TIME', e, groupName, editInfo) : null}
                              disabled={!field.edit}
                              required={required}
                              showButtonBar
                              showIcon>
                    </Calendar>
                </React.Fragment>);
            case 'O'://O – Opisowe
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`${EditRowUtils.getType(field.type)}${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <HtmlEditor
                        id={`editor_${fieldIndex}`}
                        className={`editor ${autoFill} ${validate}`}
                        defaultValue={field.value}
                        onValueChange={e => {
                            let event = {
                                name: field.fieldName,
                                value: e
                            }
                            onChange('EDITOR', event, groupName, editInfo)
                        }}
                        onFocusOut={e => onBlur ? onBlur('EDITOR', e, groupName, editInfo) : null}
                        validationMessageMode="always"
                        disabled={!field.edit}
                        required={true}
                    >  {required ? <Validator>
                        <RequiredRule message={`Pole jest wymagane`}/>
                    </Validator> : null}
                        <MediaResizing enabled={true}/>
                        <Toolbar>
                            <Item name="undo"/>
                            <Item name="redo"/>
                            <Item name="separator"/>
                            <Item name="size" acceptedValues={this.sizeValues}/>
                            <Item name="font" acceptedValues={this.fontValues}/>
                            <Item name="header" acceptedValues={this.headerValues}/>
                            <Item name="separator"/>
                            <Item name="bold"/>
                            <Item name="italic"/>
                            <Item name="strike"/>
                            <Item name="underline"/>
                            <Item name="subscript"/>
                            <Item name="superscript"/>
                            <Item name="separator"/>
                            <Item name="alignLeft"/>
                            <Item name="alignCenter"/>
                            <Item name="alignRight"/>
                            <Item name="alignJustify"/>
                            <Item name="separator"/>
                            <Item name="orderedList"/>
                            <Item name="bulletList"/>
                            <Item name="separator"/>
                            <Item name="color"/>
                            <Item name="background"/>
                            <Item name="separator"/>
                            <Item name="insertTable"/>
                            <Item name="deleteTable"/>
                            <Item name="insertRowAbove"/>
                            <Item name="insertRowBelow"/>
                            <Item name="deleteRow"/>
                            <Item name="insertColumnLeft"/>
                            <Item name="insertColumnRight"/>
                            <Item name="deleteColumn"/>
                        </Toolbar>
                    </HtmlEditor>
                </React.Fragment>);
            case 'I'://I – Obrazek
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <label style={{color: labelColor}}
                               htmlFor={`image_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                        <br/>
                        <UploadMultiImageFileBase64 multiple={false}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChange('IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        },
                                                        groupName,
                                                        editInfo)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'IM'://IM – Obrazek multi
                return (<React.Fragment>
                    <div className={`image-base ${autoFill} ${validate}`}>
                        <label style={{color: labelColor}}
                               htmlFor={`image_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                        <br/>
                        <UploadMultiImageFileBase64 multiple={true}
                                                    displayText={""}
                                                    alt={field.label}
                                                    initBase64={field.value}
                                                    onSuccessB64={(e) => onChange('MULTI_IMAGE64', {
                                                            fieldName: field.fieldName,
                                                            base64: e
                                                        },
                                                        groupName,
                                                        editInfo)}
                                                    onError={(e) => this.props.onError(e)}/>
                    </div>
                </React.Fragment>);
            case 'H'://H - Hyperlink
                return (<React.Fragment>
                    <label style={{color: labelColor}}
                           htmlFor={`field_${fieldIndex}`}>{field.label}{required ? '*' : ''}</label>
                    <InputText id={`${EditRowUtils.getType(field.type)}${fieldIndex}`}
                               name={field.fieldName}
                               className={`${autoFill} ${validate}`}
                               style={{width: '100%'}}
                               type="text"
                               value={field.value}
                               onChange={e =>
                                   onChange ? onChange('TEXT', e, groupName, editInfo) : null
                               }
                               onBlur={e => onBlur ? onBlur('TEXT', e, groupName, editInfo) : null}
                               disabled={!field.edit}
                               required={required}
                    />
                    <a href={field.value} style={{float: 'right'}} rel="noreferrer"
                       target='_blank'>
                        {field.label}
                    </a>
                </React.Fragment>);
        }
    }

    getFiles(files) {
        ConsoleHelper(files[0].base64)
    }

}

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    visibleEditPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
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
};

export default EditRowComponent;

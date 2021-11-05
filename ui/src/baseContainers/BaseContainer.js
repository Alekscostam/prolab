import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import ActionLink from '../components/ActionLink';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import SimpleReactValidator from '../components/validator';
import AuthService from '../services/AuthService';
import $ from 'jquery';
import Constants from '../utils/Constants';
import BlockUi from '../components/waitPanel/BlockUi';
import {Toast} from 'primereact/toast';
import {Message} from 'primereact/message';
import AppPrefixUtils from "../utils/AppPrefixUtils";
import {confirmDialog} from "primereact/confirmdialog";
import {localeOptions} from "primereact/api";
import EditRowUtils from "../utils/EditRowUtils";

class BaseContainer extends React.Component {
    constructor(props, service) {
        super(props);
        this.service = service;
        this.authService = new AuthService(this.props.backendUrl);
        this.scrollToFirstError = this.scrollToFirstError.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleValidForm = this.handleValidForm.bind(this);
        this.prepareFooter = this.prepareFooter.bind(this);
        this.prepareHeader = this.prepareHeader.bind(this);
        this.prepareHeaderItems = this.prepareHeaderItems.bind(this);
        this.prepareFooterItems = this.prepareFooterItems.bind(this);
        this.setWaitPanelLabel = this.setWaitPanelLabel.bind(this);
        this.blockUi = this.blockUi.bind(this);
        this.unblockUi = this.unblockUi.bind(this);
        this.loader = this.loader.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.showSuccessMessage = this.showSuccessMessage.bind(this);
        this.showInfoMessage = this.showInfoMessage.bind(this);
        this.showWarningMessage = this.showWarningMessage.bind(this);
        this.showErrorMessages = this.showErrorMessages.bind(this);
        this.handleGetDetailsError = this.handleGetDetailsError.bind(this);
        this.renderGlobalTop = this.renderGlobalTop.bind(this);
        this.handleEditRowChange = this.handleEditRowChange.bind(this);
        this.handleEditRowSave = this.handleEditRowSave.bind(this);
        this.handleEditRowBlur = this.handleEditRowBlur.bind(this);
        this.handleAutoFillRowChange = this.handleAutoFillRowChange.bind(this);
        this.handleCancelRowChange = this.handleCancelRowChange.bind(this);
        this.validator = new SimpleReactValidator();
        this._isMounted = false;
        this.jwtRefreshBlocked = false;
        this.scrollToError = false;
        this.messages = null;
    }

    componentDidMount() {
        window.addEventListener('beforeunload', function () {
        });
        this._isMounted = true;
        if (!this.jwtRefreshBlocked && this.authService.loggedIn()) {
            this.jwtRefreshBlocked = true;
            this.authService
                .refresh()
                .then(() => {
                    this.jwtRefreshBlocked = false;
                })
                .catch(() => {
                    this.jwtRefreshBlocked = false;
                });
        }
        this.scrollToError = false;
        // eslint-disable-next-line no-undef
        $(window).off('beforeunload');
        // eslint-disable-next-line no-undef
        $(window).unbind();
    }

    componentDidUpdate() {
        this.refreshJwtToken();
        if (this.scrollToError) {
            this.scrollToError = false;
            this.scrollToFirstError();
        }
    }

    refreshJwtToken() {
        if (!this.jwtRefreshBlocked && this.authService.loggedIn() && this.authService.isTokenValidForRefresh()) {
            this.jwtRefreshBlocked = true;
            this.authService
                .refresh()
                .then(() => {
                    this.jwtRefreshBlocked = false;
                })
                .catch(() => {
                    this.jwtRefreshBlocked = false;
                });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showInfoMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = 'Informacja') {
        this.messages.show({
            severity: 'info',
            life: Constants.SUCCESS_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'info'} content={detail}></Message>
                </div>
            ),
        });
    }

    showWarningMessage(detail, life = Constants.ERROR_MSG_LIFE, summary = '') {
        this.messages.show({
            severity: 'warn',
            life: Constants.ERROR_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'warn'} content={detail}></Message>
                </div>
            ),
        });
    }

    showSuccessMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = '') {
        this.messages.show({
            severity: 'success',
            life: life,
            summary: summary,
            detail: detail,
        });
        this.unblockUi();
    }

    showResponseErrorMessage(errorResponse) {
        let title = "Błąd";
        let message = "";
        if (!!errorResponse.error) {
            message = errorResponse.error?.message;
        } else {
            message = 'Wystąpił nieoczekiwany błąd';
        }
        this.messages.show({
            severity: 'error',
            sticky: false,
            closable: true,
            life: Constants.ERROR_MSG_LIFE,
            summary: title,
            detail: message,
        });
        this.unblockUi();
    }

    showErrorMessage(errMsg, life = Constants.ERROR_MSG_LIFE, closable = true, summary = 'Błąd!') {
        this.messages.show({
            severity: 'error',
            sticky: false,
            life: life,
            summary: summary,
            detail: errMsg,
        });
        this.unblockUi();
    }

    showErrorMessages(err) {
        let message;
        let title;
        let messages = [];
        if (typeof err === 'string') {
            message = err;

        } else if (err) {
            message = err.Message;
            title = err.title;
            if (!message) {
                if (err.errors) {
                    const keys = Object.keys(err.errors);
                    keys.forEach((key, idx) => {
                        let item = key + ': ';

                        const values = err.errors[key];
                        if (values) {
                            if (Array.isArray(values)) {
                                values.forEach(v => {
                                    item += '' + v;
                                })
                            } else if (typeof values === 'string') {
                                item += values;
                            }
                        }
                        item += (idx === keys.length - 1) ? '' : '; ';
                        messages.push(item);
                    })
                }
            }
        }
        if (!message && messages.length === 0) {
            message = 'Wystąpił nieoczekiwany błąd';
        }
        if (messages.length === 0) {
            messages.push(message);
        }
        if (title) {
            title = `Błąd: ${title}`;
        } else {
            title = 'Błąd';
        }
        this.messages.clear();
        this.messages.show({
            severity: 'error',
            summary: title,
            content: (
                <React.Fragment>
                    <div class="p-flex p-flex-column" style={{flex: '1 1 0%'}}>
                        <span class="p-toast-message-icon pi"/>
                        <div className="p-toast-message-text">
                            <span className="p-toast-summary">{title}</span>
                            {messages.map(msg => {
                                return (
                                    <div className="p-toast-detail">{msg}</div>
                                )
                            })}
                        </div>
                    </div>
                </React.Fragment>

            ),
            life: Constants.ERROR_MSG_LIFE,
            closable: true,
        });
        this.unblockUi();
    }

    showMessage(severity, summary, detail, life = Constants.ERROR_MSG_LIFE, closable = true, errMsg) {
        if (this.messages !== undefined && this.messages !== null) {
            this.messages.clear();
            this.messages.show({
                severity,
                summary,
                detail,
                life,
                closable,
            });
        } else {
            if (errMsg !== undefined) {
                console.log('this.messages === undefined', errMsg);
            } else {
                console.log('this.messages === undefined');
            }
        }
    }

    scrollToFirstError() {
        if (this !== undefined && ReactDOM.findDOMNode(this) !== undefined && ReactDOM.findDOMNode(this) !== null) {
            const errors = ReactDOM.findDOMNode(this).getElementsByClassName('srv-validation-message');
            if (errors && errors.length > 0) {
                errors[0].parentNode.scrollIntoView();
            }
        } else {
            console.log('scrollToFirstError ', this, ReactDOM.findDOMNode(this));
        }
    }

    handleChangeSetState(varName, varValue, onAfterStateChange, stateField, parameter) {
        if (stateField && stateField !== '') {
            const stateFieldArray = stateField.split('.');
            let stateFieldValue = undefined;
            stateFieldValue = this.getValueInObjPath(stateFieldArray[0]);
            if (this._isMounted) {
                if (parameter) {
                    let varValueArray;
                    if (varValue instanceof Array) {
                        varValueArray = varValue.map((el) => el[parameter]);
                    } else {
                        varValueArray = varValue[parameter];
                    }
                    this.setValueInObjPath(stateFieldValue, varValue, `${varName}Obj`, stateFieldArray);
                    this.setValueInObjPath(stateFieldValue, varValueArray, varName, stateFieldArray);
                    this.setState(
                        {
                            [stateFieldArray[0]]: stateFieldValue,
                        },
                        () => (onAfterStateChange ? onAfterStateChange() : null)
                    );
                } else {
                    this.setValueInObjPath(stateFieldValue, varValue, varName, stateFieldArray);
                    this.setState(
                        {
                            [stateFieldArray[0]]: stateFieldValue,
                        },
                        () => (onAfterStateChange ? onAfterStateChange() : null)
                    );
                }
            } else {
                console.log("component isn't mounted");
            }
        } else {
            if (this._isMounted) {
                if (parameter) {
                    let varValueArray;
                    if (varValue instanceof Array) {
                        varValueArray = varValue.map((el) => el[parameter]);
                    } else {
                        varValueArray = varValue[parameter];
                    }
                    this.setState(
                        {
                            [varName]: varValueArray,
                            [`${varName}Obj`]: varValue,
                        },
                        () => (onAfterStateChange ? onAfterStateChange() : null)
                    );
                } else {
                    this.setState(
                        {
                            [varName]: varValue,
                        },
                        () => (onAfterStateChange ? onAfterStateChange() : null)
                    );
                }
            } else {
                console.log("component isn't mounted");
            }
        }
    }

    handleChange(inputType, parameters, event, onAfterStateChange, stateField) {
        console.log('handleChange', inputType, parameters, event, stateField);
        let stateFieldValue = undefined;
        if (stateField && stateField !== '') {
            ({[stateField]: stateFieldValue} = this.state);
            stateFieldValue = this.getValueInObjPath(stateField);
        }
        let varName;
        let varValue;
        let modifiedList;
        if (event !== undefined) {
            switch (inputType) {
                case 'YES_NO_DIALOG':
                    varName = event.name;
                    varValue = event.value;
                    this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    break;
                case 'MULTI_FILE_CHOOSE':
                    varName = parameters[1];
                    if (stateFieldValue) {
                        modifiedList = stateFieldValue[varName];
                    } else {
                        ({[varName]: modifiedList} = this.state);
                    }
                    if (parameters[0] === 'ADD') {
                        varValue = event;
                        if (!modifiedList) {
                            modifiedList = [varValue];
                        } else {
                            modifiedList = modifiedList.concat(varValue);
                        }
                    } else if (
                        modifiedList !== undefined &&
                        modifiedList.length >= parameters[2] - 1 &&
                        parameters[0] === 'REMOVE'
                    ) {
                        modifiedList.splice(parameters[2], 1);
                    }
                    this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    break;
                case 'SINGLE_FILE_CHOOSE':
                    varName = parameters[1];
                    if (parameters[0] === 'ADD') {
                        varValue = event[0];
                    } else if (parameters[0] === 'REMOVE') {
                        varValue = undefined;
                    }
                    this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    break;
                case 'MULTI_FILE_UPLOAD':
                    varName = parameters[1];
                    if (stateFieldValue) {
                        modifiedList = stateFieldValue[varName];
                    } else {
                        ({[varName]: modifiedList} = this.state);
                    }
                    if (parameters[0] === 'ADD') {
                        varValue = JSON.parse(event.xhr.response);
                        if (!modifiedList) {
                            modifiedList = [varValue];
                        } else {
                            modifiedList = modifiedList.concat(varValue);
                        }
                    } else if (
                        modifiedList !== undefined &&
                        modifiedList.length >= parameters[2] - 1 &&
                        parameters[0] === 'REMOVE'
                    ) {
                        modifiedList.splice(parameters[2], 1);
                    }
                    this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    break;
                case 'SINGLE_FILE_UPLOAD':
                    varName = parameters[1];
                    if (parameters[0] === 'ADD') {
                        varValue = JSON.parse(event.xhr.response)[0];
                    } else if (parameters[0] === 'REMOVE') {
                        varValue = undefined;
                    }
                    this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    break;
                case 'MULTI_DROPDOWN':
                    varName = event.target.name;
                    varValue = event.target.value ? event.target.value : undefined;
                    if (stateFieldValue) {
                        modifiedList = stateFieldValue[varName];
                    } else {
                        ({[varName]: modifiedList} = this.state);
                    }
                    if (!modifiedList) {
                        modifiedList = [];
                    }
                    modifiedList[parameters[0]] = varValue;
                    this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    break;
                case 'MULTI_CHECKBOX':
                    varName = event.target.name;
                    varValue = event.checked ? event.checked : false;
                    if (stateFieldValue) {
                        modifiedList = stateFieldValue[varName];
                    } else {
                        ({[varName]: modifiedList} = this.state);
                    }
                    if (!modifiedList) {
                        modifiedList = [];
                    }
                    if (varValue) {
                        if (!modifiedList) {
                            modifiedList = [parameters[1]];
                        } else {
                            modifiedList = [...modifiedList, parameters[1]];
                        }
                    } else {
                        modifiedList = modifiedList.filter((v) => {
                            return v[parameters[0]] !== parameters[1][parameters[0]] ? v : null;
                        });
                    }
                    this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    break;
                case 'CHECKBOX':
                    varName = event.target.name;
                    varValue = event.checked ? event.checked : false;
                    this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    break;
                case 'TEXT_EDITOR':
                    varName = parameters[0];
                    varValue = event;
                    this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    break;
                case 'EDITABLE_DATA_TABLE':
                    varName = event.name;
                    varValue = event.value;
                    if (stateFieldValue) {
                        modifiedList = stateFieldValue[varName];
                    } else {
                        ({[varName]: modifiedList} = this.state);
                    }
                    if (parameters[0] === 'ADD') {
                        if (!modifiedList) {
                            if (parameters.length >= 2) {
                                varValue.page = parameters[1];
                            }
                            modifiedList = [varValue];
                        } else {
                            if (parameters.length >= 2) {
                                varValue.page = parameters[1];
                            }
                            modifiedList = [...modifiedList, varValue];
                        }
                        this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    } else if (parameters[0] === 'EDIT') {
                        const rowData = parameters[1];
                        const dataKey = parameters[2];
                        const eventObj = {};
                        eventObj.target = {};
                        if (parameters[3] === 'MULTI_FILE_UPLOAD' || parameters[3] === 'SINGLE_FILE_UPLOAD') {
                            eventObj.name = parameters[4][1];
                            eventObj.target.name = parameters[4][1];
                        } else if (parameters[3] === 'NUMBER') {
                            let numberValue = isNaN(parseFloat(parameters[5].value))
                                ? 0
                                : parseFloat(parameters[5].value);
                            eventObj.name = parameters[5].name;
                            eventObj.value = numberValue;
                            eventObj.target.name = parameters[5].name;
                            eventObj.target.value = numberValue;
                        } else {
                            eventObj.name = parameters[5].name;
                            eventObj.value = parameters[5].value;
                            eventObj.target.name = parameters[5].target.name;
                            eventObj.target.value = parameters[5].target.value;
                        }
                        let index = -1;
                        if (modifiedList !== undefined) {
                            modifiedList.forEach((el, i) => {
                                if (el[dataKey] === rowData[dataKey]) {
                                    index = i;
                                }
                            });
                            let computedStateField = '';
                            if (!!stateField && stateField !== '') {
                                computedStateField = `${stateField}.${event.name}[${index}]`;
                            } else {
                                computedStateField = `${event.name}[${index}]`;
                            }
                            if (parameters.length >= 7) {
                                modifiedList[index].page = parameters[6];
                                this.handleChangeSetState(
                                    varName,
                                    modifiedList,
                                    () => {
                                        this.handleChange(
                                            parameters[3],
                                            parameters[4] !== undefined && parameters[4].length > 0
                                                ? parameters[4]
                                                : undefined,
                                            eventObj,
                                            onAfterStateChange,
                                            computedStateField
                                        );
                                    },
                                    stateField
                                );
                            } else {
                                this.handleChange(
                                    parameters[3],
                                    parameters[4],
                                    parameters[5],
                                    onAfterStateChange,
                                    computedStateField
                                );
                            }
                        }
                    } else if (parameters[0] === 'EDIT_DB') {
                        let computetdStateField = stateField;
                        if (computetdStateField !== '') {
                            computetdStateField = `${computetdStateField}.`;
                        }
                        computetdStateField = `${computetdStateField}${event.name}`;
                        stateFieldValue = this.getValueInObjPath(computetdStateField);
                        const rowData = parameters[1];
                        const dataKey = parameters[2];
                        const eve = parameters[5];
                        const modifiedMap = stateFieldValue;
                        const object = rowData;
                        object[eve.target.name] =
                            eve.target.value || eve.target.value === '' ? eve.target.value : undefined;
                        // object.deleted = deleted ? true : undefined;
                        if (parameters.length >= 7) {
                            object.page = parameters[6];
                        }
                        modifiedMap.set(rowData[dataKey], object);
                        if (modifiedMap !== undefined) {
                            this.handleChangeSetState(event.name, modifiedMap, onAfterStateChange, stateField);
                        }
                    } else if (parameters[0] === 'REMOVE_DB') {
                        let computetdStateField = stateField;
                        if (computetdStateField !== '') {
                            computetdStateField = `${computetdStateField}.`;
                        }
                        computetdStateField = `${computetdStateField}${event.name}`;
                        stateFieldValue = this.getValueInObjPath(computetdStateField);
                        const rowData = parameters[1];
                        const dataKey = parameters[2];
                        const deleted = parameters[3];
                        const modifiedMap = stateFieldValue;
                        const object = rowData;
                        object.deleted = deleted ? true : undefined;
                        modifiedMap.set(rowData[dataKey], object);
                        if (modifiedMap !== undefined) {
                            this.handleChangeSetState(event.name, modifiedMap, onAfterStateChange, stateField);
                        }
                    } else if (parameters[0] === 'REMOVE') {
                        const rowData = parameters[1];
                        const dataKey = parameters[2];
                        const deleted = parameters[3];
                        const permanent = parameters[4];
                        let index = -1;
                        modifiedList.forEach((el, i) => {
                            if (el[dataKey] === rowData[dataKey]) {
                                index = i;
                            }
                        });
                        if (permanent) {
                            if (modifiedList !== undefined && modifiedList.length >= index - 1) {
                                modifiedList.splice(index, 1);
                            }
                        } else {
                            modifiedList[index][deleted] = deleted ? true : undefined;
                        }
                        this.handleChangeSetState(varName, modifiedList, onAfterStateChange, stateField);
                    }
                    break;
                case 'XML':
                    varName = event.name;
                    const errorName = event.errorName;
                    varValue = event !== undefined ? event.lastValidXml : undefined;
                    const error = event !== undefined ? event.error : undefined;
                    if (error === undefined || error === null) {
                        this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField);
                    }
                    this.handleChangeSetState(errorName, error, undefined, stateField);
                    break;
                case 'AUTOCOMPLETE_FORCE':
                    if (event !== undefined) {
                        varName = parameters[0];
                        varValue = event.value || event.value === '' ? event.value : undefined;
                        if (varValue !== undefined && varValue.value !== undefined) {
                            varValue = varValue.value;
                        }
                        this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField, undefined);
                    }
                    break;
                case 'AUTOCOMPLETE':
                    if (event !== undefined) {
                        varName = event.target.name;
                        varValue = event.target.value || event.target.value === '' ? event.target.value : undefined;
                        if (varValue !== undefined && varValue.value !== undefined) {
                            varValue = varValue.value;
                        }
                        this.handleChangeSetState(varName, varValue, onAfterStateChange, stateField, undefined);
                    }
                    break;
                case 'NUMBER':
                    varName = event.name;
                    varValue = isNaN(parseFloat(event.value)) ? 0 : parseFloat(event.value);
                    this.handleChangeSetState(
                        varName,
                        varValue,
                        onAfterStateChange,
                        stateField,
                        parameters ? parameters[0] : undefined
                    );
                    break;
                case 'MULTI_SELECT_BUTTON':
                case 'DROPDOWN':
                case 'SELECT_BUTTON':
                case 'MULTI_SELECT':
                case 'CALENDAR_FROM':
                case 'CALENDAR':
                case 'TEXTAREA':
                case 'TEXT':
                case 'RADIOBUTTON':
                default:
                    varName = event.target.name;
                    varValue = event.target.value || event.target.value === '' ? event.target.value : undefined;
                    this.handleChangeSetState(
                        varName,
                        varValue,
                        onAfterStateChange,
                        stateField,
                        parameters ? parameters[0] : undefined
                    );
                    break;
            }
        } else {
            console.log('handleChange implementation error');
        }
    }

    handleValidForm() {
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.blockUi(this.handleValidForm);
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.forceUpdate();
        }
    }

    renderFooter() {
        const footerItems = this.prepareFooterItems();
        if (footerItems !== undefined && footerItems.length > 0) {
            return this.prepareFooter(footerItems);
        } else {
            return null;
        }
    }

    prepareFooterItems() {
        return [];
    }

    prepareFooter(items) {
        const leftItems = [];
        const rightItems = [];
        if (items !== undefined && items.length > 0) {
            items.forEach((item) => {
                if (item.className !== undefined && item.className.includes('float-right')) {
                    item.className = item.className.replace('float-right', '');
                    rightItems.push(item);
                } else {
                    leftItems.push(item);
                }
            });
        }
        return (
            <DivContainer colClass='p-card-header-minheight'>
                {leftItems && leftItems.length > 0
                    ? leftItems.map((item, index) =>
                        item.customRenderFunction instanceof Function
                            ? item.customRenderFunction()
                            : this.renderItem(item, index)
                    )
                    : null}
                <DivContainer colClass='float-right'>
                    {rightItems && rightItems.length > 0
                        ? rightItems.map((item, index) =>
                            item.customRenderFunction instanceof Function
                                ? item.customRenderFunction()
                                : this.renderItem(item, index)
                        )
                        : null}
                </DivContainer>
            </DivContainer>
        );
    }

    prepareHeaderItems() {
        return [];
    }

    renderHeader() {
        const headerItems = this.prepareHeaderItems();
        if (headerItems !== undefined && headerItems.length > 0) {
            return this.prepareHeader(headerItems);
        } else {
            return null;
        }
    }

    renderItem(item, index) {
        if (item.type === 'LABEL') {
            return (
                <h2 className={`pageheader-title ${item.className}`} key={item.label + index}>
                    {item.label}
                </h2>
            );
        } else if (item.type === 'LINK') {
            return (
                <ActionLink
                    label={item.label}
                    className={`${item.className} header-item`}
                    // eslint-disable-next-line react/jsx-handler-names
                    handleClick={item.onClick instanceof Function ? item.onClick : undefined}
                    href={item.href}
                    rendered={item.rendered}
                    disabled={item.disabled}
                    iconColor={item.iconColor}
                    iconName={item.iconName}
                    iconSize={item.iconSize}
                    iconSide={item.iconSide}
                    variant={item.variant}
                    size={item.size}
                    key={item.label + index}
                />
            );
        } else if (item.type === 'SUBMIT') {
            return (
                <button
                    value={item.label}
                    // eslint-disable-next-line max-len
                    className={`p-button p-component p-button-text-only header-item ${item.className} ${item.variant} ${item.size}`}
                    type='submit'
                    rendered={item.rendered}
                    disabled={item.disabled}
                    key={item.label + index}
                >
                    <span className='p-button-text p-c'>{item.label}</span>
                </button>
            );
        } else {
            return (
                <ActionButton
                    label={item.label}
                    className={`${item.className} header-item`}
                    // eslint-disable-next-line react/jsx-handler-names
                    handleClick={item.onClick instanceof Function ? item.onClick : undefined}
                    href={item.href}
                    rendered={item.rendered}
                    disabled={item.disabled}
                    iconColor={item.iconColor}
                    iconName={item.iconName}
                    iconSize={item.iconSize}
                    iconSide={item.iconSide}
                    variant={item.variant}
                    size={item.size}
                    key={item.label + index}
                />
            );
        }
    }

    prepareHeader(items) {
        const leftItems = [];
        const rightItems = [];
        if (items !== undefined && items.length > 0) {
            items.forEach((item) => {
                if (item.className !== undefined && item.className.includes('float-right')) {
                    item.className = item.className.replace('float-right', '');
                    rightItems.push(item);
                } else {
                    leftItems.push(item);
                }
            });
        }
        return (
            <DivContainer colClass='p-card-header-minheight'>
                <DivContainer colClass='col-12'>
                    <DivContainer colClass='row'>
                        <DivContainer colClass='col-12'>
                            {leftItems && leftItems.length > 0
                                ? leftItems.map((item, index) =>
                                    item.customRenderFunction instanceof Function
                                        ? item.customRenderFunction()
                                        : this.renderItem(item, index)
                                )
                                : null}
                        </DivContainer>
                        <DivContainer colClass='col-12'>
                            <DivContainer colClass='float-right'>
                                {rightItems && rightItems.length > 0
                                    ? rightItems.map((item, index) =>
                                        item.customRenderFunction instanceof Function
                                            ? item.customRenderFunction()
                                            : this.renderItem(item, index)
                                    )
                                    : null}
                            </DivContainer>
                        </DivContainer>
                    </DivContainer>
                </DivContainer>
            </DivContainer>
        );
    }

    renderSeparator(pt) {
        return (
            <div className={`row ${pt}`}>
                <div className='col'>
                    <div className='ade-border-bottom ade-separator'/>
                </div>
            </div>
        );
    }

    setWaitPanelLabel(waitPanelLabel, callBack) {
        this.setState({waitPanelLabel}, () =>
            callBack !== undefined && callBack instanceof Function ? callBack() : null
        );
    }

    blockUi(callBack, waitPanelLabel) {
        if (waitPanelLabel !== undefined) {
            this.setState(
                {
                    blocking: true,
                    waitPanelLabel,
                },
                () => (callBack !== undefined && callBack instanceof Function ? callBack() : null)
            );
        } else {
            this.setState({blocking: true}, () =>
                callBack !== undefined && callBack instanceof Function ? callBack() : null
            );
        }
    }

    unblockUi(callBack) {
        this.setState({blocking: false}, () =>
            callBack !== undefined && callBack instanceof Function ? callBack() : null
        );
    }

    loader() {
        const {waitPanelLabel} = this.state;
        let label = 'Operacja w toku, proszę czekać.';
        if (waitPanelLabel !== undefined && waitPanelLabel !== null) {
            label = waitPanelLabel;
        }
        return (
            <div id='cover-spin-container'>
                <div id='cover-spin'/>
                <div id='cover-spin-text'>
                    <p>{label}</p>
                </div>
            </div>
        );
    }

    getViewInfoName() {
        return '';
    }

    renderContent() {
        return <React.Fragment></React.Fragment>;
    }

    renderHeaderRight() {
        return <React.Fragment></React.Fragment>;
    }

    renderHeaderLeft() {
        return <React.Fragment></React.Fragment>;
    }

    renderHeaderContent() {
        return <React.Fragment></React.Fragment>;
    }

    renderHeadPanel() {
        return <React.Fragment></React.Fragment>;
    }

    renderGlobalTop() {
        return <React.Fragment></React.Fragment>
    }

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)}/>
                <BlockUi tag='div' className='block-ui-div' blocking={this.state.blocking || this.state.loading}
                         loader={this.loader}>
                    {this.renderGlobalTop()}
                    <DivContainer colClass='base-container-div'>
                        <DivContainer colClass='row base-container-header'>
                            <DivContainer id='header-left' colClass='col-11'>
                                <div className='font-medium mb-4'>{this.getViewInfoName()}</div>
                                {this.state.loading === false ? this.renderHeaderLeft() : null}
                            </DivContainer>
                            <DivContainer id='header-right' colClass='col-1 to-right'>
                                {this.state.loading === false ? this.renderHeaderRight() : null}
                            </DivContainer>
                            <DivContainer id='header-content' colClass='col-12'>
                                {this.state.loading === false ? this.renderHeaderContent() : null}
                            </DivContainer>
                        </DivContainer>
                        <DivContainer colClass='row base-container-head-panel'>
                            <DivContainer id='header-panel' colClass='col-12'>
                                {this.state.loading === false ? this.renderHeadPanel() : null}
                            </DivContainer>
                        </DivContainer>
                        <DivContainer colClass='row base-container-content'>
                            <DivContainer id='content' colClass='col-12'>
                                {this.state.loading === false ? this.renderContent() : null}
                            </DivContainer>
                        </DivContainer>
                    </DivContainer>
                </BlockUi>
            </React.Fragment>
        );
    }

    handleGetDetailsError(err) {
        this.showErrorMessages(err);
        if (this.props.backUrl) {
            window.location.href = AppPrefixUtils.locationHrefUrl(this.props.backUrl);
        } else {
            this.setState({loading: false}, () => this.unblockUi());
        }
    }

    handleEditRowSave(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
        const saveElement = this.editService.createObjectToSave(this.state);
        console.log(`handleEditRowSave: element to save = ${JSON.stringify(saveElement)}`)
        this.rowSave(viewId, recordId, parentId, saveElement, false);
    }

    rowSave = (viewId, recordId, parentId, saveElement, confirmSave) => {
        this.blockUi();
        this.editService
            .save(viewId, recordId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                switch (saveResponse.status) {
                    case 'OK':
                        if (!!saveResponse.message) {
                            confirmDialog({
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => this.setState({visibleEditPanel: false})
                            })
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        } else {
                            this.setState({visibleEditPanel: false});
                        }
                        break;
                    case 'NOK':
                        if (!!saveResponse.question) {
                            confirmDialog({
                                message: saveResponse?.question?.text,
                                header: saveResponse?.question?.title,
                                icon: 'pi pi-question-circle',
                                acceptLabel: localeOptions('accept'),
                                rejectLabel: localeOptions('reject'),
                                accept: () => this.rowSave(viewId, recordId, parentId, saveElement, true),
                                reject: () => undefined,
                            })
                        } else if (!!saveResponse.message) {
                            confirmDialog({
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => undefined
                            })
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        }
                        break;
                    default:
                        if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        } else {
                            this.showErrorMessages(saveResponse);
                        }
                        break;
                }
                this.unblockUi();
            }).catch((err) => {
            if (!!err.error) {
                this.showResponseErrorMessage(err);
            } else {
                this.showErrorMessages(err);
            }
        });
    }

    handleAutoFillRowChange(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
        this.blockUi();
        const autofillBodyRequest = this.editService.createObjectToAutoFill(this.state);
        this.editService
            .getEditAutoFill(viewId, recordId, parentId, autofillBodyRequest)
            .then((editAutoFillResponse) => {
                let arrayTmp = editAutoFillResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndAutoFill(editData, element.fieldName, element.value);
                })
                this.setState({editData: editData});
                this.unblockUi();
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    handleCancelRowChange(viewId, recordId, parentId) {
        console.log(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`)
    }

    handleEditRowChange(inputType, event, groupName, viewInfo, forceRefreshFieldVisibility = false) {
        console.log(`handleEditRowChange inputType=${inputType} groupName=${groupName}`);
        console.log(event)
        let editData = this.state.editData;
        let groupData = editData.editFields.filter((obj) => {
            return obj.groupName === groupName;
        });
        let varName;
        let varValue;
        let startRefreshFieldVisibility = true;
        console.clear();
        console.log(event)
        if (event !== undefined) {
            switch (inputType) {
                case 'IMAGE64':
                    varName = event == null ? null : event.fieldName;
                    varValue = event == null ? '' : event.base64[0];
                    break;
                case 'MULTI_IMAGE64':
                    varName = event == null ? null : event.fieldName;
                    varValue = event == null ? '' : event.base64;
                    break;
                case 'CHECKBOX':
                    varName = event.target.name;
                    varValue = event.checked ? event.checked : false;
                    break;
                case 'EDITOR':
                    varName = event.name;
                    varValue = event.value || event.value === '' ? event.value : undefined;
                    startRefreshFieldVisibility = false;
                    break;
                case 'TEXT':
                case 'AREA':
                    varName = event.target?.name;
                    varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                    startRefreshFieldVisibility = false;
                    break;
                default:
                    varName = event.target?.name;
                    varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                    break;
            }
            console.log('handleEditRowChange - ', inputType, varName, varValue);
            let field = groupData[0]?.fields.filter((obj) => {
                return obj.fieldName === varName;
            });
            if (!!field && !!field[0]) {
                field[0].value = varValue;
            }
            if (!!field[0]
                && !!field[0]?.selectionList
                && (startRefreshFieldVisibility || forceRefreshFieldVisibility)) {
                this.refreshFieldVisibility(viewInfo);
            }
            this.setState({editData: editData, modifyEditData: true});
        } else {
            console.log('handleEditRowChange implementation error');
        }
    }

    handleEditRowBlur(inputType, event, groupName, viewInfo) {
        console.log(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        if (inputType === 'EDITOR') {
            this.refreshFieldVisibility(viewInfo);
        } else {
            this.handleEditRowChange(inputType, event, groupName, viewInfo, true);
        }
    }

    refreshFieldVisibility(viewInfo) {
        const refreshObject = this.editService.createObjectToRefresh(this.state)
        this.editService
            .refreshFieldVisibility(viewInfo.viewId, viewInfo.recordId, viewInfo.parentId, refreshObject)
            .then((editRefreshResponse) => {
                let arrayTmp = editRefreshResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndRefreshVisibility(editData, element.fieldName, element.hidden);
                })
                this.setState({editData: editData});
                this.unblockUi();
            })
            .catch((err) => { //zjadam
            });
    }

    handleShowEditPanel(editDataResponse) {
        this.setState({
            visibleEditPanel: true,
            modifyEditData: false,
            editData: editDataResponse
        });
        this.unblockUi();
    }
}

BaseContainer.defaultProps = {
    viewMode: 'VIEW',
};

BaseContainer.propTypes = {
    viewMode: PropTypes.string,
};

export default BaseContainer;

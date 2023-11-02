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
import AppPrefixUtils from '../utils/AppPrefixUtils';
import {confirmDialog} from 'primereact/confirmdialog';
import {localeOptions} from 'primereact/api';
import EditRowUtils from '../utils/EditRowUtils';
import ConsoleHelper from '../utils/ConsoleHelper';
import {LoadIndicator} from 'devextreme-react';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {EntryResponseUtils} from '../utils/EntryResponseUtils';
import CrudService from '../services/CrudService';
import UrlUtils from '../utils/UrlUtils';
import {readObjFromCookieGlobal, readValueCookieGlobal, removeCookieGlobal} from '../utils/Cookie';
import DataPluginStore from '../containers/dao/DataPluginStore';
import LocalizationService from '../services/LocalizationService';
import DataHistoryLogStore from '../containers/dao/DataHistoryLogStore';

class BaseContainer extends React.Component {
    constructor(props, service) {
        super(props);
        this.refDataGrid = null;
        this.service = service;
        this.authService = new AuthService(this.props.backendUrl);
        this.crudService = new CrudService();
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
        this.executePlugin = this.executePlugin.bind(this);
        this.showErrorMessages = this.showErrorMessages.bind(this);
        this.handleGetDetailsError = this.handleGetDetailsError.bind(this);
        this.renderGlobalTop = this.renderGlobalTop.bind(this);
        this.handleEditRowChange = this.handleEditRowChange.bind(this);
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleEditRowSave = this.handleEditRowSave.bind(this);
        this.handleEditRowBlur = this.handleEditRowBlur.bind(this);
        this.handleAutoFillRowChange = this.handleAutoFillRowChange.bind(this);
        this.handleRightHeadPanelContent = this.handleRightHeadPanelContent.bind(this);
        this.handleCancelRowChange = this.handleCancelRowChange.bind(this);
        this.handleEditListRowChange = this.handleEditListRowChange.bind(this);
        this.getRealViewId = this.getRealViewId.bind(this);
        this.unselectAllDataGrid = this.unselectAllDataGrid.bind(this);
        this.setVariableFromEvent = this.setVariableFromEvent.bind(this);
        this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
        this.getConfigUrl = this.getConfigUrl.bind(this);
        this.refreshSubView = this.refreshSubView.bind(this);
        this.prepareCalculateFormula = this.prepareCalculateFormula.bind(this);
        this.validator = new SimpleReactValidator();
        this.localizationService = new LocalizationService();
        this._isMounted = false;
        this.jwtRefreshBlocked = false;
        this.scrollToError = false;
    }

    getMessages() {}

    componentDidMount() {
        window.addEventListener('beforeunload', function () {});
        this._isMounted = true;
        if (!this.jwtRefreshBlocked && this.authService.loggedIn()) {
            if (this.authService.isTokenExpiredDate()) {
                this.jwtRefreshBlocked = true;
                this.authService
                    .refresh()
                    .then(() => {
                        this.jwtRefreshBlocked = false;
                    })
                    .catch((err) => {
                        this.jwtRefreshBlocked = false;
                    });
            }
        }
        this.scrollToError = false;
        // eslint-disable-next-line no-undef
        $(window).off('beforeunload');
        // eslint-disable-next-line no-undef
        $(window).unbind();
    }

    getTranslationParam(language, param) {
        let frameworkType = 'rd'.toLowerCase();
        let lang = language.toLowerCase();
        return this.fetch(`${readObjFromCookieGlobal('CONFIG_URL')}/lang/${frameworkType}_translations_${lang}.json`, {
            method: 'GET',
        })
            .then((arr) => {
                return Promise.resolve(arr.labels.find((el) => el.code.toLowerCase() === param.toLowerCase()));
            })
            .catch((err) => {
                throw err;
            });
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
                .catch((err) => {
                    this.jwtRefreshBlocked = false;
                });
        }
    }

    handleLogoutUser() {
        this.authService.logout();
        window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showInfoMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = 'Informacja') {
        this.getMessages()?.show({
            severity: 'info',
            life: Constants.SUCCESS_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'info'} content={detail} />
                </div>
            ),
        });
    }

    showWarningMessage(detail, life = Constants.ERROR_MSG_LIFE, summary = '') {
        this.getMessages()?.show({
            severity: 'warn',
            life: Constants.ERROR_MSG_LIFE,
            summary: summary,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'warn'} content={detail} />
                </div>
            ),
        });
    }

    showSuccessMessage(detail, life = Constants.SUCCESS_MSG_LIFE, summary = '') {
        this.getMessages()?.show({
            severity: 'success',
            life: life,
            summary: summary,
            detail: detail,
        });
        this.unblockUi();
    }

    showResponseErrorMessage(errorResponse) {
        let title = 'Błąd';
        let message;
        if (!!errorResponse?.error) {
            message = errorResponse.error?.message;
        } else {
            message = 'Wystąpił nieoczekiwany błąd';
        }
        this.getMessages()?.show({
            severity: 'error',
            sticky: false,
            closable: true,
            life: Constants.ERROR_MSG_LIFE,
            summary: title,
            detail: message,
        });
        this.unblockUi();
    }

    showGlobalErrorMessage(err) {
        console.error(err);
        if (!!err.error) {
            this.showResponseErrorMessage(err);
        } else {
            this.showErrorMessages(err);
        }
    }

    showErrorMessage(errMsg, life = Constants.ERROR_MSG_LIFE, closable = true, summary = 'Błąd!') {
        this.getMessages()?.show({
            severity: 'error',
            sticky: false,
            life: life,
            summary: summary,
            detail: errMsg,
        });
        this.unblockUi();
    }

    getConfigUrl() {
        let browseUrl = window.location.href;
        const id = browseUrl.indexOf('/#');
        if (id > 0) {
            browseUrl = browseUrl.substring(0, id + 1);
        }
        let configUrl;
        const urlPrefixCookie = readObjFromCookieGlobal('REACT_APP_URL_PREFIX');
        if (urlPrefixCookie === undefined || urlPrefixCookie == null || urlPrefixCookie === '') {
            configUrl = browseUrl;
        } else {
            configUrl = browseUrl.trim().match('^(?:https?:)?(?:\\/\\/)?([^\\/\\?]+)', '')[0] + '/' + urlPrefixCookie;
        }

        return configUrl;
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
                                values.forEach((v) => {
                                    item += '' + v;
                                });
                            } else if (typeof values === 'string') {
                                item += values;
                            }
                        }
                        item += idx === keys.length - 1 ? '' : '; ';
                        messages.push(item);
                    });
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
        this.getMessages()?.clear();
        this.getMessages()?.show({
            severity: 'error',
            summary: title,
            content: (
                <React.Fragment>
                    <div className='p-flex p-flex-column' style={{flex: '1 1 0%'}}>
                        <span className='p-toast-message-icon pi' />
                        <div className='p-toast-message-text'>
                            <span className='p-toast-summary'>{title}</span>
                            {messages.map((msg) => {
                                return <div className='p-toast-detail'>{msg}</div>;
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
            this.getMessages()?.clear();
            this.getMessages()?.show({
                severity,
                summary,
                detail,
                life,
                closable,
            });
        } else {
            if (errMsg !== undefined) {
                ConsoleHelper('this.messages === undefined', errMsg);
            } else {
                ConsoleHelper('this.messages === undefined');
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
            ConsoleHelper('scrollToFirstError ', this, ReactDOM.findDOMNode(this));
        }
    }

    handleChangeSetState(varName, varValue, onAfterStateChange, stateField, parameter) {
        if (stateField && stateField !== '') {
            const stateFieldArray = stateField.split('.');
            let stateFieldValue;
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
                ConsoleHelper("component isn't mounted");
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
                ConsoleHelper("component isn't mounted");
            }
        }
    }

    handleChange(inputType, parameters, event, onAfterStateChange, stateField) {
        ConsoleHelper('handleChange', inputType, parameters, event, stateField);
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
                        modifiedList = modifiedList?.filter((v) => {
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
            ConsoleHelper('handleChange implementation error');
        }
    }

    handleValidForm() {}

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
            return item.rendered ? (
                <button
                    value={item.label}
                    // eslint-disable-next-line max-len
                    className={`p-button p-component p-button-text-only header-item ${item.className} ${item.variant} ${item.size}`}
                    type='submit'
                    disabled={item.disabled}
                    key={item.label + index}
                >
                    <span className='p-button-text p-c'>{item.label}</span>
                </button>
            ) : null;
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
                    <div className='ade-border-bottom ade-separator' />
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
                <LoadIndicator visible={true} height={40} width={40} />
                <div id='cover-spin-text'>
                    <p>{label}</p>
                </div>
            </div>
        );
    }

    renderContent() {
        return <React.Fragment />;
    }

    renderHeaderRight() {
        return <React.Fragment />;
    }

    renderHeaderLeft() {
        return <React.Fragment />;
    }

    renderHeaderContent() {
        return <React.Fragment />;
    }

    renderHeadPanel() {
        return <React.Fragment />;
    }

    renderGlobalTop() {
        return <React.Fragment />;
    }

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <BlockUi
                    tag='div'
                    className='block-ui-div'
                    blocking={this.state.blocking || this.state.loading}
                    loader={this.loader}
                    renderBlockUi={this.state.gridViewType !== 'dashboard'}
                >
                    {this.state.loading === false ? this.renderView() : null}
                </BlockUi>
            </React.Fragment>
        );
    }

    renderView() {
        return (
            <React.Fragment>
                {this.renderGlobalTop()}
                <DivContainer colClass='base-container-div'>
                    <DivContainer colClass='row base-container-header'>
                        <DivContainer id='header-left' colClass={''}>
                            {this.renderHeaderLeft()}
                        </DivContainer>
                        <DivContainer id='header-right' colClass={''}>
                            {this.renderHeaderRight()}
                        </DivContainer>
                        <DivContainer id='header-content' colClass='col-12'>
                            {this.renderHeaderContent()}
                        </DivContainer>
                    </DivContainer>
                    <DivContainer colClass='row base-container-head-panel'>
                        <DivContainer id='header-panel' colClass='col-12'>
                            {this.renderHeadPanel()}
                        </DivContainer>
                    </DivContainer>
                    <DivContainer colClass='row base-container-content'>
                        <DivContainer id='content' colClass='col-12'>
                            {this.renderContent()}
                        </DivContainer>
                    </DivContainer>
                </DivContainer>
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

    handleEditRowSave(viewId, recordId, parentId, token) {
        ConsoleHelper(`handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`);
        const saveElement = this.crudService.createObjectToSave(this.state);
        ConsoleHelper(`handleEditRowSave: element to save = ${JSON.stringify(saveElement)}`);
        this.rowSave(viewId, recordId, parentId, saveElement, false, token);
        if (!this.state?.copyData) {
            this.unselectAllDataGrid();
        }
    }

    refreshView() {
        if (this.isCardView()) {
            if (!!this.getRefCardGrid()) {
                this.getRefCardGrid().current?.refresh(true);
            }
        } else if (this.isGanttView()) {
            if (!!this.getRefGanttView()) {
                this.getRefGanttView().current.refresh();
            }
        } else if (this.isGridView()) {
            if (!!this.getRefGridView()) {
                if (window?.dataGrid) {
                    if (this.state?.gridViewType !== 'cardView') window.dataGrid.clearSelection();
                }
                this.getRefGridView().instance.getDataSource().reload();
            }
        } else if (this.isDashboard()) {
            this.getRefGridView()?.instance?.getDataSource()?.reload();
        }
    }

    windowNotHaveSubView() {
        return (
            this.isCardView() &&
            UrlUtils.getURLParameter('viewType') === 'cardView' &&
            !UrlUtils.getURLParameter('parentId') &&
            !UrlUtils.getURLParameter('recordId')
        );
    }
    refreshSubView(forceReStateSubView) {
        if (this.windowNotHaveSubView()) {
            this.unblockUi();
            return;
        }
        if (
            ((this.state.kindView === 'ViewSpec' || this.state.kindView === 'View') && this.state.subView) ||
            forceReStateSubView
        ) {
            console.log('refreshing subview: ', this.state.kindView);
            if (window?.dataGrid) {
                if (this.state?.gridViewType !== 'cardView') window.dataGrid.clearSelection();
            }
            const id = UrlUtils.getViewIdFromURL();
            this.downloadData(
                id,
                this.state.elementRecordId,
                this.state.elementSubViewId,
                this.state.elementFilterId,
                this.state.elementParentId,
                this.state.elementViewType,
                forceReStateSubView
            );
        } else {
            removeCookieGlobal('refreshSubView');
        }
    }

    reloadOnlyDataGrid() {
        if (this.isGridView()) {
            if (!!this.getRefGridView()) this.getRefGridView().instance.getDataSource().reload();
        }
    }

    repaintGridView() {
        if (!!this.getRefGridView()) {
            this.getRefGridView().instance.repaint();
        }
    }

    specSave = (viewId, parentId, saveElement, confirmSave, fncRedirect) => {
        this.blockUi();
        saveElement.forEach((array) => {
            array.forEach((el) => {
                if (el.fieldName === '_STATUS' && el.value === 'inserted') {
                    let ID = array.find((arr) => arr.fieldName === 'ID');
                    ID.value = null;
                }
            });
        });
        this.crudService
            .saveSpec(viewId, parentId, saveElement, confirmSave)
            .then((saveResponse) => {
                switch (saveResponse.status) {
                    case 'OK':
                        if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => {},
                            });
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        }
                        break;
                    case 'NOK':
                        if (!!saveResponse.question) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.question?.text,
                                header: saveResponse?.question?.title,
                                icon: 'pi pi-question-circle',
                                acceptLabel: localeOptions('accept'),
                                rejectLabel: localeOptions('reject'),
                                accept: () => this.specSave(viewId, parentId, saveElement, true),
                                reject: () => undefined,
                            });
                        } else if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => undefined,
                            });
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
                this.refreshView();
                if (UrlUtils.urlParamExsits('grid-view')) this.refreshSubView(true);
                this.unselectAllDataGrid();
                if (fncRedirect) {
                    fncRedirect();
                }
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
                this.unblockUi();
            });
    };

    rowSave = (viewId, recordId, parentId, saveElement, confirmSave, token) => {
        this.blockUi();
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        const kindOperation = this.state.editData.editInfo?.kindOperation
            ? this.state.editData.editInfo?.kindOperation
            : undefined;
        this.crudService
            .save(viewId, recordId, parentId, kindView, kindOperation, saveElement, confirmSave, token)
            .then((saveResponse) => {
                switch (saveResponse.status) {
                    case 'OK':
                        if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => {
                                    this.setState({visibleEditPanel: false});
                                },
                            });
                        } else if (!!saveResponse.error) {
                            this.showResponseErrorMessage(saveResponse);
                        } else {
                            this.setState({visibleEditPanel: false});
                        }
                        break;
                    case 'NOK':
                        if (!!saveResponse.question) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.question?.text,
                                header: saveResponse?.question?.title,
                                icon: 'pi pi-question-circle',
                                acceptLabel: localeOptions('accept'),
                                rejectLabel: localeOptions('reject'),
                                accept: () => this.rowSave(viewId, recordId, parentId, saveElement, true),
                                reject: () => undefined,
                            });
                        } else if (!!saveResponse.message) {
                            confirmDialog({
                                appendTo: document.body,
                                message: saveResponse?.message?.text,
                                header: saveResponse?.message?.title,
                                icon: 'pi pi-info-circle',
                                rejectClassName: 'hidden',
                                acceptLabel: 'OK',
                                rejectLabel: undefined,
                                accept: () => undefined,
                            });
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
                let refresh = true;
                if (kindOperation.toUpperCase() === 'COPY') {
                    if (saveResponse?.status !== 'NOK') {
                        this.copyAfterSave(saveResponse);
                    } else {
                        refresh = false;
                    }
                }
                if (this.state?.attachmentFiles?.length) {
                    this.uploadAttachemnt(this.state.parsedGridView, this.state.attachmentFiles[0]);
                }
                if (refresh && saveResponse.status !== 'NOK') {
                    let attachmentDialog = document.getElementById('attachmentDialog');
                    if (attachmentDialog) {
                        this.refreshView(saveElement);
                    } else {
                        if (readValueCookieGlobal('refreshSubView') && kindOperation.toUpperCase() !== 'COPY') {
                            this.refreshSubView();
                        } else {
                            this.refreshView(saveElement);
                        }
                    }
                }
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };
    copyAfterSave = (saveResponse) => {
        let {copyOptions, copyCounter} = this.state.copyData;
        let selectedRowKeys = this.state.selectedRowKeys;
        let currentSelectedRowKeyId = this.state.currentSelectedRowKeyId;
        if (copyOptions.numberOfCopy !== copyCounter.counter) {
            copyCounter.counter = copyCounter.counter + 1;
            if (copyOptions.copyLastModifiedObject) {
                selectedRowKeys = selectedRowKeys.filter((rowKey) => rowKey.ID !== currentSelectedRowKeyId);
                currentSelectedRowKeyId = saveResponse.recordId;
                this.setState({
                    currentSelectedRowKeyId: currentSelectedRowKeyId,
                });
            }
            this.copyEntry(currentSelectedRowKeyId);
        } else {
            selectedRowKeys = selectedRowKeys.filter((rowKey) => rowKey.ID !== currentSelectedRowKeyId);
            this.setState({
                currentSelectedRowKeyId: undefined,
                selectedRowKeys: selectedRowKeys,
            });
            if (selectedRowKeys.length !== 0 && !this.state.copyId) {
                copyCounter.counter = copyCounter.reInitializeCounter;
                this.copyEntry();
            } else {
                this.setState({
                    copyData: undefined,
                    copyId: undefined,
                });
                this.refreshView();
                this.unselectAllDataGrid();
                return;
            }
        }
        this.setState((prevState) => ({
            ...prevState,
            copyCounter: copyCounter,
            selectedRowKeys: selectedRowKeys,
        }));
    };

    rowCancel = (viewId, recordId, parentId, saveElement) => {
        this.blockUi();
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        const kindOperation = this.state.editData.editInfo?.kindOperation
            ? this.state.editData.editInfo?.kindOperation
            : undefined;
        this.crudService
            .cancel(viewId, recordId, parentId, kindView, kindOperation, saveElement)
            .then(() => {
                this.refreshView();
                this.unselectAllDataGrid();
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    };

    delete(id) {
        ConsoleHelper('handleDelete');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .deleteEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .delete(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((deleteResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    if (
                                        kindView !== undefined &&
                                        kindView !== null &&
                                        kindView.toUpperCase() === 'VIEWSPEC' &&
                                        UrlUtils.urlParamExsits('grid-view')
                                    ) {
                                        this.refreshSubView(true);
                                    }
                                    const msg = deleteResponse.message;
                                    if (!!msg) {
                                        this.showErrorMessage(msg.text, Constants.SUCCESS_MSG_LIFE, true, msg.title);
                                    } else if (!!deleteResponse.error) {
                                        this.showResponseErrorMessage(deleteResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    generate(id) {
        ConsoleHelper('handleGenerate');
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
        const listId = {listId: idRowKeys};
        this.crudService.getDocumentDatasInfo(viewId, id, listId, parentId).then((res) => {
            if (res.kind === 'GE') {
                if (res.info.next) {
                    if (res.message) {
                        this.showSuccessMessage(res.message.text, undefined, res.message.title);
                    } else {
                        this.executeDocument(null, viewId, id, parentId);
                    }
                }
            } else {
                if (res.inputDataFields?.length) {
                    let documentInfo = {
                        inputDataFields: res.inputDataFields,
                        info: res.info,
                    };
                    this.setState({
                        visibleDocumentPanel: true,
                        documentInfo: documentInfo,
                    });
                } else {
                    this.executeDocument(null, viewId, id, parentId);
                }
            }
        });
    }

    /** Metoda już typowo pod plugin. executePlugin wykonuje się w momencie przejscia z pierwszego do drugiego kroku*/
    // TODO: ogolnie to programsityczni slabo ze to jest w BaseContainer hmmm...
    isDashboardView() {
        return this.state.subView === null && this.state?.gridViewType === 'dashboard';
    }
    executePlugin(pluginId, requestBody, refreshAll) {
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.isDashboardView()
            ? this.state.elementRecordId
            : this.state.subView == null
            ? UrlUtils.getURLParameter('parentId')
            : this.state.elementRecordId;
        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        this.crudService
            .getPluginExecuteColumnsDefinitions(viewIdArg, pluginId, requestBody, parentIdArg)
            .then((res) => {
                let parsedPluginViewData;
                let renderNextStep = true;
                if (res.info.kind === 'GRID') {
                    visiblePluginPanel = true;
                    let datas = this.dataPluginStore.getPluginExecuteDataStore(
                        viewIdArg,
                        pluginId,
                        requestBody,
                        parentIdArg,
                        (err) => {
                            this.showErrorMessages(err);
                        },
                        () => {
                            this.setState({dataPluginStoreSuccess: true});
                        },
                        () => {
                            return {selectAll: this.state.selectAll};
                        }
                    );
                    parsedPluginViewData = datas;
                } else {
                    if (res.info.message === null && res.info.question == null) {
                        renderNextStep = false;
                    } else visibleMessagePluginPanel = true;
                }

                if (renderNextStep) {
                    this.setState({
                        pluginId: pluginId,
                        parsedPluginViewData: parsedPluginViewData,
                        parsedPluginView: res,
                        visiblePluginPanel: visiblePluginPanel,
                        visibleMessagePluginPanel: visibleMessagePluginPanel,
                        isPluginFirstStep: false,
                    });
                }
                if (res.viewOptions?.refreshAll) {
                    this.unselectAllDataGrid(false);
                    this.refreshView();
                }
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }
    plugin(id) {
        ConsoleHelper('handlePlugin');
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const idRowKeys = this.state.selectedRowKeys.map((el) => el.ID);
        const listId = {listId: idRowKeys};
        let visiblePluginPanel = false;
        let visibleMessagePluginPanel = false;
        this.crudService
            .getPluginColumnsDefnitions(viewId, id, listId, parentId)
            .then((res) => {
                let parsedPluginViewData;
                if (res.info.kind === 'GRID') {
                    visiblePluginPanel = true;
                    if (!this.dataPluginStore) {
                        this.dataPluginStore = new DataPluginStore();
                    }
                    let datas = this.dataPluginStore.getPluginDataStore(
                        viewId,
                        id,
                        listId,
                        parentId,
                        (err) => {
                            if (typeof this.showErrorMessage === 'undefined') {
                                this.props.showErrorMessage(err);
                            } else {
                                this.showErrorMessages(err);
                            }
                        },
                        () => {
                            this.setState({dataPluginStoreSuccess: true});
                        }
                    );
                    parsedPluginViewData = datas;
                } else {
                    visibleMessagePluginPanel = true;
                }
                this.setState({
                    parsedPluginView: res,
                    parsedPluginViewData: parsedPluginViewData,
                    visiblePluginPanel: visiblePluginPanel,
                    visibleMessagePluginPanel: visibleMessagePluginPanel,
                    isPluginFirstStep: true,
                    pluginId: id,
                });
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    historyLog(recordId) {
        ConsoleHelper('historyLog');
        const viewId = this.realViewSelector(recordId);
        const recordIsZero = recordId === 0 || recordId === '0';
        const parentId = recordIsZero ? recordId : this.state.elementRecordId;
        const kindView = recordIsZero ? 'view' : this.state.kindView;
        recordId = recordIsZero ? UrlUtils.getURLParameter('recordId') : recordId;
        let visibleHistoryLogPanel = false;
        this.crudService
            .getHistoryLogColumnsDefnitions(viewId, recordId, parentId, kindView)
            .then((res) => {
                let parsedHistoryLogViewData;
                if (res.info.kind === 'GRID') {
                    visibleHistoryLogPanel = true;
                    if (!this.historyLogStore) {
                        this.historyLogStore = new DataHistoryLogStore();
                    }
                    const datas = this.historyLogStore.getHistoryLogDataStore(
                        viewId,
                        recordId,
                        parentId,
                        kindView,
                        (err) => {
                            if (typeof this.showErrorMessage === 'undefined') {
                                this.props.showErrorMessage(err.error.message, 3000, true, err.error.code);
                            } else {
                                this.showErrorMessage(err.error.message, 3000, true, err.error.code);
                            }
                        },
                        () => {
                            this.setState({dataHistoryLogStoreSuccess: true});
                        }
                    );
                    parsedHistoryLogViewData = datas;
                }
                this.setState({
                    parsedHistoryLogView: res,
                    parsedHistoryLogViewData: parsedHistoryLogViewData,
                    visibleHistoryLogPanel: visibleHistoryLogPanel,
                });
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    handleRightHeadPanelContent(element) {
        const elementId = `${element?.id}`;
        switch (element.type) {
            case 'OP_PLUGINS':
            case 'SK_PLUGIN':
                this.plugin(elementId);
                break;
            case 'OP_ATTACHMENTS':
                this.attachment(elementId);
                break;
            case 'OP_DOCUMENTS':
            case 'SK_DOCUMENT':
                this.generate(elementId);
                break;
            case 'OP_PUBLISH':
            case 'SK_PUBLISH':
                this.publishEntry();
                break;
            case 'OP_HISTORY':
            case 'SK_HISTORY':
                this.historyLog(elementId);
                break;
            default:
                return null;
        }
    }

    getSelectedRowKeysIds(id) {
        return id === undefined || id === null || id === ''
            ? this.state.selectedRowKeys.map((e) => {
                  return e.ID === undefined ? e : e.ID;
              })
            : [id];
    }

    getParentValidNumber(gridView) {
        const recordId = UrlUtils.getURLParameter('recordId');
        if (recordId === undefined || recordId === null) {
            // is global
            if (gridView.viewInfo) {
                return gridView.viewInfo.parentId;
            }
            // is dashboard?
            else {
                return this.props.id;
            }
        } else {
            // is header
            let elementId = UrlUtils.getIdFromUrl();
            if (elementId === this.props.id) {
                return UrlUtils.getURLParameter('recordId');
            }
            // is grid in sub
            else {
                return this.props.recordId;
            }
        }
    }

    // gridView przekazywany dla załaczników
    uploadAttachemnt(gridView, attachmentFile) {
        ConsoleHelper('handleUploadAttachemnt');
        this.blockUi();
        const viewInfo = gridView.viewInfo;
        const viewId = viewInfo.id;
        let parentId = this.getParentValidNumber(gridView);
        const parentViewId = viewInfo.parentViewId;
        const isKindViewSpec = this.props.isKindViewSpec;
        this.crudService
            .uploadAttachemnt(viewId, parentId, parentViewId, attachmentFile, isKindViewSpec)
            .then((uploadResponse) => {
                EntryResponseUtils.run(
                    uploadResponse,
                    () => {
                        if (uploadResponse?.status === 'OK') {
                            this.crudService
                                .edit(viewId, uploadResponse.recordId, parentId, 'View')
                                .then((editDataResponse) => {
                                    const renderEditData = gridView.options.addFilesAddForm;
                                    if (renderEditData) {
                                        let attachmentFiles = this.state.attachmentFiles;
                                        attachmentFiles.shift();
                                        // editDataResponse.parentId = parentId;
                                        this.setState(
                                            {
                                                attachmentFiles: attachmentFiles,
                                                editData: editDataResponse,
                                            },
                                            () => {
                                                this.handleShowEditPanel(editDataResponse);
                                            }
                                        );
                                    } else {
                                        this.unblockUi();
                                    }
                                })
                                .catch((err) => {
                                    this.showErrorMessages(err);
                                });
                        } else {
                            if (!!uploadResponse.error) {
                                this.showResponseErrorMessage(uploadResponse);
                            } else if (!!uploadResponse.message) {
                                this.showErrorMessage(
                                    uploadResponse.message.text,
                                    3000,
                                    true,
                                    uploadResponse.message.title
                                );
                            } else {
                                this.showErrorMessages(uploadResponse);
                            }
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    downloadAttachment(id) {
        const viewId = this.getRealViewId();
        let recordId = this.getSelectedRowKeysIds(id);

        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }

        this.crudService
            .downloadAttachment(viewId, recordId)
            .then(() => {
                const selectedRowKeys = this.state.selectedRowKeys.filter((el) => el.ID !== recordId);
                if (selectedRowKeys.length !== 0) {
                    // rekurencyjnie
                    this.downloadAttachment(selectedRowKeys[0].ID);
                } else {
                    this.unselectAllDataGrid();
                }
                this.setState({
                    selectedRowKeys,
                });
            })
            .catch((err) => {
                this.showErrorMessages(err);
            });
    }

    copyEntry(id, callBack) {
        ConsoleHelper('handleEntryCopy');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeys = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .copyEntry(viewId, parentId, kindView, selectedRowKeys)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            const copyData = this.state.copyData;
                            let copyOptions = {copyOptions: copyData.copyOptions};
                            this.crudService
                                .copy(viewId, parentId, kindView, selectedRowKeys[0], copyOptions)
                                .then((copyResponse) => {
                                    const msg = copyResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!copyResponse.error) {
                                        this.showResponseErrorMessage(copyResponse);
                                    }
                                    this.setState(
                                        {
                                            visibleEditPanel: true,
                                            editData: copyResponse,
                                        },
                                        () => {
                                            if (callBack) {
                                                callBack(copyData);
                                            }
                                        }
                                    );
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                            this.setState({
                                currentSelectedRowKeyId: selectedRowKeys[0],
                            });
                            this.unblockUi();
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    restore(id) {
        ConsoleHelper('handleRestore');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .restoreEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .restore(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((restoreResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    const msg = restoreResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!restoreResponse.error) {
                                        this.showResponseErrorMessage(restoreResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    attachment(id, isAttachmentFromHeader) {
        ConsoleHelper('handleAttachment');
        this.blockUi();
        let viewId = isAttachmentFromHeader ? this.props.id : this.getRealViewId();
        let recordId = this.getSelectedRowKeysIds(id);
        if (Array.isArray(recordId)) {
            recordId = recordId[0];
        }
        let parentIdParam = '';
        if (!isAttachmentFromHeader) {
            const recordId = UrlUtils.getURLParameter('recordId');
            if (recordId !== undefined && recordId !== null) {
                parentIdParam = '?parentId=' + recordId;
            }
        }
        const isKindViewSpec =
            this.state.elementKindView === 'ViewSpec' &&
            this.state.kindView === 'ViewSpec' &&
            recordId !== '0' &&
            recordId !== 0;
        if (recordId === '0' || recordId === 0) {
            recordId = this.state.elementRecordId;
        }
        this.crudService
            .attachmentEntry(viewId, recordId, parentIdParam, isKindViewSpec)
            .then((attachmentResponse) => {
                EntryResponseUtils.run(
                    attachmentResponse,
                    () => {
                        if (!!attachmentResponse.next) {
                            this.unselectAllDataGrid();
                            this.setState({
                                attachmentViewInfo: {
                                    viewId,
                                    recordId,
                                    isKindViewSpec,
                                },
                            });
                            this.unblockUi();
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    prepareCalculateFormula(id) {
        ConsoleHelper('handlePrepareCalculateFormula');
        this.blockUi();

        const viewId = this.getRealViewId();
        const parentId = this.state.elementParentId;

        let datas = [];
        if (this.state?.elementViewType?.toUpperCase() !== 'CARDVIEW') {
            if (!!this.getRefGridView()) {
                datas = this.getRefGridView()?.instance?.getDataSource()?._items;
            }
            if (!this.state.gridViewType) {
                datas = this.state.parsedData;
            }
        }
        const fieldsToCalculate = this.createObjectToCalculate(datas);
        this.calculateFormula(viewId, parentId, id, fieldsToCalculate);
    }

    calculateFormula(viewId, parentId, id, fieldsToCalculate) {
        this.blockUi();
        ConsoleHelper('calculateFormula');
        const selectedRowKeys = this.state.selectedRowKeys;
        if (window.location.href.includes('edit-spec')) {
            this.calculateFormulaForEditSpec(viewId, parentId, id, fieldsToCalculate);
        } else if (this.state.elementKindView && this.state.elementKindView.toUpperCase() === 'VIEWSPEC') {
            parentId = UrlUtils.getURLParameter('recordId');
            let params = '';
            if (!!id) {
                params = `&specId=${id}`;
            } else {
                if (selectedRowKeys.length !== 0) {
                    selectedRowKeys.forEach((rowKey) => {
                        params = params + `&specId=${rowKey.ID}`;
                    });
                }
            }
            this.calculateFormulaForView(viewId, parentId, params);
        } else {
            let params = '';
            if (!!id) {
                params = `?recordId=${id}`;
            } else {
                if (selectedRowKeys.length !== 0) {
                    let first = true;
                    selectedRowKeys.forEach((rowKey) => {
                        if (first) {
                            first = false;
                            params = params + `?recordId=${rowKey.ID}`;
                        } else {
                            params = params + `&recordId=${rowKey.ID}`;
                        }
                    });
                }
            }
            this.calculateFormulaForView(viewId, parentId, params);
        }
    }
    changeWart(calcultedFormula, oldFormula) {
        if (parseInt(calcultedFormula[0].value) === parseInt(oldFormula.data.ID)) {
            oldFormula.data.WART = calcultedFormula[1].value;
        }
        oldFormula.children.forEach((child) => {
            this.changeWart(calcultedFormula, child);
        });
    }

    calculateFormulaForEditSpec(viewId, parentId, id, fieldsToCalculate) {
        this.crudService
            .calculateFormula(viewId, parentId, id, fieldsToCalculate)
            .then((res) => {
                res?.data?.forEach((calcultedFormula) => {
                    this.refTreeList.instance.getDataSource()._items.forEach((item) => {
                        this.changeWart(calcultedFormula, item);
                    });
                });

                const msg = res.message;
                if (!!msg) {
                    this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                } else if (!!res.error) {
                    this.showResponseErrorMessage(res);
                }
                if (this.refTreeList?.instance) {
                    this.refTreeList?.instance?.refresh();
                } else {
                    this.refreshView();
                }
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unselectAllDataGrid();
            });
    }

    calculateFormulaForView(viewId, parentId, params) {
        this.blockUi();
        this.crudService
            .calculateFormulaForView(viewId, parentId, params)
            .then((res) => {
                if (res.message) {
                    this.showSuccessMessage(res.message.text, 1000, res.message.title);
                } else {
                    this.showResponseErrorMessage(res);
                }

                this.refreshView();
                this.refreshSubView(true);
            })
            .finally(() => {
                this.unblockUi();
                this.unselectAllDataGrid();
            });
    }

    createObjectToCalculate(datas) {
        let data = [];
        let arrTemp = [];
        datas?.forEach((fields) => {
            arrTemp = [];
            Object.entries(fields).forEach((field) => {
                const elementTmp = {
                    fieldName: field[0],
                    value: field[1],
                };
                arrTemp.push(elementTmp);
            });
            data.push(arrTemp);
        });
        return {data: data};
    }

    archive(id) {
        ConsoleHelper('handleArchive');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .archiveEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .archive(viewId, parentId, kindView, selectedRowKeysIds)
                                .then((archiveResponse) => {
                                    this.unselectAllDataGrid();
                                    this.refreshView();
                                    const msg = archiveResponse.message;
                                    if (!!msg) {
                                        this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                                    } else if (!!archiveResponse.error) {
                                        this.showResponseErrorMessage(archiveResponse);
                                    }
                                    this.unblockUi();
                                })
                                .catch((err) => {
                                    this.showGlobalErrorMessage(err);
                                });
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    publish(id, body) {
        ConsoleHelper('publish');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        const publishOptions = {publishOptions: body};
        this.crudService
            .publish(viewId, parentId, kindView, selectedRowKeysIds, publishOptions)
            .then((publishResponse) => {
                let visiblePublishSummaryDialog = false;

                const msg = publishResponse.message;
                if (!!msg) {
                    this.showSuccessMessage(msg.text, Constants.SUCCESS_MSG_LIFE, msg.title);
                } else if (!!publishResponse.error) {
                    this.showResponseErrorMessage(publishResponse);
                }
                if (id && this.state.selectedRowKeys.length === 0) {
                    visiblePublishSummaryDialog = true;
                    this.refreshView();
                    this.unselectAllDataGrid();
                } else {
                    const currentSelectedRowKeyId = this.state.currentSelectedRowKeyId;
                    let selectedRowKeys = this.state.selectedRowKeys.filter((el) => el.ID !== currentSelectedRowKeyId);
                    this.setState({selectedRowKeys: selectedRowKeys});
                    if (selectedRowKeys.length === 0) {
                        visiblePublishSummaryDialog = true;
                        this.refreshView();
                        this.unselectAllDataGrid();
                    } else {
                        this.publishEntry(selectedRowKeys[0].ID);
                    }
                }
                let publishSummary = this.state.publishSummary;
                publishSummary.publishedIds.push(selectedRowKeysIds[0]);
                this.setState({
                    publishSummary,
                    visiblePublishSummaryDialog,
                });
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    publishEntry(id) {
        ConsoleHelper('publishEntry');
        this.blockUi();
        const viewId = this.getRealViewId();
        const parentId = this.state.elementRecordId;
        const selectedRowKeysIds = this.getSelectedRowKeysIds(id);
        const kindView = this.state.elementKindView;
        this.crudService
            .publishEntry(viewId, parentId, kindView, selectedRowKeysIds)
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            let isInitializePublish = this.state?.isInitializePublish;
                            if (this.state?.isInitializePublish === undefined) {
                                isInitializePublish = true;
                            }
                            if (this.state?.isInitializePublish) {
                                isInitializePublish = false;
                            }
                            if (isInitializePublish && id) {
                                this.unselectAllDataGrid();
                            }
                            if (entryResponse.publishOptions === null) {
                                this.publish(id, null);
                            } else {
                                this.setState({
                                    publishValues: entryResponse.publishValues,
                                    visiblePublishDialog: true,
                                    currentSelectedRowKeyId: id,
                                    isInitializePublish: isInitializePublish,
                                });
                                if (id && this.state.selectedRowKeys.length === 0) {
                                    this.unselectAllDataGrid();
                                }
                            }
                            if (id === undefined) {
                                this.setState({
                                    currentSelectedRowKeyId: selectedRowKeysIds[0],
                                });
                            }
                        } else {
                            this.unblockUi();
                        }
                    },
                    () => this.unblockUi()
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    unselectAllDataGrid() {
        this.refTreeList?.instance.deselectAll();
        this.setState({
            selectAll: false,
            select: false,
            selectedRowKeys: [],
        });
        this.unblockUi();
    }

    handleEditListRowChange(editInfo, editListData) {
        ConsoleHelper(`handleEditListRowChange = `, JSON.stringify(editListData));
        try {
            this.blockUi();
            let editData = this.state.editData;
            editListData.forEach((element) => {
                EditRowUtils.searchAndAutoFill(editData, element.fieldEdit, element.fieldValue);
            });
            this.setState({editData: editData, modifyEditData: true});
            if (editInfo?.field?.refreshFieldVisibility) {
                this.refreshFieldVisibility(editInfo);
            }
        } catch (err) {
            this.showErrorMessages(err);
        } finally {
            this.unblockUi();
        }
    }

    handleAutoFillRowChange(viewId, recordId, parentId, kindView) {
        ConsoleHelper(
            `handleEditRowSave: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId} parentId = ${kindView}`
        );
        this.blockUi();
        const autofillBodyRequest = this.crudService.createObjectToAutoFill(this.state);
        this.crudService
            .editAutoFill(viewId, recordId, parentId, kindView, autofillBodyRequest)
            .then((editAutoFillResponse) => {
                let arrayTmp = editAutoFillResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndAutoFill(editData, element.fieldName, element.value);
                });
                this.setState({editData: editData, modifyEditData: true});
                this.unblockUi();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            });
    }

    handleCancelRowChange(viewId, recordId, parentId) {
        ConsoleHelper(`handleCancelRowChange: viewId = ${viewId} recordId = ${recordId} parentId = ${parentId}`);
        const cancelElement = this.crudService.createObjectToSave(this.state);
        ConsoleHelper(`handleCancelRowChange: element to cancel = ${JSON.stringify(cancelElement)}`);
        this.rowCancel(viewId, recordId, parentId, cancelElement, false);
    }

    /** Dla gantta ID_PARENT nie moze byc '' */
    replaceEmptyValuesFromParent(editData) {
        editData?.editFields?.filter((obj) => {
            return obj.fields.filter((field) => {
                if (field.fieldName === 'ID_PARENT') {
                    field.value = field.value === '' ? null : field.value;
                }
                return field;
            });
        });
    }

    handleChangeCriteria(inputType, event) {
        ConsoleHelper(`handleChangeCriteria inputType=${inputType}`);
        let documentInfo = this.state.documentInfo;
        if (event) {
            let result = this.setVariableFromEvent(inputType, event);
            let varName = result.varName;
            let varValue = result.varValue;
            let fieldArr = documentInfo.inputDataFields.find(
                (field) => field.fieldName.toUpperCase() === varName.toUpperCase()
            );
            fieldArr.value = varValue;

            this.setState({documentdInfo: documentInfo, modifyEditData: true});
        }
    }
    // TUUUU
    handleEditRowChange(inputType, event, groupName, info) {
        ConsoleHelper(`handleEditRowChange inputType=${inputType} groupName=${groupName}`);
        let editData = this.state.editData;
        let groupData = editData?.editFields?.filter((obj) => {
            return obj.groupName === groupName;
        });
        if (event !== undefined) {
            let result = this.setVariableFromEvent(inputType, event);
            let varName = result.varName;
            let varValue = result.varValue;
            let refreshFieldVisibility = result.refreshFieldVisibility;

            let fieldArr = groupData[0]?.fields?.filter((obj) => {
                return obj.fieldName === varName;
            });
            let field = fieldArr[0];
            if (!!fieldArr && !!field) {
                field.value = varValue;
            }
            if (!!field && refreshFieldVisibility) {
                this.refreshFieldVisibility(info);
            }
            if (this.isGanttView()) {
                this.replaceEmptyValuesFromParent(editData);
            }
            this.setState({editData: editData, modifyEditData: true});
        } else {
            ConsoleHelper('handleEditRowChange implementation error');
        }
    }

    setVariableFromEvent(inputType, event) {
        let varName;
        let varValue;
        let refreshFieldVisibility = false;
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
                refreshFieldVisibility = event.refreshFieldVisibility;
                break;
            case 'EDITOR':
                varName = event.name;
                varValue = event.value || event.value === '' ? event.value : undefined;
                break;
            case 'TEXT':
            case 'AREA':
                varName = event.target?.name;
                varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                break;
            case 'DATE':
            case 'DATETIME':
            case 'TIME':
                varName = event.target?.name;
                varValue = event.value || event.value === '' ? event.value : undefined;
                break;
            default:
                varName = event.target?.name;
                varValue = event.target?.value || event.target?.value === '' ? event.target.value : undefined;
                break;
        }
        if (varValue === '') {
            varValue = null;
        }
        return {
            varName: varName,
            varValue: varValue,
            refreshFieldVisibility: refreshFieldVisibility,
        };
    }
    realViewSelector(recordId) {
        if (this.isViewSpecHeader(recordId) || this.isViewSpecBody(recordId)) {
            return this.getRealViewId();
        }
        if (this.isGridViewHeader(recordId)) {
            return this.props.id;
        }
        if (this.isGridViewBody(recordId)) {
            return this.getRealViewId();
        }
        return this.getRealViewId();
    }

    handleEditRowBlur(inputType, event, groupName, viewInfo, field) {
        ConsoleHelper(`handleEditRowBlur inputType=${inputType} groupName=${groupName}`);
        this.handleEditRowChange(inputType, event, groupName, viewInfo, field);
    }

    refreshFieldVisibility(info) {
        this.blockUi();
        const refreshObject = this.crudService.createObjectToRefresh(this.state);
        const kindView = this.state.elementKindView ? this.state.elementKindView : undefined;
        this.crudService
            .refreshFieldVisibility(info.viewId, info.recordId, info.parentId, kindView, refreshObject)
            .then((editRefreshResponse) => {
                let arrayTmp = editRefreshResponse?.data;
                let editData = this.state.editData;
                arrayTmp.forEach((element) => {
                    EditRowUtils.searchAndRefreshVisibility(editData, element.fieldName, element.hidden);
                });
                this.setState({editData: editData});
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    }

    handleShowEditPanel(editDataResponse) {
        this.setState({
            visibleEditPanel: true,
            modifyEditData: false,
            editData: editDataResponse,
        });
        this.unblockUi();
    }

    getRefGridView() {
        return !!this.refDataGrid ? this.refDataGrid : null;
    }
    getRefGanttView() {
        return !!this.ganttRef ? this.ganttRef : null;
    }

    getRefCardGrid() {
        return !!this.refCardGrid ? this.refCardGrid : null;
    }

    getRealViewId() {
        const {elementSubViewId} = this.state;
        const elementId = this.props.id;
        return DataGridUtils.getRealViewId(elementSubViewId, elementId);
    }

    isGridView() {
        return this.state.gridViewType === 'gridView';
    }

    isGanttView() {
        return this.state.gridViewType === 'gantt';
    }

    isTreeView() {
        return this.state.gridViewType === 'gridView' && this.state.kindView === 'ViewSpec';
    }

    isCardView() {
        return this.state.gridViewType === 'cardView';
    }

    isDashboard() {
        return this.state.gridViewType === 'dashboard';
    }

    isHeader(recordId) {
        return recordId === '0' || recordId === 0;
    }
    isBody(recordId) {
        return !(recordId === '0' || recordId === 0);
    }
    isChoosenKindView(kindViewSelected) {
        return this.state.kindView === kindViewSelected && this.state.elementKindView === kindViewSelected;
    }
    isViewSpecHeader(recordId) {
        return this.isHeader(recordId) && this.isChoosenKindView('ViewSpec');
    }
    isViewSpecBody(recordId) {
        return this.isBody(recordId) && this.isChoosenKindView('ViewSpec');
    }
    isGridViewHeader(recordId) {
        return this.isHeader(recordId) && this.isChoosenKindView('View');
    }
    isGridViewBody(recordId) {
        return this.isBody(recordId) && this.isChoosenKindView('View');
    }
}

BaseContainer.defaultProps = {
    viewMode: 'VIEW',
};

BaseContainer.propTypes = {
    viewMode: PropTypes.string,
};

export default BaseContainer;

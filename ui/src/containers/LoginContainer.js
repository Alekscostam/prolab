import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {Message} from 'primereact/message';
import {Password} from 'primereact/password';
import {Toast} from 'primereact/toast';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';
import {Redirect} from 'react-router-dom';
import BaseContainer from '../baseContainers/BaseContainer';
import ActionButton from '../components/ActionButton';
import SimpleReactValidator from '../components/validator';
import LocalizationService from '../services/LocalizationService';
import Constants from '../utils/Constants';
import BlockUi from './../components/waitPanel/BlockUi';
import ConsoleHelper from '../utils/ConsoleHelper';
import ActionLink from '../components/ActionLink';
import UserService from '../services/UserService';
import UserRowComponent from '../components/prolab/UserRowComponent';
import { CookiesName } from '../model/CookieName';

const element = {
    appName: 'ProlabRD',
    deviceID: 'ProlabRD001',
};

class LoginContainer extends BaseContainer {
    constructor(props) {
        super(props);
        this.localizationService = new LocalizationService(this.getConfigUrl());
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.showWarningMessage = this.showWarningMessage.bind(this);
        this.getLocalizationLoginPage = this.getConfigForLoginPage.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.registration = this.registration.bind(this);
        this.userService = new UserService();
        this.messages = React.createRef();
        this.recaptchaRef = React.createRef();
        this._isMounted = false;
        this.state = {
            username: '',
            password: '',
            redirectToReferrer: true,
            editData: {},
            authValid: true,
            lang: undefined,
            langs: this.props.appState?.configApp?.langs || [],
            visibleUserComponent: false,
            userInfo: {},
            labels: {},
            defaultLang : this.props.appState?.configApp?.lang ??  "PL",
            renderSignIn:this.props.appState?.configApp?.renderSignIn,
            renderForgotPassword:this.props?.appState?.configApp?.renderForgotPassword
        };
        this.authValidValidator = new SimpleReactValidator({
            validators: {
                auth: {
                    // name the rule
                    message: ':attribute',
                    rule: (val, params, validator) => {
                        return this.state.authValid;
                    }, // optional
                    required: true,
                },
            },
        });
    }

    resetPassword(e) {
        e.preventDefault();
        this.userService
            .resetPassword(element)
            .then((res) => {
                this.add(res);
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex.error.message);
            });
    }

    registration(e) {
        e.preventDefault();
        this.userService
            .registration(element)
            .then((res) => {
                this.add(res);
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex.error.message);
            });
    }

    add(response) {
        this.userService
            .add(response.viewId, response.token)
            .then((editData) => {
                this.setState({
                    editData: editData,
                    userInfo: response,
                    visibleUserComponent: true,
                    token: response.token,
                });
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex?.error?.message);
            });
    }

    componentDidMount() {
        super.componentDidMount();
        this.removeElementsAfterLogOut();
        this._isMounted = false;
        this.authService.removeLoginCookies();
        const values = queryString.parse(this.props.location.search);
        this.targetLocation = values.location;
        this.getConfigForLoginPage();
    }
    componentDidUpdate(){
        super.componentDidUpdate();
    }
    removeElementsAfterLogOut = () => {
     const dialogs =  Array.from(document.getElementsByClassName("confirm-dialog"));   
     if(dialogs.length !== 0 ){
        dialogs.forEach(d=>{
            document.body.removeChild(d);
        })
     }
    }
    getConfigForLoginPage = () => {
        const lang = this.state.lang ? this.state.lang : this.state?.defaultLang;
        this.localizationService
            .getTranslationsFromFile('rd', lang)
            .then((resp) => {
                const langs = this.state.langs;
                const labels = {};
                if (resp.labels) {
                    resp.labels.forEach((label) => (labels[label.code] = label.caption));
                }
                this.setState({langs, labels, lang: lang}, () => {
                    this.unblockUi();
                    this._isMounted = true;
                });
            })
            .catch((err) => {
                ConsoleHelper(`LoginContainer:getLocalizationLoginPage error`, err);
                this.showGlobalErrorMessage(err);
                this.unblockUi();
            });
    }

    handleFormSubmit(e) {
        const {labels} = this.state;
        if (e !== undefined) {
            e.preventDefault();
        }
        if (this.validator.allValid()) {
            this.blockUi();
            this.authService
                .login(this.state.username, this.state.password)
                .then(() => {
                    if (this.props.onAfterLogin) {
                        this.props.onAfterLogin();
                    }
                })
                .catch((err) => {
                    ConsoleHelper(`LoginContainer:handleFormSubmit error`, err);
                    if (err.status === 401 || err.status === 403) {
                        this.setState((state) => ({
                            authValid: false,
                        }));
                        this.validator.showMessages();
                        this.forceUpdate();
                        this.showErrorMessages(labels['Login_SigninError'], 10000, true, 'Błąd ' + err.status);
                        this.unblockUi();
                        return;
                    }
                    this.showErrorMessages(labels['Login_ConnectionError'], 10000);
                    this.unblockUi();
                });
        } else {
            this.validator.showMessages();
            // rerender to show messages for the first time
            this.scrollToError = true;
            this.forceUpdate();
        }
    }

    render() {
        if (this.authService.isLoggedUser()) {
            return this.renderAfterAuth();
        } else {
            const {labels} = this.state;
            return (
                this._isMounted && (
                    <BlockUi
                        tag='div'
                        blocking={this.state.blocking || this.state.loading}
                        loader={this.loader}
                        renderBlockUi={true}
                    >
                        {this.state.visibleUserComponent ? (
                            <UserRowComponent
                                visible={this.state.visiblePublishDialog}
                                onHide={() => {
                                    this.setState({visibleUserComponent: false});
                                }}
                                labels={labels}
                                token={this.state.token}
                                editData={this.state.editData}
                                onSave={this.handleEditRowSave}
                                onAutoFill={this.handleAutoFillRowChange}
                                onEditList={this.handleEditListRowChange}
                                onCancel={this.handleCancelRowChange}
                                onChange={this.handleEditRowChange}
                                onBlur={this.handleEditRowBlur}
                                showErrorMessages={(err) => {
                                    this.showErrorMessage(err);
                                }}
                                user={this.state.userInfo.user}
                                close={() => this.setState({visiblePublishDialog: false})}
                                handleUnselectAllData={this.unselectAllDataGrid}
                            />
                        ) : null}
                        {this.renderBeforeAuth()}
                    </BlockUi>
                )
            );
        }
    }
    renderAfterAuth() {
        const {redirectToReferrer} = this.state;
        if (redirectToReferrer === true) {
            return <Redirect to={this.targetLocation ? this.targetLocation : '/start'} />;
        }
        return <Redirect to={'/start'} />;
    }
    showWarningMessage(detail, life = Constants.ERROR_MSG_LIFE, summary = '') {
        this.messages.show({
            severity: 'warn',
            sticky: false,
            life: Constants.ERROR_MSG_LIFE,
            content: (
                <div className='p-flex p-flex-column' style={{flex: '1'}}>
                    <Message severity={'warn'} content={detail}></Message>
                </div>
            ),
        });
    }
    onKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleFormSubmit();
        }
    }
    renderBeforeAuth() {
        const {labels} = this.state;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <form onSubmit={this.handleFormSubmit} onKeyDown={(e) => this.onKeyDown(e)}>
                    <div className='container-fluid login'>
                        <div className='row no-gutter'>
                            <div className='col-md-7 d-none d-md-flex bg-color'>
                                <img className='login-icon' src={`./images/login_logo.svg`} alt='Prolab' />
                                <img className='login-left-bg' src={`./images/login_left_img.svg`} alt='Tło' />
                            </div>
                            <div className='col-md-5 bg-light'>
                                <div className='row'>
                                    <div
                                        className='col-12'
                                        style={{
                                            marginTop: '3px',
                                            textAlign: 'right',
                                            lineHeight: '5px',
                                            fontSize: '8px',
                                        }}
                                        id='langs'
                                    >
                                        <Dropdown
                                            options={this.state.langs}
                                            placeholder={'Wybierz język'}
                                            value={this.state.lang}
                                            key='lang'
                                            id='lang'
                                            inputId='langInput'
                                            name='lang'
                                            onChange={(e) =>
                                                this.setState({lang: e.value}, () => this.getConfigForLoginPage())
                                            }
                                            appendTo='self'
                                        />
                                    </div>
                                    <div className='col-12'>
                                        <div className='login d-flex align-items-center py-5'>
                                            <div className='container'>
                                                <div className='row'>
                                                    <div className='col-lg-10 col-xl-9 mx-auto'>
                                                        <div className='font-big  mb-4 '>{labels['Login_Signin']}</div>
                                                        <form>
                                                            <div className='form-group mb-4'>
                                                                <label htmlFor='username'>
                                                                    {labels['Login_UserName']}
                                                                </label>
                                                                <InputText
                                                                    key={'username'}
                                                                    id={'username'}
                                                                    name={'username'}
                                                                    placeholder={''}
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                    value={this.state.username}
                                                                    onChange={(e) => {
                                                                        const value = e.currentTarget.value;
                                                                        this.setState({username: value});
                                                                    }}
                                                                    required={true}
                                                                    validator={this.validator}
                                                                    validators='required|max:50'
                                                                />
                                                            </div>
                                                            <div className='form-group mb-3'>
                                                                <label htmlFor='password'>
                                                                    {labels['Login_Password']}
                                                                </label>
                                                                <Password
                                                                    key={'password'}
                                                                    id={'password'}
                                                                    name={'password'}
                                                                    placeholder={''}
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                    value={this.state.password}
                                                                    onChange={(e) => {
                                                                        const value = e.currentTarget.value;
                                                                        this.setState({password: value});
                                                                    }}
                                                                    promptLabel={labels['Login_Password']}
                                                                    feedback={false}
                                                                    required={true}
                                                                    validator={this.authValidValidator}
                                                                    validators='not_required'
                                                                />
                                                            </div>
                                                            {this.state.renderForgotPassword &&  <div>
                                                                <p className='text-right'>
                                                                    <ActionLink
                                                                        handleClick={this.resetPassword}
                                                                        label={labels['Login_ResetPassword']}
                                                                    />
                                                                </p>
                                                            </div>}
                                                           
                                                            {/* <ReCAPTCHA
                                                                    ref={this.recaptchaRef}
                                                                    sitekey='TWOJ_SITE_KEY'
                                                                    onChange={() => {
                                                                    }}
                                                                /> */}
                                                        <div>
                                                            <ActionButton
                                                                    label={labels['Login_Signin']}
                                                                    className='mt-4'
                                                                    variant='login-button'
                                                                    handleClick={this.handleFormSubmit}
                                                                />
                                                             {this.state.renderSignIn &&    <div className='mt-4'>
                                                                    <p className='font-normal text-center'>
                                                                        {labels['Login_Signup_Info']}&nbsp;
                                                                        <ActionLink
                                                                            handleClick={this.registration}
                                                                            label={labels['Login_Signup']}
                                                                        />
                                                                    </p>
                                                                </div>}
                                                         </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </React.Fragment>
        );
    }

    getMessages() {
        return this.messages;
    }
}

LoginContainer.propTypes = {
    onAfterLogin: PropTypes.func,
};
export default LoginContainer;

import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
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
import BlockUi from './../components/waitPanel/BlockUi';
import ConsoleHelper from '../utils/ConsoleHelper';
import ActionLink from '../components/ActionLink';
import UserService from '../services/UserService';
import UserRowComponent from '../components/prolab/UserRowComponent';
import useStore from '../store';
import LocUtils from '../utils/LocUtils';
import {getStore} from '../utils/helper/StoreHelper';
import ReCAPTCHA from 'react-google-recaptcha';
import {readValueCookieGlobal, saveValueToCookieGlobal} from '../utils/Cookie';
import {StringUtils} from '../utils/StringUtils';

class LoginContainer extends BaseContainer {
    constructor(props) {
        super(props);
        this.localizationService = new LocalizationService(this.getConfigUrl());
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
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
            captchaToken: undefined,
            authValid: true,
            lang: undefined,
            visibleUserComponent: false,
            userInfo: {},
            labels: {},
            langs: this.props.appState?.configApp?.langs || [],
            defaultLang: this.props.appState?.configApp?.lang ?? 'PL',
            renderSignIn: this.props.appState?.configApp?.renderSignIn,
            appName: this.props?.appState?.configApp?.appName,
            deviceName: this.props?.appState?.configApp?.deviceName,
            appVersion: this.props?.appState?.configApp?.appVersion,
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
        const element = {
            appName: this.state.appName,
            deviceName: this.state?.deviceName,
            appVersion: this.state?.appVersion,
        };
        this.userService
            .resetPassword(element)
            .then((res) => {
                this.add(res);
            })
            .catch((ex) => {
                this.showGlobalErrorMessage(ex.error.message);
            });
    }
    // test_kpal2
    registration(e) {
        e.preventDefault();
        const element = {
            appName: this.state.appName,
            deviceName: this.state?.deviceName,
            appVersion: this.state?.appVersion,
        };
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
        this.getConfigForLoginPage(readValueCookieGlobal('chosen-lang'));
    }
    componentDidUpdate() {
        super.componentDidUpdate();
    }
    removeElementsAfterLogOut = () => {
        const dialogs = Array.from(document.getElementsByClassName('confirm-dialog'));
        if (dialogs.length !== 0) {
            dialogs.forEach((d) => {
                document.body.removeChild(d);
            });
        }
    };
    getConfigForLoginPage = (lang = this.state.lang) => {
        if (StringUtils.isBlankOrEmpty(lang)) {
            lang = this.state?.defaultLang;
        }
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
                useStore.getState().setLabels(labels);
            })
            .catch((err) => {
                ConsoleHelper(`LoginContainer:getConfigForLoginPage error`, err);
                this.showGlobalErrorMessage(err);
                this.unblockUi();
            });
    };

    handleFormSubmit(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        if (this.loginDisabled()) {
            return;
        }
        if (this.validator.allValid()) {
            this.blockUi();
            this.authService
                .login(
                    this.state.username,
                    this.state.password,
                    this.state.appName,
                    this.state.deviceName,
                    this.state.appVersion,
                    this.state.captchaToken
                )
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
                        this.showErrorMessages(
                            LocUtils.locFromStore('Login_SigninError'),
                            10000,
                            true,
                            LocUtils.locFromStore('Error') + err.status
                        );
                        this.unblockUi();
                        return;
                    }
                    this.showErrorMessages(LocUtils.locFromStore('Login_ConnectionError'), 10000);
                    this.unblockUi();
                });
        } else {
            this.validator.showMessages();
            this.scrollToError = true;
            this.forceUpdate();
        }
    }

    render() {
        if (this.authService.isLoggedUser()) {
            return this.renderAfterAuth();
        } else {
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
    onKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleFormSubmit();
        }
    }
    loginDisabled = () => {
        if (getStore().captcha?.ENABLED) {
            if (!this.state.captchaToken) {
                return true;
            }
        }
        return false;
    };
    renderBeforeAuth() {
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
                                            value={
                                                readValueCookieGlobal('chosen-lang')
                                                    ? readValueCookieGlobal('chosen-lang')
                                                    : this.state.lang
                                            }
                                            key='lang'
                                            id='lang'
                                            inputId='langInput'
                                            name='lang'
                                            onChange={(e) => {
                                                saveValueToCookieGlobal('chosen-lang', e.value);
                                                this.setState({lang: e.value}, () =>
                                                    this.getConfigForLoginPage(this.state.lang)
                                                );
                                            }}
                                            appendTo='self'
                                        />
                                    </div>
                                    <div className='col-12'>
                                        <div className='login d-flex align-items-center py-5'>
                                            <div className='container'>
                                                <div className='row'>
                                                    <div className='col-lg-10 col-xl-9 mx-auto'>
                                                        <div className='font-big  mb-4 '>
                                                            {LocUtils.locFromStore('Login_Signin')}
                                                        </div>
                                                        <div>
                                                            <div className='form-group mb-4'>
                                                                <label htmlFor='username'>
                                                                    {LocUtils.locFromStore('Login_UserName')}
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
                                                                    autoComplete={getStore().rememberMe ? 'on' : 'off'}
                                                                    required={true}
                                                                    validator={this.validator}
                                                                    validators='required|max:50'
                                                                />
                                                            </div>
                                                            <div className='form-group mb-3'>
                                                                <label htmlFor='password'>
                                                                    {LocUtils.locFromStore('Login_Password')}
                                                                </label>
                                                                <Password
                                                                    key={'password'}
                                                                    id={'password'}
                                                                    name={'login_pass_hlogin_pass_hiddenidden'}
                                                                    placeholder={''}
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                    autoComplete={
                                                                        getStore().rememberMe ? '' : 'new-password'
                                                                    }
                                                                    value={this.state.password}
                                                                    onChange={(e) => {
                                                                        const value = e.currentTarget.value;
                                                                        this.setState({password: value});
                                                                    }}
                                                                    promptLabel={LocUtils.locFromStore(
                                                                        'Login_Password'
                                                                    )}
                                                                    feedback={false}
                                                                    required={true}
                                                                    validator={this.authValidValidator}
                                                                    validators='not_required'
                                                                />
                                                            </div>
                                                            {this.state.renderForgotPassword && (
                                                                <div>
                                                                    <p className='text-right'>
                                                                        <ActionLink
                                                                            handleClick={this.resetPassword}
                                                                            label={LocUtils.locFromStore(
                                                                                'Login_ResetPassword'
                                                                            )}
                                                                        />
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {getStore()?.captcha?.ENABLED && (
                                                                <ReCAPTCHA
                                                                    id='re-captcha'
                                                                    sitekey={getStore().captcha?.SITE_KEY}
                                                                    ref={this.recaptchaRef}
                                                                    onChange={(value) => {
                                                                        this.setState({captchaToken: value});
                                                                    }}
                                                                    onExpired={() => {
                                                                        this.setState({captchaToken: null});
                                                                    }}
                                                                    hl={this.state.lang}
                                                                />
                                                            )}

                                                            <div>
                                                                <ActionButton
                                                                    label={LocUtils.locFromStore('Login_Signin')}
                                                                    className='mt-4'
                                                                    disabled={this.loginDisabled()}
                                                                    variant='login-button'
                                                                    handleClick={this.handleFormSubmit}
                                                                />
                                                                {this.state.renderSignIn && (
                                                                    <div className='mt-4'>
                                                                        <p className='font-normal text-center'>
                                                                            {LocUtils.locFromStore('Login_Signup_Info')}
                                                                            &nbsp;
                                                                            <ActionLink
                                                                                handleClick={this.registration}
                                                                                label={LocUtils.locFromStore(
                                                                                    'Login_Signup'
                                                                                )}
                                                                            />
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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

import queryString from 'query-string';
import {Messages} from 'primereact/messages';
import {Password} from 'primereact/password';
import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router-dom';
import BaseContainer from '../baseContainers/BaseContainer';
import SimpleReactValidator from '../components/validator';
import AuthService from '../services/AuthService';
import UserService from '../services/UserService';
import BlockUi from './../components/waitPanel/BlockUi';
import {InputText} from "primereact/inputtext";
import ActionButton from "../components/ActionButton";

class LoginContainer extends BaseContainer {
    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.authService = new AuthService();
        this.userService = new UserService();
        this.state = {
            username: '',
            password: '',
            redirectToReferrer: true,
            authValid: true,
            showCaptcha: false,
            captchaPreventAction: false
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

    componentDidMount() {
        super.componentDidMount();
        const values = queryString.parse(this.props.location.search);
        this.targetLocation = values.location;
        //Messages.multiReadPersistMessage(['login-page'], this.messages);
    }

    handleFormSubmit(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        if (this.validator.allValid()) {
            this.blockUi();
            this.userService
                .checkStatusPassword(this.state.username, this.state.password, this.state.showCaptcha && !this.state.captchaPreventAction)
                .then((result) => {
                    switch (result.status) {
                        case 'OK':
                            this.authService
                                .login(this.state.username, this.state.password)
                                .then((res) => {
                                    if (this.props.onAfterLogin) {
                                        this.props.onAfterLogin();
                                    }
                                })
                                .catch((err) => {
                                    if (err.response != null) {
                                        if (err.response.status === 401 || err.response.status === 403) {
                                            this.setState((state) => ({
                                                authValid: false,
                                            }));
                                            this.validator.showMessages();
                                            this.forceUpdate();
                                        } else {
                                            this.showErrorMessage('Błąd logowania', 10000, true, 'Błąd ' + err.response.status);
                                        }
                                    } else {
                                        this.showErrorMessage('Nie można nawiązać połączenia z serwerem', 10000);
                                    }
                                });
                            break;
                        case 'REQUIRE_CAPTCHA':
                            if (this.state.showCaptcha) {
                                this.setState((prevState) => ({
                                    ...prevState,
                                    captchaPreventAction: false
                                }));
                            } else {
                                this.setState((prevState) => ({
                                    ...prevState,
                                    showCaptcha: true,
                                    captchaPreventAction: true
                                }));
                            }
                            this.showErrorMessage('Przekroczono domyślną liczbę prób logowania. Wymagana jest dodatkowa weryfikacja przy użyciu kodu CAPTCHA', 10000);
                            this.unblockUi();
                            break;
                        case 'BLOCKED':
                            this.showErrorMessage('Konto zostało zablokowane. Skontaktuj się z administratorem systemu', 10000);
                            this.unblockUi();
                            break;
                        default:
                            this.showErrorMessage('Niepoprawna nazwa użytkownika lub hasło', 10000);
                            this.unblockUi();
                            break;
                    }
                })
                .catch((err) => {
                    this.showErrorMessage('Nie można nawiązać połączenia z serwerem', 10000);
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
        if (this.authService.loggedIn()) {
            return this.renderAfterAuth();
        } else {
            return this.renderBeforeAuth();
        }
    }

    renderAfterAuth() {
        const {redirectToReferrer} = this.state;
        if (redirectToReferrer === true) {
            return <Redirect to={this.targetLocation ? this.targetLocation : '/start'}/>;
        }
        return <Redirect to={'/start'}/>;
    }

    renderBeforeAuth() {
        return (
            <React.Fragment>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <Messages id="custom-messages" ref={(el) => (this.messages = el)}></Messages>
                    <div className="container-fluid login">
                        <div className="row no-gutter">
                            <div className="col-md-7 d-none d-md-flex bg-color">
                                <img className='login-icon' src={`/images/login_logo.svg`} alt='Prolab'/>
                                <img className='login-left-bg' src={`/images/login_left_img.svg`}/>
                            </div>
                            <div className="col-md-5 bg-light">
                                <div className="login d-flex align-items-center py-5">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-lg-10 col-xl-9 mx-auto">
                                                <div className="font-big  mb-4 ">Zaloguj się</div>
                                                <form>
                                                    <div className="form-group mb-4">
                                                        <label htmlFor="username">Login</label>
                                                        <InputText
                                                            ariaLabel={'Nazwa użytkownika'}
                                                            key={'username'}
                                                            id={'username'}
                                                            name={'username'}
                                                            placeholder={''}
                                                            style={{width: '100%'}}
                                                            value={this.state.username}
                                                            onChange={(e) => this.handleChange('TEXT', undefined, e, undefined, '')}
                                                            required={true}
                                                            validator={this.validator}
                                                            validators='required|max:50'
                                                        />
                                                    </div>
                                                    <div className="form-group mb-3">
                                                        <label htmlFor="password">Hasło</label>
                                                        <Password
                                                            ariaLabel={'Hasło'}
                                                            key={'password'}
                                                            id={'password'}
                                                            name={'password'}
                                                            placeholder={''}
                                                            style={{width: '100%'}}
                                                            value={this.state.password}
                                                            onChange={(e) => this.handleChange('TEXT', undefined, e, undefined, '')}
                                                            promptLabel={'Hasło'}
                                                            feedback={false}
                                                            required={true}
                                                            validator={this.authValidValidator}
                                                            validators='not_required'
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-right">
                                                            <a
                                                                href="https://bootstrapious.com/snippets">
                                                                Zapomniałeś hasła?
                                                            </a>
                                                        </p>
                                                    </div>
                                                    <ActionButton
                                                        label='Zaloguj się'
                                                        className="mt-4"
                                                        variant='login-button'
                                                        handleClick={this.handleFormSubmit}
                                                        disabled={this.state.captchaPreventAction}/>
                                                    <div className="mt-4">
                                                        <p className="font-normal text-center">Nie masz swojego
                                                            konta?&nbsp;
                                                            <a
                                                                href="https://bootstrapious.com/snippets">
                                                                Stwórz profil
                                                            </a>
                                                        </p>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BlockUi>
            </React.Fragment>
        );
    }
}

LoginContainer.propTypes = {
    onAfterLogin: PropTypes.func,
};
export default LoginContainer;

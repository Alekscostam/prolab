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
import ConsoleHelper from "../utils/ConsoleHelper";

class LoginContainer extends BaseContainer {
    constructor(props) {
        super(props);
        this.localizationService = new LocalizationService();
        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.showWarningMessage = this.showWarningMessage.bind(this);
        this.getLocalizationLoginPage = this.getLocalizationLoginPage.bind(this);

        this.state = {
            username: '',
            password: '',
            redirectToReferrer: true,
            authValid: true,
            lang: null,
            langs: [],
            labels: {},
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
        this.getLocalizationLoginPage();
    }

    getLocalizationLoginPage() {
        this.blockUi();
        this.localizationService.localizationLoginPage(this.state.lang)
            .then(resp => {
                const langs = resp.langList;
                const labels = {};
                const lang = resp.lang;
                if (resp.labels) {
                    resp.labels.forEach(label => labels[label.code] = label.caption)
                }
                this.setState({langs, labels, lang}, () => this.unblockUi());
            })
            .catch(err => {
                ConsoleHelper(`LoginContainer:getLocalizationLoginPage error`, err);
                this.showErrorMessages(err);
                this.unblockUi();
            })
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
                .then((res) => {
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
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)}/>
                    <form onSubmit={this.handleFormSubmit} onKeyDown={(e) => this.onKeyDown(e)}>
                        <div className='container-fluid login'>
                            <div className='row no-gutter'>
                                <div className='col-md-7 d-none d-md-flex bg-color'>
                                    <img className='login-icon' src={`./images/login_logo.svg`} alt='Prolab'/>
                                    <img className='login-left-bg' src={`./images/login_left_img.svg`} alt='Tło'/>
                                </div>
                                <div className='col-md-5 bg-light'>
                                    <div className="row">
                                        <div className="col-12" style={{
                                            marginTop: '3px',
                                            textAlign: 'right',
                                            lineHeight: '5px',
                                            fontSize: '8px'
                                        }} id="dsadas">
                                            <Dropdown
                                                options={this.state.langs}
                                                placeholder={'Wybierz język'}
                                                value={this.state.lang}
                                                key='lang'
                                                id='lang'
                                                inputId='langInput'
                                                name='lang'
                                                onChange={(e) => this.setState({lang: e.value}, () => this.getLocalizationLoginPage())}
                                                appendTo="self"
                                            />
                                        </div>
                                        <div className="col-12">


                                            <div className='login d-flex align-items-center py-5'>
                                                <div className='container'>
                                                    <div className='row'>
                                                        <div className='col-lg-10 col-xl-9 mx-auto'>
                                                            <div
                                                                className='font-big  mb-4 '>{labels['Login_Signin']}</div>
                                                            <form>
                                                                <div className='form-group mb-4'>
                                                                    <label
                                                                        htmlFor='username'>{labels['Login_UserName']}</label>
                                                                    <InputText
                                                                        ariaLabel={this.state.labels['Login_UserName']}
                                                                        key={'username'}
                                                                        id={'username'}
                                                                        name={'username'}
                                                                        placeholder={''}
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        value={this.state.username}
                                                                        onChange={(e) =>
                                                                            this.handleChange(
                                                                                'TEXT',
                                                                                undefined,
                                                                                e,
                                                                                undefined,
                                                                                ''
                                                                            )
                                                                        }
                                                                        required={true}
                                                                        validator={this.validator}
                                                                        validators='required|max:50'
                                                                    />
                                                                </div>
                                                                <div className='form-group mb-3'>
                                                                    <label
                                                                        htmlFor='password'>{labels['Login_Password']}</label>
                                                                    <Password
                                                                        ariaLabel={labels['Login_Password']}
                                                                        key={'password'}
                                                                        id={'password'}
                                                                        name={'password'}
                                                                        placeholder={''}
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                        value={this.state.password}
                                                                        onChange={(e) =>
                                                                            this.handleChange(
                                                                                'TEXT',
                                                                                undefined,
                                                                                e,
                                                                                undefined,
                                                                                ''
                                                                            )
                                                                        }
                                                                        promptLabel={labels['Login_Password']}
                                                                        feedback={false}
                                                                        required={true}
                                                                        validator={this.authValidValidator}
                                                                        validators='not_required'
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className='text-right'>
                                                                        <a href='https://bootstrapious.com/snippets'>
                                                                            {labels['Login_ResetPassword']}
                                                                        </a>
                                                                    </p>
                                                                </div>
                                                                <ActionButton
                                                                    label={labels['Login_Signin']}
                                                                    className='mt-4'
                                                                    variant='login-button'
                                                                    handleClick={this.handleFormSubmit}
                                                                />
                                                                <div className='mt-4'>
                                                                    <p className='font-normal text-center'>
                                                                        Nie masz swojego konta?&nbsp;
                                                                        <a href='https://bootstrapious.com/snippets'>
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
                            </div>
                        </div>
                    </form>
                </BlockUi>
            </React.Fragment>
        );
    }
}

LoginContainer.propTypes = {
    onAfterLogin: PropTypes.func,
    backendUrl: PropTypes.string.isRequired,
};
export default LoginContainer;

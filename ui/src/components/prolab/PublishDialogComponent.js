import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import AuthService from '../../services/AuthService';
import {Calendar} from 'primereact/calendar';
import {InputText} from 'primereact/inputtext';
import moment from 'moment';
import {CookiesName} from '../../enum/CookieName';

export default class PublishDialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.authService = new AuthService();
        this.refDataGrid = {};
        this.state = {
            visibleDialogPublish: this.props.visible,
            publishOptions: {
                version: this.props.publishValues?.version,
                date: new Date(),
                user: JSON.parse(localStorage.getItem(CookiesName.LOGGED_USER)).name,
            },
        };
    }

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='publishDialog'
                    header={LocUtils.loc(this.props.labels, 'Publish_header', 'Publikowanie dokumentów')}
                    footer={
                            <div>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        let publishOptions = this.state.publishOptions;
                                        publishOptions.date = moment(this.state.publishOptions.date).format(
                                            'YYYY-MM-DD'
                                        );
                                        this.props.handlePublish(publishOptions);
                                        this.props.close();
                                    }}
                                    label={LocUtils.loc(this.props.labels, 'Confirm', 'Zatwierdź')}
                                />
                            </div>
                    }
                    visible={this.props.visible}
                    style={{height:"450px"}}
                    resizable={false}
                    onHide={() => this.props.onHide()}
                >
                    <div className='row'>
                        <div className='col-12'>
                            <div className='col-12'>
                                {LocUtils.loc(this.props.labels, 'Publish_user', 'Użytkownik')}
                                <InputText
                                    id={`user`}
                                    name={'user'}
                                    style={{width: '100%', color: 'red!important'}}
                                    type='text'
                                    value={this.state.publishOptions.user}
                                    disabled={true}
                                    required={true}
                                />
                            </div>
                            <div className='col-12 mt-3'>
                                {LocUtils.loc(this.props.labels, 'Publish_version', 'Wersja')}
                                <InputText
                                    id={`version`}
                                    name={'version'}
                                    style={{width: '100%'}}
                                    type='text'
                                    value={this.state.publishOptions.version}
                                    disabled={true}
                                    required={true}
                                />
                            </div>
                            <div className='col-12 mt-3'>
                                {LocUtils.loc(this.props.labels, 'Publish_date_header', 'Data publikacji')}
                                <Calendar
                                    id={`date`}
                                    name={'date'}
                                    style={{width: '100%'}}
                                    value={this.state.publishOptions.date}
                                    dateFormat='yy-mm-dd'
                                    onChange={(e) => {
                                        this.setState((prevState) => ({
                                            publishOptions: {
                                                ...prevState.publishOptions,
                                                [e.target.id]: moment(e.value).format('YYYY-MM-DD'),
                                            },
                                        }));
                                    }}
                                    appendTo={document.body}
                                    required={true}
                                    showButtonBar
                                    showIcon
                                    mask='9999-99-99'
                                />
                            </div>
                        </div>
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
}

PublishDialogComponent.defaultProps = {
    visible: true,
};

PublishDialogComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

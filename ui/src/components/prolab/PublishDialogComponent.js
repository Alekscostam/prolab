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
import {CookiesName} from '../../model/CookieName';

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
                        <React.Fragment>
                            <div>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        this.props.onHide();
                                    }}
                                    label={LocUtils.loc(this.props.labels, 'Cancel', 'Anuluj')}
                                />
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
                        </React.Fragment>
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'860px': '75vw', '640px': '100vw'}}
                    onHide={() => this.props.onHide()}
                >
                    <div>
                        <div className='row'>
                            <span style={{color: '#000'}}>
                                {LocUtils.loc(this.props.labels, 'Publish_user', 'Użytkownik')}
                            </span>
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

                        <div className='row mt-2'>
                            <span style={{color: '#000'}}>
                                {LocUtils.loc(this.props.labels, 'Publish_version', 'Wersja')}
                            </span>
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
                    </div>
                    <div className='row mt-2'>
                        <span style={{color: '#000'}}>
                            {LocUtils.loc(this.props.labels, 'Publish_date_header', 'Data publikacji')}
                        </span>
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
                        ></Calendar>
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

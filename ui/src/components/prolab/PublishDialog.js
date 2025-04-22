import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {Calendar} from 'primereact/calendar';
import {InputText} from 'primereact/inputtext';
import moment from 'moment';
import LocUtils from '../../utils/LocUtils';
import {CookiesName} from '../../enum/CookieName';
import Constants from '../../utils/Constants';

const PublishDialog = ({visible, publishValues, handlePublish, onHide, close}) => {
    const toastRef = useRef(null);

    const [publishOptions, setPublishOptions] = useState({
        version: publishValues?.version,
        date: new Date(),
        user: JSON.parse(localStorage.getItem(CookiesName.LOGGED_USER))?.name,
    });

    const handleConfirm = () => {
        const formattedDate = moment(publishOptions.date).format(Constants.DATE_FORMAT.YYYY_MM_DD);
        handlePublish({
            ...publishOptions,
            date: formattedDate,
        });
        close();
    };

    const handleDateChange = (e) => {
        setPublishOptions((prev) => ({
            ...prev,
            [e.target.id]: moment(e.value).format(Constants.DATE_FORMAT.YYYY_MM_DD),
        }));
    };

    return (
        <>
            <Toast id='toast-messages' position='top-center' ref={toastRef} />
            <Dialog
                id='publishDialog'
                header={LocUtils.locFromStoreWithDefault('Document_published', 'Publikowanie dokumentów')}
                footer={
                    <div>
                        <Button
                            type='button'
                            onClick={handleConfirm}
                            label={LocUtils.locFromStoreWithDefault('Confirm', 'Zatwierdź')}
                        />
                    </div>
                }
                visible={visible}
                style={{height: '450px'}}
                resizable={false}
                onHide={onHide}
            >
                <div className='row'>
                    <div className='col-12'>
                        <div className='col-12'>
                            {LocUtils.locFromStoreWithDefault('User', 'Użytkownik')}
                            <InputText
                                id='user'
                                name='user'
                                style={{width: '100%', color: 'red'}}
                                type='text'
                                value={publishOptions.user}
                                disabled
                                required
                            />
                        </div>
                        <div className='col-12 mt-3'>
                            {LocUtils.locFromStoreWithDefault('Version', 'Wersja')}
                            <InputText
                                id='version'
                                name='version'
                                style={{width: '100%'}}
                                type='text'
                                value={publishOptions.version}
                                disabled
                                required
                            />
                        </div>
                        <div className='col-12 mt-3'>
                            {LocUtils.locFromStoreWithDefault('Publish_date', 'Data publikacji')}
                            <Calendar
                                id='date'
                                name='date'
                                style={{width: '100%'}}
                                value={moment(publishOptions.date, Constants.DATE_FORMAT.YYYY_MM_DD).toDate()}
                                dateFormat='yy-mm-dd'
                                onChange={handleDateChange}
                                appendTo={document.body}
                                required
                                showButtonBar
                                showIcon
                                mask='9999-99-99'
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

PublishDialog.defaultProps = {
    visible: true,
};

PublishDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    handlePublish: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    publishValues: PropTypes.shape({
        version: PropTypes.string,
    }),
};

export default PublishDialog;

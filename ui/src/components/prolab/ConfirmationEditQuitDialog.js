import {Dialog} from 'primereact/dialog';
import React from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {Button} from 'primereact/button';

export const ConfirmationEditQuitDialog = (props) => {
    const {onHide, onAccept, visible} = props;

    const dialogFooter = (
        <React.Fragment>
            <div>
                <Button
                    type='button'
                    onClick={() => {
                        onHide();
                    }}
                    className='mr-2 p-button inverse'
                    label={LocUtils.locFromStoreWithDefault('No', 'Nie')}
                />
                <Button
                    type='button'
                    onClick={() => {
                        onAccept();
                    }}
                    label={LocUtils.locFromStoreWithDefault('Yes', 'Tak')}
                />
            </div>
        </React.Fragment>
    );

    const dialogHeader = (
        <div>{LocUtils.locFromStoreWithDefault('Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?')}</div>
    );

    return (
        <Dialog
            id='quitEditDialog'
            header={dialogHeader}
            footer={dialogFooter}
            visible={visible}
            resizable={false}
            closable={false}
            breakpoints={{'960px': '75vw', '640px': '100vw'}}
        ></Dialog>
    );
};

ConfirmationEditQuitDialog.defaultProps = {
    onHide: () => {},
    onAccept: () => {},
    visible: true,
    value: '',
    header: '',
};

ConfirmationEditQuitDialog.propTypes = {
    onHide: PropTypes.func,
    onAccept: PropTypes.func,
    visible: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
};

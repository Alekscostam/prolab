import {ConfirmDialog} from 'primereact/confirmdialog';
import {OperationType} from '../../enum/OperationType';
import LocUtils from '../../utils/LocUtils';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import React from 'react';
import {Button} from 'primereact/button';

export const ConfirmationOperationDialog = ({onHide, onAccept, operationType, visible}) => {
    const getTranslatedTitle = () => {
        switch (operationType.toUpperCase()) {
            case OperationType.OP_DELETE:
                return LocUtils.locFromStoreWithDefault('Confirmation_delete_title', 'Czy na pewno usunąć dane?');
            default:
                return '';
        }
    };

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

    const dialogHeader = <div>{getTranslatedTitle()}</div>;

    return (
        <Dialog
            id='confirmation-operation'
            header={dialogHeader}
            footer={dialogFooter}
            visible={visible}
            resizable={false}
            closable={false}
            breakpoints={{'960px': '75vw', '640px': '100vw'}}
        ></Dialog>
    );
};

ConfirmationOperationDialog.defaultProps = {
    onHide: () => {},
    onAccept: () => {},
    operationType: undefined,
    visible: false,
};

ConfirmationOperationDialog.propTypes = {
    onHide: PropTypes.func,
    onAccept: PropTypes.func,
    operationType: PropTypes.string,
    visible: PropTypes.bool,
};

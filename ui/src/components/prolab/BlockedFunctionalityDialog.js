import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import LocUtils from '../../utils/LocUtils';
import React from 'react';

import {Button} from 'primereact/button';
const BlockedFunctionalityDialog = ({visible, onHide}) => {
    return (
        <>
            <Dialog
                id='functionalityBlockedDialog'
                header={LocUtils.locFromStoreWithDefault(
                    'Functionality_Blocked_In_This_View',
                    'Funkcjonalność niedostępna w tym widoku'
                )}
                visible={visible}
                resizable={false}
                closable={false}
                onHide={onHide}
                footer={
                    <React.Fragment>
                        <Button
                            type='button'
                            onClick={() => {
                                onHide();
                            }}
                            label={LocUtils.locFromStoreWithDefault('Close', 'Zamknij')}
                        />
                    </React.Fragment>
                }
            ></Dialog>
        </>
    );
};

BlockedFunctionalityDialog.defaultProps = {
    visible: true,
};

BlockedFunctionalityDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default BlockedFunctionalityDialog;

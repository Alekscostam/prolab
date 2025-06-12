import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {InputTextarea} from 'primereact/inputtextarea';
import LocUtils from '../../utils/LocUtils';

const MarkupDialog = ({onClose, onAccept, initValue, confirmDialogWrapper}) => {
    const [value, setValue] = useState(initValue);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        document.body.removeChild(confirmDialogWrapper);
    };

    return (
        <Dialog
            style={{paddingRight: '0px', paddingLeft: '0px'}}
            className='col-lg-8 col-md-10 col-sm-12'
            visible={true}
            message={''}
            header={LocUtils.locFromStoreWithDefault('Markup', 'Markup')}
            icon=''
            acceptLabel={LocUtils.locFromStoreWithDefault('Save', 'Zapisz')}
            rejectLabel={LocUtils.locFromStoreWithDefault('Close', 'Zamknij')}
            onHide={handleClose}
            footer={
                <React.Fragment>
                    <Button
                        type='button'
                        onClick={() => {
                            onAccept && onAccept(value);
                            handleClose();
                        }}
                        label={LocUtils.locFromStoreWithDefault('Save', 'Zapisz')}
                    />
                </React.Fragment>
            }
        >
            <div>
                <InputTextarea
                    rows={7}
                    style={{width: '100%'}}
                    className='col-12'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </Dialog>
    );
};

function MarkupDialogComponent() {}

MarkupDialogComponent.render = ({onAccept, initValue, onClose}) => {
    const confirmDialogWrapper = document.createElement('div');
    confirmDialogWrapper.className = 'confirm-dialog';
    document.body.appendChild(confirmDialogWrapper);
    const root = ReactDOM.createRoot(confirmDialogWrapper);
    root.render(
        <MarkupDialog
            onAccept={onAccept}
            onClose={onClose}
            initValue={initValue}
            confirmDialogWrapper={confirmDialogWrapper}
        />
    );
};

export default MarkupDialogComponent;

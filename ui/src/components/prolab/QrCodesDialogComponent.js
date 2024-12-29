import {Button, TextBox} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import LocUtils from '../../utils/LocUtils';
export const QrCodesDialogComponent = (props) => {
    const {onHide, editable, labels, findCode} = props;
    const qrCodeRef = useRef(undefined);
    const [visible, setVisible] = useState(props.visible);

    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.key === 'Enter') {
                const value = document.getElementById('qrCode-textbox')?.firstChild?.firstChild?.firstChild?.value;
                if (value && value.trim() !== '') {
                    findCode(value);
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, []);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };

    const dialogHeader = () => {
        return <div> {LocUtils.locFromStoreWithDefault('Search', 'Szukaj')}</div>;
    };

    const dialogFooter = editable ? (
        <div>
            <ShortcutButton
                id={'opCancel'}
                className={`grid-button-panel-big normal mt-1 mb-1 mr-1`}
                handleClick={() => {
                    hideDialog();
                }}
                label={LocUtils.locFromStoreWithDefault('Cancel', 'Anuluj')}
            />
            <ShortcutButton
                id={'opConfirm'}
                className={`grid-button-panel-big inverse mt-1 mb-1 mr-1`}
                handleClick={() => {
                    const value = qrCodeRef.current.instance.option('value');
                    findCode(value);
                }}
                label={LocUtils.locFromStoreWithDefault('Confirm', 'Zatwierdź')}
            />
        </div>
    ) : (
        <div></div>
    );

    const fullNameLabel = {'aria-label': 'Full Name'};
    return (
        <div>
            <Dialog
                closable={false}
                header={dialogHeader}
                blockScroll
                visible={visible}
                style={{width: '25vw', overflow: 'hidden !important'}}
                onHide={hideDialog}
                footer={dialogFooter}
            >
                <div className='p-2'>
                    <div className='dx-field'>
                        <div className='dx-field-label' style={{fontSize: '15px'}}>
                            <b>{LocUtils.locFromStoreWithDefault('Barcode', 'Kod kreskowy')}</b>
                        </div>
                        <div className='dx-field-value'>
                            <TextBox
                                id='qrCode-textbox'
                                onContentReady={() => {
                                    setTimeout(() => {
                                        const ref = qrCodeRef.current;
                                        if (ref) {
                                            ref.instance.focus();
                                        }
                                    }, 100);
                                }}
                                hoverStateEnabled
                                focusStateEnabled
                                ref={qrCodeRef}
                                placeholder=''
                                inputAttr={fullNameLabel}
                                showClearButton={true}
                                className='qrcode'
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

QrCodesDialogComponent.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    labels: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

QrCodesDialogComponent.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
    labels: PropTypes.object,
};

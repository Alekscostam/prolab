import {Button, TextBox} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import ShortcutButton from '../components/prolab/ShortcutButton';
import LocUtils from '../utils/LocUtils';

export const QrCodesDialog = (props) => {
    const {onSave, onHide, editable, labels} = props;
    const qrCodeRef = useRef(undefined);
    const [visible, setVisible] = useState(props.visible);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        return () => {};
    }, [props, value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };
    const dialogHeader = () => {
        return <div> {LocUtils.loc(labels, 'Search', 'Szukaj')}</div>;
    };
    const dialogFooter = editable ? (
        <div>
            <ShortcutButton
                id={'opCancel'}
                className={`grid-button-panel-big normal mt-1 mb-1 mr-1`}
                handleClick={() => {
                    hideDialog();
                }}
                title={'Anulowanie'}
                label={LocUtils.loc(labels, 'Cancel', 'Anuluj')}
            />
            <ShortcutButton
                id={'opConfirm'}
                className={`grid-button-panel-big inverse mt-1 mb-1 mr-1`}
                handleClick={() => {}}
                title={'Zatwierdzanie kryteriów'}
                label={LocUtils.loc(labels, 'Confirm', 'Zatwierdź')}
            />
        </div>
    ):<div></div>;
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
                            <b>{LocUtils.loc(labels, 'Qrcode', 'Kod kreskowy')}</b>
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

QrCodesDialog.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    labels: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

QrCodesDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
    labels: PropTypes.object,
};

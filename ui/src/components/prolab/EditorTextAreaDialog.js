import {Button} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useState} from 'react';

import PropTypes from 'prop-types';
import {InputTextarea} from 'primereact/inputtextarea';
import LocUtils from '../../utils/LocUtils';

export const EditorTextAreaDialog = (props) => {
    const {onSave, onHide, header, editable} = props;

    const [visible, setVisible] = useState(props.visible);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        return () => {};
    }, [props, value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };

    const dialogFooter = editable ? (
        <div>
            <Button
                id='save-editor-button'
                text={LocUtils.locFromStoreWithDefault('Save', 'Zapisz')}
                onClick={() => {
                    onSave(value);
                    hideDialog();
                }}
            />
        </div>
    ) : (
        <div></div>
    );

    return (
        <div>
            <Dialog
                header={header}
                blockScroll
                visible={visible}
                style={{width: '50vw', overflow: 'hidden !important'}}
                onHide={hideDialog}
                footer={dialogFooter}
            >
                <div>
                    <InputTextarea
                        style={{resize: 'none'}}
                        autoResize
                        value={value}
                        disabled={!editable}
                        rows={1}
                        className={`col-12 ${editable} `}
                        onChange={(e) => {
                            setValue(e.currentTarget.value);
                        }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

EditorTextAreaDialog.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

EditorTextAreaDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
};

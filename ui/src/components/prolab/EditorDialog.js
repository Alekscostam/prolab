import {Button} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {EditorFixUtils} from '../../utils/EditorFixUtils';

export const EditorDialog = (props) => {
    const {onSave, onHide, header} = props;

    const [visible, setVisible] = useState(props.visible);
    const [value, setValue] = useState(props.value);
    const editor = useRef(null);
    const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
    const fontValues = [
        'Arial',
        'Courier New',
        'Georgia',
        'Impact',
        'Lucida Console',
        'Tahoma',
        'Times New Roman',
        'Verdana',
    ];
    const headerValues = [false, 1, 2, 3, 4, 5];

    useEffect(() => {
        return () => {
            EditorFixUtils.clearAllLinkedDialogsWithEditor();
        };
    }, [props, value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };
    const dialogFooter = (
        <div>
            <Button
                id='save-editor-button'
                text='Zapisz'
                onClick={() => {
                    if (onSave) {
                        onSave(editor.current?.instance?.option('value'));
                    }
                    hideDialog();
                }}
            />
        </div>
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
                    <HtmlEditor
                        id='editor-dialog'
                        ref={editor}
                        disabled={false}
                        visible={true}
                        onValueChanged={(e) => {
                            if (e.event) {
                                e.event.stopPropagation();
                                e.event.preventDefault();
                            }
                            if (editor) {
                                setValue(value);
                            }
                        }}
                        className='border-around-editor editor editable-border'
                        defaultValue={value}
                        validationMessageMode='always'
                    >
                        <MediaResizing enabled={true} />

                        <Toolbar multiline={true}>
                            <Item locateInMenu='auto' name='undo' />
                            <Item locateInMenu='auto' name='redo' />
                            <Item locateInMenu='auto' name='separator' />
                            <Item locateInMenu='auto' name='size' acceptedValues={sizeValues} />
                            <Item locateInMenu='auto' name='font' acceptedValues={fontValues} />
                            <Item locateInMenu='auto' name='header' acceptedValues={headerValues} />
                            <Item locateInMenu='auto' name='separator' />
                            <Item locateInMenu='auto' name='bold' />
                            <Item locateInMenu='auto' name='italic' />
                            <Item locateInMenu='auto' name='strike' />
                            <Item locateInMenu='auto' name='underline' />
                            <Item locateInMenu='auto' name='subscript' />
                            <Item locateInMenu='auto' name='superscript' />
                            <Item locateInMenu='auto' name='separator' />
                            <Item locateInMenu='auto' name='alignLeft' />
                            <Item locateInMenu='auto' name='alignCenter' />
                            <Item locateInMenu='auto' name='alignRight' />
                            <Item locateInMenu='auto' name='alignJustify' />
                            <Item locateInMenu='auto' name='separator' />
                            <Item locateInMenu='auto' name='orderedList' />
                            <Item locateInMenu='auto' name='bulletList' />
                            <Item locateInMenu='auto' name='separator' />
                            <Item
                                locateInMenu='auto'
                                name='color'
                                onClick={() => {
                                    setTimeout(function () {
                                        const dialogc = document.getElementsByClassName('dx-popup-normal');
                                        const dialogs = document.getElementsByClassName('p-dialog');
                                        if (dialogc.length !== 0) {
                                            Array.from(dialogc).forEach((el) => EditorFixUtils.overideEventClick(el));
                                        }
                                        if (dialogs.length !== 0) {
                                            Array.from(dialogs).forEach((el) =>
                                                EditorFixUtils.removeAllEventListeners(el)
                                            );
                                            Array.from(dialogs).forEach((el) => EditorFixUtils.overideEventClick(el));
                                        }
                                    }, 300);
                                }}
                            />
                            <Item
                                name='background'
                                onClick={() => {
                                    setTimeout(function () {
                                        const dialogc = document.getElementsByClassName('dx-popup-normal');
                                        const dialogs = document.getElementsByClassName('p-dialog');
                                        if (dialogc.length !== 0) {
                                            Array.from(dialogc).forEach((el) => EditorFixUtils.overideEventClick(el));
                                        }
                                        if (dialogs.length !== 0) {
                                            Array.from(dialogs).forEach((el) =>
                                                EditorFixUtils.removeAllEventListeners(el)
                                            );

                                            Array.from(dialogs).forEach((el) => EditorFixUtils.overideEventClick(el));
                                        }
                                    }, 300);
                                }}
                            />
                            <Item locateInMenu='auto' name='separator' />
                            <Item locateInMenu='auto' name='insertTable' />
                            <Item locateInMenu='auto' name='deleteTable' />
                            <Item locateInMenu='auto' name='insertRowAbove' />
                            <Item locateInMenu='auto' name='insertRowBelow' />
                            <Item locateInMenu='auto' name='deleteRow' />
                            <Item locateInMenu='auto' name='insertColumnLeft' />
                            <Item locateInMenu='auto' name='insertColumnRight' />
                            <Item locateInMenu='auto' name='deleteColumn' />
                        </Toolbar>
                    </HtmlEditor>
                </div>
            </Dialog>
        </div>
    );
};

EditorDialog.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    visible: true,
    value: '',
    header: '',
};

EditorDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
};

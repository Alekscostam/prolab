import React, {useState, useEffect} from 'react';
import {readableStreamToArrayBuffer} from '../../utils/Buffer';
import HtmlEditor, {Toolbar, Item, TableResizing} from 'devextreme-react/html-editor';
import Mammoth from 'mammoth';
import LocUtils from '../../utils/LocUtils';
import MarkupDialogComponent from './MarkupDialogComponent';
import useStore from '../../store';

export const DocxViewerComponent = ({labels, file}) => {
    const [editorContent, setEditorContent] = useState('');
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
        const loadDocx = async () => {
            if (file) {
                try {
                    const arrayBuffer = await readableStreamToArrayBuffer(file);
                    const result = await Mammoth.convertToHtml({arrayBuffer});
                    setEditorContent(result.value);
                } catch (error) {
                    console.error('Error converting file:', error);
                }
            }
        };

        loadDocx();
    }, [file]);

    const showMarkupOnHtmlEditor = useStore.getState().showMarkupOnHtmlEditor;
    return (
        <div>
            <HtmlEditor
                value={editorContent}
                onValueChanged={(e) => setEditorContent(e.value)}
                height={1000}
                readOnly={true}
            >
                <TableResizing enabled={true} />
                <Toolbar>
                    {' '}
                    <Item name='undo' />
                    <Item name='redo' />
                    <Item name='separator' />
                    <Item name='size' acceptedValues={sizeValues} />
                    <Item name='font' acceptedValues={fontValues} />
                    <Item name='header' acceptedValues={headerValues} />
                    <Item name='separator' />
                    <Item name='bold' />
                    <Item name='italic' />
                    <Item name='strike' />
                    <Item name='underline' />
                    <Item name='subscript' />
                    <Item name='superscript' />
                    <Item name='separator' />
                    <Item name='alignLeft' />
                    <Item name='alignCenter' />
                    <Item name='alignRight' />
                    <Item name='alignJustify' />
                    <Item name='separator' />
                    <Item name='orderedList' />
                    <Item name='bulletList' />
                    <Item name='separator' />
                    <Item name='color' />
                    <Item name='background' />
                    <Item name='separator' />
                    <Item name='insertTable' />
                    <Item name='deleteTable' />
                    <Item name='insertRowAbove' />
                    <Item name='insertRowBelow' />
                    <Item name='deleteRow' />
                    <Item name='insertColumnLeft' />
                    <Item name='insertColumnRight' />
                    <Item name='deleteColumn' />
                    <Item name='blockquote' />
                    <Item name='codeBlock' />
                    <Item name='image' />
                    <Item name='link' />
                    <Item name='clear' />
                    <Item name='insertHeaderRow' />
                    <Item name='cellProperties' />
                    <Item name='tableProperties' />
                    {showMarkupOnHtmlEditor && (
                        <Item
                            widget='dxButton'
                            showText='inMenu'
                            options={{
                                icon: 'variable',
                                hint: LocUtils.locFromStoreWithDefault('Show_markup', 'Show markup'),
                                text: LocUtils.locFromStoreWithDefault('Show_markup', 'Show markup'),
                                onClick: () => {
                                    MarkupDialogComponent.render({
                                        onAccept: (value) => {
                                            setEditorContent(value);
                                        },
                                        initValue: editorContent,
                                    });
                                },
                            }}
                        />
                    )}
                </Toolbar>
            </HtmlEditor>
        </div>
    );
};

export default DocxViewerComponent;

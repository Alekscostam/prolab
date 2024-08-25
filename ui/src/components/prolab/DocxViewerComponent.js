import React, { useState, useEffect } from 'react';
import { readableStreamToArrayBuffer } from '../../utils/Buffer';
import HtmlEditor, { Toolbar, Item } from 'devextreme-react/html-editor';
import Mammoth from 'mammoth';

export const DocxViewerComponent = ({ labels, file }) => {
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
                    const result = await Mammoth.convertToHtml({ arrayBuffer });
                    setEditorContent(result.value);
                } catch (error) {
                    console.error("Error converting file:", error);
                }
            }
        };

        loadDocx();
    }, [file]);

    return (
        <div>
            <HtmlEditor
                value={editorContent}
                onValueChanged={(e) => setEditorContent(e.value)}
                height={1000}
                readOnly={true}
            >
                <Toolbar>       <Item name='undo' />
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
                </Toolbar>
            </HtmlEditor>
        </div>
    );
};

export default DocxViewerComponent;
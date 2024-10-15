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
//O – Opisowe
export const MemoizedDescriptionInput = React.memo(({field, cellInfo, inputValue, fieldIndex, required, validate}) => {
    return (
        <React.Fragment>
            <div aria-live='assertive'>
                <HtmlEditor
                    id={`editor_${fieldIndex}`}
                    className={`editor ${validate}`}
                    defaultValue={inputValue}
                    onValueChanged={(e) => {
                        // dostosowanie pierwszej doklejonej kolumny
                        const rowIndex = cellInfo.rowIndex;
                        const realRowIndex = rowIndex + 1;
                        const elements = document.querySelectorAll('td[aria-describedby=column_0_undefined-fixed]');
                        const row = document.querySelectorAll(
                            'tr[aria-rowindex="' + realRowIndex + '"][class*="dx-column-lines"]'
                        )[0];
                        const element = elements[realRowIndex];
                        if (element) {
                            element.style.height = row.clientHeight + 'px';
                        }
                        cellInfo.setValue(e.value);
                    }}
                    validationMessageMode='always'
                    disabled={!field.edit}
                    required={required}
                >
                    {' '}
                    {required ? (
                        <Validator>
                            <RequiredRule message={`Pole jest wymagane`} />
                        </Validator>
                    ) : null}
                    <MediaResizing enabled={true} />
                    <Toolbar multiline={false}>
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
                        <Item
                            name='color'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />
                        <Item
                            name='background'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />
                        <Item name='separator' />
                        <Item
                            name='insertTable'
                            onClick={() => {
                                const dialog = document.getElementsByClassName('dx-popup-normal')[1];
                                if (dialog) {
                                    overideEventClick(dialog);
                                }
                            }}
                        />

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
        </React.Fragment>
    );
});

const classListContainsButton = (element) => {
    try {
        return Array.from(element.classList).includes('dx-button');
    } catch (ex) {
        console.log('to much iterations');
    }
};
const clickButtonIfIsParent = (parent, iterations) => {
    if (iterations < 0) {
        return;
    }
    if (classListContainsButton(parent)) {
        parent.click();
        return;
    }
    clickButtonIfIsParent(parent.parentNode, iterations - 1);
};
const overideEventClick = (element) => {
    element.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (classListContainsButton(event.target)) {
            event.target.click();
        } else {
            clickButtonIfIsParent(event.target.parentNode, 3);
        }
    });
    Array.from(element.children).forEach((child) => {
        overideEventClick(child);
    });
};
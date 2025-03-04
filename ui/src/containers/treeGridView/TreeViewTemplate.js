import {NumberBox, TextBox} from 'devextreme-react';
import {Button} from 'primereact/button';
import {ColumnType} from '../../enum/ColumnType';
import CellCustomBackground from '../../model/CellCustomBackground';
import ConsoleHelper from '../../utils/ConsoleHelper';
import Image from '../../components/Image';
import {StringUtils} from '../../utils/StringUtils';
import useStore from '../../store';
import {MemoizedOperations} from '../../components/prolab/memoized/MemoizedOperations';

export const cellRenderSpecial = (cellInfo, columnDefinition, keyExistsInInvalidCellKeys, onOperationClick) => {
    try {
        const cellBackground = new CellCustomBackground(cellInfo, columnDefinition);
        cellBackground.paintRowExecute();

        const bgColorFinal = cellBackground.getSpecialBgColor();
        const fontColorFinal = cellBackground.getFontColor();

        switch (cellInfo.column.ownType) {
            case ColumnType.H:
                return renderHyperlink(cellInfo, fontColorFinal, bgColorFinal);
            case ColumnType.O:
                return renderHtmlOutput(cellInfo, fontColorFinal, bgColorFinal);
            case ColumnType.C:
                return renderCharacter(
                    cellInfo,
                    fontColorFinal,
                    bgColorFinal,
                    keyExistsInInvalidCellKeys,
                    columnDefinition,
                    onOperationClick
                );
            case ColumnType.N:
                return renderNumber(cellInfo, fontColorFinal, bgColorFinal, columnDefinition, onOperationClick);
            case ColumnType.IM:
                return renderMultiImage(cellInfo);
            case ColumnType.I:
                return renderSingleImage(cellInfo);
            default:
                return undefined;
        }
    } catch (err) {
        ConsoleHelper('Error global cell render. Exception=', err);
    }
};

const renderHyperlink = (cellInfo, fontColorFinal, bgColorFinal) => {
    try {
        return (
            <a
                style={{display: 'contents', color: fontColorFinal, background: bgColorFinal}}
                href={cellInfo?.text}
                title={StringUtils.textFromHtmlString(cellInfo.text)}
                target='_blank'
                rel='noopener noreferrer'
            >
                {cellInfo?.text}
            </a>
        );
    } catch (err) {
        ConsoleHelper('Error render hyperlink. Exception=', err);
    }
};

const renderHtmlOutput = (cellInfo, fontColorFinal, bgColorFinal) => {
    try {
        return (
            <span
                style={{color: fontColorFinal, background: bgColorFinal}}
                title={StringUtils.textFromHtmlString(cellInfo.text)}
            >
                {StringUtils.textFromHtmlString(cellInfo?.text)}{' '}
            </span>
        );
    } catch (err) {
        ConsoleHelper('Error render htmloutput. Exception=', err);
    }
};

const renderNumber = (cellInfo, fontColorFinal, bgColorFinal, columnDefinition, onOperationClick) => {
    try {
        const selectionList = columnDefinition?.selectionList ? 'p-inputgroup' : null;
        const downFill = columnDefinition?.downFill;
        return showHintListButtons() && (columnDefinition.edit || selectionList) ? (
            <div className={`row tree-view-text-box`}>
                <div className={`${selectionList} col-12`}>
                    <NumberBox
                        mode={'text'}
                        isValid={true}
                        disabled={!columnDefinition.edit}
                        validationMessagePosition='left'
                        defaultValue={cellInfo?.text}
                        stylingMode={'filled'}
                        valueChangeEvent={'keyup'}
                    />
                    <MemoizedOperations
                        editListVisible={!!selectionList}
                        onOperationClick={columnDefinition.edit ? onOperationClick : () => {}}
                        fillDownVisible={!!downFill}
                    />
                </div>
            </div>
        ) : (
            <span
                style={{color: fontColorFinal, background: bgColorFinal}}
                dangerouslySetInnerHTML={{__html: cellInfo?.text}}
            />
        );
    } catch (err) {
        ConsoleHelper('Error render htmloutput. Exception=', err);
    }
};

const renderMultiImage = (cellInfo) => {
    try {
        return !!cellInfo?.text ? (
            <img alt='' height={100} src={`data:image/jpeg;base64,${cellInfo?.text}`} />
        ) : (
            <div />
        );
    } catch (err) {
        ConsoleHelper('Error render single-image. Exception=', err);
    }
};

const renderSingleImage = (cellInfo) => {
    try {
        return !!cellInfo?.text ? (
            cellInfo?.text?.split(',').map(() => (
                <div key={cellInfo?.text}>
                    <Image
                        onRemove={(e) => {
                            this.trashClicked.current = true;
                            setTimeout(function () {
                                document.getElementById('trash-button').click();
                                setTimeout(function () {
                                    document.getElementById('grid-selection-panel').click();
                                }, 0);
                            }, 0);
                        }}
                        canRemove={cellInfo?.text.length > 0}
                        base64={cellInfo?.text}
                    />
                </div>
            ))
        ) : (
            <div />
        );
    } catch (err) {
        ConsoleHelper('Error render multi-image. Exception=', err);
    }
};

const renderCharacter = (
    cellInfo,
    fontColorFinal,
    bgColorFinal,
    findInvalidCellKeys,
    columnDefinition,
    onOperationClick
) => {
    const keyExistsInInvalidCellKeys = findInvalidCellKeys
        ? findInvalidCellKeys(cellInfo.key, cellInfo?.column?.dataField)
        : false;

    if (!keyExistsInInvalidCellKeys) {
        try {
            const value = cellInfo.data[cellInfo?.column?.dataField];
            const selectionList = columnDefinition?.selectionList ? 'p-inputgroup' : null;
            const downFill = columnDefinition?.downFill;
            return showHintListButtons() && (columnDefinition.edit || selectionList) ? (
                <div className={`row tree-view-text-box`}>
                    <div className={`${selectionList} col-12`}>
                        <TextBox
                            mode={'text'}
                            isValid={true}
                            value={value}
                            validationMessagePosition='left'
                            disabled={!columnDefinition.edit}
                            defaultValue={value}
                            stylingMode={'filled'}
                            valueChangeEvent={'keyup'}
                        />
                        <MemoizedOperations
                            editListVisible={!!selectionList}
                            onOperationClick={columnDefinition.edit ? onOperationClick : () => {}}
                            fillDownVisible={!!downFill}
                        />
                    </div>
                </div>
            ) : (
                <div
                    title={StringUtils.textFromHtmlString(value)}
                    className={isWart(cellInfo?.column?.dataField) ? 'WART' : ''}
                    style={{color: fontColorFinal, background: bgColorFinal}}
                    dangerouslySetInnerHTML={{__html: cellInfo?.text}}
                />
            );
        } catch (err) {
            ConsoleHelper('Error render htmloutput. Exception=', err);
        }
    } else {
        try {
            return (
                <TextBox
                    className='tex-box-view-field-invalid'
                    mode={'text'}
                    isValid={false}
                    validationMessagePosition='left'
                    defaultValue={cellInfo?.text}
                    stylingMode={'filled'}
                    valueChangeEvent={'keyup'}
                />
            );
        } catch (err) {
            ConsoleHelper('Error render htmloutput. Exception=', err);
        }
    }
};

const isWart = (dataField) => {
    if (dataField) {
        return dataField.toUpperCase() === 'WART';
    }
    return false;
};

const showHintListButtons = () => {
    const showHintListButtons = useStore.getState().showHintListButtons;
    return showHintListButtons;
};

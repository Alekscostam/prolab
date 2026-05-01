import {CheckBox, NumberBox, TextBox} from 'devextreme-react';
import {ColumnType} from '../../enum/ColumnType';
import CellCustomBackground from '../../model/CellCustomBackground';
import ConsoleHelper from '../../utils/ConsoleHelper';
import Image from '../../components/Image';
import {StringUtils} from '../../utils/StringUtils';
import useStore from '../../store';
import {MemoizedOperations} from '../../components/memoized/MemoizedOperations';
import {ViewDataCompUtils} from '../../utils/component/ViewDataCompUtils';
import {ResultType} from '../../model/CellValidator';
import {Button} from 'primereact/button';
import OperationCell from '../../enum/OperationCell';

export const cellRenderSpecial = (cellInfo, columnDefinition, keyExistsInValidationCellKeys, onOperationClick) => {
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
                    keyExistsInValidationCellKeys,
                    columnDefinition,
                    onOperationClick
                );
            case ColumnType.N:
                return renderNumber(cellInfo, fontColorFinal, bgColorFinal, columnDefinition, onOperationClick);
            case ColumnType.IM:
                return renderMultiImage(cellInfo);
            case ColumnType.I:
                return renderSingleImage(cellInfo, columnDefinition, onOperationClick);
            case ColumnType.B:
                return renderBoolean(cellInfo);
            case ColumnType.L:
                return renderLogic(cellInfo);
            default:
                return undefined;
        }
    } catch (err) {
        ConsoleHelper('Error global cell render. Exception=', err);
    }
};

const renderBoolean = (cellInfo) => {
    try {
        const checked = ViewDataCompUtils.conditionForTrueValueForBoolType(cellInfo.text);
        return <CheckBox value={checked} disabled={true} />;
    } catch (err) {
        ConsoleHelper('Error render boolean. Exception=', err);
    }
};

const renderLogic = (cellInfo) => {
    try {
        const checked = ViewDataCompUtils.conditionForTrueValueForLogicType(cellInfo.text);
        return <CheckBox value={checked} disabled={true} />;
    } catch (err) {
        ConsoleHelper('Error render logic. Exception=', err);
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
        const value = cellInfo.data[cellInfo?.column?.dataField];
        return showHintListButtons() && (columnDefinition.edit || selectionList) ? (
            <div className={`row tree-view-text-box`}>
                <div className={`${selectionList} col-12`}>
                    <NumberBox
                        mode={'text'}
                        isValid={true}
                        disabled={!columnDefinition.edit}
                        validationMessagePosition='left'
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
            <span style={{color: fontColorFinal, background: bgColorFinal}} dangerouslySetInnerHTML={{__html: value}} />
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

const renderSingleImage = (cellInfo, columnDefinition, onOperationClick) => {
    try {
        return !!cellInfo?.text ? (
            cellInfo?.text?.split(',').map(() => (
                <div className='cell-image' key={cellInfo?.text}>
                    <Image
                        onRemove={(e) => {
                            onOperationClick(true);
                        }}
                        onImageClick={() => {
                            if (onOperationClick && !cellInfo.edit) {
                                onOperationClick();
                            }
                        }}
                        canRemove={columnDefinition.edit ? cellInfo?.text.length > 0 : false}
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
    findValidationCellKeys,
    columnDefinition,
    onOperationClick
) => {
    const keyExistsInValidationCellKeys = findValidationCellKeys
        ? findValidationCellKeys(cellInfo.key, cellInfo?.column?.dataField)
        : false;

    const value = cellInfo.data[cellInfo?.column?.dataField];
    const selectionList = columnDefinition?.selectionList ? 'p-inputgroup' : null;
    const downFill = columnDefinition?.downFill;
    if (!keyExistsInValidationCellKeys) {
        try {
            return showHintListButtons() && (columnDefinition.edit || selectionList) ? (
                <div className='row tree-view-text-box'>
                    <div className={`${selectionList} col-12 d-flex align-items-center`}>
                        <TextBox
                            mode='text'
                            isValid={true}
                            value={value}
                            validationMessagePosition='left'
                            disabled={!columnDefinition.edit}
                            defaultValue={value}
                            stylingMode='filled'
                            valueChangeEvent='keyup'
                            className='flex-grow-1'
                        />
                        <MemoizedOperations
                            editListVisible={!!selectionList}
                            onOperationClick={columnDefinition.edit ? onOperationClick : () => {}}
                            fillDownVisible={!!downFill}
                            className='ms-2'
                        />
                    </div>
                </div>
            ) : (
                <div
                    title={StringUtils.textFromHtmlString(value)}
                    className={isWart(cellInfo?.column?.dataField) ? 'WART' : ''}
                    style={{color: fontColorFinal, background: bgColorFinal, lineHeight: '14px'}}
                    dangerouslySetInnerHTML={{__html: value}}
                />
            );
        } catch (err) {
            ConsoleHelper('Error render htmloutput. Exception=', err);
        }
    } else {
        try {
            const field = findValidationCellKeys(cellInfo.key, cellInfo?.column?.dataField);
            switch (field.type) {
                case ResultType.NOK:
                    return (
                        <div className='row tree-view-text-box'>
                            <div className={`${selectionList} col-12 d-flex align-items-center`}>
                                <TextBox
                                    mode='text'
                                    isValid={true}
                                    value={value}
                                    validationMessagePosition='left'
                                    disabled={!columnDefinition.edit}
                                    defaultValue={value}
                                    stylingMode='filled'
                                    valueChangeEvent='keyup'
                                    className='flex-grow-1 '
                                />

                                <Button
                                    type='button'
                                    severity='danger'
                                    style={{maxWidth: '41px', backgroundColor: 'red'}}
                                    onClick={() => onOperationClick(false, 'REASON')}
                                    icon='mdi mdi-help'
                                    className='p-button-danger invalid-field'
                                />
                                <MemoizedOperations
                                    editListVisible={!!selectionList}
                                    onOperationClick={columnDefinition.edit ? onOperationClick : () => {}}
                                    fillDownVisible={!!downFill}
                                    className='ms-2'
                                />
                            </div>
                        </div>
                    );
                case ResultType.OK:
                    return (
                        <div className='row tree-view-text-box'>
                            <div className={`${selectionList} col-12 d-flex align-items-center`}>
                                <TextBox
                                    mode='text'
                                    isValid={true}
                                    value={value}
                                    validationMessagePosition='left'
                                    disabled={!columnDefinition.edit}
                                    defaultValue={value}
                                    stylingMode='filled'
                                    valueChangeEvent='keyup'
                                    className='flex-grow-1'
                                />
                                <Button
                                    severity='danger'
                                    type='button'
                                    style={{maxWidth: '41px', backgroundColor: 'green'}}
                                    onClick={() => onOperationClick(false, 'REASON')}
                                    icon='mdi mdi-help'
                                    className='p-button-danger'
                                />
                                <MemoizedOperations
                                    editListVisible={!!selectionList}
                                    onOperationClick={columnDefinition.edit ? onOperationClick : () => {}}
                                    fillDownVisible={!!downFill}
                                    className='ms-2'
                                />
                            </div>
                        </div>
                    );
                case ResultType.REGEX:
                default:
                    return (
                        <TextBox
                            className='tex-box-view-field-invalid invalid-field'
                            mode={'text'}
                            isValid={false}
                            validationMessagePosition='left'
                            defaultValue={cellInfo?.text}
                            stylingMode={'filled'}
                            valueChangeEvent={'keyup'}
                        />
                    );
            }
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

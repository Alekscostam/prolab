import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../../components/Image';
import {StringUtils} from '../StringUtils';
import {ViewDataCompUtils} from './ViewDataCompUtils';
import EditRowUtils from '../EditRowUtils';
import {ColumnType} from '../../model/ColumnType';

let _rowIndex = null;
let _bgColor = null;
let _fontcolor = null;
const _FONTCOLOR = '_FONTCOLOR';
const _BGCOLOR = '_BGCOLOR';

export class DataGridUtils extends ViewDataCompUtils {
    static clearProperties() {
        _rowIndex = null;
        _bgColor = null;
        _fontcolor = null;
    }
    static cellTemplate(column, isEditableCell, onImageClick, onEditorClick) {
        return function (element, info) {
            const className = info?.data?.SKASOWANY === 1 ? 'deleted-row' : '';
            let bgColorFinal = undefined;
            let rowSelected = null;

            if (_rowIndex !== info.row.dataIndex) {
                rowSelected =
                    info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
                _rowIndex = info.row.dataIndex;
                _bgColor = info.data[_BGCOLOR];
                _fontcolor = info.data[_FONTCOLOR];
            } else {
                _bgColor = info.data[_BGCOLOR];
                _fontcolor = info.data[_FONTCOLOR];
            }
            if (!!rowSelected) {
                bgColorFinal = undefined;
            } else {
                const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
                if (!!specialBgColor) {
                    bgColorFinal = specialBgColor;
                } else {
                    if (_bgColor) {
                        element.style.backgroundColor = _bgColor;
                        bgColorFinal = undefined;
                    }
                }
            }

            let fontColorFinal = 'black';
            const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
            if (!!specialFontColor) {
                fontColorFinal = specialFontColor;
            } else {
                if (!info.data[_FONTCOLOR]) {
                    _fontcolor = '#00000';
                }
                if (!!_fontcolor) {
                    fontColorFinal = _fontcolor;
                }
            }
            switch (column?.type) {
                case ColumnType.O:
                    return ReactDOM.render(
                        <div
                            className={className}
                            onClick={() => {
                                if (StringUtils.isEmpty(info.text)) {
                                    return;
                                }
                                if (onEditorClick) {
                                    onEditorClick(info.text, info.column?.caption);
                                }
                            }}
                            style={{
                                cursor: StringUtils.isEmpty(info.text) ? 'default' : 'pointer',
                                whiteSpace: info.column.allowWrapping ? 'wrap' : 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: info.column.allowWrapping ? '18px' : '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={StringUtils.textFromHtmlString(info.text)}
                        >
                            {StringUtils.textFromHtmlString(info.text)}
                        </div>,
                        element
                    );
                case ColumnType.C:
                case ColumnType.N:
                case ColumnType.D:
                case ColumnType.E:
                case ColumnType.T:
                    return ReactDOM.render(
                        <div
                            className={className}
                            style={{
                                // display: 'inline',
                                whiteSpace: info.column.allowWrapping ? 'wrap' : 'nowrap',
                                // maxWidth: column.width + 'px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: info.column.allowWrapping ? '18px' : '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={StringUtils.textFromHtmlString(info.text)}
                        >
                            {StringUtils.textFromHtmlString(info.text)}
                        </div>,
                        element
                    );
                case ColumnType.H:
                    return ReactDOM.render(
                        <div
                            className={className}
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <a href={info.value} rel='noopener noreferrer' target='_blank'>
                                {info.text}
                            </a>
                        </div>,
                        element
                    );

                case ColumnType.B:
                    return ReactDOM.render(
                        <div
                            className={className}
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                onChange={(e) => {
                                    setTimeout(function () {
                                        const id = `${EditRowUtils.getType(column?.type)}${column.id}`;
                                        const checkbox = document.getElementById(id);
                                        if (checkbox) {
                                            checkbox.click();
                                        }
                                    }, 100);
                                }}
                                readOnly={true}
                                checked={DataGridUtils.conditionForTrueValueForBoolType(info.text)}
                            />
                        </div>,
                        element
                    );
                case ColumnType.L:
                    return ReactDOM.render(
                        <div
                            className={className}
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                onChange={(e) => {
                                    setTimeout(function () {
                                        const id = `${EditRowUtils.getType(column?.type)}${column.id}`;
                                        const checkbox = document.getElementById(id);
                                        if (checkbox) checkbox.click();
                                    }, 100);
                                }}
                                readOnly={true}
                                checked={DataGridUtils.conditionForTrueValueForLogicType(info.text)}
                            />
                        </div>,
                        element
                    );
                case ColumnType.I:
                case ColumnType.IM:
                    if (Array.isArray(info.text) && info.text?.length > 0) {
                        return ReactDOM.render(
                            <div
                                className='cursor-pointer'
                                style={{
                                    display: 'inline',
                                    backgroundColor: bgColorFinal,
                                    color: fontColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                {info.text?.map((i, index) => {
                                    return (
                                        <Image
                                            onImageClick={(base64) => {
                                                if (onImageClick) {
                                                    onImageClick(base64, info.column?.caption);
                                                }
                                            }}
                                            style={{maxWidth: '100%'}}
                                            key={index}
                                            base64={info.text}
                                        />
                                    );
                                })}
                            </div>,
                            element
                        );
                    } else {
                        return ReactDOM.render(
                            <div
                                className='cursor-pointer'
                                style={{
                                    display: 'inline',
                                    backgroundColor: bgColorFinal,
                                    color: fontColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                <Image
                                    onImageClick={(base64) => {
                                        if (onImageClick) {
                                            onImageClick(base64, info.column?.caption);
                                        }
                                    }}
                                    onRemove={() => {
                                        setTimeout(function () {
                                            const trashButton = document.getElementById('trash-button');
                                            if (trashButton) {
                                                trashButton.click();
                                            }
                                        }, 300);
                                    }}
                                    canRemove={isEditableCell && info.text?.length > 0}
                                    base64={info.text}
                                />
                            </div>,
                            element
                        );
                    }
                default:
                    return ReactDOM.render(
                        <div
                            className={className}
                            style={{
                                display: 'inline',
                                backgroundColor: bgColorFinal,
                                color: fontColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
            }
        };
    }
}

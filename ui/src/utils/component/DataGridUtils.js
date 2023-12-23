import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../../components/Image';
import {StringUtils} from '../StringUtils';
import {ViewDataCompUtils} from './ViewDataCompUtils';
import EditRowUtils from '../EditRowUtils';

let _rowIndex = null;
let _bgColor = null;
let _fontcolor = null;

export class DataGridUtils extends ViewDataCompUtils {
    // TODO: jesli chcemy tu utilsa to musi byc czyszczenie, bo np. let _rowIndex = null nie sa constami!!!
    static clearProperties() {
        _rowIndex = null;
        _bgColor = null;
        _fontcolor = null;
    }
    static cellTemplate(column, isEditableCell) {
        return function (element, info) {
            let bgColorFinal = undefined;
            let rowSelected = null;
            if (_rowIndex !== info.row.dataIndex) {
                rowSelected =
                    info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
                _rowIndex = info.row.dataIndex;
                _bgColor = info.data['_BGCOLOR'];
                _fontcolor = info.data['_FONTCOLOR'];
            } else {
                _bgColor = info.data['_BGCOLOR'];
                _fontcolor = info.data['_FONTCOLOR'];
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
                if (!info.data['_FONTCOLOR']) {
                    _fontcolor = '#00000';
                }
                if (!!_fontcolor) {
                    fontColorFinal = _fontcolor;
                }
            }
            switch (column?.type) {
                case 'C':
                case 'N':
                case 'D':
                case 'E':
                case 'O':
                case 'T':
                    return ReactDOM.render(
                        <div
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
                case 'H':
                    return ReactDOM.render(
                        <div
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
                                {info.text}{' '}
                            </a>
                        </div>,
                        element
                    );

                case 'B':
                    return ReactDOM.render(
                        <div
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
                                        checkbox.click();
                                    }, 100);
                                }}
                                readOnly={true}
                                checked={DataGridUtils.conditionForTrueValueForBoolType(info.text)}
                            />
                        </div>,
                        element
                    );
                case 'L':
                    return ReactDOM.render(
                        <div
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
                                readOnly={true}
                                onChange={(e) => {
                                    setTimeout(function () {
                                        const id = `${EditRowUtils.getType(column?.type)}${column.id}`;
                                        const checkbox = document.getElementById(id);
                                        checkbox.click();
                                    }, 100);
                                }}
                                checked={DataGridUtils.conditionForTrueValueForLogicType(info.text)}
                            />
                        </div>,
                        element
                    );
                case 'I':
                case 'IM':
                    if (Array.isArray(info.text) && info.text?.length > 0) {
                        return ReactDOM.render(
                            <div
                                style={{
                                    display: 'inline',
                                    backgroundColor: bgColorFinal,
                                    color: fontColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                {info.text?.map((i, index) => {
                                    return <Image style={{maxWidth: '100%'}} key={index} base64={info.text} />;
                                })}
                            </div>,
                            element
                        );
                    } else {
                        const imageStyle = isEditableCell ? {maxHeight: '76px'} : {maxHeight: '26px'};
                        return ReactDOM.render(
                            <div
                                style={{
                                    display: 'inline',
                                    backgroundColor: bgColorFinal,
                                    color: fontColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                <Image
                                    onRemove={() => {
                                        setTimeout(function () {
                                            const trashButton = document.getElementById('trash-button');
                                            if (trashButton) {
                                                trashButton.click();
                                            }
                                        }, 300);
                                    }}
                                    canRemove={isEditableCell && info.text?.length > 0}
                                    style={imageStyle}
                                    base64={info.text}
                                />
                            </div>,
                            element
                        );
                    }
                default:
                    return ReactDOM.render(
                        <div
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

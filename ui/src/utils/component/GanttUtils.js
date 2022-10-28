import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../../components/Image';
import Constants from '../Constants';
import {StringUtils} from '../StringUtils';
import {ViewDataCompUtils} from './ViewDataCompUtils';

let _rowIndex = null;
let _bgcolor = null;
let _fontcolor = null;

export class GanttUtils extends ViewDataCompUtils {
    static specifyColumnType(type) {
        if (type) {
            switch (type) {
                case 'C':
                    return 'string';
                case 'N':
                    return 'number';
                case 'B':
                    return 'boolean';
                case 'L':
                    return 'boolean';
                case 'D':
                    return 'date';
                case 'E':
                    return 'datetime';
                case 'T':
                    return 'datetime';
                case 'O':
                case 'H':
                    return 'string';
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static specifyColumnFormat(format) {
        if (format) {
            switch (format) {
                case 'D':
                    return Constants.DATE_FORMAT.DATE_FORMAT;
                case 'E':
                    return Constants.DATE_FORMAT.DATE_TIME_FORMAT;
                case 'T':
                    return Constants.DATE_FORMAT.TIME_FORMAT;
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static cellTemplateAfterSelected() {
        return function (element, info) {
            element.style.backgroundColor = '#dde6ff';
            // element.style.color="red"
            return ReactDOM.render(
                <div
                    style={{
                        display: 'inline',
                        color: 'black',
                        borderRadius: '25px',
                        padding: '2px 6px 2px 6px',
                    }}
                    title={info.text}
                >
                    {info.text}
                </div>,
                element
            );
        };
    }

    static cellTemplate(column) {
        return function (element, info) {
            if (_rowIndex !== info.row.dataIndex) {
                _rowIndex = info.row.dataIndex;
                _bgcolor = info.data['_BGCOLOR'];
                _fontcolor = info.data['_FONTCOLOR'];
            }

            if (_bgcolor) element.style.backgroundColor = _bgcolor;

            let fontColorFinal = 'black';
            let bgColorFinal = '';

            if (!!_fontcolor) {
                fontColorFinal = _fontcolor;
            }
            if (!!_bgcolor) {
                bgColorFinal = _bgcolor;
            }

            switch (column?.type) {
                case 'C':
                case 'N':
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
                case 'D':
                case 'E':
                case 'T':
                case 'H':
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            {info.text}
                        </div>,
                        element
                    );
                case 'O':
                    element.innerHTML =
                        '<div className="limited-text" id="innerHTML" ' +
                        'title="' +
                        StringUtils.textFromHtmlString(info.text) +
                        '"  ' +
                        'style=' +
                        'border-radius: 25px; ' +
                        'padding: 2px 6px 2px 6px; ' +
                        'background-color: ' +
                        bgColorFinal +
                        '; ' +
                        'color: ' +
                        fontColorFinal +
                        ';">' +
                        '<p style="" >' +
                        info.text +
                        '</p>' +
                        '</div>';
                    break;
                case 'B':
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                readOnly={true}
                                checked={GanttUtils.conditionForTrueValueForBoolType(info.text)}
                            />
                        </div>,
                        element
                    );
                case 'L':
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px',
                            }}
                            title={info.text}
                        >
                            <input
                                type='checkbox'
                                readOnly={true}
                                checked={GanttUtils.conditionForTrueValueForLogicType(info.text)}
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
                                    color: fontColorFinal,
                                    backgroundColor: bgColorFinal,
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
                        return ReactDOM.render(
                            <div
                                style={{
                                    display: 'inline',
                                    color: fontColorFinal,
                                    backgroundColor: bgColorFinal,
                                    borderRadius: '25px',
                                    padding: '2px 0px 2px 0px',
                                }}
                            >
                                <Image style={{maxHeight: '26px'}} base64={info.text} />
                            </div>,
                            element
                        );
                    }
                default:
                    return ReactDOM.render(
                        <div
                            style={{
                                display: 'inline',
                                color: fontColorFinal,
                                backgroundColor: bgColorFinal,
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

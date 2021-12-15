import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../components/Image';
import Constants from './Constants';

let _rowIndex = null;
let _bgColor = null;
let _fontcolor = null;

export class GridViewUtils {
    static containsOperationButton(operations, type) {
        for (let button in operations) {
            if (operations[button]
                && operations[button].type
                && operations[button].type.toUpperCase() === type.toUpperCase()) {
                return operations[button];
            }
        }
        return null;
    }

    static getURLParameters(paramName) {
        let sURL = window.document.URL.toString();
        if (sURL.indexOf('?') > 0) {
            let arrParams = sURL.split('?');
            let arrURLParams = arrParams[1].split('&');
            let arrParamNames = new Array(arrURLParams.length);
            let arrParamValues = new Array(arrURLParams.length);
            let i;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split('=');
                arrParamNames[i] = sParam[0];
                if (sParam[1] !== '') arrParamValues[i] = unescape(sParam[1]);
                else arrParamValues[i] = null;
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] === paramName) {
                    //alert("Parameter:" + arrParamValues[i]);
                    return arrParamValues[i];
                }
            }
            return null;
        }
    }

    static getViewIdFromURL() {
        let url = window.document.URL.toString();
        var regexp = new RegExp('^.+\\/grid-view\\/([0-9]+)([\\?|\\/]+.*)?$', 'g');
        let match = regexp.exec(url);
        if (match) {
            return match[1];
        }
    }

    /*
    Typ kolumny:
        C – Znakowy
        N – Numeryczny/Liczbowy
        B – Logiczny (0/1)
        L – Logiczny (T/N)
        D – Data
        E – Data + czas
        T – Czas
        O – Opisowe
        I – Obrazek
        IM – Obrazek multi
        H - Hyperlink
     */
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

    static specifyEditorOptions(format) {
        if (format) {
            switch (format) {
                case 'T':
                    return {type: "time"};
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static conditionForTrueValueForLogicType(text) {
        return text === "T" || text === "t";
    }

    static conditionForTrueValueForBoolType(text) {
        return text === "1" || text === 1;
    }

    static cellTemplate(column) {
        return function (element, info) {

            let bgColorFinal = undefined;
            let rowSelected = null;
            if (_rowIndex !== info.row.dataIndex) {
                rowSelected = info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
                _rowIndex = info.row.dataIndex;
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
            if (!!_fontcolor) {
                fontColorFinal = _fontcolor;
            } else {
                const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
                if (!!specialFontColor) {
                    fontColorFinal = specialFontColor;
                }
            }
            switch (column?.type) {
                case 'C':
                case "N":
                case 'D':
                case 'E':
                case 'T':
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
                            {info.text}
                        </div>,
                        element
                    );
                case 'O':
                    element.innerHTML
                        = '<div id="innerHTML" style="' +
                        // 'display: inline; ' +
                        'border-radius: 25px; ' +
                        'padding: 2px 6px 2px 6px; ' +
                        'background-color: ' + bgColorFinal + '; ' +
                        'color: ' + fontColorFinal + ';">' + info.text + '' +
                        '</div>'
                    break;
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
                            <input type="checkbox" readOnly={true}
                                   checked={GridViewUtils.conditionForTrueValueForBoolType(info.text)}/>
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
                            <input type="checkbox" readOnly={true}
                                   checked={GridViewUtils.conditionForTrueValueForLogicType(info.text)}/>
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
                                    return <Image style={{maxWidth: '100%'}} key={index} base64={info.text}/>;
                                })}
                            </div>,
                            element
                        );
                    } else {
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
                                <Image style={{maxHeight: '26px'}} base64={info.text}/>
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

    static equalString(s1, s2) {
        if (
            (s1 === null || s1 === undefined || s1 === 'undefined') &&
            (s2 === null || s2 === undefined || s2 === 'undefined')
        ) {
            return true;
        }
        return s1 === s2;
    }

    static equalNumbers(n1, n2) {
        if (
            (n1 === null || n1 === undefined || n1 === 'undefined') &&
            (n2 === null || n2 === undefined || n2 === 'undefined')
        ) {
            // ConsoleHelper('equalNumbers: result=' + true + ' {' + n1 + ', ' + n2 + '}' );
            return true;
        }
        let num1, num2;
        if (typeof n1 === 'number') {
            num1 = n1;
        } else {
            num1 = parseInt(n1);
        }
        if (typeof n2 === 'number') {
            num2 = n2;
        } else {
            num2 = parseInt(n2);
        }
        return num1 === num2;
    }

    static notEqualNumbers(n1, n2) {
        return !GridViewUtils.equalNumbers(n1, n2)
    }

    static getDefaultSortOrder(value) {
        if (value !== undefined && value !== null) {
            switch (value.toUpperCase()) {
                case true:
                    return 'asc';
                case false:
                    return 'desc';
                default:
                    return null;
            }
        }
        return null;
    }

    static getRealViewId(elementSubViewId, elementId) {
        return elementSubViewId ? elementSubViewId : elementId
    }

}

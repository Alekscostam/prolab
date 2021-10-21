import {CheckBox} from 'devextreme-react';
import React from 'react';
import ReactDOM from 'react-dom';
import Image from '../components/Image';
import Constants from './Constants';

export class GridViewUtils {
    static containsOperationButton(operations, type) {
        for (let button in operations) {
            if (operations[button].type === type) {
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
            let i = 0;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split('=');
                arrParamNames[i] = sParam[0];
                if (sParam[1] != '') arrParamValues[i] = unescape(sParam[1]);
                else arrParamValues[i] = null;
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] == paramName) {
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

    //TODO dopracować
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
                    return 'datetime';
                case 'E':
                    return 'datetime';
                case 'T':
                    return 'datetime';
                case 'O':
                case 'H':
                    return 'string';
            }
        }
        return undefined;
    }

    //TODO dopracować
    static specifyColumnFormat(format) {
        if (format) {
            switch (format) {
                case 'D':
                    return Constants.DATE_FORMAT.DATE_FORMAT;
                case 'E':
                    return Constants.DATE_FORMAT.DATE_TIME_FORMAT;
                case 'T':
                    return Constants.DATE_FORMAT.TIME_FORMAT;
            }
        }
        return undefined;
    }

    static specifyCellTemplate(template) {
        if (template) {
            switch (template) {
                case 'I':
                    return function (element, info) {
                        ReactDOM.render(
                            <div>
                                <Image style='display: block; width: 100%;' base64={info.text}/>
                            </div>,
                            element
                        );
                    };
                case 'IM':
                    return function (element, info) {
                        ReactDOM.render(<div>{info.text}</div>, element);
                    };
            }
        }
        return undefined;
    }

    static cellTemplate(column) {
        return function (element, info) {
            let bgColorFinal = undefined;
            const bgColor = info.data['_BGCOLOR'];
            const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
            if (bgColor) {
                element.style.backgroundColor = bgColor;
                bgColorFinal = undefined;
            }
            if (specialBgColor) {
                bgColorFinal = specialBgColor;
            }
            const rowSelected =
                info?.row?.cells?.filter((c) => c.column?.type === 'selection' && c.value === true).length > 0;
            if (rowSelected) {
                bgColorFinal = undefined;
            }

            let fontColorFinal = 'black';
            const fontColor = info.data['_FONTCOLOR'];
            const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
            if (fontColor) {
                fontColorFinal = fontColor;
            } else {
                if (specialFontColor) {
                    fontColorFinal = specialFontColor;
                }
            }
            if (!!info.text) {
                switch (column?.type) {
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
                                    {info.text?.map((i) => {
                                        return <Image style={{maxWidth: '100%'}} base64={info.text}/>;
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
                                    <Image style={{maxWidth: '100%'}} base64={info.text}/>
                                </div>,
                                element
                            );
                        }
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
                                <CheckBox readOnly={true} value={parseInt(info.text) === 1}/>
                            </div>,
                            element
                        );
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
            } else {
                return ReactDOM.render(
                    <div
                        style={{
                            display: 'inline',
                            backgroundColor: bgColorFinal,
                            color: fontColorFinal,
                            borderRadius: '25px',
                            padding: '2px 6px 2px 6px',
                        }}
                    ></div>,
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
            //console.log('equalNumbers: result=' + true + ' {' + n1 + ', ' + n2 + '}' );
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
        const result = num1 === num2;
        //console.log('equalNumbers: result=' + result + ' [' + n1 + ', ' + n2 + '] [' + typeof n1 + ', ' + typeof n2 + ']' );
        return result;
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
        const viewId = elementSubViewId ? elementSubViewId : elementId;
        return viewId
    }

}

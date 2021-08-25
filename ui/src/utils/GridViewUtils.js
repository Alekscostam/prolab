import Constants from "./constants";
import ReactDOM from "react-dom";
import React from "react";
import ShortcutButton from "../components/ShortcutButton";
import ActionButtonWithMenu from "../components/ActionButtonWithMenu";
import AppPrefixUtils from "./AppPrefixUtils";
import ViewService from "../services/ViewService";

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
        if (sURL.indexOf("?") > 0) {
            let arrParams = sURL.split("?");
            let arrURLParams = arrParams[1].split("&");
            let arrParamNames = new Array(arrURLParams.length);
            let arrParamValues = new Array(arrURLParams.length);
            let i = 0;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split("=");
                arrParamNames[i] = sParam[0];
                if (sParam[1] != "")
                    arrParamValues[i] = unescape(sParam[1]);
                else
                    arrParamValues[i] = null;
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
                        let srcFromBase64 = 'data:image/png;base64' + info.text + '"';
                        ReactDOM.render(
                            <div>
                                <img src={srcFromBase64} style='display: block; width: 100%;'/>
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
        switch (column?.type) {
            case 'I':
            case 'IM':
                return (element, info) => {
                    if (!!info.text) {
                        if (Array.isArray(info.text) && info.text?.length > 0) {
                            let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                            ReactDOM.render(
                                <div>
                                    {info.text?.map((i) => {
                                        return (
                                            <img style={{width: '100%'}} src={srcFromBase64}></img>
                                        );
                                    })}
                                </div>,
                                element
                            );
                        } else {
                            let srcFromBase64 = 'data:image/png;base64,' + info.text + '';
                            ReactDOM.render(
                                <div>
                                    <img style={{width: '100%'}} src={srcFromBase64}></img>
                                </div>,
                                element
                            );
                        }
                    }
                }
            default:
                return (element, info) => {
                    let bgColor = 'white';
                    let specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField]
                    if (specialBgColor) {
                        bgColor = specialBgColor;
                    } else {
                        let defaultBgColor = info.data['_BGCOLOR'];
                        if (defaultBgColor) {
                            bgColor = defaultBgColor;
                        }
                    }
                    let fontColor = 'black';
                    let specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField]
                    if (specialFontColor) {
                        fontColor = specialBgColor;
                    } else {
                        let defaultFontColor = info.data['_FONTCOLOR'];
                        if (defaultFontColor) {
                            fontColor = defaultFontColor;
                        }
                    }
                    if (!!info.text) {
                        ReactDOM.render(
                            <div style={{
                                display: 'inline',
                                backgroundColor: bgColor,
                                color: fontColor,
                                borderRadius: '25px',
                                padding: '2px 6px 2px 6px'
                            }}>
                                {info.text}
                            </div>,
                            element
                        );
                    }
                }
        }
    }

    static renderAction(_this, columns) {
        if (_this.state.parsedGridView?.operations) {
            let showEditButton = false;
            let showSubviewButton = false;
            let menuItems = [];
            _this.state.parsedGridView?.operations.forEach((operation) => {
                showEditButton = showEditButton || operation.type === 'OP_EDIT';
                //OP_SUBVIEWS
                showSubviewButton = showSubviewButton || operation.type === 'OP_SUBVIEWS';
                if (
                    operation.type === 'OP_PUBLIC' ||
                    operation.type === 'OP_HISTORY' ||
                    operation.type === 'OP_ATTACHMENTS'
                ) {
                    menuItems.push(operation);
                }
            });
            let showMenu = menuItems.length > 0;
            let widthTmp = 0;
            if (showMenu) {
                widthTmp += 45;
            }
            if (showEditButton) {
                widthTmp += 45;
            }
            if (showSubviewButton) {
                widthTmp += 45;
            }
            if (showEditButton || showMenu || showSubviewButton) {
                columns?.push({
                    caption: 'Akcje',
                    width: widthTmp,
                    fixed: true,
                    fixedPosition: 'right',
                    cellTemplate: (element, info) => {
                        let el = document.createElement('div');
                        el.id = `actions-${info.column.headerId}-${info.rowIndex}`;
                        element.append(el);
                        ReactDOM.render(
                            <div style={{textAlign: 'center'}}>
                                <ShortcutButton
                                    id={`${info.column.headerId}_menu_button`}
                                    className={`action-button-with-menu mr-1`}
                                    iconName={'mdi-pencil'}
                                    label={''}
                                    title={'Edycja'}
                                    rendered={showEditButton}
                                />
                                <ActionButtonWithMenu
                                    id='more_shortcut'
                                    iconName='mdi-dots-horizontal'
                                    className={`mr-1`}
                                    items={menuItems}
                                    remdered={showMenu}
                                    title={'Dodatkowe opcje'}
                                />
                                <ShortcutButton
                                    id={`${info.column.headerId}_menu_button`}
                                    className={`action-button-with-menu mr-1`}
                                    iconName={'mdi-playlist-plus '}
                                    label={''}
                                    title={'Podwidoki'}
                                    handleClick={(e) => {
                                        //TODO redundantion
                                        console.log(_this.state)
                                        new ViewService()
                                            .getSubView(_this.state.elementId, info.row?.data?.ID)
                                            .then((subViewResponse) => {
                                                _this.setState({subView: subViewResponse}, () => {
                                                    let viewInfoId = _this.state.subView.viewInfo?.ID;
                                                    let subViewId = _this.state.subView.subViews[0]?.ID;
                                                    let recordId = info.row?.data?.ID;
                                                    window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewInfoId}?recordId=${recordId}&subview=${subViewId}`);
                                                    _this.unblockUi();
                                                });
                                            })
                                            .catch((err) => {
                                                _this.handleGetDetailsError(err);
                                            });
                                    }}
                                    rendered={showSubviewButton}
                                />
                            </div>,
                            element
                        );
                    },
                });
            }
        }
    }


}
import React from 'react';
import ReactDOM from 'react-dom';
import Constants from '../Constants';
import {ViewDataCompUtils} from './ViewDataCompUtils';

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
    static paintDatas = (datas) => {
        datas.forEach((data) => {
            this.recursionPainting(data, 100, datas);
        });
        return datas;
    };

    static recursionPainting = (data, value, datas) => {
        if (!data._LINE_COLOR_GRADIENT) {
            data._LINE_COLOR_GRADIENT = [value];
        } else {
            data._LINE_COLOR_GRADIENT.push(value);
        }
        const childrens = datas.filter((el) => {
            if (!data.ID) {
                return false;
            }
            return data.ID === el.ID_PARENT;
        });
        if (childrens.length) {
            childrens.forEach((children) => {
                this.recursionPainting(children, value - 10, datas);
            });
        }
    };
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
}

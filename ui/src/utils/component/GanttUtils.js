import React from 'react';
import ReactDOM from 'react-dom';
import {ViewDataCompUtils} from './ViewDataCompUtils';

export class GanttUtils extends ViewDataCompUtils {
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

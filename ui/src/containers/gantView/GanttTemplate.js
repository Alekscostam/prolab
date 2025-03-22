import {ColumnType} from '../../enum/ColumnType';
import {GanttUtils} from '../../utils/component/GanttUtils';
import {StringUtils} from '../../utils/StringUtils';
import Image from '../../components/Image';
import ReactDOM from 'react-dom';
import {OperationType} from '../../enum/OperationType';

let _rowIndex = null;
let _bgcolor = null;
let _fontcolor = null;

export const cellTemplate = (column) => {
    return function (element, info) {
        if (_rowIndex !== info.row.dataIndex) {
            _rowIndex = info.row.dataIndex;
            _bgcolor = info.data['_BGCOLOR'];
            _fontcolor = info.data['_FONTCOLOR'];
        }
        if (_bgcolor) {
            element.style.backgroundColor = _bgcolor;
        }

        let fontColorFinal = 'black';
        let bgColorFinal = '';

        if (!!_fontcolor) {
            fontColorFinal = _fontcolor;
        }
        if (!!_bgcolor) {
            bgColorFinal = _bgcolor;
        }
        const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
        const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
        if (specialBgColor) {
            bgColorFinal = specialBgColor;
        }
        if (specialFontColor) {
            fontColorFinal = specialFontColor;
        }

        switch (column?.type) {
            case ColumnType.C:
            case ColumnType.N:
            case ColumnType.D:
            case ColumnType.E:
            case ColumnType.T:
            case ColumnType.H:
                return renderCell(element, info.text, fontColorFinal, bgColorFinal);
            case ColumnType.O:
            case ColumnType.OH:
                return renderWithoutHtmlCell(element, info.text, fontColorFinal, bgColorFinal, column.width);
            case ColumnType.CH:
                return renderHtmlCell(element, info.text, fontColorFinal, bgColorFinal, column);
            case ColumnType.B:
                return renderCheckboxCell(
                    element,
                    info.text,
                    fontColorFinal,
                    bgColorFinal,
                    GanttUtils.conditionForTrueValueForBoolType
                );
            case ColumnType.L:
                return renderCheckboxCell(
                    element,
                    info.text,
                    fontColorFinal,
                    bgColorFinal,
                    GanttUtils.conditionForTrueValueForLogicType
                );
            case ColumnType.I:
                return renderImageCell(element, info.text, fontColorFinal, bgColorFinal);
            case ColumnType.IM:
                return renderImagesCell(element, info.text, fontColorFinal, bgColorFinal);
            default:
                return renderCell(element, info.text, fontColorFinal, bgColorFinal);
        }
    };
};

const renderCell = (element, text, fontColor, bgColor) => {
    return ReactDOM.render(
        <div
            style={{
                display: 'inline',
                color: fontColor,
                backgroundColor: bgColor,
                borderRadius: '25px',
                padding: '2px 6px 2px 6px',
            }}
            title={text}
        >
            {text}
        </div>,
        element
    );
};

const renderWithoutHtmlCell = (element, text, fontColor, bgColor, width) => {
    return ReactDOM.render(
        <div
            style={{
                whiteSpace: 'nowrap',
                maxWidth: width + 'px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                backgroundColor: bgColor,
                color: fontColor,
                borderRadius: '25px',
                padding: '2px 6px 2px 6px',
            }}
            title={StringUtils.textFromHtmlString(text)}
        >
            {StringUtils.textFromHtmlString(text)}
        </div>,
        element
    );
};

const renderHtmlCell = (element, text, fontColor, bgColor, column) => {
    return ReactDOM.render(
        <div
            style={{
                whiteSpace: column.allowWrapping ? 'wrap' : 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '18px',
                backgroundColor: bgColor,
                color: fontColor,
                borderRadius: column.allowWrapping ? '18px' : '25px',
                padding: '2px 6px 2px 6px',
                float: column.type === ColumnType.N ? 'right' : undefined,
            }}
            title={StringUtils.textFromHtmlString(text)}
            dangerouslySetInnerHTML={{__html: text}}
        ></div>,
        element
    );
};

const renderCheckboxCell = (element, text, fontColor, bgColor, conditionFn) => {
    return ReactDOM.render(
        <div
            style={{
                display: 'inline',
                color: fontColor,
                backgroundColor: bgColor,
                borderRadius: '25px',
                padding: '2px 6px 2px 6px',
            }}
            title={text}
        >
            <input type='checkbox' readOnly={true} checked={conditionFn(text)} />
        </div>,
        element
    );
};

const renderImagesCell = (element, text, fontColor, bgColor) => {
    return ReactDOM.render(
        <div
            style={{
                display: 'inline',
                color: fontColor,
                backgroundColor: bgColor,
                borderRadius: '25px',
                padding: '2px 0px 2px 0px',
            }}
        >
            {text?.map((i, index) => {
                return <Image style={{maxWidth: '100%'}} key={index} base64={text} />;
            })}
        </div>,
        element
    );
};

const renderImageCell = (element, text, fontColor, bgColor) => {
    return ReactDOM.render(
        <div
            style={{
                display: 'inline',
                color: fontColor,
                backgroundColor: bgColor,
                borderRadius: '25px',
                padding: '2px 0px 2px 0px',
            }}
        >
            <Image style={{maxHeight: '26px'}} base64={text} />
        </div>,
        element
    );
};

const menuExtendedItems = (i, documentsList = [], batchesList = [], pluginsList = []) => {
    let items = undefined;
    switch (i.type?.toUpperCase()) {
        case OperationType.OP_DOCUMENTS:
            items = documentsList.map((i, index) => {
                return menuExtendedItem(i, index + '-document');
            });
            return items;
        case OperationType.OP_PLUGINS:
            items = pluginsList.map((i, index) => {
                return menuExtendedItem(i, index + '-plugin');
            });
            return items;
        case OperationType.OP_BATCH:
            items = batchesList.map((i, index) => {
                return menuExtendedItem(i, index + '-batch');
            });
            return items;
    }
};
const menuExtendedItem = (i, index) => {
    return {
        key: 'menu-' + index,
        className: i.className,
        text: i.label,
    };
};
export const contextMenuItems = (operations, documentsList, batchesList, pluginsList) => {
    return operations
        ? operations.map((i, index) => {
              const extendedItems = menuExtendedItems(i, documentsList, batchesList, pluginsList);
              return {
                  key: 'menu-' + index,
                  className: i.className,
                  text: i.label,
                  name: i.type,
                  closeMenuOnClick: true,
                  icon: `mdi ${i.iconCode}`,
                  items: extendedItems,
              };
          })
        : [];
};

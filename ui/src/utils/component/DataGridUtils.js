import ReactDOM from 'react-dom/client'; // Użycie React 18
import Image from '../../components/Image';
import {StringUtils} from '../StringUtils';
import {ViewDataCompUtils} from './ViewDataCompUtils';
import EditRowUtils from '../EditRowUtils';
import {ColumnType} from '../../enum/ColumnType';
import {getStore} from '../helper/StoreHelper';

let _rowIndex = null;
let _bgColor = null;
let _fontcolor = null;
const _FONTCOLOR = '_FONTCOLOR';
const _BGCOLOR = '_BGCOLOR';
const _rowSpanMap = {}; // pamięta scalone wiersze
let arrayOfUniqueElements = [];
let arrayOfUniqueData = [];
let uniqueMap = new Map();

export class DataGridUtils extends ViewDataCompUtils {
    static clearProperties() {
        _rowIndex = null;
        _bgColor = null;
        _fontcolor = null;
        arrayOfUniqueElements = [];
        arrayOfUniqueData = [];
    }
    static isWart(dataField) {
        return dataField?.toUpperCase() === 'WART';
    }
    static renderToElement(element, node) {
        ReactDOM.createRoot(element).render(node);
    }
    static cellTemplate(column, isEditableCell, onImageClick, onEditorClick) {
        return function (element, info) {
            let className = info?.data?.SKASOWANY === 1 ? 'deleted-row' : '';
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
            let fontColorFinal = 'black';
            const specialFontColor = info.data['_FONTCOLOR_' + info.column?.dataField];
            if (specialFontColor) {
                fontColorFinal = specialFontColor;
                className += ' importance-color';
            } else if (_fontcolor) {
                fontColorFinal = _fontcolor;
            }

            const specialBgColor = info.data['_BGCOLOR_' + info.column?.dataField];
            if (!rowSelected) {
                bgColorFinal = specialBgColor || _bgColor;
                if (!specialBgColor && _bgColor) {
                    element.style.backgroundColor = _bgColor;
                    bgColorFinal = undefined;
                }
            }

            const commonProps = {
                className,
                style: {
                    whiteSpace: info.column.allowWrapping ? 'wrap' : 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: bgColorFinal,
                    color: fontColorFinal,
                    borderRadius: '25px',
                    padding: '2px 6px',
                },
                title: StringUtils.textFromHtmlString(info.text),
            };
            let result = undefined;
            switch (column?.type) {
                case ColumnType.O:
                case ColumnType.OH:
                    result = this.renderToElement(
                        element,
                        <div
                            {...commonProps}
                            onClick={() => {
                                if (!StringUtils.isEmpty(info.text) && onEditorClick) {
                                    onEditorClick(info.text, info.column?.caption, column?.type);
                                }
                            }}
                            style={{
                                ...commonProps.style,
                                cursor: StringUtils.isEmpty(info.text) ? 'default' : 'pointer',
                            }}
                        >
                            {DataGridUtils.getText(info)}
                        </div>
                    );
                    break;
                case ColumnType.C:
                case ColumnType.N:
                case ColumnType.D:
                case ColumnType.E:
                case ColumnType.T:
                    result = this.renderToElement(
                        element,
                        <div
                            {...commonProps}
                            style={{
                                ...commonProps.style,
                                float: column.type === ColumnType.N ? 'right' : undefined,
                                minHeight: '18px',
                            }}
                        >
                            {DataGridUtils.getText(info)}
                        </div>
                    );
                    break;
                case ColumnType.CH:
                    result = this.renderToElement(
                        element,
                        <div
                            {...commonProps}
                            style={{
                                ...commonProps.style,
                                minHeight: '18px',
                                float: column.type === ColumnType.N ? 'right' : undefined,
                            }}
                            dangerouslySetInnerHTML={{__html: info.text}}
                        />
                    );
                    break;
                case ColumnType.H:
                    result = this.renderToElement(
                        element,
                        <div {...commonProps}>
                            <a href={info.value} rel='noopener noreferrer' target='_blank'>
                                {info.text}
                            </a>
                        </div>
                    );
                    break;
                case ColumnType.B:
                case ColumnType.L:
                    const checked =
                        column.type === ColumnType.B
                            ? DataGridUtils.conditionForTrueValueForBoolType(info.text)
                            : DataGridUtils.conditionForTrueValueForLogicType(info.text);
                    result = this.renderToElement(
                        element,
                        <div {...commonProps}>
                            <input
                                type='checkbox'
                                onChange={() => {
                                    setTimeout(() => {
                                        const id = `${EditRowUtils.getType(column?.type)}${column.id}`;
                                        document.getElementById(id)?.click();
                                    }, 100);
                                }}
                                readOnly
                                checked={checked}
                            />
                        </div>
                    );
                    break;
                case ColumnType.I:
                case ColumnType.IM:
                    commonProps.style.padding = '';
                    commonProps.style.borderRadius = '0px';
                    commonProps.style.display = 'flex';
                    commonProps.style.justifyContent = 'center';
                    commonProps.style.alignItems = 'center';

                    if (Array.isArray(info.text) && info.text?.length > 0) {
                        result = this.renderToElement(
                            element,
                            <div className='cursor-pointer' style={commonProps.style}>
                                {info.text.map((i, index) => (
                                    <Image
                                        key={index}
                                        base64={i}
                                        onImageClick={(base64) => onImageClick?.(base64, info.column?.caption)}
                                        style={{maxWidth: '100%'}}
                                    />
                                ))}
                            </div>
                        );
                        break;
                    } else {
                        result = this.renderToElement(
                            element,
                            <div className='cursor-pointer' style={commonProps.style}>
                                <Image
                                    base64={info.text}
                                    onImageClick={(base64) => onImageClick?.(base64, info.column?.caption)}
                                    onRemove={() => {
                                        setTimeout(() => {
                                            document.getElementById('trash-button')?.click();
                                        }, 300);
                                    }}
                                    canRemove={isEditableCell && info.text?.length > 0}
                                />
                            </div>
                        );
                        break;
                    }
                default:
                    result = this.renderToElement(element, <div {...commonProps}>{info.text}</div>);
                    break;
            }
            return result;
        }.bind(this);
    }

    static mergingRows = () => {};
    static getText(info) {
        return StringUtils.textFromHtmlString(info.text);
    }
}

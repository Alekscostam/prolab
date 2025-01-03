import {StringUtils} from '../utils/StringUtils';

export default class CellCustomBackground {
    constructor(cellInfo, columnDefinition) {
        this.cellInfo = cellInfo;
        this.data = cellInfo.data;
        this.dataField = cellInfo?.column?.dataField;
        this.columnDefinition = columnDefinition;
    }

    isFormulaWart() {
        return this.data?.FORMULA && this.isWart(this.dataField);
    }
    isSpecialBgColor() {
        return !StringUtils.isBlankOrEmpty(this.cellInfo.data['_BGCOLOR_' + this.cellInfo.column?.dataField]);
    }
    isBgColor() {
        return !StringUtils.isBlankOrEmpty(this.cellInfo.data['_BGCOLOR']);
    }
    isDisabled() {
        return !this.columnDefinition?.edit;
    }
    isWart() {
        if (this.dataField) {
            return this.dataField.toUpperCase() === 'WART';
        }
        return false;
    }

    getSpecialBgColor() {
        if (this.isSpecialBgColor()) {
            return this.cellInfo.data['_BGCOLOR_' + this.cellInfo.column?.dataField] + '!important';
        } else {
            return undefined;
        }
    }

    getFontColor() {
        if (this.isSpecialBgColor()) {
            return this.cellInfo.data['_FONTCOLOR_' + this.cellInfo.column?.dataField] + '!important';
        } else if (this.isBgColor()) {
            return this.cellInfo.data['_FONTCOLOR'];
        } else {
            return 'black';
        }
    }

    paintRowExecute() {
        if (this.isFormulaWart()) {
            this.paintRowByClassAndStyle('', '#93ffb8!important');
        } else if (this.isBgColor() && this.cellInfo.columnIndex !== 0) {
            this.paintRowByClassAndStyle('', this.cellInfo.data['_BGCOLOR']);
        } else if (!this.isBgColor() && !this.isSpecialBgColor()) {
            if (this.isDisabled()) {
                this.paintRowByClassAndStyle('disabled-background', null);
            }
        }
    }
    paintRowByClassAndStyle(classNameBackground, styleBackground) {
        let regexForColor = /(#[0-9a-fA-F]{6})(!important)?/;

        function getColorParam() {
            const match = styleBackground.match(regexForColor);
            return match ? match[1] : '';
        }
        function getImportanceParam() {
            const match = styleBackground.match(regexForColor);
            return match && match[2] ? 'important' : '';
        }

        if (StringUtils.isNumber(this.cellInfo?.row?.dataIndex)) {
            const rows = Array.from(
                document.querySelectorAll('tr[aria-rowindex="' + Number(this.cellInfo.row?.dataIndex + 1) + '"]')
            );
            const penultimateElement = rows[rows.length - 2];
            if (penultimateElement) {
                if (!StringUtils.isBlank(this.cellInfo?.column?.headerId)) {
                    const elements = Array.from(penultimateElement.children).filter(
                        (child) => child.getAttribute('aria-describedby') === this.cellInfo.column.headerId
                    );
                    if (elements.length !== 0) {
                        const element = elements[0];
                        if (!StringUtils.isBlankOrEmpty(classNameBackground)) {
                            element.classList.add(classNameBackground);
                        }
                        if (!StringUtils.isBlank(styleBackground)) {
                            element.style.setProperty('background', getColorParam(), getImportanceParam());
                        }
                    }
                }
            }
        }
    }
}

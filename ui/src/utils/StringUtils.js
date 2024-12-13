import unorm from 'unorm';

export class StringUtils {
    static textFromHtmlString(stringHtml) {
        if (this.isBlank(stringHtml)) {
            return stringHtml;
        }
        var div = document.createElement('div');
        div.innerHTML = stringHtml;
        var text = div.textContent || div.innerText || '';
        return text;
    }
    static isBlank(value) {
        return value !== undefined && value !== null ? false : true;
    }
    static isEmpty(value) {
        return value.trim() === '';
    }
    static isEmptyString(value) {
        return typeof value === 'string' && value === '';
    }
    static isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    static truncateText(text, maxLength) {
        if (this.isBlank(text)) {
            return text;
        }
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, maxLength) + '...';
    }

    static normalizeText(text) {
        const normalizedText = unorm.nfkd(text);
        const superscriptToStandard = {
            '¹': '1',
            '²': '2',
            '³': '3',
            '⁴': '4',
            '⁵': '5',
            '⁶': '6',
            '⁷': '7',
            '⁸': '8',
            '⁹': '9',
            '⁰': '0',
            '⁺': '+',
            '⁻': '-',
            '⁼': '=',
            ⁱ: 'i',
            ʳ: 'r',
            ⁿ: 'n',
        };
        return normalizedText.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰⁺⁻⁼ⁱʳⁿ]/g, (match) => superscriptToStandard[match] || match);
    }
}

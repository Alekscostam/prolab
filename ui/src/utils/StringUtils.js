import unorm from 'unorm';

export class StringUtils {
    static textFromHtmlString(stringHtml) {
        if (this.isBlank(stringHtml)) {
            return stringHtml;
        }
        const div = document.createElement('div');
        div.innerHTML = stringHtml;
        const text = div.textContent || div.innerText || '';
        return text;
    }

    static objToQueryString(obj) {
        const keyValuePairs = [];
        for (const key in obj) {
            if (obj[key] !== null && obj[key] !== undefined) {
                keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
            }
        }
        return (keyValuePairs.length > 0 ? '?' : '') + keyValuePairs.join('&');
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
    static isString(value) {
        return typeof value === 'string';
    }
    static isBlankOrEmpty(value) {
        return value === undefined || value === null || value === '';
    }
    static containingText(text, textIn) {
        if (typeof text !== 'string' || typeof textIn !== 'string') {
            return false;
        }
        return text.includes(textIn);
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

    static normalizeNumberString(value) {
        if (value == null || value === '') return '';

        if (typeof value !== 'string') value = String(value);
        let separator = null;
        const firstComma = value.indexOf(',');
        const firstDot = value.indexOf('.');

        if (firstComma !== -1 && (firstComma < firstDot || firstDot === -1)) separator = ',';
        else if (firstDot !== -1) separator = '.';

        let normalized = value.replace(/[^0-9,.-]/g, '');
        normalized = normalized.replace(/(?!^)-/g, ''); // tylko minus na początku

        if (separator) {
            const firstSepIndex = normalized.indexOf(separator);
            normalized =
                normalized.slice(0, firstSepIndex + 1) +
                normalized.slice(firstSepIndex + 1).replace(new RegExp(`[.,]`, 'g'), '');

            const lastChar = normalized[normalized.length - 1];
            if (lastChar === separator && firstSepIndex !== normalized.length - 1) {
                normalized = normalized.slice(0, -1);
            }
        }

        return normalized;
    }
}

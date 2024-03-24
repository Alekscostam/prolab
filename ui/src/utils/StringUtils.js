export class StringUtils {
    static textFromHtmlString(stringHtml) {
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
    static isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
}

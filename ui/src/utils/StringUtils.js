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
    static isEmptyString(value){
        return typeof value === 'string' && value === '';
    }
    static isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, maxLength) + '...';
    }

 
}

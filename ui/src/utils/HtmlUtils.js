import {StringUtils} from './StringUtils';

export class HtmlUtils {
    static clickedInsideComponent(event, componentId) {
        if (event.target) {
            let currentElement = event.target;
            while (currentElement.parentNode) {
                currentElement = currentElement.parentNode;
                if (currentElement.id === componentId) {
                    return true;
                }
            }
        }
        return false;
    }

    static isValidHtml(text) {
        if (StringUtils.isBlank(text)) {
            return false;
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
        } catch (e) {
            return false;
        }
    }

    static createHtmlFromString(htmlContent) {
        if (this.isValidHtml(htmlContent)) {
            return <div dangerouslySetInnerHTML={{__html: htmlContent}} />;
        }
        return htmlContent;
    }

    static textFromHtmlString(stringHtml) {
        if (this.isValidHtml(stringHtml)) {
            const div = document.createElement('div');
            div.innerHTML = stringHtml;
            const text = div.textContent || div.innerText || '';
            return text;
        }
        return stringHtml;
    }
}

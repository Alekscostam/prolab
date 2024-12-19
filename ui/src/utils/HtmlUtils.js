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
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            return doc.body.innerHTML !== '';
        } catch (e) {
            return false;
        }
    }
}

export default class StyleInterpreter {
    constructor(obj) {
        this.obj = obj;
    }

    get style() {
        const font = this.obj || {};
        const style = {};

        if (font.name) {
            style.fontFamily = font.name;
        }

        if (font.size) {
            style.fontSize = `${font.size}px`;
        }

        if (font.bold !== undefined) {
            style.fontWeight = font.bold ? 'bold' : 'normal';
        }

        if (font.color) {
            style.color = font.color;
        }

        return style;
    }

    assign(el) {
        Object.assign(el.style, this.style());
    }
}

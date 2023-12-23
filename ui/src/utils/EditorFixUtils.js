const eventClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (EditorFixUtils.classListContainsButton(event.target)) {
        event.target.click();
    } else {
        EditorFixUtils.clickButtonIfIsParent(event.target.parentNode, 3);
    }
};

export class EditorFixUtils {
    static classListContainsButton(element) {
        try {
            return (
                Array.from(element.classList).includes('dx-button') ||
                Array.from(element.classList).includes('p-button') ||
                Array.from(element.classList).includes('p-button-text')
            );
        } catch (ex) {
            console.log('to much iterations');
        }
    }

    static clearAllLinkedDialogsWithEditor() {
        const dialogc = document.getElementsByClassName('dx-popup-normal');
        const dialogs = document.getElementsByClassName('p-dialog');
        if (dialogc.length !== 0) {
            Array.from(dialogc).forEach((el) => this.removeAllEventListeners(el));
        }
        if (dialogs.length !== 0) {
            Array.from(dialogs).forEach((el) => this.removeAllEventListeners(el));
        }
    }

    static clickButtonIfIsParent(parent, iterations) {
        if (iterations < 0) {
            return;
        }
        if (this.classListContainsButton(parent)) {
            this.clearAllLinkedDialogsWithEditor();
            // TODO: remove Anuluj child
            // if (parent.ariaLabel !== 'Anuluj') {
            parent.click();
            // }
            return;
        }
        if (parent.parentNode) {
            this.clickButtonIfIsParent(parent.parentNode, iterations - 1);
            return;
        }
    }

    static overideEventClick(element) {
        element.addEventListener('click', eventClick);
        Array.from(element.children).forEach((child) => {
            this.overideEventClick(child);
        });
    }
    static removeAllEventListeners(element) {
        element.removeEventListener('click', eventClick);
        Array.from(element.children).forEach((child) => {
            this.removeAllEventListeners(child);
        });
    }
}

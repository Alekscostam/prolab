export default class BarcodeScannerSimulator {
    constructor({value}) {
        this.value = value;
    }

    simulateKey(key, options = {}) {
        const eventOptions = {
            key,
            code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
            bubbles: true,
            cancelable: true,
            ...options,
        };
        document.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        document.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
        document.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    }

    run() {
        this.simulateKey('L', {ctrlKey: true});
        setTimeout(() => {
            const barCode = document.getElementById('qrCode-textbox').lastChild.firstChild.firstChild;
            barCode.value = this.value;
            this.simulateKey('Enter');
        }, 4000);
    }
}

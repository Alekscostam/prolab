const ALT = 'ALT';
const CTRL = 'CTRL';
const SHIFT = 'SHIFT';
const META = 'META';
const CMD = 'CMD';
const WIN = 'WIN';

export default class KeyCombinationDetector {
    constructor(event, keyCombo) {
        this.event = event;
        this.keys = keyCombo.split(/[-+.,;:]/).map((k) => k.toUpperCase());
    }
    hasAlt() {
        return this.keys.includes(ALT);
    }

    hasCtrl() {
        return this.keys.includes(CTRL);
    }

    hasShift() {
        return this.keys.includes(SHIFT);
    }

    hasMeta() {
        return this.keys.includes(META) || this.keys.includes(CMD) || this.keys.includes(WIN);
    }
    nonModifiers() {
        return this.keys.filter((k) => ![CTRL, ALT, SHIFT, META, CMD, WIN].includes(k));
    }
    isExecuted() {
        const e = this.event;
        if (this.hasAlt() && !e.altKey) return false;
        if (this.hasCtrl() && !e.ctrlKey) return false;
        if (this.hasShift() && !e.shiftKey) return false;
        if (this.hasMeta() && !e.metaKey) return false;
        const nonModifiers = this.nonModifiers();
        if (nonModifiers.length === 0) return false;
        const pressedKey = e.key.toUpperCase();
        return nonModifiers.includes(pressedKey);
    }
}

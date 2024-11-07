import LocUtils from "./LocUtils";

export class TranslationUtils {
    static getOpButton(operations, type) {
        for (let button in operations) {
            if (
                operations[button] &&
                operations[button].type &&
                operations[button].type.toUpperCase() === type.toUpperCase()
            ) {
                return operations[button];
            }
        }
        return null;
    }
    static getOrCreateOpButton(operations, labels, type, alternativeText) {
        operations = operations || [];
        const result = this.getOpButton(operations, type);
        if (result) {
            return result;
        }
        operations.push({type: type, label: LocUtils.loc(labels, type, alternativeText)});
        return this.getOpButton(operations, type);
    }
    static getOpButtonWithTranslation(operations, labels, type, alternativeText) {
        operations = operations || [];
        const result = this.getOpButton(operations, type);
        if (result) {
            result.label = LocUtils.loc(labels, type, alternativeText);
            return result;
        }
        return null;
    }
}
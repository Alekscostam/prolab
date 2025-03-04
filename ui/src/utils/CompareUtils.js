export class CompareUtils {
    static areEqualIgnoringType(value1, value2) {
        if (value1 === undefined || value2 === undefined || value1 === null || value2 === null) {
            return value1 === value2;
        }
        const num1 = Number(value1);
        const num2 = Number(value2);
        if (!isNaN(num1) && !isNaN(num2)) {
            return num1 === num2;
        }
        return String(value1) === String(value2);
    }
}

export class ArrayUtils {
    static isEmpty(array) {
        if (Array.isArray(array)) {
            if (array.length === 0) {
                return true;
            }
        }
        return false;
    }
    static checkArraySize(array, count) {
        return Array.isArray(array) && array.length === count;
    }
}

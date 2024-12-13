export class ArrayUtils {
    static isEmpty(array) {
        if (Array.isArray(array)) {
            if (array.length === 0) {
                return true;
            }
        }
        return false;
    }
}

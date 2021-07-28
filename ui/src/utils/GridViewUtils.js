export class GridViewUtils {
    static containsOperationButton(operations, type) {
        for (let button in operations) {
            if (operations[button].type === type) {
                return operations[button];
            }
        }
        return null;
    }
}
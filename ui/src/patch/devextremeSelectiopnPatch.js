import SelectionStrategy from 'devextreme/esm/__internal/ui/selection/selection.strategy';

try {
    const proto = SelectionStrategy.prototype;

    const original = proto.updateSelectedItemKeyHash;

    proto.updateSelectedItemKeyHash = function (...args) {
        try {
            return original.apply(this, args);
        } catch (e) {
            return undefined;
        }
    };
} catch (e) {}

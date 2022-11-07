class ActionButtonWithMenuUtils {
    static createItemsWithCommand(items, maxShortcutButtons, handleClick, operationType) {
        maxShortcutButtons = maxShortcutButtons === undefined ? 0 : maxShortcutButtons;
        let index = 1;
        let menuItems = [];
        for (let item in items) {
            if (index > maxShortcutButtons) {
                menuItems.push({
                    id: items[item].id,
                    label: items[item].label,
                    type: items[item]?.type === undefined ? operationType : items[item]?.type,
                    showAlways: items[item]?.showAlways,
                    command: (e) => {
                        handleClick(e.item);
                    },
                });
            }
            index++;
        }
        return menuItems;
    }
}

export default ActionButtonWithMenuUtils;

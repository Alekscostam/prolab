class ActionButtonWithMenuUtils {
    static createItemsWithCommand(items, maxShortcutButtons, handleClick, operationType, iconsEnabled) {
        maxShortcutButtons = maxShortcutButtons === undefined ? 0 : maxShortcutButtons;
        let menuItems = [];
        if (items) {
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                if (index >= maxShortcutButtons) {
                    menuItems.push({
                        id: item.id,
                        label: item.label,
                        icon: iconsEnabled ? item.icon : undefined,
                        type: item?.type === undefined ? operationType : item?.type,
                        showAlways: item?.showAlways,
                        command: (e) => {
                            handleClick(e.item);
                        },
                    });
                }
            }
        }
        return menuItems;
    }
    static hideActionButtomWithMenuPopup = () => {
        const actionButtomWithMenuPopup = document.getElementsByClassName('action-button-with-menu-popup');
        if (actionButtomWithMenuPopup.length > 0) {
            document.getElementById('action-button-with-menu-contant').click();
        }
    };
}

export default ActionButtonWithMenuUtils;

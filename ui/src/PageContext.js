const customOverlay = 'custom-overlay';

const addCustomOverlayToElement = (className) => {
    const baseContainerDiv = document.getElementsByClassName(className);
    if (baseContainerDiv.length > 0) {
        Array.from(baseContainerDiv).forEach((element) => {
            element.classList.add(customOverlay);
        });
    }
};

const removeCustomOverlayToElement = (className) => {
    const baseContainerDiv = document.getElementsByClassName(className);
    if (baseContainerDiv.length > 0) {
        Array.from(baseContainerDiv).forEach((element) => {
            element.classList.remove(customOverlay);
        });
    }
};

module.exports = {
    removeCustomOverlayToElement,
    addCustomOverlayToElement,
};

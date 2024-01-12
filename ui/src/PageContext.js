
const customOverlay = "custom-overlay";

const addCustomOverlayToElement = (className) => {
    const baseContainerDiv =   document.getElementsByClassName(className)
    if(baseContainerDiv.length === 1){
       baseContainerDiv[0].classList.add(customOverlay);
    }
}

const removeCustomOverlayToElement = (className) => {
     const baseContainerDiv =   document.getElementsByClassName(className)
     if(baseContainerDiv.length === 1){
        baseContainerDiv[0].classList.remove(customOverlay);
     } 
}


module.exports = {
   removeCustomOverlayToElement,
   addCustomOverlayToElement,
};
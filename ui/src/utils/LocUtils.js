import useStore from "../store";

class LocUtils {

    static loc(locale, translationKey, notFoundValue) {
        try {
            let foundValue = locale[translationKey.trim()];
            if (foundValue === undefined || foundValue === null || foundValue === '') {
                return notFoundValue;
            } else {
                return foundValue;
            }
        } catch (ex) {
            return notFoundValue;
        }
    }

    static locFromStore(translationKey) {
        try {
            const locale = useStore.getState().labels;
            const foundValue = locale[translationKey.trim()];
            if (foundValue === undefined || foundValue === null || foundValue === '') {
                return "###"+ translationKey + "###";
            } else {
                return foundValue;
            }
        } catch (ex) {
            console.error(ex)
            return "###"+ translationKey + "###";
        }
    }  
}

export default LocUtils;
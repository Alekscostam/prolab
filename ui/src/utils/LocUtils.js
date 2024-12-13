import useStore from '../store';

class LocUtils {
    static getTranslation(locale, translationKey, notFoundValue) {
        try {
            const foundValue = locale[translationKey.trim()];
            return foundValue === undefined || foundValue === null || foundValue === '' ? notFoundValue : foundValue;
        } catch (ex) {
            console.error(ex);
            return notFoundValue;
        }
    }
    static loc(locale, translationKey, notFoundValue) {
        return this.getTranslation(locale, translationKey, notFoundValue);
    }
    static locFromStore(translationKey) {
        const locale = useStore.getState().labels;
        return this.getTranslation(locale, translationKey, `###${translationKey}###`);
    }
    static locFromStoreWithDefault(translationKey, defaultValue) {
        const locale = useStore.getState().labels;
        return this.getTranslation(locale, translationKey, defaultValue);
    }
}

export default LocUtils;

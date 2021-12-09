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
}

export default LocUtils;
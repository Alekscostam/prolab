import BaseService from './BaseService';

export default class LocalizationService extends BaseService {
    // Initializing important variables

    constructor(props) {
        super(props);

        this.path = '';
    }

    localizationLoginPage(lang) {
        const langParam = lang ? '?lang=' + lang : '';
        return this.fetch(`${this.domain}/${this.path}LocalizationLoginPage${langParam}`, {
            method: 'GET',
        }).then((res) => {
            return Promise.resolve(res);
        });
    }

    localization(lang) {
        const langParam = lang ? '?lang=' + lang : '';
        return this.fetch(`${this.domain}/${this.path}Localization${langParam}`, {
            method: 'GET',
        }).then((res) => {
            return Promise.resolve(res);
        });
    }

    getTranslationsFromFile(frameworkTypeArg, langArg) {
        let frameworkType = frameworkTypeArg.toLowerCase();
        let lang = langArg.toLowerCase();
        return this.fetch(`${this.domain}/lang/${frameworkType}_translations_${lang}.json`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
}

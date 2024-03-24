import BaseService from './BaseService';

export default class LocalizationService extends BaseService {
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
        const frameworkType = frameworkTypeArg.toLowerCase();
        const lang = langArg.toLowerCase();
        return this.fetch(`${this.domain}/lang/${frameworkType}_translations_${lang}.json`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
}

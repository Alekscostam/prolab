import BaseService from './BaseService';

export default class LocalizationService extends BaseService {
	// Initializing important variables
	constructor() {
		super();
		this.path = '';
	}

	localizationLoginPage(lang) {
		const langParam = lang ? ('?lang=' + lang) : '';
		return this.fetch(`${this.domain}/${this.path}LocalizationLoginPage${langParam}`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}
}

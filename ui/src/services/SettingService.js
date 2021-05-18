import BaseServiceCrud from './BaseServiceCrud';

export default class SettingService extends BaseServiceCrud {
	// Initializing important variables
	constructor() {
		super();
		this.path = 'settings';
		this.getValue = this.getValue.bind(this);
	}

	getCriteria(criteria) {
		return this.objToQueryString({
			type: criteria.type?.enumValue,
			active: criteria.active,
			id: criteria.id,
			entity_uuid: criteria.entityUuid,
			first_result: criteria.firstResult,
			max_result: criteria.maxResult,
			sort_field: criteria.sortField,
			sort_asc: criteria.sortAsc,
		});
	}

	getValue(key) {
		return this.fetch(`${this.domain}/${this.path}/key/` + key, {
			method: 'GET',
		}).catch((err) => {
			throw err;
		});
	}

	getCaptchaPublic() {
		return this.fetch(`${this.domain}/${this.path}/captcha`, {
			method: 'GET',
		})
			.then((res) => {
				return Promise.resolve(res);
			})
			.catch((err) => {
				throw err;
			});
	}
	getSettingTypes(){
        return this.fetch(`${this.domain}/${this.path}/parameterTypes`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
    }
}

import BaseService from './BaseService';

export default class BaseServiceCrud extends BaseService {
	// Initializing important variables
	constructor(domain) {
		super(domain);
		this.getList = this.getList.bind(this);
		this.get = this.get.bind(this);
		this.add = this.add.bind(this);
		this.update = this.update.bind(this);
	}

	add(element) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/`, {
			method: 'POST',
			body: JSON.stringify(element),
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	update(element) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/${element.id}`, {
			method: 'PUT',
			body: JSON.stringify(element),
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	get(id) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/${id}`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	getList(criteria) {
		const queryString = this.getCriteria(criteria);
		return this.fetch(`${this.domain}/${this.path}/list${queryString}`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	getItems() {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/items`, {
			method: 'GET',
		})
			.then((res) => {
				return Promise.resolve(res);
			})
			.catch((err) => {
				throw err;
			});
	}

	remove(element) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/${element.id}`, {
			method: 'DELETE',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}
}

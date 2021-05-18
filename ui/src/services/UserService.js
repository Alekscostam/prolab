import BaseServiceCrud from './BaseServiceCrud';

export default class UserService extends BaseServiceCrud {
	// Initializing important variables
	constructor() {
		super();
		this.path = 'user';
	}

	getCriteria(criteria) {
		return this.objToQueryString({
			login: criteria.login,
			first_name: criteria.firstName,
			last_name: criteria.lastName,
			email: criteria.email,
			role_type: criteria.roleType?.enumValue,
			status: criteria.status?.enumValue,
			active: criteria.active,
			first_result: criteria.firstResult,
			max_result: criteria.maxResult,
			sort_field: criteria.sortField,
			sort_asc: criteria.sortAsc,
		});
	}

	checkStatusPassword(login, password, captchaValid) {
		return this.fetch(`${this.domain}/${this.path}/password/check-status-password`, {
			method: 'POST',
			body: JSON.stringify({ login, password, captchaValid }),
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	verifyTokenAndSendNewPassword(token) {
		const encodedValue = encodeURIComponent(token);
		return this.fetch(`${this.domain}/${this.path}/password/verify-reset-link?token=${encodedValue}`, {
			method: 'POST',
		}).catch((err) => {
			throw err;
		});
	}

	updateMyAccount(element) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/my-account`, {
			method: 'PUT',
			body: JSON.stringify(element),
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	getMyAccount() {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/my-account`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	blockAccount(id) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/block/${id}`, {
			method: 'PUT',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	unblockAccount(id) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}/${this.path}/unblock/${id}`, {
			method: 'PUT',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	getAllActiveUsers() {
		return this.fetch(`${this.domain}/${this.path}/all-active-users`, {
			method: 'GET',
		}).then((res) => {
			return Promise.resolve(res);
		});
	}

	logout(token) {
		return this.fetch(`${this.domain}/${this.path}/logout`, {
				method: 'PUT',
			}, {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Authorization: token
			}
		).then((res) => {
			return Promise.resolve(res);
		});
	}
}

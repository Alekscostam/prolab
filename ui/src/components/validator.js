/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
import React from 'react';
import moment from 'moment';

class SimpleReactValidator {
	constructor(options = {}) {
		this.fields = {};
		this.errorMessages = {};
		this.messagesShown = false;
		this.rules = {
			accepted: {
				message: 'Pole :attribute musi być zaznaczone.',
				rule: (val) => val === true,
				required: true,
			},
			after: {
				message: 'Pole :attribute musi być datą późniejszą niż :date.',
				rule: (val, params) => this.helpers.momentInstalled() && moment.isMoment(moment(val)) && moment(val).isAfter(params[0], 'day'),
				messageReplace: (message, params) => message.replace(':date', moment(params[0]).format(params[1])),
			},
			after_or_equal: {
				message: 'Pole :attribute musi być datą nie wcześniejszą niż :date.',
				rule: (val, params) => this.helpers.momentInstalled() && moment.isMoment(moment(val)) && moment(val).isSameOrAfter(params[0], 'day'),
				messageReplace: (message, params) => message.replace(':date', moment(params[0]).format(params[1])),
			},
			after_or_equal_time: {
				message: 'Pole :attribute musi być godziną nie wcześniejszą niż :date.',
				rule: (val, params) => 
				this.helpers.momentInstalled() && moment.isMoment(moment(val, "HH:mm:ss")) && new Date(val).getTime()>= new Date(`${moment(new Date()).format('YYYY-MM-DD').toString()}T${params[0]}`),
				messageReplace: (message, params) => message.replace(':date',params[0]),
			},
			before_or_equal_time: {
				message: 'Pole :attribute musi być godziną nie późniejszą niż :date.',
				rule: (val, params) => 
				this.helpers.momentInstalled() && moment.isMoment(moment(val, "HH:mm:ss")) && new Date(val).getTime()<= new Date(`${moment(new Date()).format('YYYY-MM-DD').toString()}T${params[0]}`),
				messageReplace: (message, params) => message.replace(':date',params[0]),
			},
			alpha: {
				message: 'Pole :attribute może zawierać tylko litery.',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż]*$/i),
			},
			alpha_space: {
				message: 'Pole :attribute może zawierać tylko litery i spacje.',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż\s]*$/i),
			},
			alpha_space_dash: {
				message: 'Pole :attribute może zawierać tylko litery, spacje i "-".',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż\s-]*$/i),
			},
			alpha_num: {
				message: 'Pole :attribute może zawierać tylko litery i cyfry.',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]*$/i),
			},
			alpha_num_space: {
				message: 'Pole :attribute może zawierać tylko litery, cyfry i spacje.',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9\s]*$/i),
			},
			alpha_num_dash: {
				message: 'Pole :attribute może zawierać tylko litery, cyfry, "_" i "-".',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9_-]*$/i),
			},
			alpha_num_dash_space: {
				message: 'Pole :attribute może zawierać tylko litery, cyfry, spacje, "_", ",", "." i "-".',
				rule: (val) => this.helpers.testRegex(val, /^[A-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9\_\-\,\.\s]*$/i),
			},
			array: { message: 'Pole :attribute must be an array.', rule: (val) => Array.isArray(val) },
			array_required: {
				message: 'Pole :attribute jest wymagane.',
				rule: (val) => Array.isArray(val) && val.length > 0,
			},
			before: {
				message: 'Pole :attribute musi być datą wcześniejszą niż :date.',
				rule: (val, params) => this.helpers.momentInstalled() && moment.isMoment(moment(val)) && moment(val).isBefore(params[0], 'day'),
				messageReplace: (message, params) => message.replace(':date', moment(params[0]).format(params[1])),
			},
			before_or_equal: {
				message: 'Pole :attribute musi być datą nie późniejszą niż :date.',
				rule: (val, params) => this.helpers.momentInstalled() && moment.isMoment(moment(val)) && moment(val).isSameOrBefore(params[0], 'day'),
				messageReplace: (message, params) => message.replace(':date', moment(params[0]).format(params[1])),
			},
			between: {
				message: 'Pole :attribute musi mieć wartość pomiędzy :min a :max:type.',
				rule: (val, params) => this.helpers.size(val, params[2]) >= parseFloat(params[0]) && this.helpers.size(val, params[2]) <= parseFloat(params[1]),
				messageReplace: (message, params) => message.replace(':min', params[0]).replace(':max', params[1]).replace(':type', this.helpers.sizeText(params[2])),
			},
			boolean: {
				message: 'Pole :attribute must be a boolean.',
				rule: (val) => val === false || val === true,
			},
			card_exp: {
				message: 'Pole :attribute must be a valid expiration date.',
				rule: (val) => this.helpers.testRegex(val, /^(([0]?[1-9]{1})|([1]{1}[0-2]{1}))\s?\/\s?(\d{2}|\d{4})$/),
			},
			card_num: {
				message: 'Pole :attribute must be a valid credit card number.',
				rule: (val) => this.helpers.testRegex(val, /^\d{4}\s?\d{4,6}\s?\d{4,5}\s?\d{0,8}$/),
			},
			currency: {
				message: 'Pole :attribute must be a valid currency.',
				rule: (val) => this.helpers.testRegex(val, /^\$?(\d{1,3})(\,?\d{3})*\.?\d{0,2}$/),
			},
			date: {
				message: 'Pole :attribute musi być datą w formacie dd-mm-rrrr.',
				rule: (val) => this.helpers.momentInstalled() && moment(val).isValid() && moment.isMoment(moment(val)),
			},
			date_format: {
				message: 'Pole :attribute musi być datą w formacie :dateFormat.',
				rule: (val, params) => this.helpers.momentInstalled() && moment(val, params[0], true).isValid() && moment.isMoment(moment(val)),
				messageReplace: (message, params) => message.replace(':dateFormat', params[1]),
			},
			date_equals: {
				message: 'Pole :attribute must be on :date.',
				rule: (val, params) => this.helpers.momentInstalled() && moment.isMoment(moment(val)) && moment(val).isSame(params[0], 'day'),
				messageReplace: (message, params) => message.replace(':date', moment(params[0]).format(params[1])),
			},
			email: {
				message: 'Pole :attribute musi być poprawnym adresem email, np. "email@org.pl".',
				rule: (val) => this.helpers.testRegex(val, /^[A-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
			},
			equals: {
				message: 'Wartości pól :attribute i :fieldName muszą być identyczne.',
				rule: (val, params) => val === params[0],
				messageReplace: (message, params) => message.replace(':fieldName', params[1]),
			},
			in: {
				message: 'Pole :attribute musi przyjmować wartości z listy :values.',
				rule: (val, params) => params.indexOf(val) > -1,
				messageReplace: (message, params) => message.replace(':values', this.helpers.toSentence(params)),
			},
			integer: {
				message: 'Pole :attribute musi być liczbą całkowitą.',
				rule: (val) => this.helpers.testRegex(val, /^\d*$/),
			},
			max: {
				message: 'Pole :attribute maksymalna długość :max:type.',
				rule: (val, params) => this.helpers.size(val, params[1]) <= parseFloat(params[0]),
				messageReplace: (message, params) => message.replace(':max', params[0]).replace(':type', this.helpers.sizeText(params[1])),
			},
			min: {
				message: 'Pole :attribute minimalna długość :min:type.',
				rule: (val, params) => this.helpers.size(val, params[1]) >= parseFloat(params[0]),
				messageReplace: (message, params) => message.replace(':min', params[0]).replace(':type', this.helpers.sizeText(params[1])),
			},
			nip: {
				message: 'Pole :attribute musi być poprawnym numerem NIP.',
				rule: (val) => this.helpers.validateNip(val),
			},
			not_in: {
				message: 'Pole :attribute nie może przyjmować wartości z listy :values.',
				rule: (val, params) => params.indexOf(val) === -1,
				messageReplace: (message, params) => message.replace(':values', this.helpers.toSentence(params)),
			},
			not_regex: {
				message: 'Pole :attribute nie może pasować do wzorca.',
				rule: (val, params) => !this.helpers.testRegex(val, typeof params[0] === 'string' || params[0] instanceof String ? new RegExp(params[0]) : params[0]),
			},
			numeric: {
				message: 'Pole :attribute musi być liczbą.',
				rule: (val) => this.helpers.numeric(val),
			},
			pesel: {
				message: 'Pole :attribute musi być poprawnym numerem PESEL.',
				rule: (val) => this.helpers.isPeselValid(val),
			},
			pesel_or_initial_value: {
				message: 'Pole :attribute musi być poprawnym numerem PESEL.',
				rule: (val, params) => this.helpers.isPeselValidOrInitialValue(val, params[0]),
			},
			phone: {
				message: 'Pole :attribute musi być numerem telefonu, np. +48111222333.',
				rule: (val) => this.helpers.testRegex(val, /^\+[0-9]{2}[0-9]{9}$/),
			},
			password: {
				message: 'Pole :attribute musi się składać z minimum :min znaków, zawierać co najmniej jedną małą i dużą literę, cyfrę oraz znak specjalny spośród !@#$%^&*(){}[]|:";\'<>?,./',
				rule: (val, params) => this.helpers.testRegex(val, new RegExp(`^(?=.*\\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(){}[\\\]|:";'<>?,.\\\/])[a-zA-ZĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9!@#$%^&*(){}[\\\]|:";'<>?,.\\\/]{${params[0]},}$`)),
				messageReplace: (message, params) => message.replace(':min', params[0]),
			},
			regex: {
				message: 'Pole :attribute musi pasować do wzorca.',
				rule: (val, params) => this.helpers.testRegex(val, typeof params[0] === 'string' || params[0] instanceof String ? new RegExp(params[0]) : params[0]),
			},
			regon: {
				message: 'Pole :attribute musi być poprawnym numerem REGON.',
				rule: (val) => this.helpers.validateRegon(val),
			},
			zipcode: {
				message: 'Pole :attribute musi być poprawnym kodem pocztowym, np. 12-345.',
				rule: (val) => this.helpers.validateZipcode(val),
			},
			required: {
				message: 'Pole jest wymagane.',
				rule: (val) => !this.helpers.isBlank(val),
				required: true,
			},
			not_required: {
				message: 'Pole :attribute nie jest wymagane.',
				rule: () => true,
				required: true,
			},
			size: {
				message: 'Pole :attribute musi być mniejsze niż :size:type.',
				rule: (val, params) => this.helpers.size(val, params[1]) === parseFloat(params[0]),
				messageReplace: (message, params) => message.replace(':size', params[0]).replace(':type', this.helpers.sizeText(params[1])),
			},
			time: {
				message: 'Pole :attribute musi być w formacie GG:MM',
				rule: (val) => this.helpers.testRegex(val, /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/),
				required: true,
			},

			number_max: {
				message: 'Pole :attribute nie może być większe niż :size.',
				rule: (val, params) => this.helpers.number_max(val, params),
				messageReplace: (message, params) => message.replace(':size', params[0]),
				required: true,
			},

			number_min: {
				message: 'Pole :attribute nie może być mniejsze niż :size.',
				rule: (val, params) => this.helpers.number_min(val, params),
				messageReplace: (message, params) => message.replace(':size', params[0]),
				required: true,
			},

			string: {
				message: 'Pole :attribute musi być ciągiem znaków.',
				rule: (val) => typeof val === typeof 'string',
			},
			typeof: {
				message: 'Pole :attribute musi być typu :type.',
				rule: (val, params) => typeof val === typeof params[0],
				messageReplace: (message, params) => message.replace(':type', typeof params[0]),
			},
			url: {
				message: 'Pole :attribute musi być urlem.',
				rule: (val) => this.helpers.testRegex(val, /^(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i),
			},
			xml: {
				message: 'Plik nie jest poprawnym dokumentem XML.',
				rule: (val) => this.helpers.testXml(val),
			},
			xml_show_error: {
				message: 'Plik nie jest poprawnym dokumentem XML. :error',
				rule: (val) => this.helpers.testXml(val),
				messageReplace: (message, params) => message.replace(':error', params[0]),
			},
			...(options.validators || {}),
		};

		// apply default options
		this.messages = options.messages || {};
		this.className = options.className;

		// apply default element
		if (options.element === false) {
			this.element = (message) => message;
		} else if (options.hasOwnProperty('element')) {
			this.element = options.element;
		} else if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
			this.element = (message) => message;
		} else {
			this.element = (message, className, id) => React.createElement('div', { className: className || this.className || 'srv-validation-message', id: `${id}-error` }, message);
		}
		this.helpers = {
			parent: this,

			passes(rule, value, params, rules) {
				if (rule === undefined || rule === null || rule === '') {
					return true;
				}
				if (!rules.hasOwnProperty(rule)) {
					console.error(`Rule Not Found: There is no rule with the name ${rule}.`);
					return true;
				}
				if (!this.isRequired(rule, rules) && this.isBlank(value)) {
					return true;
				}
				return rules[rule].rule(value, params, this.parent) !== false;
			},

			isRequired(rule, rules) {
				return rules[rule].hasOwnProperty('required') && rules[rule].required;
			},

			isBlank(value) {
				let areSpacesOnly = false;
				if (value !== undefined && value !== null && typeof value === 'string') {
					if (value.trim().length === 0) {
						areSpacesOnly = true;
					}
				}
				return typeof value === 'undefined' || value === null || value === '' || areSpacesOnly;
			},

			normalizeValues(value, validation) {
				return [this.valueOrEmptyString(value), this.getValidation(validation), this.getOptions(validation)];
			},

			getValidation(validation) {
				if (validation === Object(validation) && !!Object.keys(validation).length) {
					return Object.keys(validation)[0];
				} else {
					if (validation.indexOf('~') != -1) {
						return validation.split('~')[0];
					} else {
						return validation.split(':')[0];
					}
				}
			},

			getOptions(validation) {
				if (validation === Object(validation) && !!Object.values(validation).length) {
					const params = Object.values(validation)[0];
					return Array.isArray(params) ? params : [params];
				} else {
					let params;
					if (validation.indexOf('~') != -1) {
						params = validation.replace(/\~(?=([^~]*~[^~]*~)*[^~]*)/g, '`').split('`');
					} else {
						params = validation.replace(/:(?=([^~]*~[^~]*~)*[^~]*$)/g, '`').split('`'); // validation.split(':');
					}
					if (params.length > 1) {
						switch (params[0]) {
							case 'password':
								const validationParams = params[1].split(',');
								if (validationParams !== undefined && validationParams !== null && validationParams.length >= 1) {
									return validationParams;
								} else {
									return [9];
								}
							case 'after':
							case 'before':
							case 'after_or_equal':
							case 'before_or_equal':
							case 'date_equals':
								let dateFormat = 'DD-MM-YYYY';
								if (params.length > 2) {
									dateFormat = params[2];
								}
								return [moment(moment.utc(params[1], dateFormat)), dateFormat];
							case 'after_or_equal_time':
							case 'before_or_equal_time':
								let dateFormatTime = 'HH:mm:ss';

								if (params.length > 2) {
									dateFormatTime = params[2];
								}
								return [params[1], dateFormatTime];

							case 'regex':
								return [params[1]];
							case 'equals':
								const validationParamsEquals = params[1].replace(/,(?=([^~]*~[^~]*~)*[^~]*$)/g, '`').split('`');
								if (validationParamsEquals[0]) {
									return [validationParamsEquals[0].replace(/~/g, ''), validationParamsEquals[1]];
								} else {
									return [undefined];
								}
							default:
								return params[1].split(',');
						}
					} else {
						return [];
					}
				}
			},

			valueOrEmptyString(value) {
				return typeof value === 'undefined' || value === null ? '' : value;
			},

			toSentence(arr) {
				return arr.slice(0, -2).join(', ') + (arr.slice(0, -2).length ? ', ' : '') + arr.slice(-2).join(arr.length > 2 ? ', or ' : ' or ');
			},

			testRegex(value, regex) {
				return value.toString().match(regex) !== null;
			},

			testXml(value) {
				return value === undefined || value === null;
			},

			calculateChecksum(input, weights) {
				let result = 0;
				for (let i = 0; i < weights.length; i++) {
					result += weights[i] * parseInt(input[i]);
				}
				return result;
			},

			validChecksum(input, weights, control) {
				const digits = `${input}`.split('');
				if (digits.length === weights.length + 1) {
					const controlSum = this.calculateChecksum(digits, weights);
					let controlNum = control(controlSum);
					if (controlNum === 10) {
						controlNum = 0;
					}
					return controlNum === parseInt(digits[weights.length]);
				}
				return false;
			},

			validateRegon(input) {
				let weights;
				switch (input.length) {
					case 7:
						weights = [2, 3, 4, 5, 6, 7];
						break;
					case 9:
						weights = [8, 9, 2, 3, 4, 5, 6, 7];
						break;
					case 14:
						weights = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
						break;
					default:
						return false;
				}
				return this.validChecksum(input, weights, (controlSum) => controlSum % 11);
			},

			validateZipcode(input) {
				return this.testRegex(input, '^[0-9]{2}-[0-9]{3}$');
			},

			validateNip(input) {
				const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
				return this.validChecksum(input.split('-').join(''), weights, (controlSum) => controlSum % 11);
			},

			isPeselValid(pesel) {
				const reg = /^[0-9]{11}$/;
				if (reg.test(pesel) === false) {
					return false;
				}
				// pobranie daty
				let rok = parseInt(pesel.substring(0, 2), 10);
				let miesiac = parseInt(pesel.substring(2, 4), 10) - 1;
				const dzien = parseInt(pesel.substring(4, 6), 10);
				if (miesiac >= 80) {
					rok += 1800;
					miesiac = miesiac - 80;
				} else if (miesiac >= 60) {
					rok += 2200;
					miesiac = miesiac - 60;
				} else if (miesiac >= 40) {
					rok += 2100;
					miesiac = miesiac - 40;
				} else if (miesiac >= 20) {
					rok += 2000;
					miesiac = miesiac - 20;
				} else {
					rok += 1900;
				}
				const dataUrodzenia = new Date();
				dataUrodzenia.setFullYear(rok, miesiac, dzien);
				// Weryfikacja numery PESEL
				const wagi = [9, 7, 3, 1, 9, 7, 3, 1, 9, 7];
				let suma = 0;
				for (let i = 0; i < wagi.length; i++) {
					suma += parseInt(pesel.substring(i, i + 1), 10) * wagi[i];
				}
				suma = suma % 10;
				const cyfraKontr = parseInt(pesel.substring(10, 11), 10);
				const poprawnosc = suma === cyfraKontr;
				// określenie płci
				let plec = 'k';
				if (parseInt(pesel.substring(9, 10), 10) % 2 === 1) {
					plec = 'm';
				}
				const result = {
					valid: poprawnosc,
					sex: plec,
					date: dataUrodzenia,
				};
				return result.valid;
			},

			isPeselValidOrInitialValue(pesel, initialValue) {
				if (initialValue !== undefined && initialValue === pesel) {
					return true;
				}
				return this.isPeselValid(pesel);
			},

			message(rule, field, options, rules) {
				options.messages = options.messages || {};
				const message = options.messages[rule] || options.messages.default || this.parent.messages[rule] || this.parent.messages.default || rules[rule].message;
				return message.replace(':attribute', field);
			},

			humanizeFieldName(field) {
				// supports snake_case or camelCase
				return field
					.replace(/([A-Z])/g, ' $1')
					.replace(/_/g, ' ')
					.toLowerCase();
			},

			element(message, options, id) {
				const element = options.element || this.parent.element;
				return element(message, options.className, id);
			},

			numeric(val) {
				return this.testRegex(val, /^(\d+[.,]?\d*)?$/);
			},

			momentInstalled() {
				if (!moment) {
					console.warn('Date validators require using momentjs https://momentjs.com and moment objects.');
					return false;
				} else {
					return true;
				}
			},

			size(val, type) {
				// if an array or string get Pole length, else return Pole value.
				if (type === 'string' || type === undefined || type === 'array') {
					return val.length;
				} else if (type === 'num') {
					return parseFloat(val);
				}
			},

			sizeText(type) {
				if (type === 'string' || type === undefined) {
					return ' znaków';
				} else if (type === 'array') {
					return ' elementów';
				} else {
					return '';
				}
			},

			number_max(value, params) {
				if (params === undefined) {
					return false;
				}
				const max = parseInt(params[0]);
				const intValue = parseInt(value);

				if (isNaN(max) || isNaN(intValue)) {
					return false;
				}
				return intValue <= max;
			},

			number_min(value, params) {
				if (params === undefined) {
					return false;
				}
				const max = parseInt(params[0]);
				const intValue = parseInt(value);

				if (isNaN(max) || isNaN(intValue)) {
					return false;
				}
				const result = intValue >= max;
				return result;
			},
		};
	}

	getErrorMessages() {
		return this.errorMessages;
	}

	showMessages() {
		this.messagesShown = true;
	}

	hideMessages() {
		this.messagesShown = false;
	}

	allValid() {
		const toDelete = [];
		for (const key in this.fields) {
			if (key && key !== '') {
				const el = document.getElementById(key);
				if (!el) {
					toDelete.push(key);
				}
			}
		}
		for (const key of toDelete) {
			console.log(`* removing from validator fields: ${key}`);
			delete this.fields[key];
		}
		for (const key in this.fields) {
			if (this.fieldValid(key) === false) {
				return false;
			}
		}
		return true;
	}

	fieldValid(field) {
		return this.fields.hasOwnProperty(field) && this.fields[field] === true;
	}

	purgeFields() {
		this.fields = {};
		this.errorMessages = {};
	}

	messageAlways(field, message, options = {}) {
		if (message && this.messagesShown) {
			return this.helpers.element(message, options);
		}
	}

	removeValidation(fieldName) {
		delete this.errorMessages[fieldName];
		delete this.fields[fieldName];
	}

	message(id, field, inputValue, validations, options = {}) {
		this.errorMessages[id] = null;
		this.fields[id] = true;
		if (!Array.isArray(validations)) {
			validations = validations.replace(/\|(?=([^~]*~[^~]*~)*[^~]*)/g, '`').split('`');
		}
		const rules = options.validators ? { ...this.rules, ...options.validators } : this.rules;
		for (const validation of validations) {
			if (validation !== undefined) {
				const [value, rule, params] = this.helpers.normalizeValues(inputValue, validation);
				if (!this.helpers.passes(rule, value, params, rules)) {
					this.fields[id] = false;
					let message = this.helpers.message(rule, field, options, rules);
					if (params.length > 0 && rules[rule].hasOwnProperty('messageReplace')) {
						message = rules[rule].messageReplace(message, params);
					}
					this.errorMessages[id] = message;
					if (this.messagesShown) {
						return this.helpers.element(message, options, id);
					}
				}
			}
		}
	}
}

export default SimpleReactValidator;

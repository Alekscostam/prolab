

const Constants = {
	DATE_GET_REQUEST_FORMAT: 'YYYY-MM-DD',
	DATE_TIME_FORMAT_ISO: 'dd-MM-yyyy HH:mm:ss',
	DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

	DATE_FORMAT: 'YYYY-MM-DD',
	DATE_FORMAT_MONTH: 'YYYY-MM',
	SIMPLE_DATE_FORMAT: 'DD-MM-YYYY',
	BOOLEAN_OPTIONS:[
		{ value: true, label: 'Tak' },
		{ value: false, label: 'Nie' },
	],
	BOOLEAN_OPTIONS_ONLY_TRUE:[
		{ value: true, label: 'Tak' }
	],
	IMAGE_EXTS: '.gif,.jpg,.jpeg,.png',
	SC_MAX_RESULT: 99999,
	IMAGE_MAX_SIZE: 10000000,
	PROTOCOL_REPORT_MAX_SIZE: 100000000,
	SUCCESS_MSG_LIFE: 15000,
	ERROR_MSG_LIFE: 15000
};

export default Constants;

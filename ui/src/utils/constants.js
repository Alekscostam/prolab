export const Cookie = {}

export const Constants = {
    DATE_FORMAT: {
        DATE_GET_REQUEST_FORMAT: 'YYYY-MM-DD',
        DATE_FORMAT: 'yyyy-MM-dd',
        DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm',
        TIME_FORMAT: 'HH:mm',
        MONTH_FORMAT: 'yyyy-MM',
    },
    BOOLEAN: {
        BOOLEAN_OPTIONS: [
            {value: true, label: 'Tak'},
            {value: false, label: 'Nie'},
        ],
        BOOLEAN_OPTIONS_ONLY_TRUE: [
            {value: true, label: 'Tak'}
        ],
    },
    SUCCESS_MSG_LIFE: 7500,
    ERROR_MSG_LIFE: 7500
};

export default Constants;

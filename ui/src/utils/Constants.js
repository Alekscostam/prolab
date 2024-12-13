export const Constants = {
    DATE_FORMAT: {
        YYYY_MM_DD: 'YYYY-MM-DD',
        YYYY_MM_DD_HHmmss: 'YYYY-MM-DD HH:mm:ss',
        YYYY_MM_DD_HHmm: 'YYYY-MM-DD HH:mm',
        DATE_FORMAT: 'yyyy-MM-dd',
        DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm',
        HHmm: 'HH:mm',
        MONTH_FORMAT: 'yyyy-MM',
        HH_mm_ss: 'HH:mm:ss',
    },
    BOOLEAN: {
        BOOLEAN_OPTIONS: [
            {value: true, label: 'Tak'},
            {value: false, label: 'Nie'},
        ],
        BOOLEAN_OPTIONS_ONLY_TRUE: [{value: true, label: 'Tak'}],
    },
    SUCCESS_MSG_LIFE: 7500,
    ERROR_MSG_LIFE: 7500,
    DEFAULT_DATA_PACKAGE_COUNT: 30,
    DEFAULT_MARGIN_BETWEEN_BUTTONS: 'mr-1',
    INTEGER_MAX_VALUE: 2147483647,
};

export default Constants;

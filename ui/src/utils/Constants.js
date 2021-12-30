export const Constants = {
    DATE_FORMAT: {
        DATE_FORMAT_MOMENT: 'YYYY-MM-DD',
        DATE_TIME_FORMAT_MOMENT: 'YYYY-MM-DD HH:mm',
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
    ERROR_MSG_LIFE: 7500,
    DEFAULT_DATA_PACKAGE_COUNT: 30,
};

export default Constants;

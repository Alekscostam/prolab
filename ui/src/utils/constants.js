export const Cookie = {
    CURRENT_SELECTED_MENU_ITEM: 'CURRENT_SELECTED_MENU_ITEM',
}

export const Constants = {
    DATE_FORMAT: {
        DATE_GET_REQUEST_FORMAT: 'YYYY-MM-DD',
        DATE_TIME_FORMAT_ISO: 'dd-MM-yyyy HH:mm:ss',
        DATE_FORMAT_ISO: 'dd-MM-YYYY',
        DATE_FORMAT: 'YYYY-MM-DD',
        DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
        DATE_MONTH_FORMAT: 'YYYY-MM',
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

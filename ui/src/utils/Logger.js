const LOG_MODES = {
    ALL: 'ALL',
    MEDIUM: 'MEDIUM',
    IMPORTANT: 'IMPORTANT',
    OFF: 'OFF',
};

const LOG_LEVELS = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
};

const MODE_MINIMUM_LEVEL = {
    ALL: LOG_LEVELS.DEBUG,
    MEDIUM: LOG_LEVELS.INFO,
    IMPORTANT: LOG_LEVELS.WARN,
};

const DEFAULT_LOG_MODE = LOG_MODES.OFF;
const WARSAW_TIME_ZONE = 'Europe/Warsaw';

const getConfiguredLogMode = () => {
    const configuredMode = process.env.REACT_APP_LOG_MODE;
    if (!configuredMode || configuredMode.trim() === '') {
        return DEFAULT_LOG_MODE;
    }

    const normalizedMode = configuredMode.trim().toUpperCase();

    if (!Object.prototype.hasOwnProperty.call(LOG_MODES, normalizedMode)) {
        console.warn(
            '[Logger] Nieprawidłowy REACT_APP_LOG_MODE:',
            configuredMode,
            '- używam trybu domyślnego:',
            DEFAULT_LOG_MODE
        );

        return DEFAULT_LOG_MODE;
    }

    return normalizedMode;
};

const CONFIGURED_LOG_MODE = getConfiguredLogMode();

const shouldDisplayLog = (level) => {
    if (CONFIGURED_LOG_MODE === LOG_MODES.OFF) {
        return false;
    }

    if (!level || typeof level !== 'string') {
        return false;
    }

    const normalizedLevel = level.trim().toUpperCase();
    const logLevelValue = LOG_LEVELS[normalizedLevel];

    if (!logLevelValue) {
        console.warn('[Logger] Nieobsługiwany poziom logu:', level);

        return false;
    }

    const minimumLevel = MODE_MINIMUM_LEVEL[CONFIGURED_LOG_MODE];

    return logLevelValue >= minimumLevel;
};

const getWarsawDateTime = () => {
    const now = new Date();

    const dateParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: WARSAW_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(now);

    const getDatePart = (type) => {
        const datePart = dateParts.find((part) => part.type === type);

        return datePart ? datePart.value : '';
    };

    const year = getDatePart('year');
    const month = getDatePart('month');
    const day = getDatePart('day');
    const hour = getDatePart('hour');
    const minute = getDatePart('minute');
    const second = getDatePart('second');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milliseconds;
};

const createPrefix = (level) => {
    return '[' + getWarsawDateTime() + '] [' + level + ']';
};

class Logger {
    static log(level, ...args) {
        const normalizedLevel = typeof level === 'string' ? level.trim().toUpperCase() : '';

        if (!shouldDisplayLog(normalizedLevel)) {
            return;
        }

        const prefix = createPrefix(normalizedLevel);

        switch (normalizedLevel) {
            case 'ERROR':
                console.error(prefix, ...args);
                break;

            case 'WARN':
                console.warn(prefix, ...args);
                break;

            case 'INFO':
                console.info(prefix, ...args);
                break;

            case 'DEBUG':
                console.log(prefix, ...args);
                break;

            default:
                console.log(prefix, ...args);
        }
    }

    static debug(...args) {
        Logger.log('DEBUG', ...args);
    }

    static info(...args) {
        Logger.log('INFO', ...args);
    }

    static warn(...args) {
        Logger.log('WARN', ...args);
    }

    static error(...args) {
        Logger.log('ERROR', ...args);
    }

    static getConfiguredMode() {
        return CONFIGURED_LOG_MODE;
    }

    static isEnabled(level) {
        return shouldDisplayLog(level);
    }
}

export const LogMode = {
    ALL: 'ALL',
    MEDIUM: 'MEDIUM',
    IMPORTANT: 'IMPORTANT',
    OFF: 'OFF',
};

export default Logger;

import Logger from './Logger';

const MAX_SET_INTERVAL_MS = 2_147_483_647;
const MINUTE_IN_MS = 60_000;

export function setInterval(callback, miliseconds, maxTimeInMinutes = 15) {
    let safeMilliseconds = miliseconds;
    let maxTimeInMs = MAX_SET_INTERVAL_MS;

    if (!Number.isFinite(miliseconds) || miliseconds <= 0) {
        Logger.warn(
            `Invalid miliseconds value: ${miliseconds}. Using maximum allowed value: ${MAX_SET_INTERVAL_MS} ms.`
        );

        safeMilliseconds = MAX_SET_INTERVAL_MS;
    } else if (miliseconds > MAX_SET_INTERVAL_MS) {
        Logger.warn(`miliseconds value ${miliseconds} exceeds maximum allowed value ${MAX_SET_INTERVAL_MS}.`);

        safeMilliseconds = MAX_SET_INTERVAL_MS;
    }

    if (!Number.isFinite(maxTimeInMinutes) || maxTimeInMinutes <= 0) {
        Logger.warn(`Invalid maxTimeInMinutes value: ${maxTimeInMinutes}. Using maximum allowed value.`);
    } else {
        maxTimeInMs = maxTimeInMinutes * MINUTE_IN_MS;

        if (maxTimeInMs > MAX_SET_INTERVAL_MS) {
            Logger.warn(
                `maxTimeInMinutes value ${maxTimeInMinutes} exceeds maximum allowed interval. Using ${MAX_SET_INTERVAL_MS} ms.`
            );

            maxTimeInMs = MAX_SET_INTERVAL_MS;
        }
    }

    safeMilliseconds = Math.min(safeMilliseconds, maxTimeInMs);

    return window.setInterval(callback, safeMilliseconds);
}

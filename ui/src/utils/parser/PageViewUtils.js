import moment from 'moment';

export class PageViewUtils {
    static tickerSessionTimeoutFormat(timeToLeaveSession) {
        return (
            'Czas wygaśnięcia sesji: ' +
            moment
                .utc(
                    timeToLeaveSession.hours * 3600000 +
                        timeToLeaveSession.minutes * 60000 +
                        timeToLeaveSession.seconds * 1000
                )
                .format('HH:mm:ss')
        );
    }
}

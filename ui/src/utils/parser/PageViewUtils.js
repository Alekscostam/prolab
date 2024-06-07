import moment from 'moment';
import LocUtils from '../LocUtils';

export class PageViewUtils {
    static tickerSessionTimeoutFormat(timeToLeaveSession, labels) {
        return (
            LocUtils.loc(labels, 'Session_expiration_time', 'Czas wygaśnięcia sesji: ') +
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

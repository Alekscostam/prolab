import BaseService from './BaseService';
import moment from 'moment';
import ConsoleHelper from "../utils/ConsoleHelper";

/*
GET zwracający dane potrzebne do wyrenderowania widoku: informacje ogólne o widoku, opcje
widoku, kolumny, przyciski, lista dokumentów oraz lista wtyczek.
 */
export default class ViewService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'view';
        this.getView = this.getView.bind(this);
        this.getSubView = this.getSubView.bind(this);
    }

    getView(viewId, viewType) {
        let viewTypeParam = '';
        if (!!viewType) {
            viewTypeParam = `?viewType=${viewType}`;
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}${viewTypeParam}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getSubView(viewId, recordId) {
        // czasem na jednym widoku, lub przy przejściu między widokami idzie kilka takich samych zapytań, jedno po drugim;
        // dlatego wyniki zapytań są zapamiętywane lokalnie na 5 sekund
        const cacheKey = JSON.stringify({viewId: parseInt(viewId), recordId: parseInt(recordId)});
        ConsoleHelper('getSubView: cacheKey=' + cacheKey);
        try {
            let cacheValue = JSON.parse(sessionStorage.getItem(cacheKey));
            if (cacheValue) {
                const expDate = cacheValue.expDate;
                const now = moment();
                if (now.isBefore(expDate)) {
                    if (cacheValue.data) {
                        ConsoleHelper('getSubView: returning data from cache');
                        return Promise.resolve(cacheValue.data);
                    }
                } else {
                    ConsoleHelper('getSubView: cache expired');
                }
            } else {
                ConsoleHelper('getSubView: cache value is empty');
            }
        } catch (err) {
            ConsoleHelper('getSubView: invalid format of cache value', err);
            sessionStorage.removeItem(cacheKey);
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}/subView/${recordId}`, {
            method: 'GET',
        })
            .then((result) => {
                const cacheValue = {
                    expDate: moment().add(5, 'seconds'),
                    data: result,
                }
                ConsoleHelper('getSubView: setting data to cache');
                sessionStorage.setItem(cacheKey, JSON.stringify(cacheValue));
                return Promise.resolve(result);
            })
            .catch((err) => {
                throw err;
            });
    }
}

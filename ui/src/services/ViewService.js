import BaseService from './BaseService';

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
    }

    getView(viewId, viewType) {
        if (!viewType) {
            viewType = 'listView';
        }
        return this.fetch(`${this.domain}/${this.path}/${viewId}?viewType=${viewType}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

    getSubView(viewId, recordId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/subView?recordId=${recordId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
}

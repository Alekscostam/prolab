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
        let viewTypeParam='';
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
        return this.fetch(`${this.domain}/${this.path}/${viewId}/subView?recordId=${recordId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
}

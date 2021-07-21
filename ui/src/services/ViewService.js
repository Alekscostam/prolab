import BaseService from "./BaseService";

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

    getView(viewId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

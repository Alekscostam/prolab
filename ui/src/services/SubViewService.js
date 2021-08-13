import BaseService from "./BaseService";

/*
GET zwracający dane potrzebne do wyrenderowania widoku: informacje ogólne o widoku, opcje
widoku, kolumny, przyciski, lista dokumentów oraz lista wtyczek.
 */
export default class SubViewService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'view';
        this.getView = this.getView.bind(this);
    }

    getSubView(viewId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}/subView`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

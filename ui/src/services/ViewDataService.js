import BaseService from "./BaseService";

//Deprecated
/*
GET zwracający dane potrzebne do wyrenderowania widoku: informacje ogólne o widoku, opcje
widoku, kolumny, przyciski, lista dokumentów oraz lista wtyczek.
 */
export default class ViewDataService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'viewdata';
        this.getViewData = this.getViewData.bind(this);
    }

    getViewData(viewId) {
        return this.fetch(`${this.domain}/${this.path}/${viewId}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

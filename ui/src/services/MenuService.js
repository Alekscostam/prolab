import BaseService from "./BaseService";

/*
GET wyświetlający strukturę menu, na którą składają się grupy widoków oraz widoki.
 */
export default class MenuService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'menu';
        this.getMenu = this.getMenu.bind(this);
    }

    getMenu() {
        return this.fetch(`${this.domain}/${this.path}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

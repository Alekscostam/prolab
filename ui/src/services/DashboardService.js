import BaseService from './BaseService';

/*
GET zwracający dane potrzebne do wyrenderowania widoku dashboardów
 */

export default class DashboardService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'dashboard';
        this.getDashboard = this.getDashboard.bind(this);
    }

    getDashboard() { 
        return this.fetch(`${this.domain}/${this.path}`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

import BaseServiceCrud from './BaseServiceCrud';

export default class ApiService extends BaseServiceCrud {
    constructor() {
        super();
        this.path = 'api';
    }

    changeLang(lang) {
        return this.fetch(`${this.domain}/User/changelang?lang=${encodeURIComponent(lang)}`, {
            method: 'POST',
        }).then((res) => {
            return Promise.resolve(res);
        });
    }
}

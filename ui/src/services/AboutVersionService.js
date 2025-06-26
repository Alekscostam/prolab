import BaseService from './BaseService';

export default class AboutVersionService extends BaseService {
    // Initializing important variables
    constructor(props) {
        super(props);
        this.path = 'aboutVersion';
    }

    getAboutVersion() {
        return this.fetch(`${this.domain}/${this.path}/aboutVersion.json`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }
}

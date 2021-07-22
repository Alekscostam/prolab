import BaseService from "./BaseService";

export default class ReadConfigService extends BaseService {
    // Initializing important variables
    constructor(props) {
        super(props);
        this.path = 'conf';
        this.getConfiguration = this.getConfiguration.bind(this);
    }

    getConfiguration() {
        return this.fetch(`${this.domain}/${this.path}/config.json`, {
            method: 'GET',
        }).catch((err) => {
            throw err;
        });
    }

}

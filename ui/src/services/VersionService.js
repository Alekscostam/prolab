import {reStateApp} from '../App';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import BaseService from './BaseService';

/*
GET wyświetlający informacje o wersji systemu
 */
export default class VersionService extends BaseService {
    // Initializing important variables
    constructor() {
        super();
        this.path = 'version';
        this.getVersion = this.getVersion.bind(this);
    }

    getVersion() {
        return this.fetch(`${this.domain}/${this.path}`, {
            method: 'GET',
        }).catch((err) => {
            console.log(err);
            window.location.href = AppPrefixUtils.locationHrefUrl('/#/');
            if (reStateApp) {
                reStateApp();
            }
        });
    }
}

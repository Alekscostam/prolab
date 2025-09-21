import {reStateApp} from '../App';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import UrlUtils from '../utils/UrlUtils';
import BaseService from './BaseService';

export default class VersionService extends BaseService {
    constructor() {
        super();
        this.path = 'version';
        this.getVersion = this.getVersion.bind(this);
    }

    getVersion() {
        if (!UrlUtils.isLoginPage()) {
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
}

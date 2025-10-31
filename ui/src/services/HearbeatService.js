import BaseService from './BaseService';

export default class HeartbeatService extends BaseService {
    constructor() {
        super();
        this.path = 'session/heartbeat';
    }

    heartbeat() {
        return this.fetch(`${this.domain}/${this.path}`, {
            method: 'POST',
        }).catch((err) => {
            throw err;
        });
    }
}

import BaseService from '../../services/BaseService';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

const url = 'https://js.devexpress.com/Demos/Mvc/api/SchedulerData';

export default class SchedulerDataStore extends BaseService {
    constructor() {
        super();
        this.path = 'View';
        this.response = {};
    }

    getDataStore() {
        return AspNetData.createStore({
            key: 'AppointmentId',
            loadUrl: `${url}/Get`,
            insertUrl: `${url}/Post`,
            updateUrl: `${url}/Put`,
            deleteUrl: `${url}/Delete`,
            onBeforeSend(_, ajaxOptions) {
                ajaxOptions.xhrFields = {withCredentials: true};
            },
        });
    }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/md-light-indigo/theme.css';
// import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import './assets/quill/quill.bubble.scss';
import './assets/quill/quill.core.scss';
import './assets/quill/quill.snow.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'devextreme/dist/css/dx.material.blue.light.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import './App.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import './assets/css/mdi.scss';
import '@mdi/font/css/materialdesignicons.min.css';
import {MyProvider} from './MyProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));

const theApp = (
    <MyProvider>
        <App />
    </MyProvider>
);

root.render(theApp);

serviceWorker.unregister();

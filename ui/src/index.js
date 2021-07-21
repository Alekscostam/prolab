import React from 'react';
import ReactDOM from 'react-dom';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/md-light-indigo/theme.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import './assets/quill/quill.bubble.scss';
import './assets/quill/quill.core.scss';
import './assets/quill/quill.snow.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {ThroughProvider} from 'react-through'


const theApp = (
    <ThroughProvider>
        <App/>
    </ThroughProvider>
)

ReactDOM.render(theApp, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

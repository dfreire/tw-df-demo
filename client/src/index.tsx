import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { init } from '@rematch/core';
import 'antd/dist/antd.css';
import './index.css';
import * as models from './models';
import App from './App';

const store = init({ models });

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();

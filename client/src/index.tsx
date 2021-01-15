import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import Config from './utils/Config';

Config.init();

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

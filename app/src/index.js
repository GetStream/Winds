import './index.css';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';

import packageInfo from '../package.json';

Raven.config(process.env.REACT_APP_SENTRY_DSN, {
	release: packageInfo.version,
}).install();

Raven.context(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
});

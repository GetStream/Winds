import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import stream from 'getstream';
import StreamAnalytics from 'stream-analytics';
import * as serviceWorker from './serviceWorker';

import config from './config';

Raven.config(config.sentry, {
	release: config.version,
}).install();

window.streamClient = stream.connect(config.stream.apiKey, null, config.stream.appID);

window.streamAnalyticsClient = new StreamAnalytics({
	apiKey: config.stream.apiKey,
	token: config.stream.analyticsKey,
});

Raven.context(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

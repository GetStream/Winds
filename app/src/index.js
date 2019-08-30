import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import stream from 'getstream';
import StreamAnalytics from 'stream-analytics';

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

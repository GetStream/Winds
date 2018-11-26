import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import stream from 'getstream';
import StreamAnalytics from 'stream-analytics';

Raven.config(process.env.REACT_APP_SENTRY_DSN, {
	release: process.env.REACT_APP_VERSION,
}).install();

window.streamClient = stream.connect(
	process.env.REACT_APP_STREAM_API_KEY,
	null,
	process.env.REACT_APP_STREAM_APP_ID,
);

window.streamAnalyticsClient = new StreamAnalytics({
	apiKey: process.env.REACT_APP_STREAM_API_KEY,
	token: process.env.REACT_APP_STREAM_ANALYTICS,
});

Raven.context(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
});

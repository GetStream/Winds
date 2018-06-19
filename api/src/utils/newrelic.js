import config from '../config';

if (config.newrelic) {
	require('newrelic');
}

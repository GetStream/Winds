import Analytics from 'electron-google-analytics';

import config from '../../config';

const analytics = new Analytics(config.google.analytics);

export default analytics;

import '../../loadenv';
import { Raven, CaptureError } from '../../utils/errors';
import logger from '../../utils/logger';
import { createSentryTransport } from '../utils/logger/sentry';

Raven.context(function() {
	Raven.setContext({ url: 'google' });
	Raven.captureBreadcrumb({ action: 'flashflood' });

	try {
		doSomething(a[0]);
	} catch (e) {
		console.log('sending to raven', e);
		Raven.captureException(e);
	}
});

console.log('v1', Raven.version);

const t = createSentryTransport(Raven);
console.log(t);

logger.error('Testing Sentry 123');

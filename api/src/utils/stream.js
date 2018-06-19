import stream from 'getstream';
import config from '../config';

var streamClient = null;

export function getStreamClient() {
	if (streamClient === null) {
		streamClient = stream.connect(
			config.stream.apiKey,
			config.stream.apiSecret,
		);
	}
	return streamClient;
}

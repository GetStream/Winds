import algolia from 'algoliasearch';
import config from '../../config';
import util from 'util';
import logger from '../../utils/logger';

if (config.algolia.appId && config.algolia.writeKey && config.algolia.index) {
	const client = algolia(config.algolia.appId, config.algolia.writeKey);
	const index = client.initIndex(config.algolia.index);
	const algoliaAddToIndex = async data => {
		if (!data.type) {
			throw new Error('Missing data.type key and value.');
		}
		await util.promisify(index.addObject)(data);
	};
	module.exports = algoliaAddToIndex;
} else {
	module.exports = async () => {
		logger.info('Faking search indexing')
	};
}

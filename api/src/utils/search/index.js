import algolia from 'algoliasearch';
import config from '../../config';
import util from 'util';
import logger from '../../utils/logger';

if (config.algolia.appId && config.algolia.writeKey && config.algolia.index) {
	const client = algolia(config.algolia.appId, config.algolia.writeKey);
	const index = client.initIndex(config.algolia.index);

	module.exports = async (data) => {
		if (!data.type) {
			throw new Error('Missing data.type key and value.');
		}
		await util.promisify(index.addObject.bind(index))(data);
	};

	module.exports.indexMany = async (data) => {
		await util.promisify(index.addObjects.bind(index))(data);
	};
} else {
	module.exports = async () => {
		logger.info('Faking search indexing');
	};

	module.exports.indexMany = function () {
		logger.info('Faking search indexing');
	};
}

import Episode from '../controllers/episode';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/episodes').get(wrapAsync(Episode.list));
	api.route('/episodes/:episodeId').get(wrapAsync(Episode.get));
};

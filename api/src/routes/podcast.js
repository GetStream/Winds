import Podcast from '../controllers/podcast';
import Episode from '../controllers/episode';
import {wrapAsync} from '../utils/controllers';

module.exports = api => {
	api.route('/podcasts').get(Podcast.list);
	api.route('/podcasts/:podcastId').get(wrapAsync(Podcast.get));
	api.route('/podcasts').post(wrapAsync(Podcast.post));
	api.route('/podcasts/:podcastId').put(Podcast.put);

	api.route('/podcasts/:podcastId/episodes').get(Episode.list);
	api.route('/podcasts/:podcastId/episodes/:episodeId').post(Episode.get);
};

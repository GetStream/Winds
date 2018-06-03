import RSS from '../controllers/rss';
import Article from '../controllers/article';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/rss').get(wrapAsync(RSS.list));
	api.route('/rss/:rssId').get(wrapAsync(RSS.get));
	api.route('/rss').post(wrapAsync(RSS.post));
	api.route('/rss/:rssId').put(wrapAsync(RSS.put));

	api.route('/rss/:rssId/articles').get(wrapAsync(Article.list));
	api.route('/rss/:rssId/articles/:articleId').get(wrapAsync(Article.get));
};

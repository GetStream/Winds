import Article from '../controllers/article';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/articles').get(Article.list);
	api.route('/articles/:articleId').get(wrapAsync(Article.get));
};

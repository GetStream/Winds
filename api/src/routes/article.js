import Article from '../controllers/article';
import asyncUtil from 'express-async-handler';

module.exports = api => {
	api.route('/articles').get(asyncUtil(Article.list));
	api.route('/articles/:articleId').get(asyncUtil(Article.get));
};

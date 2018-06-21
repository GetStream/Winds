import User from '../controllers/user';
import Feed from '../controllers/feed';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/users').get(wrapAsync(User.list));
	api.route('/users/:userId').get(wrapAsync(User.get));
	api.route('/users/:userId').put(wrapAsync(User.put));
	api.route('/users/:userId').delete(wrapAsync(User.delete));
	api.route('/users/:userId/feeds').get(wrapAsync(Feed.get));
};

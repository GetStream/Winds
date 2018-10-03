import Email from '../controllers/email';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/email').get(wrapAsync(Email.list));
	api.route('/email/:emailName').get(wrapAsync(Email.get));
	api.route('/email/:emailName').post(wrapAsync(Email.post));
};

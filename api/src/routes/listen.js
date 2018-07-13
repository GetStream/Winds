import Listen from '../controllers/listen';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/listens').get(wrapAsync(Listen.list));
	api.route('/listens').post(wrapAsync(Listen.post));
};

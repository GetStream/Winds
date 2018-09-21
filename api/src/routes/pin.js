import Pin from '../controllers/pin';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/pins').get(wrapAsync(Pin.list));
	api.route('/pins/:pinId').get(wrapAsync(Pin.get));
	api.route('/pins').post(wrapAsync(Pin.post));
	api.route('/pins/:pinId').delete(wrapAsync(Pin.delete));
};

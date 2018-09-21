import Alias from '../controllers/alias';
import { wrapAsync } from '../utils/controllers';

module.exports = api => {
	api.route('/aliases').get(wrapAsync(Alias.list));
	api.route('/aliases').post(wrapAsync(Alias.post));
	api.route('/aliases/:aliasId').get(wrapAsync(Alias.get));
	api.route('/aliases/:aliasId').put(wrapAsync(Alias.put));
	api.route('/aliases/:aliasId').delete(wrapAsync(Alias.delete));
};

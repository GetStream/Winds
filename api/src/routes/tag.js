import Tag from '../controllers/tag';
import { wrapAsync } from '../utils/controllers';

module.exports = (api) => {
	api.route('/tags').get(wrapAsync(Tag.list));
	api.route('/tags').post(wrapAsync(Tag.post));
	api.route('/tags/:tagId').get(wrapAsync(Tag.get));
	api.route('/tags/:tagId').put(wrapAsync(Tag.put));
	api.route('/tags/:tagId').delete(wrapAsync(Tag.delete));
};

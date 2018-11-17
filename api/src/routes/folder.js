import Folder from '../controllers/folder';
import { wrapAsync } from '../utils/controllers';

module.exports = (api) => {
	api.route('/folders').get(wrapAsync(Folder.list));
	api.route('/folders/:folderId').get(wrapAsync(Folder.get));
	api.route('/folders').post(wrapAsync(Folder.post));
	api.route('/folders/:folderId').put(wrapAsync(Folder.put));
	api.route('/folders/:folderId').delete(wrapAsync(Folder.delete));
	api.route('/folders/:folderId/feed').get(wrapAsync(Folder.feed));
};

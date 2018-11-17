import Note from '../controllers/note';
import { wrapAsync } from '../utils/controllers';

module.exports = (api) => {
	api.route('/notes').get(wrapAsync(Note.list));
	api.route('/notes').post(wrapAsync(Note.post));
	api.route('/notes/:noteId').get(wrapAsync(Note.get));
	api.route('/notes/:noteId').put(wrapAsync(Note.put));
	api.route('/notes/:noteId').delete(wrapAsync(Note.delete));
};

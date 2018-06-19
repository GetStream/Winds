import multer from 'multer';

import OPML from '../controllers/opml';
import { wrapAsync } from '../utils/controllers';

const upload = multer();

module.exports = api => {
	api.route('/opml/download').get(wrapAsync(OPML.get));
	api.route('/opml/upload').post(upload.single('opml'), wrapAsync(OPML.post));
};

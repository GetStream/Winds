import multer from "multer"

import OPML from "../controllers/opml"

const upload = multer()

module.exports = api => {
    api.route("/opml/download").get(OPML.get)
    api.route("/opml/upload").post(upload.single("opml"), OPML.post)
}

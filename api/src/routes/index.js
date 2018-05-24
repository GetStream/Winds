import Default from "../controllers/default"

module.exports = api => {
    api.route("/").get(Default.get)
    api.route("/").post(Default.post)
}

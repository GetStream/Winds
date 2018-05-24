import Follow from "../controllers/follow"

module.exports = api => {
    api.route("/follows").get(Follow.list)
    api.route("/follows/:followId").get(Follow.get)
    api.route("/follows").post(Follow.post)
    api.route("/follows").delete(Follow.delete)
}

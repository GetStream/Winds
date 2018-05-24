import Like from "../controllers/like"

module.exports = api => {
    api.route("/likes").get(Like.list)
    api.route("/likes/:likeId").get(Like.get)
    api.route("/likes").post(Like.post)
    api.route("/likes").delete(Like.delete)
}

import Comment from "../controllers/comment"

module.exports = api => {
    api.route("/comments").get(Comment.list)
    api.route("/comments").post(Comment.post)
    api.route("/comments/:commentId").get(Comment.get)
    api.route("/comments/:commentId").put(Comment.put)
}

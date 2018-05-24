import User from "../controllers/user"
import Feed from "../controllers/feed"
import Following from "../controllers/following"
import Follower from "../controllers/follower"

module.exports = api => {
    api.route("/users").get(User.list)
    api.route("/users/:userId").get(User.get)
    api.route("/users/:userId").put(User.put)

    api.route("/users/:userId/feeds").get(Feed.get)
    api.route("/users/:userId/following").get(Following.get)
    api.route("/users/:userId/followers").get(Follower.get)
}

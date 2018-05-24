import Episode from "../controllers/episode"

module.exports = api => {
    api.route("/episodes").get(Episode.list)
    api.route("/episodes/:episodeId").get(Episode.get)
}

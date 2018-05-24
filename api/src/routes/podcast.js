import Podcast from "../controllers/podcast"
import Episode from "../controllers/episode"

module.exports = api => {
    api.route("/podcasts").get(Podcast.list)
    api.route("/podcasts/:podcastId").get(Podcast.get)
    api.route("/podcasts").post(Podcast.post)
    api.route("/podcasts/:podcastId").put(Podcast.put)

    api.route("/podcasts/:podcastId/episodes").get(Episode.list)
    api.route("/podcasts/:podcastId/episodes/:episodeId").post(Episode.get)
}

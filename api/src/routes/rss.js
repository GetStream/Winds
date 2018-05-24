import RSS from "../controllers/rss"
import Article from "../controllers/article"

module.exports = api => {
    api.route("/rss").get(RSS.list)
    api.route("/rss/:rssId").get(RSS.get)
    api.route("/rss").post(RSS.post)
    api.route("/rss/:rssId").put(RSS.put)

    api.route("/rss/:rssId/articles").get(Article.list)
    api.route("/rss/:rssId/articles/:articleId").get(Article.get)
}

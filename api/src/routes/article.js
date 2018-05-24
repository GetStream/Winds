import Article from "../controllers/article"

module.exports = api => {
    api.route("/articles").get(Article.list)
    api.route("/articles/:articleId").get(Article.get)
}

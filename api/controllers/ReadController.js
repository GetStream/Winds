/**
 * ReadController
 *
 * @description :: Server-side logic for managing Reads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    markRead: function(req, res, next) {

        let userId = req.user.id,
            articles = req.body.articles

        if (!articles) {
            res.badRequest('Sorry, you need to provide a list of articles')
        }

        function markArticleRead(article, callback) {
            sails.models.read.create({
                user: userId,
                article: article
            }).exec(function(err, result) {
                callback(err, result)
            })
        }

        async.map(articles, markArticleRead, function(err, result) {
            if (err) {
                return res.serverError(err)
            } else {
                return res.ok({
                    articles: articles
                })
            }
        })

    },
};

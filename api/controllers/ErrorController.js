/**
 * ErrorController
 *
 * @description :: Server-side logic for managing errors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    four: function(req, res) {
        res.send(401)
    },

    five: function (req, res) {
        res.send(502)
    }

}

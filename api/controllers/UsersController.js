/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    aboutMe: function(req, res) {
        return res.ok(req.user.toJSON())
    },

    updatePassword: function(req, res) {

        const password = req.body.password

        if (!password) return res.badRequest('Please provide a valid password.')

        sails.models.users.update({ id: req.user.id }, { password: password }).exec(function(err, result) {

            if (err) {
                sails.log.error(err)
                return res.badRequest('Password update failed.');
            }

            return res.ok(req.user.toJSON())

        })

    },

};

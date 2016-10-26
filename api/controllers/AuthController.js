var passport = require('passport'),
    bcrypt = require('bcrypt'),
    randomstring = require('randomstring'),
    util = require('util')

module.exports = {

    register: function(req, res, next) {

        let email = req.body.email,
            password = req.body.password

        if (!password) { password = randomstring.generate(10) }

        req.checkBody('email', 'Invalid email address.').isEmail()

        if (req.validationErrors()) {
            return res.badRequest(req.validationErrors())
        }

        sails.models.users.findOrCreate({
            email: email
        }, {
            email: email,
            password: password
        }).exec(function(err, user) {

            if (err) {
                sails.log.error('registration failed', err)
                return res.badRequest('Registration failed. Could not create user.')
            }

            bcrypt.compare(password, user.password, function(err, validPassword) {

                if (err || !validPassword) {

                    sails.log.error('login failed', err)
                    return res.badRequest('Failed to login. Invalid password.')

                } else {

                    async.parallel([

                        callback => {

                            // send the registration email
                            let context = { password: password }

                            user.sendRegistrationEmail(context, function(err, result) {
                                callback(err, result)
                            })

                        }, callback => {

                            // follow the topics
                            let topicsToFollow = req.body.topics
                            FollowService.followTopics(user.id, topicsToFollow, callback)

                        }], function(err, results) {
                            if (err) {
                                sails.log.error(err)
                                return res.badRequest('Failed to send registration email.')
                            } else {
                                return res.ok(user.toJSON())
                            }
                        })

                }
            })

        })
    },

    login: function(req, res) {

        req.checkBody('email', 'Invalid email address.').isEmail()

        if (req.validationErrors()) return res.badRequest(req.validationErrors())

        passport.authenticate('local', function(err, user, info, something) {

            if (err || !user) {
                return res.badRequest(info.message)
            }
            req.logIn(user, function(err) {
                if (err) res.send(err)
                return res.send({
                    message: info.message,
                    user: user.toJSON()
                })
            })

        })(req, res)

    },

    logout: function(req, res) {
        req.logout()
        return res.ok({});
    },

    passwordReset: function(req, res) {

        let email = req.body.email,
            password = randomstring.generate(10)

        req.checkBody('email', 'Invalid email address.').isEmail()

        if (req.validationErrors()) {
            res.badRequest(req.validationErrors())
            return
        }

        sails.models.users.update({ email: email }, { password: password }).exec(function(err, users) {

            if (err || (users && !users.length)) {
                sails.log.error(err)
                return res.badRequest('Could not retrieve user.')
            }

            let context = { password: password },
                user = users[0]

            user.sendRegistrationEmail(context, function(err, result) {

                if (err) {
                    sails.log.error(err)
                    return res.badRequest('Failed to send registration email.')
                }

                return res.ok({})

            })

        })

    }

}

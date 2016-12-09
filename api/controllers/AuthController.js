var passport      = require('passport'),
    bcrypt        = require('bcrypt'),
    randomstring  = require('randomstring'),
    util          = require('util'),
    request       = require('request')

module.exports = {

    register: function(req, res, next) {

        let email = req.body.email,
            password = req.body.password

        if (!password || password == 'null') {
            password = randomstring.generate(10)
        }

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
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(err)
                } else {
                    sails.log.warn(err)
                }
                return res.badRequest('Registration failed. Could not create user.')
            }

            bcrypt.compare(password, user.password, function(err, validPassword) {

                if (err || !validPassword) {
                    return res.badRequest('Failed to login. Invalid password.')
                }

                async.parallel([

                    callback => {

                        let context = { password: password }

                        user.sendRegistrationEmail(context, function(err, result) {
                            callback(err, result)
                        })

                    }, callback => {

                        let topicsToFollow = req.body.topics
                        FollowService.followTopics(user.id, topicsToFollow, callback)

                    }], function(err, results) {

                        if (err) {
                            if (!_.isEmpty(sails.sentry)) {
                                sails.sentry.captureMessage(err)
                            } else {
                                sails.log.warn(err)
                            }
                            return res.badRequest('Failed to send registration email.')
                        }

                        return res.ok(user.toJSON())

                })

            })

        })
    },

    login: function(req, res) {

        req.checkBody('email', 'Invalid email address.').isEmail()

        if (req.validationErrors()) {
            return res.badRequest(req.validationErrors())
        }

        passport.authenticate('local', function(err, user, info) {

            if (err || !user) {
                return res.badRequest(info.message)
            }

            req.logIn(user, function(err) {

                if (err) {
                    return res.send(err)
                }

                return res.send({
                    message: info.message,
                    user: user.toJSON()
                })

            })

        })(req, res)

    },

    logout: function(req, res) {
        req.logout()
        return res.redirect('/app/getting-started')
    },

    passwordReset: function(req, res) {

        let email    = req.body.email,
            password = randomstring.generate(10)

        req.checkBody('email', 'Invalid email address.').isEmail()

        if (req.validationErrors()) {
            res.badRequest(req.validationErrors())
            return
        }

        sails.models.users.update({ email: email }, { password: password }).exec(function(err, users) {

            if (err || (users && !users.length)) {
                if (!_.isEmpty(sails.sentry)) {
                    sails.sentry.captureMessage(err)
                } else {
                    sails.log.warn(err)
                }
                return res.badRequest('Could not retrieve user.')
            }

            let context = { password: password },
                user = users[0]

            user.sendRegistrationEmail(context, function(err, result) {

                if (err) {
                    if (!_.isEmpty(sails.sentry)) {
                        sails.sentry.captureMessage(err)
                    } else {
                        sails.log.warn(err)
                    }
                    return res.badRequest('Failed to send registration email.')
                }

                return res.ok({})

            })

        })

    },

    facebookAuth: function(req, res) {

        passport.authenticate('facebook', {
            failureRedirect: '/app/getting-started?auth=false',
            scope: ['email'],
        }, function(err, user, info) {

            if (err || !user) {
                return res.redirect('/app-getting-started?auth=failed')
            }

            req.logIn(user, function(err) {

                if (err) {
                    if (!_.isEmpty(sails.sentry)) {
                        sails.sentry.captureMessage(err)
                    } else {
                        sails.log.warn(err)
                    }
                    return res.badRequest('Failed to login user via Facebook.')
                }

                let data = user.toJSON()

                let url = `/app/personalization-feed`
                    url += `?auth=true`
                    url += `&id=${data.id}`
                    url += `&jwt=${data.token}`
                    url += `&email=${data.email}`

                return res.redirect(url)

            })

        })(req, res)

    },

}

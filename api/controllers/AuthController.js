var passport = require('passport'),
    bcrypt = require('bcrypt'),
    randomstring = require('randomstring'),
    util = require('util'),
    request = require('request')

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

        let email = req.body.email,
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

        if (req.query.code) {

            let url = `https://graph.facebook.com/v2.8/oauth/access_token`
                url += `?client_id=${process.env.FACEBOOK_API_KEY}`
                url += `&redirect_uri=${process.env.FACEBOOK_CALLBACK_URI}`
                url += `&client_secret=${process.env.FACEBOOK_API_SECRET}`
                url += `&code=${req.query.code}`

            request.get({
                url: url,
            }, function(error, response, body) {

                if (error) {
                    sails.warn(error)
                    res.redirect('/app/getting-started#error')
                }

                let payload = JSON.parse(body)

                let url = `https://graph.facebook.com/me`
                    url += `?access_token=${payload.access_token}`
                    url += `&fields=id,email`

                request.get({
                    url: url,
                }, function(error, response, body) {

                    if (error) {
                        sails.warn(error)
                        res.redirect('/app/getting-started#error')
                    }

                    payload = JSON.parse(body)

                    passport.authenticate('local', function(err, user, info) {

                        if (err || !user) {
                            console.log('OH SHIT', info)
                            return res.badRequest(info.message)
                        }

                        console.log('USER', user)

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

                })

            })

        } else {
            res.redirect('/app/getting-started#unauthorized')
        }

    }

}

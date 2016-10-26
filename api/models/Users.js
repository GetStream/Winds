var bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    path = require('path'),
    htmlToText = require('nodemailer-html-to-text').htmlToText;

function saltPassword(newPassword, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            sails.log.error('failed to generate a salt', err)
            callback(err, null)
        }
        bcrypt.hash(newPassword, salt, function(err, hash) {
            if (err) {
                sails.log.error('failed to hash the password', err)
            }
            callback(err, hash)
        });
    });
}

module.exports = {
    attributes: {
        email: {
            type: 'email',
            required: true,
            unique: true
        },
        password: {
            type: 'string',
            minLength: 6,
        },
        toJSON: function() {
            var obj = this.toObject()
            delete obj.password
            obj.token = this.getJWTToken()
            obj.feedTokens = {}
            obj.feedTokens['timeline'] = StreamService.client.feed('timeline', this.id).getReadOnlyToken()
            return obj;
        },
        getJWTToken: function() {
            let token = jwt.sign({
                    sub: this.id,
                    iss: sails.config.passport.issuer,
                    audience: sails.config.passport.audience
                },
                sails.config.passport.secret
            )
            return token
        },
        sendRegistrationEmail: function(context, callback) {
            let userEmail = this.email
            let EmailTemplate = require('email-templates').EmailTemplate
            let templateDir = path.join(__dirname, '../../views', 'emails', 'signup')
            let newsletter = new EmailTemplate(templateDir)

            newsletter.render(context, function(err, result) {
                MailerService
                    .send({
                        to: userEmail,
                        subject: result.subject,
                        html: result.html,
                        text: result.text
                    })
                    .then(function(result) {
                        callback(null, result)
                    })
                    .catch(callback);
            })
            
        },

    },
    beforeCreate: function(user, cb) {
        saltPassword(user.password, function(err, passwordHash) {
            if(!err) {
                user.password = passwordHash
            }
            cb(err, passwordHash)
        })
    },
    beforeUpdate: function(changedValues, cb) {
        if (changedValues.password) {
            saltPassword(changedValues.password, function(err, passwordHash) {
                if(!err) {
                    changedValues.password = passwordHash
                }
                cb(err, passwordHash)
            })
        } else {
            cb(null, changedValues)
        }
    }
};

var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
bcrypt = require('bcrypt');

let config = {
    secret: 'Yt7MCuotQOKZRnfPeDyxQuXYKugMpBlL3RRCxp3Gziz8omKEPD',
    issuer: 'getstream.io',
    audience: 'getstream.io'
}

module.exports = {
    passport: config
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Users.findOne({ id: id } , function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    Users.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      bcrypt.compare(password, user.password, function (err, res) {
          if (!res)
            return done(null, false, {
              message: 'Invalid Password'
            });
          return done(null, user, {
            message: 'Logged In Successfully'
          });
        });
    });
  }
));

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt

var opts = {}

opts.jwtFromRequest = function(request) {
    let t = ExtractJwt.fromAuthHeader()(request)
    return t
}
opts.secretOrKey = config.secret
opts.issuer = config.issuer

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    Users.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    });
}));

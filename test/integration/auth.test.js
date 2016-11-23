var request = require('supertest'),
    assert = require('chai').assert,
    Chance = require('chance'),
    chance = new Chance()

describe('Auth', function() {

    let email    = chance.email(),
        password = chance.string({length: 6})

    it('registers a new user', function (done) {
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': test.email, 'password': test.password})
        .expect(200, function(err, result) {
            assert(result.body.token)
            assert(result.body.id)
            done()
        })
    })

    it('registers a new user without a password', function (done) {
        sails.models.users.destroy({email: chance.email()}).exec(function(err, result) {
            request(sails.hooks.http.app)
              .post('/api/register')
              .send({'email': email})
              .expect(200, function(err, result) {
                  assert(result.body.token)
                  assert(result.body.id)
                  done()
              })
        })
    })

    it('registers a new user with a null password', function (done) {
        let emailNull = chance.email()
        sails.models.users.destroy({email: chance.email()}).exec(function(err, result) {
            request(sails.hooks.http.app)
              .post('/api/register')
              .send({'email': emailNull, 'password': 'null'})
              .expect(200, function(err, result) {
                  assert(result.body.token)
                  assert(result.body.id)
                  done()
              })
        })
    })

    it('returns a bad response code when registration fails', function (done) {
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': 'invalid.com'})
        .expect(400, function(err, result) {
            done()
        })
    })

    it('successfully logs in a user', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': test.email, 'password': test.password})
        .expect(200, function(err, result) {
            assert(result.body.user.token)
            assert(result.body.user.id)
            done()
        })
    })

    it('returns a jwt token', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': test.email, 'password': test.password})
        .expect(200, function(err, result) {
            let token = result.body.user.token
            request(sails.hooks.http.app)
              .get('/api/stream/personalized')
              .set('Authorization', `JWT ${token}`)
              .expect(200, done)
        })
    })

    it('fails to login', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': 'foo@bar.com'})
        .expect(400, done)
    })

    it('fails to login when an invalid password', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': test.email, 'password': test.password + 'abc'})
        .expect(400, done)
    })

    it('logs out a user', function (done) {
      request(sails.hooks.http.app)
        .get('/api/logout')
        .expect(302, done)
    })

    it('resets a users password', function (done) {
      let email = chance.email()
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': email, 'password': chance.string({length: 6})})
        .expect(200, function(err, result) {
            assert.ifError(err)
            let token = result.body.token
            request(sails.hooks.http.app)
              .post('/api/password_reset')
              .send({'email': email})
              .set('Authorization', `JWT ${token}`)
              .expect(200, function(err, result) {
                  assert.ifError(err)
                  done()
              })
        })
    })

})

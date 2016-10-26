let request = require('supertest'),
    assert = require('chai').assert,
    Chance = require('chance'),
    chance = new Chance();

describe('Auth test', function() {
    let password = '123456abc',
        email = 'thierry+aaa@getstream.io'

    it('register', function (done) {
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': email, 'password': password})
        .expect(200, function(err, result) {
            assert(result.body.token)
            assert(result.body.id)
            done()
        })
    });

    it('registernopassword', function (done) {
        let testEmail = 'thierry+newuser@getstream.io'
        sails.models.users.destroy({email: testEmail}).exec(function(err, result) {
            if(err) sails.log.error(err)
            request(sails.hooks.http.app)
              .post('/api/register')
              .send({'email': testEmail})
              .expect(200, function(err, result) {
                  console.log(err, result.body)
                  assert(result.body.token)
                  assert(result.body.id)
                  done()
              })
        })
    });

    it('invalidregister', function (done) {
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': 'invalid.com'})
        .expect(400, function(err, result) {
            done()
        })
    });

    // test login
    it('loginsuccess', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': email, 'password': password})
        .expect(200, function(err, result) {
            assert(result.body.user.token)
            assert(result.body.user.id)
            done()
        })
    });

    // test jwt
    it('jwt', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': email, 'password': password})
        .expect(200, function(err, result) {
            let token = result.body.user.token
            // read the personalized feed
            request(sails.hooks.http.app)
              .get('/api/stream/personalized')
              .set('Authorization', `JWT ${token}`)
              .expect(200, done)
        })
    });

    // test invalid login
    it('loginfail', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': 'ttt@gmail.com'})
        .expect(400, done)
    });

    // test invalid login
    it('loginfail2', function (done) {
      request(sails.hooks.http.app)
        .post('/api/login')
        .send({'email': email, 'password': password + 'abc'})
        .expect(400, done)
    });

    // test logout
    it('logout', function (done) {
      request(sails.hooks.http.app)
        .get('/api/logout')
        .expect(200, done)
    });

    // test password reset
    it('passwordreset', function (done) {
        let email = chance.email()
      request(sails.hooks.http.app)
        .post('/api/register')
        .send({'email': email, 'password': 'changed'})
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
    });

});

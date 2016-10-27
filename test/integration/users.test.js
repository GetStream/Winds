var request = require('supertest'),
    Chance  = require('chance'),
    chance  = new Chance()

describe('Users', function() {

    it('me endpoint returns data on the current user', function (done) {
        request(sails.hooks.http.app)
          .get('/api/me')
          .set('Authorization', `JWT ${test.token}`)
          .expect(200, function(err, result) {
              done()
          })
    })

    it('can update their password', function (done) {
        request(sails.hooks.http.app)
          .post('/api/update_password')
          .send({'password': chance.string({length: 6})})
          .set('Authorization', `JWT ${test.token}`)
          .expect(200, done)
    })

})

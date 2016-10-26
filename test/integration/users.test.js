var request = require('supertest');

describe('Users', function() {
    it.skip('updatepassword', function (done) {
        request(sails.hooks.http.app)
          .post('/api/update_password')
          .send({'password': 'abc1337777777'})
          .set('Authorization', `JWT ${sails.test.token}`)
          .expect(200, done)
    });

    it('me', function (done) {
        request(sails.hooks.http.app)
          .get('/api/me')
          .set('Authorization', `JWT ${sails.test.token}`)
          .expect(200, function(err, result) {
              done()
          })
    });

});

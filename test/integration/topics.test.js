var request = require('supertest');

describe('Topics', function() {
    it('readtopics', function (done) {
        request(sails.hooks.http.app)
          .get('/api/topics')
          .set('Authorization', `JWT ${sails.test.token}`)
          .expect(200, done)
    });
    it('readanonymous', function (done) {
        request(sails.hooks.http.app)
          .get('/api/topics')
          .expect(200, done)
    });
});

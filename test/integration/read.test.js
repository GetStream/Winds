var request = require('supertest');

describe('Read', function() {

    it('mark3', function (done) {
      request(sails.hooks.http.app)
        .post('/api/mark_read')
        .send({ articles: [1,2,3]})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('mark100', function (done) {
      request(sails.hooks.http.app)
        .post('/api/mark_read')
        .send({ articles: _.range(100)})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

});

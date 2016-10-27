var request = require('supertest')

describe('Topics', function() {

    it('allows logged in users to read from the topics and returns the status', function (done) {
        request(sails.hooks.http.app)
          .get('/api/topics')
          .set('Authorization', `JWT ${test.token}`)
          .expect(200, done)
    })

    it('allows anonoymous users to read from the api', function (done) {
        request(sails.hooks.http.app)
          .get('/api/topics')
          .expect(200, done)
    })

})

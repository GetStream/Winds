var request = require('supertest')

describe('Upload', function() {

    it('upload opml file', function (done) {
        request(sails.hooks.http.app)
          .post('/api/uploads/opml')
          .attach('opml', 'test/data/saas.opml')
          .set('Authorization', `JWT ${test.token}`)
          .expect(200, done)
    })

})

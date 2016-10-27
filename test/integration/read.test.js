var request = require('supertest')

describe('Read', function() {

    it('marks multiple articles as read', function (done) {
      request(sails.hooks.http.app)
        .post('/api/mark_read')
        .send({ articles: [1,2,3]})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('marks 100 articles (in bulk) as read', function (done) {
      request(sails.hooks.http.app)
        .post('/api/mark_read')
        .send({ articles: _.range(100)})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

})

var request = require('supertest')

describe('Follows Topics', function() {

    let topicId = '5807c78cd64043631fc3ac5d'

    it('follows a topic', function (done) {
      request(sails.hooks.http.app)
        .post('/api/follow_topics')
        .set('Authorization', `JWT ${test.token}`)
        .send({'follow': [topicId]})
        .expect(200, done)
    })

    it('unfollows a topic', function (done) {
      request(sails.hooks.http.app)
        .post('/api/follow_topics')
        .set('Authorization', `JWT ${test.token}`)
        .send({'unfollow': ['5807e9f6ef5aebaf9165d0b6']})
        .expect(200, done)
    })

    it('unfollows a topic', function (done) {
      request(sails.hooks.http.app)
        .post('/api/unfollow')
        .set('Authorization', `JWT ${test.token}`)
        .send({'feed_id': ['5807e9f6ef5aebaf9165d0b6']})
        .expect(200, function(err, result) {
            done()
        })
    })

    it('optionally follows a topic of type feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/follows')
        .set('Authorization', `JWT ${test.token}`)
        .query({'type': 'feed'}) // NOTE: type can be feed or topic
        .expect(200, function(err, response) {
            done()
        })
    })

    it('follows a topic of unknown type', function (done) {
      request(sails.hooks.http.app)
        .get('/api/follows')
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

})

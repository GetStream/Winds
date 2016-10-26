var request = require('supertest');

describe('Follow topics', function() {

    let topicId = '5807c78cd64043631fc3ac5d'

    it('dofollow', function (done) {
      request(sails.hooks.http.app)
        .post('/api/follow_topics')
        .set('Authorization', `JWT ${sails.test.token}`)
        .send({'follow': [topicId]})
        .expect(200, done)
    });

    it('dounfollow', function (done) {
      request(sails.hooks.http.app)
        .post('/api/follow_topics')
        .set('Authorization', `JWT ${sails.test.token}`)
        .send({'unfollow': ['5807e9f6ef5aebaf9165d0b6']})
        .expect(200, done)
    });

    it('dounfollowfeed', function (done) {
      request(sails.hooks.http.app)
        .post('/api/unfollow')
        .set('Authorization', `JWT ${sails.test.token}`)
        .send({'feed_id': ['5807e9f6ef5aebaf9165d0b6']})
        .expect(200, function(err, result) {
            done()
        })
    });

    it('readfollows1', function (done) {
      request(sails.hooks.http.app)
        .get('/api/follows')
        .set('Authorization', `JWT ${sails.test.token}`)
        // type is optional and can be feed or topic
        .query({'type': 'feed'})
        .expect(200, function(err, response) {
            done()
        })
    });

    it('readfollows2', function (done) {
      request(sails.hooks.http.app)
        .get('/api/follows')
        .set('Authorization', `JWT ${sails.test.token}`)
        // type is optional and can be feed or topic
        .expect(200, done)
    });

});

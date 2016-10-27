let request = require('supertest'),
    assert = require('assert')

describe('Stream', function() {

    describe('chronological', function() {
        it('returns a permission denied error', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/chronological')
                .expect(403, done)
        })

        it('returns a successful response code', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/chronological')
                .set('Authorization', `JWT ${test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        })
    })

    describe('personalized', function() {
        it('reads a personalized feed', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/personalized')
                .set('Authorization', `JWT ${test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        })
    })

    describe('feed', function() {
        it('reads the spacex feed', function(done) {
            let feed = '5807e4f325b5b23e2359ccbd'
            request(sails.hooks.http.app)
                .get('/api/stream/feed')
                .query({
                    feed: feed
                })
                .set('Authorization', `JWT ${test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        })
    })

    describe('interest profile', function() {
        it('returns the interest profile values', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/interest_profile')
                .set('Authorization', `JWT ${test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        })
    })

    describe('event counts', function() {
        it('returns the event counts for a user', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/event_counts')
                .set('Authorization', `JWT ${test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        })
    })


})

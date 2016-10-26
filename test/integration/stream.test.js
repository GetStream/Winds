let request = require('supertest'),
    assert = require('assert')

describe('Stream', function() {

    describe('chronological', function() {
        it('permissiondenied', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/chronological')
                .expect(403, done)
        });

        it('readchronological', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/chronological')
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200, function(err, result) {
                    done()
                })
        });
        it.skip('secondpage', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/chronological')
                .set('Authorization', `JWT ${sails.test.token}`)
                .query({
                    limit: 2
                })
                .expect(200)
                .end(function(err, res) {
                    let firstId = res.body.results[0]['id'],
                        secondId = res.body.results[1]['id']
                    // query with offset firstId and secondId
                    request(sails.hooks.http.app)
                        .get('/api/stream/chronological')
                        .set('Authorization', `JWT ${sails.test.token}`)
                        .query({
                            limit: 2,
                            id_lt: firstId
                        })
                        .expect(200)
                        .end(function(err, res) {
                            assert.equal(res.body.results[0]['id'], secondId)
                            done()
                        })
                })
        });
    });


    describe('personalized', function() {
        it('readpersonalized', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/personalized')
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200, function(err, result) {
                    console.log('err', err, result.body)
                    done()
                })
        });
        it.skip('should show the second personalized page', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/personalized')
                .query({
                    limit: 2
                })
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200)
                .end(function(err, res) {
                    let firstId = res.body.results[0]['id'],
                        secondId = res.body.results[1]['id'],
                        version = res.body.version
                        // query with version and offset
                    request(sails.hooks.http.app)
                        .get('/api/stream/personalized')
                        .set('Authorization', `JWT ${sails.test.token}`)
                        .query({
                            limit: 10,
                            version: version,
                            offset: 1
                        })
                        .expect(200)
                        .end(function(err, res) {
                            assert.equal(res.body.results[0]['id'], secondId)
                            done()
                        })
                })
        });
    });

    describe('feed', function() {
        it('readfeed', function(done) {
            let spacex = '5807e4f325b5b23e2359ccbd'
            request(sails.hooks.http.app)
                .get('/api/stream/feed')
                .query({
                    feed: spacex
                })
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200, function(err, result) {
                    console.log(result.body)
                    done()
                })
        });
    });

    describe('interestprofile', function() {
        it('basicread', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/interest_profile')
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200, function(err, result) {
                    console.log('err', err, result.body)
                    done()
                })
        });
    });

    describe('eventcounts', function() {
        it('eventcounts', function(done) {
            request(sails.hooks.http.app)
                .get('/api/stream/event_counts')
                .set('Authorization', `JWT ${sails.test.token}`)
                .expect(200, function(err, result) {
                    console.log('err', err, result.body)
                    done()
                })
        });
    });


});

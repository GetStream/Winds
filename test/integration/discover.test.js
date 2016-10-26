var request = require('supertest'),
    assert = require('assert');

describe('Discover', function() {

    it('spacex', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'spacex.com'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('spacex2', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'http://www.spacex.com/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('engadget', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'engadget.com'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('google', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'google.com'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(400, function(err, result) {
            assert.ifError(err)
            done()
        })
    });

    it('highscalability', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'http://highscalability.com/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('onstartups', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'http://onstartups.com/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('gizmododirect', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'http://feeds.gawker.com/gizmodo/full'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('darkreading', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'http://www.darkreading.com/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('security', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'https://security.googleblog.com/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('securitydirect', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'https://googleonlinesecurity.blogspot.com/atom.xml'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });

    it('yourshot', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'yourshot.nationalgeographic.com'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(400, done)
    });

    it('sentry', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .query({ url: 'https://blog.sentry.io/'})
        .set('Authorization', `JWT ${sails.test.token}`)
        .expect(200, done)
    });


});

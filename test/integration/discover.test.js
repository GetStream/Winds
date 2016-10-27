var request = require('supertest'),
    assert = require('assert')

describe('Discover', function() {

    it('finds the spacex rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://spacex.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the engadget rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://engadget.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('fails on the google rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'google.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, function(err, result) {
            assert.ifError(err)
            done()
        })
    })

    it('finds the highscalability rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://highscalability.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the onstartups rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://onstartups.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the gizmododirect rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://feeds.gawker.com/gizmodo/full'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the darkreading rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'http://www.darkreading.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the security rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://security.googleblog.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('finds the securitydirect rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://googleonlinesecurity.blogspot.com/atom.xml'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })

    it('fails to find the yourshot rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'yourshot.nationalgeographic.com'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, done)
    })

    it('gets the meta information for producthunt', function(done) {
        ScrapingService.getMetaInformation('https://www.producthunt.com/r/ad762e0562240c/80616?app_id=339', function(err, meta) {
            done()
        })
    })

    it('fails to find the producthunt rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://www.producthunt.com/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(400, done)
    })

    it('finds the sentry rss feed', function (done) {
      request(sails.hooks.http.app)
        .get('/api/rss/discover')
        .timeout(10000)
        .query({ url: 'https://blog.sentry.io/'})
        .set('Authorization', `JWT ${test.token}`)
        .expect(200, done)
    })


})

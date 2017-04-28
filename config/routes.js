/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://links.sailsjs.org/docs/config/routes
 */

module.exports.routes = {

  '/': {
      view: 'index'
  },

  '/app': {
      view: 'homepage'
  },

  '/app/personalization-feed': {
      view: 'homepage'
  },

  '/app/subscriptions': {
      view: 'homepage'
  },

  '/app/subscriptions/:id': {
      view: 'homepage'
  },

  '/app/getting-started': {
      view: 'homepage'
  },

  '/app/logout': {
      view: 'homepage'
  },

  'get /api/me': 'UsersController.aboutMe',

  'get /api/stream/chronological': 'StreamController.chronological',
  'get /api/stream/personalized': 'StreamController.personalized',
  'get /api/stream/suggestions': 'StreamController.getFeedSuggestions',
  'put /api/stream/suggestions': 'StreamController.updateFeedSuggestions',
  'get /api/stream/feed': 'StreamController.readFeed',
  'get /api/stream/interest_profile': 'StreamController.interestProfile',
  'get /api/stream/event_counts': 'StreamController.eventCounts',

  'post /api/mark_read': 'ReadController.markRead',

  'post /api/follow_topics': 'FollowsController.followTopics',
  'get /api/follows': 'FollowsController.readFollows',
  'post /api/unfollow': 'FollowsController.unfollowFeed',

  'get /api/topics': 'TopicsController.readTopics',
  'get /api/rss/discover': 'SitesController.discover',

  'post /api/login': 'AuthController.login',
  'get /api/logout': 'AuthController.logout',
  'post /api/register': 'AuthController.register',
  'post /api/password_reset': 'AuthController.passwordReset',

  'post /api/update_password': 'UsersController.updatePassword',
  'post /api/uploads/opml': 'UploadController.opml',

  'get /api/like': 'LikeController.getLike',
  'post /api/like': 'LikeController.addLike',
  'delete /api/like': 'LikeController.deleteLike',

  'get /api/auth/facebook': 'AuthController.facebookAuth',

};

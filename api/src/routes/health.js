import Health from '../controllers/health';

module.exports = api => {
	api.route('/health').get(Health.health);
	api.route('/test').get(Health.test);
};

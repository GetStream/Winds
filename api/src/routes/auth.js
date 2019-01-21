import Auth from '../controllers/auth';
import { wrapAsync } from '../utils/controllers';

module.exports = (api) => {
	api.route('/auth/signup').post(wrapAsync(Auth.signup));
	api.route('/auth/login').post(wrapAsync(Auth.login));
	api.route('/auth/forgot-password').post(wrapAsync(Auth.forgotPassword));
	api.route('/auth/reset-password').post(wrapAsync(Auth.resetPassword));
};

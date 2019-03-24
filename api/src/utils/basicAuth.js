import basicAuth from 'express-basic-auth';
import User from '../models/user';

const asyncAuthorizer = async (email, password, cb) => {
	if (!email || !password) return cb(null, false);

	const user = await User.findOne({ email: email.toLowerCase().trim(), admin: true });
	if (!user) return cb(null, false);

	if (!(await user.verifyPassword(password))) return cb(null, false);
	return cb(null, true);
};

export default basicAuth({
	authorizer: asyncAuthorizer,
	authorizeAsync: true,
	challenge: true,
});

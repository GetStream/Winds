import User from '../models/user';
import { weeklyContextGlobal, weeklyContextUser } from '../utils/email/context';
import { SendWeeklyEmail, CreateWeeklyEmail } from '../utils/email/send';

exports.list = async (req, res) => {
	res.json(['weekly']);
};

exports.get = async (req, res) => {
	if (req.params.emailName === 'weekly') {
		const user = req.query.user;

		if (!query.rss && !mongoose.Types.ObjectId.isValid(user)) {
			return res.status(400).json({ error: `Invalid user id ${user}.` });
		}

		let user = await User.findOne({ _id: user, admin: true });
		let context = Object.assign(
			{},
			await weeklyContextGlobal(),
			await weeklyContextUser(user),
		);
		let obj = CreateWeeklyEmail(context);

		return res.type('html').send(obj.html);
	}
};

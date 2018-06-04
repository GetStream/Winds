import config from '../src/config';
import jwt from 'jsonwebtoken';
import redis from 'redis';
import db from '../src/utils/db';

function withLogin(r) {
	const authToken = jwt.sign({
		email: 'valid@email.com',
		sub: '5b0f306d8e147f10f16aceaf',
	}, config.jwt.secret);
	return r.set('Authorization', `Bearer ${authToken}`);
}

exports.withLogin = withLogin;

exports.reset = async function() {
	const redisClient = redis.createClient(config.cache.uri);
	const mongo = await db;
	await mongo.connection.dropDatabase();
	await redisClient.send_command('FLUSHDB');
};

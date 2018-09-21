import Redis from 'ioredis';

import config from '../config';

const redis = new Redis(config.cache.uri);

redis.defineCommand('rateLimit', {
	numberOfKeys: 2,
	lua: `
		local requestsPerDay = tonumber(ARGV[1])
		local microsecondsPerDay = 24 * 60 * 60 * 1000 * 1000
		local requestsPerMicrosecond = requestsPerDay / microsecondsPerDay
		local microsecondsPerRequest = 1 / requestsPerMicrosecond

		local time = redis.call('TIME')
		local now = tonumber(time[1]) * 1000000 + tonumber(time[2])

		local value = tonumber(redis.call('GET', KEYS[1])) or requestsPerDay
		local lastUpdate = tonumber(redis.call('GET', KEYS[2])) or now

		local timePassed = now - lastUpdate
		local newValue = math.min(requestsPerDay, value + requestsPerMicrosecond * timePassed)
		local timeUntilRefil = math.min(microsecondsPerRequest, math.max(0, microsecondsPerRequest - timePassed))
		redis.replicate_commands()
		if math.floor(newValue) > 0 then
			newValue = newValue - 1
			redis.call('SET', KEYS[2], now)
			timeUntilRefil = -1
		end
		redis.call('SET', KEYS[1], newValue)
		return tostring(timeUntilRefil)
	`,
});

function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

export async function tick(userID, requestsPerDay = 3000) {
	const valueKey = `rate-limit:${userID}:value`;
	const lastUpdateKey = `rate-limit:${userID}:last-update`;
	const timeUntilRefil = parseFloat(
		await redis.rateLimit(valueKey, lastUpdateKey, requestsPerDay),
	);
	if (timeUntilRefil === -1) {
		return;
	}
	await sleep(timeUntilRefil / 1000);
	return tick(userID);
}

export async function reset(userID) {
	const valueKey = `rate-limit:${userID}:value`;
	const lastUpdateKey = `rate-limit:${userID}:last-update`;
	return await redis.del(valueKey, lastUpdateKey);
}

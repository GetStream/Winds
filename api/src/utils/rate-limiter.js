function refil() {
	const timePassed = Date.now() - this.lastUpdate;
	const requestsPerMillisecond = this.requestsPerMinute / 60000;
	const millisecondsPerRequest = 1 / requestsPerMillisecond;
	this.value = Math.min(this.requestsPerMinute, this.value + requestsPerMillisecond * timePassed);
	return Math.min(millisecondsPerRequest, Math.max(0, millisecondsPerRequest - timePassed));
}

function tick() {
	const timeUntilRefil = this.refil();

	if (Math.floor(this.value) > 0) {
		--this.value;
		this.lastUpdate = Date.now();
		return Promise.resolve();
	}
	return new Promise((resolve, _) => {
		setTimeout(() => this.tick().then(resolve), timeUntilRefil);
	});
}

export function rateLimiter(requestsPerMinute) {
	return { lastUpdate: Date.now(), value: requestsPerMinute, requestsPerMinute, tick, refil };
}

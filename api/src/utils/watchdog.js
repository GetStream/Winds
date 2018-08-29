import { getStatsDClient } from './statsd';

const defaultSampleInterval = 60;

export function startSampling(metricName, sampleInterval = defaultSampleInterval) {
	const statsd = getStatsDClient();

	function updateMetric(diff) {
		const elapsed = diff[0] * 1000 + diff[1] / 1000000 - sampleInterval;
		statsd.timing(metricName, elapsed);
	}

	function loop() {
		let time = process.hrtime();

		setTimeout(() => {
			const diff = process.hrtime(time);

			//XXX: scheduling statsd metric update to avoid disrupting measuring loop
			process.nextTick(() => updateMetric(diff));

			time = process.hrtime();

			loop();
		}, sampleInterval);
	}

	loop();
}

import '../utils/db';
import program from 'commander';
import Podcast from '../models/podcast';
import Article from '../models/article';
import Episode from '../models/episode';

import RSS from '../models/rss';

import { OgQueueAdd } from '../asyncTasks';

program
	.option('--all', 'Rescrape articles for which we already have an og image')
	.parse(process.argv);

function partitionBy(collection, selector) {
	if (!collection.length) {
		return [];
	}

	const partitions = [[collection[0]]];
	let currentPartition = 0;
	let lastElement = selector(collection[0]);
	for (let i = 1; i < collection.length; ++i) {
		const element = selector(collection[i]);
		if (element !== lastElement) {
			partitions.push([]);
			++currentPartition;
		}
		partitions[currentPartition].push(collection[i]);
		lastElement = element;
	}
	return partitions;
}

async function main() {
	const schemas = { podcast: Podcast, rss: RSS, episode: Episode, article: Article };
	const fieldMap = { article: 'url', episode: 'link', podcast: 'url', rss: 'url' };
	const feedIdMap = { episode: 'podcast', article: 'rss', rss: '_id', podcast: '_id' };
	const feedFieldMap = {
		episode: 'podcast',
		article: 'rss',
		rss: 'rss',
		podcast: 'podcast',
	};

	console.log(`program.all is set to ${program.all}`);

	for (const [contentType, schema] of Object.entries(schemas)) {
		const total = await schema.count({});
		const chunkSize = 1000;

		const field = fieldMap[contentType];
		const feedField = feedFieldMap[contentType];
		const feedIdField = feedIdMap[contentType];

		console.log(`Found ${total} for ${contentType} with url field ${field}\n`);

		let completed = 0;
		for (let i = 0, j = total; i < j; i += chunkSize) {
			const chunk = await schema
				.find()
				.sort(feedIdField)
				.skip(i)
				.limit(chunkSize)
				.lean();
			completed += chunkSize;

			const instances = chunk.filter(instance => {
				const missingImage = !instance.images || !instance.images.og;
				return (missingImage || program.all) && instance[field];
			});
			const partitions = partitionBy(instances, i => i[feedIdField]);
			const promises = partitions.map(partition => {
				return OgQueueAdd(
					{
						type: contentType,
						[feedField]: partition[0][feedIdField],
						urls: partition.map(i => i[field]),
						update: true,
					},
					{ removeOnComplete: true, removeOnFail: true },
				);
			});
			await Promise.all(promises);
			const progress = Math.floor((100 * i) / j);
			console.log(`\rprogress ${progress}%: ${i}/${j}`);
		}

		console.log(`Completed for type ${contentType} with field ${field}`);
	}
}

main()
	.then(result => {
		console.log('completed it all, open the test page to see queue status');
		process.exit(0);
	})
	.catch(err => {
		console.log(`failed: ${err.stack}`);
		process.exit(1);
	});

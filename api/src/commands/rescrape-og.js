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

async function main() {
	const schemas = { rss: RSS, episode: Episode, podcast: Podcast, article: Article };
	const fieldMap = { article: 'url', episode: 'link', podcast: 'url', rss: 'url' };
	const parentSchemaMap = { episode: Podcast, article: RSS, rss: RSS, podcast: Podcast };

	console.log(`program.all is set to ${program.all}`);

	for (const [contentType, schema] of Object.entries(schemas)) {
		const total = await schema.count({});
		const completed = 0;
		const chunkSize = 1000;

		const field = fieldMap[contentType];
		const mongoParentSchema = parentSchemaMap[contentType];
		const parentField = mongoParentSchema === RSS ? 'rss' : 'podcast';

		console.log(`Found ${total} for ${contentType} with url field ${field}`);

		for (let i = 0, j = total; i < j; i += chunkSize) {
			const chunk = await schema
				.find()
				.skip(i)
				.limit(chunkSize)
				.lean();
			completed += chunkSize;
			const promises = chunk.filter(instance => {
				const missingImage = !instance.images || !instance.images.og;
				return (missingImage || program.all) && instance[field];
			}).map(instance => {
				return OgQueueAdd({
					type: contentType,
					[parentField]: instance[parentField],
					url: instance[field],
					update: true,
				}, {
					removeOnComplete: true,
					removeOnFail: true,
				});
			});
			await Promise.all(promises);
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

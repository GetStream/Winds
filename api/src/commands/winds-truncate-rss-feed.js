import '../loadenv';
import '../utils/db';

import RSS from '../models/rss';
import Article from '../models/article';
import program from 'commander';

program.parse(process.argv);

let args = program.args;

async function main() {
	let rss = await RSS.findById(args[0]).exec();
	await Article.deleteMany({ rss: rss._id }, {}, { timeout: true }).exec();
}

main()
	.then(() => {
		console.info('done');
		process.exit(0);
	})
	.catch(err => {
		console.info(`failed with err ${err}`);
		process.exit(1);
	});

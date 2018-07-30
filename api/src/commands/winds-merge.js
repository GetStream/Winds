import axios from 'axios';
import mongoose from 'mongoose';
import ProgressBar from 'progress';

import '../config';
import db from '../utils/db';
import { mergeFeeds } from '../utils/merge';
import { fetchSocialScore } from '../utils/social';
import { upsertCollections } from '../utils/collections';
import { setupAxiosRedirectInterceptor } from '../utils/axios';
import User from '../models/user';
import Article from '../models/article';

const batchSize = 5000;

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function socialScore(article, socialBatch) {
    for (let retries = 0; retries < 3; ++retires) {
        try {
            const socialScore = await fetchSocialScore(article);
            if (socialScore) {
                socialBatch.find({ _id: article._id }).updateOne({$set: { socialScore }});
            }
            return;
        } catch (err) {
            console.error(`Failed to get social score for ${article._id}: ${err.message}`);
            await sleep(350);
        }
    }
}

process.on('unhandledRejection', error => console.error(error.message));

setupAxiosRedirectInterceptor(axios);

async function collections() {
    await db;
    let lastId = mongoose.Types.ObjectId("5b2e96e3d050606b2a9f5234");
    const articleCount = await Article.count({ _id: { $gt: lastId } });
    let bar = new ProgressBar('[:current / :total] :bar [:percent | :rate records per second]', { total: articleCount });
    let data = [];
    console.log(`Reading ${articleCount} articles`);
    while (!bar.complete) {
        const cursor = Article.find({ _id: { $gt: lastId } }).sort('_id').lean().batchSize(batchSize).cursor();

        try {
            await cursor.eachAsync(async c => {
                data.push({
                    id: c._id,
                    title: c.title,
                    likes: c.likes,
                    socialScore: c.socialScore,
                    description: c.description,
                    publicationDate: c.publicationDate,
                    rss: c.rss._id,
                });
                bar.tick();
                if ((bar.curr % 100) == 0) {
                    console.log(`Flushing data to DB. Last id: ${c._id}`);
		            await upsertCollections('articles', data);
                    data = [];
                }
                lastId = c._id;
            });
        } catch (err) {
            // XXX: ignore errors and resume iteration
            console.log(`Iteration stopped by ${err}. Resuming from ${lastId}`);
        }
    }
}

async function main() {
    await db;
    // console.log(await mergeFeeds('5aea4723dc6a838ed1367bb5', '5aea4723dc6a838ed1367bb5'));
    // return;
    // const fingerprintToFeed = new Map();

	let socialBatch = Article.collection.initializeUnorderedBulkOp();
    let lastId = mongoose.Types.ObjectId("5b25b8ea3686e150b9424b1c");
    const articleCount = await Article.count({ _id: { $gt: lastId } });
    let bar = new ProgressBar('[:current / :total] :bar [:percent | :rate records per second]', { total: articleCount });
    console.log(`Reading ${articleCount} articles`);
    while (!bar.complete) {
        const cursor = Article.find({ _id: { $gt: lastId } }).sort('_id').lean().batchSize(batchSize).cursor();

        try {
            await cursor.eachAsync(async article => {
                await socialScore(article, socialBatch);
                bar.tick();
                await sleep(360);
                if ((bar.curr % 300) == 0) {
                    console.log(`Flushing data to DB. Last id: ${article._id}`);
                    await socialBatch.execute();
                    socialBatch = Article.collection.initializeUnorderedBulkOp();
                }
                lastId = article._id;
            });
        } catch (err) {
            // XXX: ignore errors and resume iteration
            console.log(`Iteration stopped by ${err}. Resuming from ${lastId}`);
        }
    }
	await socialBatch.execute();
    return;

	let updatingSocialScore = false;
	updatedArticles = await timeIt('winds.handle_rss.update_social_score', () => {
		return Promise.all(updatedArticles.filter(a => !!a.url).map());
	});
	if (updatingSocialScore) {
		await socialBatch.execute();
	}

    const cursor = Article.collection.aggregate([
        { $match: { fingerprint: 1 } },
        { $lookup: { from: 'articles', localField: 'fingerprint', foreignField: 'fingerprint', as: 'duplicate' } },
        { $unwind: '$duplicate' },
        { $project: { rss: 1, original: { $eq: ["$_id", "$duplicate._id"] }, duplicate: { $ne: ["$_id", "$duplicate._id"] } } },
        { $group: { _id: '$rss', total: { $sum: 1 }, original: { $sum: { $cond: ['$original', 1, 0] } }, duplicates: { $sum: { $cond: ['$duplicate', 1, 0] } } } },
        { $out: 'feed_duplicates' }
    ], { allowDiskUse: true });
    return await cursor.next();

    console.log(`Finished reading ${articleCount} articles`);
    console.log('Grouping by feed');

    bar = new ProgressBar('[:current / :total] :bar [:percent | :rate records per second]', { total: articleCount });
    const feedSummaries = new Map();
    fingerprintToFeed.forEach(feedIDs => {
        const singleFeed = feedIDs.length == 1;
        const metric = singleFeed ? 'original' : 'duplicate';
        for (const feedID of feedIDs) {
            const summary = feedSummaries.get(feedID) || { total: 0, original: 0, duplicate: 0 };
            summary.total += 1;
            summary[metric] += 1;
            feedSummaries.set(feedID, summary);
        }
        bar.tick();
    });
    console.log('Finished grouping by feed');
    console.log('Sorting results');

    const summaries = [...feedSummaries.entries()];
    summaries.sort(([_, l], [__, r]) => {
        if (l.total > r.total) {
            return 1;
        }
        if (l.total < r.total) {
            return -1;
        }
        if (l.duplicate > r.duplicate) {
            return 1;
        }
        if (l.duplicate < r.duplicate) {
            return -1;
        }
        if (l.original > r.original) {
            return 1;
        }
        if (l.original < r.original) {
            return -1;
        }
        return 0;
    });
    console.log('Finished sorting results');
    for (const result of summaries) {
        console.dir(result);
    }
}

collections().then(() => {
// main().then(() => {
	console.info('done');
	process.exit(0);
}).catch(err => {
	console.info(`failed with err ${err.stack}`);
	process.exit(1);
});

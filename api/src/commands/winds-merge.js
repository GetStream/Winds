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

process.on('unhandledRejection', error => console.error(error.message));

setupAxiosRedirectInterceptor(axios);

async function main() {
    await db;

    const cursor = Article.collection.aggregate([
        { $match: { fingerprint: 1 } },
        { $lookup: { from: 'articles', localField: 'fingerprint', foreignField: 'fingerprint', as: 'duplicate' } },
        { $unwind: '$duplicate' },
        { $project: { rss: 1, dup_rss: "$duplicate.rss", original: { $eq: ["$_id", "$duplicate._id"] }, duplicate: { $ne: ["$_id", "$duplicate._id"] } } },
        { $group: { _id: '$rss', dup_rss: { $addToSet: "$dup_rss" }, total: { $sum: 1 }, original: { $sum: { $cond: ['$original', 1, 0] } }, duplicates: { $sum: { $cond: ['$duplicate', 1, 0] } } } },
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

main().then(() => {
	console.info('done');
	process.exit(0);
}).catch(err => {
	console.info(`failed with err ${err.stack}`);
	process.exit(1);
});

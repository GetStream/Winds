import mongoose from 'mongoose';
import ProgressBar from 'progress';

import db from '../utils/db';
import { mergeFeeds } from '../utils/merge';
import { fetchSocialScore } from '../utils/social';
import { upsertCollections } from '../utils/collections';
import User from '../models/user';
import Article from '../models/article';
import Episode from '../models/article';

const batchSize = 5000;

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

process.on('unhandledRejection', error => console.error(error.message));

async function main() {
    await db;
    // await mergeFeeds('5aff4dd4fe7430d359cbb524', '5afdcfe4fe7430d359b7c234', 'podcast');
    // await mergeFeeds('5aff4dd4fe7430d359cbb524', '5afdc6eefe7430d359b6e81d', 'podcast');
    // return;

    // const articles = mongoose.connection.collection('dup_articles_clean')
    // const articleCount = await articles.count();
    // const bar = new ProgressBar('[:current / :total] :bar [:percent | :rate records per second]', { total: articleCount });
    // const cursor = articles.find().batchSize(batchSize);

    // let deletes = [];
    // while (await cursor.hasNext()) {
        // const data = await cursor.next();
        // deletes.push(Article.deleteMany({ _id: { $in: data.ids } }));
        // if (deletes.length % 128 === 0) {
            // await Promise.all(deletes);
            // deletes = [];
        // }
        // bar.tick();
    // }
    // await Promise.all(deletes);
    const articles = mongoose.connection.collection('dup_episodes_clean')
    const articleCount = await articles.count();
    const bar = new ProgressBar('[:current / :total] :bar [:percent | :rate records per second]', { total: articleCount });
    const cursor = articles.find().batchSize(batchSize);

    let deletes = [];
    while (await cursor.hasNext()) {
        const data = await cursor.next();
        deletes.push(Episode.deleteMany({ _id: { $in: data.ids } }));
        if (deletes.length % 128 === 0) {
            await Promise.all(deletes);
            deletes = [];
        }
        bar.tick();
    }
    await Promise.all(deletes);

    /*
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
    */
}

main().then(() => {
	console.info('done');
	process.exit(0);
}).catch(err => {
	console.info(`failed with err ${err.stack}`);
	process.exit(1);
});

import '../loadenv';

import normalize from 'normalize-url';
import ogs from 'open-graph-scraper';

// rss import model is needed because Article refs it
import RSS from '../models/rss' // eslint-disable-line
import Podcast from '../models/podcast' // eslint-disable-line

import Article from '../models/article';
import Episode from '../models/episode';

import '../utils/db';

import logger from '../utils/logger';
import {ParseOG} from '../parsers/og';

import async_tasks from '../async_tasks';
import axios from 'axios';

const schemaMap = {
	episode: Episode,
	podcast: Podcast,
};
const requestTimeout = 10000;
const maxRedirects = 10;
const maxContentLengthBytes = 1024 * 1024;
const invalidExtensions = ['mp3', 'mp4', 'mov', 'm4a', 'mpeg'];

// TODO: move this to a different main.js
logger.info('Starting the OG worker');
async_tasks.ProcessOgQueue(30, handleOg);

async function handleOg(job) {
	logger.info(`OG image scraping: ${job.data.url}`);
	try {
		await _handleOg(job);
	} catch (err) {
		let tags = {queue: 'og'};
		let extra = {
			JobURL: job.data.url,
			JobType: job.data.type,
		};
		logger.error('OG job encountered an error', {err, tags, extra});
	}
}

async function isValidUrl(url) {
	let invalid = invalidExtensions.some(extension=> {
		if( url.endsWith(`.${extension}`)) {
			return extension;
		}
	});
	if (invalid) {
		logger.warn(`Invalid file extension for url ${url}`);
		return false;
	}


	return true;
}

// Run the OG scraping job
async function _handleOg(job) {
	const url = job.data.url;
	const jobType = job.data.type;

	// Lookup the right type of schema: article, episode or podcast
	let mongoSchema = schemaMap[jobType] || Article;
	let field = job.data.type === 'episode' ? 'link' : 'url';

	// if the instance hasn't been created yet, or it already has an OG image, ignore
	let instance = await mongoSchema.findOne({ [field]: url });

	if (!instance) {
		return logger.warn(`instance not found for type ${jobType} with lookup ${field}: ${url}`);
	} else if (instance.images.og && !job.data.update) {
		return logger.info(
			`instance already has an image ${
				instance.images.og
			}: ${jobType} with lookup ${field}: ${url}`,
		);
	}

	let ogImage;
	let isValid = await isValidUrl(url);
	if (!isValid) {
		return;
	}

	try {
		ogImage = await ParseOG(url)
	} catch (err) {
		return logger.info(`OGS scraping broke for URL ${url}`, {err});
	}

	if (!ogImage) {
		return logger.info(`Didn't find image for ${url}`);
	}

	let images = instance.images || {};

	try {
		images.og = normalize(ogImage);
	} catch (err) {
		return logger.warn(`Bad OG Image URL ${ogImage}`, {err});
	}

	await mongoSchema.update(
		{ _id: instance._id },
		{ images: images },
	);
	logger.info(`Stored ${images.og} image for ${url}`);
}

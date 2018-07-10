import { expect } from 'chai';

import config from '../../src/config';
import * as social from '../../src/utils/social';

describe('Reddit score', () => {
	it('should return post id for correct url', () => {
		const url = 'https://www.reddit.com/r/funny/comments/8vfdgt/xxxdoodleion/';
		expect(social.extractRedditPostID({ link: url })).to.be.equal('t3_8vfdgt');
	});

	it('should return score for existing post', async function() {
		if (!config.social.reddit.secret || !config.social.reddit.password) {
			this.skip();
		}
		const score = await social.redditScore('t3_7mjw12');
		//XXX: reddit is fuzzing upvote count returned by the API to mess with bots
		expect(score).to.be.closeTo(307864, 50);
	});
});

describe('Hacker News score', () => {
	it('should return post id for correct url', () => {
		const url = 'https://news.ycombinator.com/item?id=17439811';
		expect(social.extractHackernewsPostID({ commentUrl: url })).to.be.equal('17439811');
	});

	it('should return score for existing post', async () => {
		const score = await social.hackernewsScore('17449546');
		expect(score).to.be.equal(4);
	});
});

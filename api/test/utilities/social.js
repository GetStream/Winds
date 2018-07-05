import { expect } from 'chai';

import { redditScore, extractRedditPostID } from '../../src/utils/social';

describe('Reddit score', () => {
	it('should return post id for correct url', () => {
		const url = 'https://www.reddit.com/r/funny/comments/8vfdgt/xxxdoodleion/';
		expect(extractRedditPostID({ link: url })).to.be.equal('t3_8vfdgt');
	});

	it('should return score for existing post', async () => {
		const score = await redditScore('t3_7mjw12');
		//XXX: reddit is fuzzing upvote count returned by the API to mess with bots
		expect(score).to.be.closeTo(307864, 50);
	});
});

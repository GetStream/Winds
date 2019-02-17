import { expect } from 'chai';

import { ParseContent } from '../../src/parsers/content';

describe('Mercury Parser', () => {
	it('should parse the content', async () => {
		const content = await ParseContent('https://getstream.io');

		expect(content).to.not.be.null;
		expect(content.title).to.be.string;
		expect(content.content).to.be.string;
	});
});

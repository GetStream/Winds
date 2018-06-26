import { expect } from 'chai';

import { DetectLangFromStream } from '../../src/parsers/detect-language';
import { getTestFeed } from '../utils';

describe('Language detection', () => {
	it('should detect language from techcrunch', async () => {
		const tc = getTestFeed('techcrunch');
		const result = await DetectLangFromStream(tc);
		expect(result).to.equal('eng');
	});

	it('should detect language from lemonde', async () => {
		const tc = getTestFeed('lemonde');
		const result = await DetectLangFromStream(tc);
		expect(result).to.equal('fra');
	});

	it('should detect language from habr', async () => {
		const tc = getTestFeed('habr');
		const result = await DetectLangFromStream(tc);
		expect(result).to.equal('rus');
	});
});

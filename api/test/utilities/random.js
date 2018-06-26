import { expect } from 'chai';
import weightedRandom from '../../src/utils/random';

describe('Weighted random', () => {
	it('should distribute results logarithmically', () => {
		const results = {};

		for (let i = 0; i < 5000000; ++i) {
			const value = weightedRandom(10);
			const previousCount = results[value] || 0;
			results[value] = previousCount + 1;
		}

		const entries = Object.entries(results).map(e => {
			return { value: Number(e[0]), count: Number(e[1]) };
		});

		entries.sort((l, r) => {
			if (l.count > r.count) {
				return -1;
			}
			if (l.count < r.count) {
				return 1;
			}
			return 0;
		});

		for (let i = 1; i < entries.length; ++i) {
			expect(entries[i].value).to.be.above(entries[i - 1].value);
			expect(entries[i - 1].count / entries[i].count).to.be.closeTo(2, 0.1);
		}
	});
});

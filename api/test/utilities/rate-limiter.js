import sinon from 'sinon';
import { expect } from 'chai';

import * as limiter from '../../src/utils/rate-limiter';

describe('Rate limiter', () => {
    let originalSetTimeout;

    beforeEach(async () => {
        await limiter.reset('fake-id');
        originalSetTimeout = global.setTimeout;
        global.setTimeout = sinon.spy(originalSetTimeout);
    });

    afterEach(() => {
        global.setTimeout = originalSetTimeout;
    });

    it('shouldn\'t block until max capacity is reached', async () => {
        for (let i = 0; i < 3000; ++i) {
            await limiter.tick('fake-id');
            expect(setTimeout.called, `waiting #${i + 1}`).to.be.false;
        }
    });

    it('should block when over max capacity', async () => {
        for (let i = 0; i < 3000; ++i) {
            await limiter.tick('fake-id');
        }
        const before = Date.now();
        await limiter.tick('fake-id');
        const after = Date.now();
        expect(after - before).to.be.closeTo(28800, 50);
    }).timeout(45000).retries(3);

    it('shouldn\'t block after waiting', async () => {
        for (let i = 0; i < 3000; ++i) {
            await limiter.tick('fake-id');
        }
        await new Promise(resolve => originalSetTimeout(resolve, 28800));
        const before = Date.now();
        await limiter.tick('fake-id');
        const after = Date.now();
        expect(after - before).to.be.closeTo(0, 20);
    }).timeout(45000).retries(3);
});

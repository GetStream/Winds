import sinon from 'sinon';
import { expect } from 'chai';

import { rateLimiter } from '../../src/utils/rate-limiter';

describe('Rate limiter', () => {
    let originalSetTimeout;

    beforeEach(() => {
        originalSetTimeout = global.setTimeout;
        global.setTimeout = sinon.spy(originalSetTimeout);
    });

    afterEach(() => {
        global.setTimeout = originalSetTimeout;
    });

    it('shouldn\'t block until max capacity is reached', async () => {
        const limiter = rateLimiter(5);
        for (let i = 0; i < 5; ++i) {
            await limiter.tick();
        }
        expect(setTimeout.called).to.be.false;
    });

    it('should block when over max capacity', async () => {
        const limiter = rateLimiter(1000);
        for (let i = 0; i < 1000; ++i) {
            await limiter.tick();
        }
        const before = Date.now();
        await limiter.tick();
        const after = Date.now();
        expect(setTimeout.calledOnce).to.be.true;
        expect(after - before).to.be.closeTo(60, 5);
    });

    it('shouldn\'t block after waiting', async () => {
        const limiter = rateLimiter(1000);
        for (let i = 0; i < 1000; ++i) {
            await limiter.tick();
        }
        await new Promise((resolve, _) => originalSetTimeout(resolve, 60));
        await limiter.tick();
        expect(setTimeout.called).to.be.false;
    });
});

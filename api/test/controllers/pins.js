import { expect, request } from 'chai'
import Chance from 'chance';

import api from '../../src/server';
import pins from '../../src/controllers/pin';
import Pin from '../../src/models/pin';

import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';

const chance = new Chance();
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe.only('Pins controller', () => {
    describe('create', () => {
        describe('valid request', () => {

            before(async () => {
                expect(await Pin.find({ article: { $exists: true, } })).to.be.empty;
                expect(await Pin.find({ episode: { $exists: true, } })).to.be.empty;

                await loadFixture('initialData');
            });

            it('should create a new pin', async () => {
                let payload = {};
                payload[chance.pickone(['article', 'episode'])] = chance.guid();

                let res = await request(api).post('/pins').send(payload);

                expect(res).to.have.status(200);
            });

        });
    });
});

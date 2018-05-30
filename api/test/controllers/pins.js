import { expect, request } from 'chai'
import Chance from 'chance';

import api from '../../src/server';
import pins from '../../src/controllers/pin';
import Pin from '../../src/models/pin';

import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';

const chance = new Chance();

describe.only('Pins controller', () => {
    describe('create', () => {
        describe('valid request', () => {

            before(async () => {
                expect(await Pin.find({ article: { $exists: true, } })).to.be.empty;
                expect(await Pin.find({ episode: { $exists: true, } })).to.be.empty;
            });

            it('should create a new pin', async () => {
                let payload = {};

                payload[chance.pickone(['article', 'episode'])] = chance.guid();
                payload['user'] = chance.guid();
                payload['email'] = chance.email();

                console.log(payload);

                let res = await request(api).post('/pins').send(payload);

                console.log(res);

                expect(res).to.have.status(200);
            });

        });
    });
});

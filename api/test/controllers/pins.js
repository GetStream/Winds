import { expect, request } from 'chai'
import jwt from 'jsonwebtoken';
import config from '../../src/config';

import api from '../../src/server';
import pins from '../../src/controllers/pin';
import Pin from '../../src/models/pin';

import { loadFixture, getMockClient, getMockFeed } from '../../src/utils/test';

describe.only('Pins controller', () => {
    describe('create', () => {
        describe('valid request', () => {

            const token = jwt.sign(
                {
                    email: 'test+test@test.com',
                    sub: '5b0f306d8e147f10f16aceaf',
                },
                config.jwt.secret,
            );

            before(async () => {
                expect(await Pin.find({ article: { $exists: true, } })).to.be.empty;
                expect(await Pin.find({ episode: { $exists: true, } })).to.be.empty;

                await loadFixture('initialData');
            });

            it('should create a new article pin', async () => {
                let res = await request(api).post('/pins').set('Authorization', `Bearer ${token}`).send({
                    article: '5b0ad37226dc3db38194e5eb',
                });

                expect(res).to.have.status(200);
            });

        });
    });
});

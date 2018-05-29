import { expect, request } from 'chai'
import sinon from 'sinon'

import api from '../../src/server'
import auth from '../../src/controllers/auth'
import User from '../../src/models/user'

describe('Auth controller', () => {
    describe('signup', () => {
        beforeEach(() => User.remove().exec())

        it('should return 200 for valid request', async () => {
            const response = await request(api).post('/auth/signup').send({
                email: 'valid@email.com',
                username: 'valid',
                name: 'Valid Name',
                password: 'valid_password'
            });

            expect(response).to.have.status(200);
        })

        it('should return 422 for missing data in request', async () => {
            const bodies = [
                { username: 'valid', name: 'Valid Name', password: 'valid_password' },
                { email: 'valid@email.com', name: 'Valid Name', password: 'valid_password' },
                { email: 'valid@email.com', username: 'valid', password: 'valid_password' },
                { email: 'valid@email.com', username: 'valid', name: 'Valid Name' }
            ];
            const requests = bodies.map((body) => request(api).post('/auth/signup').send(body));
            for await (const response of requests) {
                expect(response).to.have.status(422);
            }
        })

        it('should return 422 for invalid email in request', async () => {
            const bodies = [
                { email: 'invalid.email.com', username: 'valid', name: 'Valid Name', password: 'valid_password' },
                { email: 'invalid@email', username: 'valid', name: 'Valid Name', password: 'valid_password' },
                { email: '@invalid.email.com', username: 'valid', name: 'Valid Name', password: 'valid_password' },
            ];
            const requests = bodies.map((body) => request(api).post('/auth/signup').send(body));
            for await (const response of requests) {
                expect(response).to.have.status(422);
            }
        })

        it('should return 422 for invalid username in request', async () => {
            const response = await request(api).post('/auth/signup').send({
                email: 'valid@email.com',
                username: 'invalid-username',
                name: 'Valid Name',
                password: 'valid_password'
            });

            expect(response).to.have.status(422);
        })

        it('should return 409 for existing user', async () => {
            const user = {
                email: 'valid@email.com',
                username: 'valid',
                name: 'Valid Name',
                password: 'valid_password'
            };
            await User.create(user);
            const response = await request(api).post('/auth/signup').send(user);

            expect(response).to.have.status(409);
        })
    })
})

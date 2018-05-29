import { expect, request } from 'chai'

import api from '../../src/server'
import auth from '../../src/controllers/auth'
import User from '../../src/models/user'
import { loadFixture } from '../../src/utils/test'

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

        it('should return 422 for missing/empty data in request', async () => {
            const bodies = [
                { username: 'valid', name: 'Valid Name', password: 'valid_password' },
                { email: 'valid@email.com', name: 'Valid Name', password: 'valid_password' },
                { email: 'valid@email.com', username: 'valid', password: 'valid_password' },
                { email: 'valid@email.com', username: 'valid', name: 'Valid Name' },
                { email: '', username: 'valid', name: 'Valid Name', password: 'valid_password' },
                { email: 'invalid.email.com', username: '', name: 'Valid Name', password: 'valid_password' },
                { email: 'invalid.email.com', username: 'valid', name: '', password: 'valid_password' },
                { email: 'invalid.email.com', username: 'valid', name: 'Valid Name', password: '' }
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
            await loadFixture('example')

            const response = await request(api).post('/auth/signup').send({
                email: 'valid@email.com',
                username: 'valid',
                name: 'Valid Name',
                password: 'valid_password'
            });

            expect(response).to.have.status(409);
        })
    })

    describe('login', () => {
        before(async () => {
            await User.remove().exec();
            await loadFixture('example');
        })

        it('should return 200 for existing user', async () => {
            const response = await request(api).post('/auth/login').send({
                email: 'valid@email.com',
                password: 'valid_password'
            });

            expect(response).to.have.status(200);
        })

        it('should return 401 for missing/empty data in request', async () => {
            const bodies = [
                { password: 'valid_password' },
                { email: 'valid@email.com' },
                { email: '', password: 'valid_password' },
                { email: 'valid@email.com', password: '' },
            ];
            const requests = bodies.map((body) => request(api).post('/auth/login').send(body));
            for await (const response of requests) {
                expect(response).to.have.status(401);
            }
        })

        it('should return 404 for nonexistent user', async () => {
            const response = await request(api).post('/auth/login').send({
                email: 'invalid@email.com',
                password: 'valid_password'
            });

            expect(response).to.have.status(404);
        })

        it('should return 403 for existing user w/ wrong password', async () => {
            const response = await request(api).post('/auth/login').send({
                email: 'valid@email.com',
                password: 'invalid_password'
            });

            expect(response).to.have.status(403);
        })
    })

    describe('password recovery', () => {
        before(async () => {
            await User.remove().exec();
            await loadFixture('example');
        })

        describe('recovery code endpoint', () => {
            it('should return 200 for existing user', async () => {
                const response = await request(api).post('/auth/forgot-password').send({
                    email: 'valid@email.com'
                });

                expect(response).to.have.status(200);
            })

            it('should return 404 for nonexistent user', async () => {
                const response = await request(api).post('/auth/forgot-password').send({
                    email: 'invalid@email.com'
                });

                expect(response).to.have.status(404);
            })
        })

        describe('password reset endpoint', () => {
            let user;

            before(async () => {
                user = await User.findOne({ email: 'valid@email.com' });
            })

            it('should return 200 for existing user', async () => {
                const response = await request(api).post('/auth/reset-password').send({
                    email: 'valid@email.com',
                    passcode: user.recoveryCode,
                    password: 'new-password'
                });

                expect(response).to.have.status(200);
            })

            it('should return 404 for nonexistent user', async () => {
                const response = await request(api).post('/auth/reset-password').send({
                    email: 'invalid@email.com'
                });

                expect(response).to.have.status(404);
            })

            it('should return 404 for incorrect passcode', async () => {
                const response = await request(api).post('/auth/reset-password').send({
                    email: 'valid@email.com',
                    passcode: 'incorrect-passcode'
                });

                expect(response).to.have.status(404);
            })
        })
    })
})

import { expect, request } from 'chai';
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import config from '../../src/config';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import { DummyEmailTransport } from '../../src/utils/email/send';
import { loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';
import Redis from 'ioredis';

const cache = new Redis(config.cache.uri);

describe('Auth controller', () => {
	describe('signup', () => {
		before(dropDBs);

		describe('empty state', () => {
			let response;
			let user;

			before(async () => {
				expect(await User.findOne({ email: 'valid@email.com' })).to.be.null;

				await cache.flushall();

				response = await request(api)
					.post('/auth/signup')
					.send({
						email: 'valid@email.com',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					});

				user = await User.findOne({ email: 'valid@email.com' });
			});

			after(async () => {
				await RSS.remove().exec();
				await Podcast.remove().exec();
				await User.findOneAndDelete({ email: 'valid@email.com' });
			});

			it('should return 200', () => {
				const mockClient = getMockClient();
				expect(response).to.have.status(200);
				expect(
					mockClient.followMany.firstCall &&
						mockClient.followMany.firstCall.args,
				).to.be.null;
			});
		});

		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				expect(await User.findOne({ email: 'valid@email.com' })).to.be.null;

				await cache.flushall();

				await loadFixture('featured');

				response = await request(api)
					.post('/auth/signup')
					.send({
						email: 'valid@email.com',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					});

				user = await User.findOne({ email: 'valid@email.com' });
			});

			after(async () => {
				await RSS.remove().exec();
				await Podcast.remove().exec();
			});

			it('should return 200', () => {
				expect(response).to.have.status(200);
			});

			it('should return user info', () => {
				const keys = ['_id', 'email', 'interests', 'name', 'username'];
				expect(Object.keys(response.body)).to.include.members(keys);

				for (const key of keys) {
					//XXX: converting to string to avoid type differences
					expect(String(response.body[key])).to.be.equal(String(user[key]));
				}
			});

			it('should return valid jwt', async () => {
				expect(response.body.jwt).to.not.be.empty;

				const decoded = jwt.verify(response.body.jwt, config.jwt.secret);

				expect(decoded).to.not.be.null;
				expect(Object.keys(decoded)).to.include.members(['email', 'sub']);
				expect(decoded.email).to.equal(user.email);
				expect(decoded.sub).to.equal(String(user._id));
			});

			it('should create a User entity', async () => {
				expect(user).to.not.be.null;
				expect(user).to.include({
					email: 'valid@email.com',
					username: 'valid',
					name: 'Valid Name',
				});
				expect(await user.verifyPassword('valid_password')).to.be.true;
			});

			it('should follow featured podcasts and RSS feeds', async () => {
				const mockClient = getMockClient();

				const podcastEntries = await Podcast.find({
					featured: true,
				});

				const rssEntries = await RSS.find({
					featured: true,
				});

				const merged = [...podcastEntries, ...rssEntries];
				let correct = [];

				for (const data of merged) {
					let type = data.constructor.modelName == 'RSS' ? 'rss' : 'podcast';
					let userFeed = type == 'rss' ? 'user_article' : 'user_episode';
					correct.push(
						{
							source: `timeline:${user._id}`,
							target: `${type}:${data._id}`,
						},
						{
							source: `${userFeed}:${user._id}`,
							target: `${type}:${data._id}`,
						},
					);
				}
				const actual = mockClient.followMany.firstCall.args[0];
				expect(actual).to.deep.have.same.members(correct);
			});

			it('should send welcome email to user', async () => {
				let email = DummyEmailTransport.emails[0];
				expect(email.subject).to.equal('Welcome to Winds!');
			});
		});

		describe('invalid request', () => {
			it('should return 400 for missing/empty data', async () => {
				const bodies = [
					{
						email: undefined,
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: 'valid@email.com',
						username: undefined,
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: 'valid@email.com',
						username: 'valid',
						name: undefined,
						password: 'valid_password',
					},
					{
						email: 'valid@email.com',
						username: 'valid',
						name: 'Valid Name',
						password: undefined,
					},
					{
						email: '',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: 'invalid.email.com',
						username: '',
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: 'invalid.email.com',
						username: 'valid',
						name: '',
						password: 'valid_password',
					},
					{
						email: 'invalid.email.com',
						username: 'valid',
						name: 'Valid Name',
						password: '',
					},
				];
				const requests = bodies.map(body =>
					request(api)
						.post('/auth/signup')
						.send(body),
				);
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(400);
				}
			});

			it('should return 400 for invalid email', async () => {
				const bodies = [
					{
						email: 'invalid.email.com',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: 'invalid@email',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					},
					{
						email: '@invalid.email.com',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					},
				];
				const requests = bodies.map(body =>
					request(api)
						.post('/auth/signup')
						.send(body),
				);
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(400);
				}
			});

			it('should return 400 for invalid username', async () => {
				const response = await request(api)
					.post('/auth/signup')
					.send({
						email: 'valid@email.com',
						username: 'invalid username',
						name: 'Valid Name',
						password: 'valid_password',
					});

				expect(response).to.have.status(400);
			});

			it('should return 409 for existing user', async () => {
				await dropDBs();
				await loadFixture('initial-data');

				const response = await request(api)
					.post('/auth/signup')
					.send({
						email: 'valid@email.com',
						username: 'valid',
						name: 'Valid Name',
						password: 'valid_password',
					});

				expect(response).to.have.status(409);
			});
		});
	});

	describe('login', () => {
		let user;

		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');
			user = await User.findOne({ email: 'valid@email.com' });
			expect(user).to.not.be.null;
			expect(await user.verifyPassword('valid_password')).to.be.true;
		});

		describe('valid request', () => {
			let response;

			before(async () => {
				response = await request(api)
					.post('/auth/login')
					.send({
						email: 'valid@email.com',
						password: 'valid_password',
					});
			});

			it('should return 200 for existing user', () => {
				expect(response).to.have.status(200);
			});

			it('should return user info', () => {
				const keys = ['_id', 'email', 'interests', 'name', 'username'];
				expect(Object.keys(response.body)).to.include.members(keys);

				for (const key of keys) {
					//XXX: converting to string to avoid type differences
					expect(String(response.body[key])).to.be.equal(String(user[key]));
				}
			});

			it('should return valid jwt', async () => {
				expect(response.body.jwt).to.not.be.empty;
				const decoded = jwt.verify(response.body.jwt, config.jwt.secret);
				expect(decoded).to.not.be.null;
				expect(Object.keys(decoded)).to.include.members(['email', 'sub']);
				expect(decoded.email).to.equal(user.email);
				expect(decoded.sub).to.equal(String(user._id));
			});
		});

		describe('invalid request', () => {
			it('should return 400 for missing/empty data', async () => {
				const bodies = [
					{ password: 'valid_password' },
					{ email: 'valid@email.com' },
					{ email: '', password: 'valid_password' },
					{ email: 'valid@email.com', password: '' },
				];
				const requests = bodies.map(body =>
					request(api)
						.post('/auth/login')
						.send(body),
				);
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(400);
				}
			});

			it('should return 404 for nonexistent user', async () => {
				const response = await request(api)
					.post('/auth/login')
					.send({
						email: 'invalid@email.com',
						password: 'valid_password',
					});

				expect(response).to.have.status(404);
			});

			it('should return 403 for existing user w/ wrong password', async () => {
				const response = await request(api)
					.post('/auth/login')
					.send({
						email: 'valid@email.com',
						password: 'invalid_password',
					});

				expect(response).to.have.status(403);
			});
		});
	});

	describe('password recovery', () => {
		before(async () => {
			await dropDBs();
			await loadFixture('initial-data');
		});

		describe('recovery code endpoint', () => {
			describe('valid request', () => {
				let response;
				before(async () => {
					response = await request(api)
						.post('/auth/forgot-password')
						.send({ email: 'valid@email.com' });
				});

				it('should return 200 for existing user', () => {
					expect(response).to.have.status(200);
				});

				it('should send recovery code email to user', async () => {
					const user = await User.findOne({ email: 'valid@email.com' });

					let email = DummyEmailTransport.emails[0];
					expect(email.subject).to.equal('Forgot Password');
				});
			});

			describe('invalid request', () => {
				it('should return 404 for nonexistent user', async () => {
					const response = await request(api)
						.post('/auth/forgot-password')
						.send({ email: 'invalid@email.com' });

					expect(response).to.have.status(404);
				});
			});
		});

		describe('password reset endpoint', () => {
			let user;

			before(async () => {
				user = await User.findOne({ email: 'valid@email.com' });
			});

			describe('valid request', () => {
				let response;

				before(async () => {
					response = await request(api)
						.post('/auth/reset-password')
						.send({
							email: 'valid@email.com',
							recoveryCode: user.recoveryCode,
							password: 'new-password',
						});
				});

				it('should return 200 for existing user', () => {
					expect(response).to.have.status(200);
				});

				it('should return user info', () => {
					const keys = ['_id', 'email', 'interests', 'name', 'username'];
					expect(Object.keys(response.body)).to.include.members(keys);

					for (const key of keys) {
						//XXX: converting to string to avoid type differences
						expect(String(response.body[key])).to.be.equal(String(user[key]));
					}
				});

				it('should return valid jwt', async () => {
					expect(response.body.jwt).to.not.be.empty;
					const decoded = jwt.verify(response.body.jwt, config.jwt.secret);
					expect(decoded).to.not.be.null;
					expect(Object.keys(decoded)).to.include.members(['email', 'sub']);
					expect(decoded.email).to.equal(user.email);
					expect(decoded.sub).to.equal(String(user._id));
				});
			});

			describe('invalid request', () => {
				it('should return 404 for nonexistent user', async () => {
					const response = await request(api)
						.post('/auth/reset-password')
						.send({ email: 'invalid@email.com' });

					expect(response).to.have.status(404);
				});

				it('should return 404 for incorrect recoveryCode', async () => {
					const response = await request(api)
						.post('/auth/reset-password')
						.send({
							email: 'valid@email.com',
							recoveryCode: 'incorrect-recovery-code',
						});

					expect(response).to.have.status(404);
				});
			});
		});
	});
});

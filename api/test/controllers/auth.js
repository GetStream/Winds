import { expect, request } from 'chai';
import jwt from 'jsonwebtoken';

import api from '../../src/server';
import config from '../../src/config';
import Podcast from '../../src/models/podcast';
import RSS from '../../src/models/rss';
import User from '../../src/models/user';
import email from '../../src/utils/email';
import { loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';

describe('Auth controller', () => {
	describe('signup', () => {
		before(dropDBs);

		describe('valid request', () => {
			let response;
			let user;

			before(async () => {
				expect(await User.findOne({ email: 'valid@email.com' })).to.be.null;

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
				const content = [
					{ sourceModel: Podcast, userFeed: 'user_episode', contentFeed: 'podcast' },
					{ sourceModel: RSS,     userFeed: 'user_article', contentFeed: 'rss' },
				];
				const mockClient = getMockClient();

				for (const contentType of content) {
					const entries = await contentType.sourceModel.find({
						featured: true,
					});

					for (const data of entries) {
						expect(mockClient.feed.calledWith(contentType.userFeed, user._id)).to.be.true;
						expect(mockClient.feed.calledWith('timeline', user._id)).to.be.true;

						const userFeed = getMockFeed(contentType.userFeed, user._id);
						const timelineFeed = getMockFeed('timeline', user._id);
						expect(userFeed).to.not.be.null;
						expect(timelineFeed).to.not.be.null;

						expect(userFeed.follow.calledWith(contentType.contentFeed, data._id)).to.be.true;
						expect(timelineFeed.follow.calledWith(contentType.contentFeed, data._id)).to.be.true;
					}
				}
			});

			it('should send welcome email to user', async () => {
				expect(email.calledWith({
					type: 'welcome',
					email: user.email,
				})).to.be.true;
			});
		});

		describe('invalid request', () => {
			it('should return 422 for missing/empty data', async () => {
				const bodies = [
					{ email: undefined,           username: 'valid',   name: 'Valid Name', password: 'valid_password' },
					{ email: 'valid@email.com',   username: undefined, name: 'Valid Name', password: 'valid_password' },
					{ email: 'valid@email.com',   username: 'valid',   name: undefined,    password: 'valid_password' },
					{ email: 'valid@email.com',   username: 'valid',   name: 'Valid Name', password: undefined         },
					{ email: '',                  username: 'valid',   name: 'Valid Name', password: 'valid_password' },
					{ email: 'invalid.email.com', username: '',        name: 'Valid Name', password: 'valid_password' },
					{ email: 'invalid.email.com', username: 'valid',   name: '',           password: 'valid_password' },
					{ email: 'invalid.email.com', username: 'valid',   name: 'Valid Name', password: ''               },
				];
				const requests = bodies.map(body => request(api).post('/auth/signup').send(body));
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(422);
				}
			});

			it('should return 422 for invalid email', async () => {
				const bodies = [
					{ email: 'invalid.email.com',  username: 'valid', name: 'Valid Name', password: 'valid_password', },
					{ email: 'invalid@email',      username: 'valid', name: 'Valid Name', password: 'valid_password', },
					{ email: '@invalid.email.com', username: 'valid', name: 'Valid Name', password: 'valid_password', },
				];
				const requests = bodies.map(body => request(api).post('/auth/signup').send(body));
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(422);
				}
			});

			it('should return 422 for invalid username', async () => {
				const response = await request(api)
					.post('/auth/signup')
					.send({
						email: 'valid@email.com',
						username: 'invalid-username',
						name: 'Valid Name',
						password: 'valid_password',
					});

				expect(response).to.have.status(422);
			});

			it('should return 409 for existing user', async () => {
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
			it('should return 401 for missing/empty data', async () => {
				const bodies = [
					{ password: 'valid_password' },
					{ email: 'valid@email.com' },
					{ email: '', password: 'valid_password' },
					{ email: 'valid@email.com', password: '' },
				];
				const requests = bodies.map(body => request(api).post('/auth/login').send(body));
				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(401);
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

					expect(email.calledWith({
						type: 'password',
						email: user.email,
						passcode: user.recoveryCode,
					})).to.be.true;
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
							passcode: user.recoveryCode,
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

				it('should return 404 for incorrect passcode', async () => {
					const response = await request(api)
						.post('/auth/reset-password')
						.send({
							email: 'valid@email.com',
							passcode: 'incorrect-passcode',
						});

					expect(response).to.have.status(404);
				});
			});
		});
	});
});

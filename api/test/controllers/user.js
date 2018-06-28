import { expect, request } from 'chai';

import api from '../../src/server';
import User from '../../src/models/user';
import { withLogin, loadFixture, getMockClient, getMockFeed, dropDBs } from '../utils';

describe('User controller', () => {
	before(async () => {
		await dropDBs();
		await loadFixture('initial-data');
	});

	let authUser = {
		email: 'logged_in_user@email.com',
		sub: '4342306d8e147f10f16aceaf',
	};

	describe('retrieve user', () => {
		let user;

		before(async () => {
			await loadFixture('user');
			user = await User.findOne({ email: authUser.email });
			expect(user).to.not.be.null;
		});

		after(async () => {
			await User.remove().exec();
		});

		describe('valid request', () => {
			it('should return 200 and the user resource, including the email field, when retrieving the authenticated user', async () => {
				const response = await withLogin(
					request(api).get(`/users/${user._id}`),
					authUser,
				);

				expect(response).to.have.status(200);
				expect(response.body._id).to.equal(user._id.toString());
				expect(response.body.email).to.not.be.false;
				expect(response.body.streamTokens).to.not.be.false;
			});

			it('should return 200 and the user resource, excluding the email field, when retrieving another user', async () => {
				const anotherUser = await User.findOne({
					email: 'another_user@email.com',
				});

				const response = await withLogin(
					request(api).get(`/users/${anotherUser.id}`),
					authUser,
				);

				expect(response).to.have.status(200);
				expect(response.body._id).to.equal(anotherUser._id.toString());
				expect(response.body).to.not.have.an('email');
			});
		});

		describe('invalid requests', () => {
			it('should return 404 if requested user does not exist', async () => {
				const nonExistingId = '5b10e1c601e9b8702ccfb974';
				expect(await User.findOne({ _id: nonExistingId })).to.be.null;

				const response = await withLogin(
					request(api).get(`/users/${nonExistingId}`),
					authUser,
				);
				expect(response).to.have.status(404);
			});
		});

		describe('authentication and authorization', () => {});
	});

	describe('remove user', () => {
		let user;

		beforeEach(async () => {
			await loadFixture('user');
			user = await User.findOne({ email: authUser.email });
			expect(user).to.not.be.null;
		});

		afterEach(async () => {
			await User.remove().exec();
		});

		describe('valid request', () => {
			it('should return 204 and remove the user model', async () => {
				const response = await withLogin(
					request(api).delete(`/users/${user._id}`),
					authUser,
				);
				expect(response).to.have.status(204);
				expect(await User.findOne({ _id: user._id })).to.be.null;
			});
		});

		describe('authentication and authorization', () => {
			it('should return 403 for unauthorized access to an existing user resource', async () => {
				const anotherUser = await User.findOne({
					email: 'another_user@email.com',
				});

				const response = await withLogin(
					request(api).delete(`/users/${anotherUser.id}`),
					authUser,
				);

				expect(response).to.have.status(403);
				expect(await User.findOne({ _id: anotherUser._id })).to.not.be.null;
			});

			it('should return 403 unauthorized access to a non-existing user resource', async () => {
				const nonExistingId = '5b10e1c601e9b8702ccfb974';
				expect(await User.findOne({ _id: nonExistingId })).to.be.null;

				const response = await withLogin(
					request(api).delete(`/users/${nonExistingId}`),
					authUser,
				);
				expect(response).to.have.status(403);
			});
		});
	});

	describe('update user', () => {
		let user;

		beforeEach(async () => {
			await loadFixture('user');
			user = await User.findOne({ email: authUser.email });
			expect(user).to.not.be.null;
		});

		afterEach(async () => {
			await User.remove().exec();
		});

		describe('valid requests', () => {
			it('should return 201 for valid update', async () => {
				const updatedUser = {
					email: 'valid.alternative@email.com',
					username: 'validusername',
					name: 'Valid Name',
				};
				const response = await withLogin(
					request(api)
						.put(`/users/${user.id}`)
						.send(updatedUser),
					authUser,
				);

				expect(response).to.have.status(201);
				expect(JSON.parse(response.text)).to.include(updatedUser);
				expect(await User.findOne({ _id: user.id })).to.include(updatedUser);
			});
		});

		describe('invalid requests', () => {
			it('should return 400 for invalid email', async () => {
				const bodies = [
					{ email: 'invalid.email.com', username: 'valid', name: 'Valid Name' },
					{ email: 'invalid@email', username: 'valid', name: 'Valid Name' },
					{
						email: '@invalid.email.com',
						username: 'valid',
						name: 'Valid Name',
					},
				];
				const requests = bodies.map(body =>
					withLogin(
						request(api)
							.put(`/users/${user.id}`)
							.send(body),
						authUser,
					),
				);

				for (const response of await Promise.all(requests)) {
					expect(response).to.have.status(400);
				}
			});

			it('should return 400 for invalid username', async () => {
				const response = await withLogin(
					request(api)
						.put(`/users/${user.id}`)
						.send({
							email: 'logged_in_user@email.com',
							username: 'invalid username',
							name: 'Valid Name',
						}),
					authUser,
				);

				expect(response).to.have.status(400);
			});

			it('should return 409 for existing username', async () => {
				const anotherUser = await User.findOne({
					email: 'another_user@email.com',
				});

				const response = await withLogin(
					request(api)
						.put(`/users/${user.id}`)
						.send({
							email: user.email,
							username: anotherUser.username,
							name: user.name,
						}),
					authUser,
				);

				expect(response).to.have.status(409);
			});

			it('should return 409 for existing email', async () => {
				const anotherUser = await User.findOne({
					email: 'another_user@email.com',
				});

				const response = await withLogin(
					request(api)
						.put(`/users/${user.id}`)
						.send({
							email: anotherUser.email,
							username: user.username,
							name: user.name,
						}),
					authUser,
				);

				expect(response).to.have.status(409);
			});
		});

		describe('authentication and authorization', () => {
			it('should return 403 for unauthorized access to an existing user resource', async () => {
				const anotherUser = await User.findOne({
					email: 'another_user@email.com',
				});

				const response = await withLogin(
					request(api)
						.put(`/users/${anotherUser.id}`)
						.send({}),
					authUser,
				);

				expect(response).to.have.status(403);
				expect(await User.findOne({ _id: anotherUser._id })).to.not.be.null;
			});

			it('should return 403 for unauthorized access to a non-existing user resource', async () => {
				const nonExistingId = '5b10e1c601e9b8702ccfb974';
				expect(await User.findOne({ _id: nonExistingId })).to.be.null;

				const response = await withLogin(
					request(api)
						.put(`/users/${nonExistingId}`)
						.send({}),
					authUser,
				);
				expect(response).to.have.status(403);
			});
		});
	});
});

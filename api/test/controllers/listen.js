import sinon from 'sinon';
import { expect, request } from 'chai';

import User from '../../src/models/user';
import Listen from '../../src/models/listen';
import api from '../../src/server';
import logger from '../../src/utils/logger';
import { dropDBs, loadFixture, withLogin } from '../utils';

describe('Listen controller', () => {
	const episodeId = '5b0ad37026dc3db38194e286';
	let user;
	let listen;

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'listens');

		user = await User.findOne();
		listen = await Listen.findOne().lean();
	});

	describe('listing all entries', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get('/listens'));

			expect(response).to.have.status(200);
			expect(response.body.map(l => l._id)).to.include(String(listen._id));

			const keys = ['_id', 'user', 'episode', 'duration'];
			for (const entry of response.body) {
				expect(Object.keys(entry)).to.include.members(keys);
			}
		});
		
		it('should filter results if query is provided', async () => {
			const response = await withLogin(request(api).get('/listens').query({ episode: episodeId }));

			expect(response).to.have.status(200);
			expect(response.body.map(l => l._id)).to.include(String(listen._id));
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(request(api).get('/listens').query({ episode: { $gte: '' } }));

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('retrieving entry by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get(`/listens/${listen._id}`));

			expect(response).to.have.status(200);
			const keys = ['_id', 'user', 'episode', 'duration'];
			expect(Object.keys(response.body)).to.include.members(keys);

			for (const key of keys) {
				//XXX: converting to string to avoid type differences
				expect(String(response.body[key]._id || response.body[key])).to.be.equal(String(listen[key]));
			}
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(request(api).get('/listens/5b0f306d8e147f10deadbeef'));

			expect(response).to.have.status(404);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(request(api).get('/listens/<bogus-id>/'));

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('upsert entry', () => {
		it('should return 200 for new entry', async () => {
			const data = {
				user: user._id,
				episode: episodeId,
				duration: 33
			};
			const response = await withLogin(request(api).post('/listens').send(data));

			expect(response).to.have.status(200);
			const keys = ['user', 'episode', 'duration'];
			expect(Object.keys(response.body)).to.include.members(keys);
			const newListen = await Listen.findOne(data);
			expect(newListen).to.not.be.null;

			expect(response.body._id).to.be.equal(String(newListen._id));
			expect(response.body.user).to.be.equal(String(data.user));
			expect(response.body.user).to.be.equal(String(newListen.user._id));
			expect(response.body.episode).to.be.equal(data.episode);
			expect(response.body.episode).to.be.equal(String(newListen.episode._id));
			expect(response.body.duration).to.be.equal(data.duration);
			expect(response.body.duration).to.be.equal(newListen.duration);
		});

		it('should return 200 for existing entry', async () => {
			const data = {
				_id: listen._id,
				user: user._id,
				episode: episodeId,
				duration: 66
			};
			const response = await withLogin(request(api).post('/listens').send(data));

			expect(response).to.have.status(200);

			const updatedListen = await Listen.findById(listen._id).lean();
			const keys = ['_id', 'user', 'episode', 'duration'];
			expect(Object.keys(response.body)).to.include.members(keys);

			expect(response.body._id).to.be.equal(String(updatedListen._id));
			expect(response.body.user).to.be.equal(String(data.user));
			expect(response.body.user).to.be.equal(String(updatedListen.user._id));
			expect(response.body.episode).to.be.equal(data.episode);
			expect(response.body.episode).to.be.equal(String(updatedListen.episode._id));
			expect(response.body.duration).to.be.equal(data.duration);
			expect(response.body.duration).to.be.equal(updatedListen.duration);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(
				request(api)
					.post('/listens')
					.send({ episode: { $gte: { and: 1 } } })
			);

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});

	describe('deleting entry by id', () => {
		it('should return 204 for valid request', async () => {
			const response = await withLogin(request(api).delete(`/listens/${listen._id}`));

			expect(response).to.have.status(204);
			expect(await Listen.findById(listen._id)).to.be.null;
		});

		it('shoudl return 404 for invalid id', async () => {
			const response = await withLogin(request(api).delete('/listens/5b0f306d8e147f10deadbeef'));

			expect(response).to.have.status(404);
		});

		it('should return 500 for invalid request', async () => {
			//XXX: silensing error logs to have nice clean test output
			sinon.stub(logger, 'error');
			const response = await withLogin(request(api).delete('/listens/<bogus-id>/'));

			expect(response).to.have.status(500);
			logger.error.restore();
		});
	});
});

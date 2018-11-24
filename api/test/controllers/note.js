import { expect, request } from 'chai';
import { dropDBs, loadFixture, withLogin } from '../utils';

import Note from '../../src/models/note';
import api from '../../src/server';

describe('Note controller', () => {
	const keys = ['_id', 'user', 'start', 'end', 'text'];

	let note;
	let notes;
	let authedUser = '5b0f306d8e147f10f16aceaf';

	before(async () => {
		await dropDBs();
		await loadFixture('initial-data', 'notes');

		notes = await Note.find({ user: authedUser });
		note = await Note.findById('5bca58f5e4313757120cabc5');
	});

	describe('list notes', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get('/notes'));
			expect(response).to.have.status(200);
			expect(response.body.length).to.be.equal(notes.length);

			expect(response.body.map((n) => n._id)).to.have.all.members(
				notes.map((t) => String(t._id)),
			);

			for (const entry of response.body) {
				expect(Object.keys(entry)).to.include.members(keys);
				if (entry.article) expect(entry.episode).to.be.undefined;
				if (entry.episode) expect(entry.article).to.be.undefined;
			}
		});
	});

	describe('retrieving note by id', () => {
		it('should return 200 for valid request', async () => {
			const response = await withLogin(request(api).get(`/notes/${note._id}`));

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body._id).to.be.equal(String(note._id));
			expect(response.body.text).to.be.equal(note.text);
			expect(response.body.start).to.be.equal(note.start);
			expect(response.body.end).to.be.equal(note.end);
			if (note.article)
				expect(response.body.article._id).to.be.equal(String(note.article._id));
			if (note.episode)
				expect(response.body.episode._id).to.be.equal(String(note.episode_id));
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).get('/notes/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('creating new notes', () => {
		it('should create a new highlight', async () => {
			const data = {
				start: 11,
				end: 22,
				article: String(note.article._id),
			};
			const response = await withLogin(
				request(api)
					.post('/notes')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user).to.be.equal(authedUser);
			expect(response.body.start).to.be.equal(data.start);
			expect(response.body.end).to.be.equal(data.end);
			expect(response.body.text).to.be.empty;
			expect(response.body.article._id).to.be.equal(data.article);
			expect(response.body.episode).to.be.undefined;
		});

		it('should create a new note', async () => {
			const data = {
				start: 33,
				end: 44,
				text: 'note',
				article: String(note.article._id),
			};

			const response = await withLogin(
				request(api)
					.post('/notes')
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user).to.be.equal(authedUser);
			expect(response.body.start).to.be.equal(data.start);
			expect(response.body.end).to.be.equal(data.end);
			expect(response.body.text).to.be.equal(data.text);
			expect(response.body.article._id).to.be.equal(data.article);
			expect(response.body.episode).to.be.undefined;
		});

		it('should create a new highlight and merge overlaps', async () => {
			const data = {
				start: 1,
				end: 30,
				text: '',
				article: String(note.article._id),
			};
			const overlaps = await Note.find({
				user: authedUser,
				article: data.article,
				$nor: [{ end: { $lte: data.start } }, { start: { $gte: data.end } }],
			}).lean();

			const response = await withLogin(
				request(api)
					.post('/notes')
					.send(data),
			);

			for (const note of overlaps) {
				if (note.start < data.start) data.start = note.start;
				if (note.end > data.end) data.end = note.end;
				if (note.text) data.text = data.text + '\n' + note.text;
			}

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user).to.be.equal(authedUser);
			expect(response.body.start).to.be.equal(data.start);
			expect(response.body.end).to.be.equal(data.end);
			expect(response.body.mergedNotes.sort()).to.deep.equal(
				overlaps.map((n) => String(n._id)).sort(),
			);
			expect(response.body.text).to.be.equal(data.text);
			expect(response.body.article._id).to.be.equal(data.article);
			expect(response.body.episode).to.be.undefined;
		});

		it('should create a new note and merge overlaps', async () => {
			const data = {
				start: 22,
				end: 44,
				text: 'note',
				article: String(note.article._id),
			};

			const overlaps = await Note.find({
				user: authedUser,
				article: data.article,
				$nor: [{ end: { $lte: data.start } }, { start: { $gte: data.end } }],
			}).lean();

			const response = await withLogin(
				request(api)
					.post('/notes')
					.send(data),
			);

			for (const note of overlaps) {
				if (note.start < data.start) data.start = note.start;
				if (note.end > data.end) data.end = note.end;
				if (note.text) data.text = data.text + '\n' + note.text;
			}

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user).to.be.equal(authedUser);
			expect(response.body.start).to.be.equal(data.start);
			expect(response.body.end).to.be.equal(data.end);
			expect(response.body.mergedNotes.sort()).to.deep.equal(
				overlaps.map((n) => String(n._id)).sort(),
			);
			expect(response.body.text).to.be.equal(data.text);
			expect(response.body.article._id).to.be.equal(data.article);
			expect(response.body.episode).to.be.undefined;
		});
	});

	describe('updating existing notes', () => {
		it('should update a note', async () => {
			const data = { text: 'new text' };

			const response = await withLogin(
				request(api)
					.put(`/notes/${note._id}`)
					.send(data),
			);

			expect(response).to.have.status(200);
			expect(Object.keys(response.body)).to.include.members(keys);
			expect(response.body.user).to.be.equal(authedUser);
			expect(response.body.start).to.be.equal(note.start);
			expect(response.body.end).to.be.equal(note.end);
			expect(response.body.text).to.be.equal(data.text);
			expect(response.body.article._id).to.be.equal(String(note.article._id));
			expect(response.body.episode).to.be.undefined;
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api)
					.put('/notes/5b0f306d8e147f10deadbeef')
					.send({ text: 'invalid' }),
			);

			expect(response).to.have.status(404);
		});
	});

	describe('deleting notes by id', () => {
		it('should return 204 for valid request', async () => {
			const response = await withLogin(request(api).delete(`/notes/${note._id}`));

			expect(response).to.have.status(204);
			expect(await Note.findById(note._id)).to.be.null;
		});

		it('should return 404 for invalid id', async () => {
			const response = await withLogin(
				request(api).delete('/notes/5b0f306d8e147f10deadbeef'),
			);

			expect(response).to.have.status(404);
		});
	});
});

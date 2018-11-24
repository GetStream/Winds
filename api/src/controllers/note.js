import Note from '../models/note';

exports.list = async (req, res) => {
	res.json(await Note.find({ user: req.user.sub }).sort({ updatedAt: -1 }));
};

exports.get = async (req, res) => {
	const note = await Note.findById(req.params.noteId);
	if (!note) return res.status(404).json({ error: 'Resource does not exist.' });
	if (note.user._id != req.user.sub) return res.sendStatus(403);
	res.json(note);
};

exports.post = async (req, res) => {
	const data = {
		user: req.user.sub,
		article: req.body.article,
		episode: req.body.episode,
		start: req.body.start,
		end: req.body.end,
		text: req.body.text || '',
	};

	if (data.start == undefined || data.end == undefined)
		return res.status(422).json({ error: 'missing start|end offset' });
	if (!data.article && !data.episode)
		return res.status(422).json({ error: 'missing article||episode id' });
	if (data.article && data.episode)
		return res.status(422).json({ error: 'both article||episode id' });

	const overlaps = await Note.find({
		user: data.user,
		article: data.article,
		episode: data.episode,
		$nor: [{ end: { $lte: data.start } }, { start: { $gte: data.end } }],
	})
		.sort({ start: 1 })
		.lean();

	const mergedNotes = overlaps.map((n) => n._id);

	if (overlaps.length) {
		for (const note of overlaps) {
			if (note.start < data.start) data.start = note.start;
			if (note.end > data.end) data.end = note.end;
			if (note.text) data.text = data.text + '\n' + note.text;
		}
		await Note.deleteMany({ _id: { $in: mergedNotes } });
	}

	const note = await Note.create(data);
	const noteJson = (await Note.findById(note._id)).toJSON();
	res.json({ ...noteJson, mergedNotes });
};

exports.put = async (req, res) => {
	const noteId = req.params.noteId;

	const note = await Note.findById(noteId).lean();
	if (!note) return res.status(404).json({ error: 'Resource does not exist.' });
	if (note.user._id != req.user.sub) return res.sendStatus(403);

	const start = req.body.start || note.start;
	const end = req.body.end || note.end;
	const text = req.body.text || note.text || '';

	res.json(await Note.findByIdAndUpdate(noteId, { start, end, text }, { new: true }));
};

exports.delete = async (req, res) => {
	const note = await Note.findById(req.params.noteId);
	if (!note) return res.status(404).json({ error: 'Resource does not exist.' });
	if (note.user._id != req.user.sub) return res.sendStatus(403);
	await note.remove();
	res.sendStatus(204);
};

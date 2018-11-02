import Note from '../models/note';

exports.list = async (req, res) => {
	res.json(await Note.find({ user: req.user.sub }));
};

exports.listArticleNotes = async (req, res) => {
	res.json(await Note.find({ user: req.user.sub, article: req.params.articleId }));
};

exports.listEpisodeNotes = async (req, res) => {
	res.json(await Note.find({ user: req.user.sub, episode: req.params.episodeId }));
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

	if (!data.start || !data.end)
		return res.status(422).json({ error: 'missing start|end offset' });
	if (!data.article && !data.episode)
		return res.status(422).json({ error: 'missing article||episode id' });

	const note = await Note.create(data);
	res.json(await Note.findById(note._id));
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

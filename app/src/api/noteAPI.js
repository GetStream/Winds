import fetch from '../util/fetch';

export const getNotes = (type, id, thenFn, catchFn) => {
	fetch('GET', `/notes/${type === 'article' ? 'article' : 'episode'}/${id}`)
		.then(thenFn)
		.catch(catchFn);
};

export const newNote = (type, id, start, end, text, thenFn, catchFn) => {
	const typeId = type === 'article' ? { article: id } : { episode: id };

	fetch('POST', '/notes', { start, end, text, ...typeId })
		.then(thenFn)
		.catch(catchFn);
};

export const deleteNote = async (noteId, thenFn, catchFn) => {
	fetch('DELETE', `/notes/${noteId}`)
		.then(thenFn)
		.catch(catchFn);
};

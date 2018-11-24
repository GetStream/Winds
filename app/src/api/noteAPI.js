import fetch from '../util/fetch';

export const getNotes = (dispatch) => {
	fetch('GET', '/notes')
		.then(({ data }) => dispatch({ data, type: 'BATCH_UPDATE_NOTES' }))
		.catch((err) => console.log(err)); // eslint-disable-line no-console
};

export const newNote = (dispatch, type, id, start, end, text, thenFn, catchFn) => {
	const typeId = type === 'article' ? { article: id } : { episode: id };

	fetch('POST', '/notes', { start, end, text, ...typeId })
		.then((res) => {
			dispatch({ data: res.data, type: 'NEW_NOTE' });
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const updateNote = (dispatch, noteId, text, thenFn, catchFn) => {
	fetch('PUT', `/notes/${noteId}`, { text })
		.then((res) => {
			dispatch({ data: res.data, type: 'UPDATE_NOTE' });
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const deleteNote = async (dispatch, feedId, noteId, thenFn, catchFn) => {
	fetch('DELETE', `/notes/${noteId}`)
		.then((res) => {
			dispatch({ noteId, feedId, type: 'DELETE_NOTE' });
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

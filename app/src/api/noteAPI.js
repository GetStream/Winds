import fetch from '../util/fetch';

export const getRecentNotes = (dispatch) => {
	fetch('GET', '/notes?sort=recent')
		.then(({ data }) => dispatch({ data, type: 'BATCH_UPDATE_RECENT_NOTES' }))
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const getNotes = (type, id, thenFn, catchFn) => {
	fetch('GET', `/notes/${type === 'article' ? 'article' : 'episode'}/${id}`)
		.then(thenFn)
		.catch(catchFn);
};

export const newNote = (dispatch, type, id, start, end, text, thenFn, catchFn) => {
	const typeId = type === 'article' ? { article: id } : { episode: id };

	fetch('POST', '/notes', { start, end, text, ...typeId })
		.then((res) => {
			getRecentNotes(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const deleteNote = async (dispatch, noteId, thenFn, catchFn) => {
	fetch('DELETE', `/notes/${noteId}`)
		.then((res) => {
			getRecentNotes(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

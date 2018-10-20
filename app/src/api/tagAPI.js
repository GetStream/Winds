import fetch from '../util/fetch';

export const getTags = (dispatch) => {
	fetch('GET', '/tags')
		.then(({ data }) => dispatch({ data, type: 'BATCH_UPDATE_TAGS' }))
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const newTag = (dispatch, data, thenFn, catchFn) => {
	fetch('POST', '/tags', data)
		.then((res) => {
			getTags(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const addTag = (dispatch, tagId, feedId, type, thenFn, catchFn) => {
	let data = {};
	data[type] = feedId;

	fetch('PUT', `/tags/${tagId}`, data)
		.then((res) => {
			getTags(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const removeTag = (dispatch, tagId, feedId, type, thenFn, catchFn) => {
	let data = { action: 'remove' };
	data[type] = feedId;

	fetch('PUT', `/tags/${tagId}`, data)
		.then((res) => {
			getTags(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const renameTag = (dispatch, tagId, name, thenFn, catchFn) => {
	fetch('PUT', `/tags/${tagId}`, { name })
		.then((res) => {
			getTags(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const deleteTag = async (dispatch, tagId, thenFn, catchFn) => {
	fetch('DELETE', `/tags/${tagId}`)
		.then((res) => {
			getTags(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

import fetch from '../util/fetch';

export const getFolders = (dispatch) => {
	fetch('GET', '/folders')
		.then(({ data }) => dispatch({ data, type: 'BATCH_UPDATE_FOLDERS' }))
		.catch((err) => {
			console.log(err); // eslint-disable-line no-console
		});
};

export const newFolder = (dispatch, data, thenFn, catchFn) => {
	fetch('POST', '/folders', data)
		.then((res) => {
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const updateFolder = (dispatch, folderID, data, thenFn, catchFn) => {
	fetch('PUT', `/folders/${folderID}`, data)
		.then((res) => {
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const renameFolder = (dispatch, folderID, name, thenFn, catchFn) => {
	fetch('PUT', `/folders/${folderID}`, { name })
		.then((res) => {
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const deleteFolder = (dispatch, folderID, unfollow, thenFn, catchFn) => {
	fetch('DELETE', `/folders/${folderID}`, { unfollow })
		.then((res) => {
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const getFolderFeeds = (folderID, params) => {
	return fetch('GET', `/folders/${folderID}/feed`, {}, params);
};

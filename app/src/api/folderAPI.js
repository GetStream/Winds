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
			thenFn(res);
		})
		.catch(catchFn);
};

export const updateFolder = (dispatch, folderID, data, thenFn, catchFn) => {
	fetch('POST', `/folders/${folderID}`, null, data)
		.then((res) => {
			getFolders(dispatch);
			thenFn(res);
		})
		.catch(catchFn);
};

export const deleteFolder = (dispatch, folderID, thenFn, catchFn) => {
	fetch('DELETE', `/folders/${folderID}`)
		.then((res) => {
			getFolders(dispatch);
			thenFn(res);
		})
		.catch(catchFn);
};

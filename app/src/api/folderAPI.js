import fetch from '../util/fetch';
import { unfollowRss, unfollowPodcast } from '../api';

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

export const upsertFolder = async (
	dispatch,
	folderId = '',
	isRss,
	feedID,
	name,
	thenFn,
	catchFn,
) => {
	try {
		// Remove Feed from its current folder //
		if (folderId) {
			let data = { action: 'remove' };
			data[isRss ? 'rss' : 'podcast'] = feedID;
			await fetch('PUT', `/folders/${folderId}`, data);
		}
		// Create a new folder with the feed //
		let data = { name };
		data[isRss ? 'rss' : 'podcast'] = [feedID];
		const res = await fetch('POST', '/folders', data);

		getFolders(dispatch);
		if (thenFn) thenFn(res);
	} catch (e) {
		if (catchFn) thenFn(catchFn);
	}
};

export const renameFolder = (dispatch, folderID, name, thenFn, catchFn) => {
	fetch('PUT', `/folders/${folderID}`, { name })
		.then((res) => {
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const deleteFolder = async (dispatch, folder, unfollow, thenFn, catchFn) => {
	fetch('DELETE', `/folders/${folder._id}`)
		.then((res) => {
			if (unfollow) {
				for (const feed of folder.rss) unfollowRss(dispatch, feed._id);
				for (const feed of folder.podcast) unfollowPodcast(dispatch, feed._id);
			}
			getFolders(dispatch);
			if (thenFn) thenFn(res);
		})
		.catch(catchFn);
};

export const getFolderFeeds = (folderID, params) => {
	return fetch('GET', `/folders/${folderID}/feed`, {}, params);
};

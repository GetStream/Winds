const blockedURLs = ['indeed.'];

export const isBlockedURLs = (url = '') => {
	return !!blockedURLs.find((u) => url.includes(u));
};

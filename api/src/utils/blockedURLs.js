const blockedURLs = ['indeed.co.uk'];

export const isBlockedURLs = (url = '') => {
	return !!blockedURLs.find((u) => url.includes(u));
};

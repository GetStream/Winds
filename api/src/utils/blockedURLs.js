const blockedURLs = ['indeed.co'];

export const isBlockedURLs = (url = '') => {
	return !!blockedURLs.find((u) => url.includes(u));
};

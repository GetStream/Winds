import fetch from './fetch';

const getAliases = dispatch => {
	fetch('GET', '/aliases')
		.then(({ data }) => {
			const aliases = data.reduce((result, { _id, alias, podcast, rss }) => {
				const feedID = podcast ? podcast._id : rss._id;
				result[feedID] = { _id, alias };
				return result;
			}, {});

			dispatch({ aliases, type: 'BATCH_UPDATE_ALIASES' });
		})
		.catch(err => {
			if (window.console) console.log(err); // eslint-disable-line no-console
		});
};

export { getAliases };

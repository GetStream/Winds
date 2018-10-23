import sanitizeHtml from 'sanitize-html';

const basicTags = [
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'a',
	'ul',
	'ol',
	'nl',
	'li',
	'blockquote',
	'code',
	'table',
	'thead',
	'caption',
	'tbody',
	'tr',
	'th',
	'td',
	'pre',
];
const extraTags = ['b', 'br', 'i', 'strong', 'em', 'strike', 'img'];

const options = {
	allowedIframeHostnames: false,
	allowedTags: [...basicTags, ...extraTags],
	allowedAttributes: {
		a: ['href', 'target', 'id'],
		img: ['src', 'title', 'alt', 'data-*'],
		'*': ['id'],
	},
	transformTags: basicTags.reduce((acc, tag) => {
		acc[tag] = (tagName, attribs) => ({
			tagName,
			attribs: { ...attribs, id: String(Math.ceil(Math.random() * 100000000)) },
		});
		return acc;
	}, {}),
};

const sanitize = (dirty) => {
	return sanitizeHtml(dirty, options);
};

export default sanitize;

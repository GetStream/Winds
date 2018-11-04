import sanitizeHtml from 'sanitize-html';

const allowedTags = [
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
	'figcaption',
	'b',
	'br',
	'i',
	'strong',
	'em',
	'strike',
	'img',
];

const options = {
	allowedIframeHostnames: false,
	allowedTags,
	allowedAttributes: {
		a: ['href', 'target', 'id'],
		img: ['src', 'title', 'alt', 'data-*'],
	},
};

const sanitize = (dirty) => {
	const html = sanitizeHtml(dirty, options).replace(/\n|\r/g, '');
	if (html === '') return '<p></p>';
	return html;
};

export default sanitize;

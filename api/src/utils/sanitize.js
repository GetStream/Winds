import sanitizeHtml from 'sanitize-html';

export default function sanitize(dirty) {
	return sanitizeHtml(dirty, {
		allowedAttributes: { img: ['src', 'title', 'alt'] },
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
	});
}

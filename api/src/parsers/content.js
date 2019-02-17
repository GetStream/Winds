import Mercury from '@postlight/mercury-parser';

export async function ParseContent(url) {
	return await Mercury.parse(url);
}

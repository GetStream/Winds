// The service worker is needed for a PWA app, by now we'll not cache anything
this.addEventListener('install', (e) => {
	console.log('Winds installed');
});

this.addEventListener('fetch', () => null);

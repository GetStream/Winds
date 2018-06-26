import http from 'http';
import axios from 'axios';
import { expect } from 'chai';

import {
	setupAxiosRedirectInterceptor,
	cleanupAxiosRedirectInterceptor,
} from '../../src/utils/axios';

describe('axios', () => {
	let redirectCount;

	before(() => {
		// correct server
		http.createServer((req, res) => {
			++redirectCount;
			res.statusCode = 302 + redirectCount;
			res.setHeader('location', 'http://localhost:34567');
			res.end();
		}).listen(34567);

		// server sending malformed redirect header
		http.createServer((req, res) => {
			++redirectCount;
			const code = 302 + redirectCount;
			res.socket.end(
				`HTTP/1.1 ${code} Redirect\r\nContent-length: 0\r\nLocation: http://localhost:34568/愛とは何か？/\r\nConnection: close\r\n\r\n`,
				'latin1',
			);
			res.connection.destroy();
		}).listen(34568);
	});

	beforeEach(() => {
		redirectCount = 0;
	});

	describe('w/o interceptors', () => {
		let uncaughtExceptionListeners;

		before(() => {
			// stop Mocha from handling uncaughtExceptions.
			uncaughtExceptionListeners = process.listeners('uncaughtException');
			process.removeAllListeners('uncaughtException');
		});

		after(() => {
			process.removeAllListeners('uncaughtException');
			// resume normal Mocha handling of uncaughtExceptions.
			uncaughtExceptionListeners.forEach(listener => {
				process.on('uncaughtException', listener);
			});
		});

		it('should follow redirects', async () => {
			try {
				await axios({
					url: 'http://localhost:34567',
					maxRedirects: 9,
				});
			} catch (err) {
				expect(err)
					.to.be.an.instanceOf(Error)
					.with.property('message', 'Max redirects exceeded.');
			}
			expect(redirectCount).to.equal(10);
		});

		it('should fail in unhandleable way for malformed redirects', done => {
			process.on('uncaughtException', err => {
				expect(err)
					.to.be.an.instanceOf(TypeError)
					.with.property(
						'message',
						'Request path contains unescaped characters',
					);
				expect(redirectCount).to.equal(1);
				done();
			});

			axios({
				url: 'http://localhost:34568',
				maxRedirects: 9,
			});
		});
	});

	describe('interceptors', () => {
		let interceptor;

		before(() => {
			interceptor = setupAxiosRedirectInterceptor(axios);
		});

		after(() => {
			cleanupAxiosRedirectInterceptor(axios, interceptor);
		});

		it('should follow redirects', async () => {
			try {
				await axios({
					url: 'http://localhost:34567',
					maxRedirects: 9,
				});
			} catch (err) {
				expect(err)
					.to.be.an.instanceOf(Error)
					.with.property('message', 'Max redirects exceeded.');
			}
			expect(redirectCount).to.equal(10);
		});

		it('should fail for malformed redirects', async () => {
			try {
				await axios({
					url: 'http://localhost:34568',
					maxRedirects: 9,
				});
			} catch (err) {
				expect(err)
					.to.be.an.instanceOf(TypeError)
					.with.property(
						'message',
						'Request path contains unescaped characters',
					);
			}
			expect(redirectCount).to.equal(1);
		});
	});
});

function wrapAsync(fn) {
	return function wrapAsyncInner(req, res, next) {
		// Make sure to `.catch()` any errors and pass them along to the `next()`
		// middleware in the chain, in this case the error handler.
		fn(req, res, next).catch((e) => {
			next(e);
		});
	};
}

exports.wrapAsync = wrapAsync;

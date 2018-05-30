import Health from "../controllers/health"

const asyncMiddleware = fn =>
	(req, res, next) => {
		Promise.resolve(fn(req, res, next))
			.catch(next);
	};

module.exports = api => {
    api.route("/health").get(Health.health)
    api.route("/status").get(Health.status)
    api.route("/sentry/log").get(asyncMiddleware(Health.sentryLog))
    api.route("/sentry/throw").get(asyncMiddleware(Health.sentryThrow))
}

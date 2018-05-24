import Health from "../controllers/health"

module.exports = api => {
    api.route("/health").get(Health.health)
    api.route("/status").get(Health.status)
}

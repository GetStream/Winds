import Listen from "../controllers/listen"

module.exports = api => {
    api.route("/listens").get(Listen.list)
    api.route("/listens/:listenId").get(Listen.get)
    api.route("/listens").post(Listen.post)
    api.route("/listens/:listenId").delete(Listen.delete)
}

import Pin from "../controllers/pin"

module.exports = api => {
    api.route("/pins").get(Pin.list)
    api.route("/pins/:pinId").get(Pin.get)
    api.route("/pins").post(Pin.post)
    api.route("/pins/:pinId").delete(Pin.delete)
}

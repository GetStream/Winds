import Share from "../controllers/share"

module.exports = api => {
    api.route("/shares").get(Share.list)
    api.route("/shares/:shareId").get(Share.get)
    api.route("/shares").post(Share.post)
    api.route("/shares/:shareId").put(Share.put)
    api.route("/shares/:shareId").delete(Share.delete)
}

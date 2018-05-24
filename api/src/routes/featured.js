import Featured from "../controllers/featured"

module.exports = api => {
    api.route("/featured").get(Featured.list)
}

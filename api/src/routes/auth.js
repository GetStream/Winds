import Auth from "../controllers/auth"

module.exports = api => {
    api.route("/auth/signup").post(Auth.signup)
    api.route("/auth/login").post(Auth.login)
    api.route("/auth/forgot-password").post(Auth.forgotPassword)
    api.route("/auth/reset-password").post(Auth.resetPassword)
}

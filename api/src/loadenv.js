import dotenv from "dotenv"
import path from "path"

// workaround based on https://github.com/motdotla/dotenv/issues/133
let envPath = path.resolve(__dirname, "..", "..", "app", ".env")

console.log(`Loading .env from ${envPath}`)

dotenv.config({ path: envPath })

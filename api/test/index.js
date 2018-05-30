import fs from 'fs'
import path from 'path'
import klawSync from 'klaw-sync'
import chai from 'chai'
import chaiHttp from 'chai-http'
import redis from 'redis'
import mongoose from 'mongoose'

import config from '../src/config'
import '../src/utils/db'
import api from '../src/server'
import { setupMocks } from '../src/utils/test'

chai.use(chaiHttp);

after(() => {
    //XXX: don't care about open connections
    setTimeout(process.exit, 3000);
})

const redisClient = redis.createClient(config.cache.uri);

//XXX: drop all data before running tests
mongoose.connection.dropDatabase();
redisClient.send_command('FLUSHDB');

setupMocks();

const thisFile = path.join(__dirname, "index.js")
klawSync(__dirname).forEach(item => {
    if (item.path.endsWith(".js") && item.path != thisFile) {
        require(item.path)
    }
})

fs.readdirSync(path.join(__dirname, "..", "src", "routes")).map(file => {
    if (file.endsWith(".js")) {
        require("../src/routes/" + file)(api)
    }
})

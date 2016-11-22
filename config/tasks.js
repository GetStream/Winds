module.exports.tasks = {
    // see https://github.com/Automattic/kue#redis-connection-settings
    redis: {
        port: 6379,
        host: 'http://winds.getstream.io',
        auth: process.env.REDIS_AUTH,
        db: 0, // if provided select a non-default redis db
        // options: {
        //   // see https://github.com/mranney/node_redis#rediscreateclient
        // }
    }
}

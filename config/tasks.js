module.exports.tasks = {
    // see https://github.com/Automattic/kue#redis-connection-settings
    redis: {
        port: 6379,
        host: '127.0.0.1',
        auth: process.env.REDIS_AUTH,
        db: 0, // if provided select a non-default redis db
        // options: {
        //   // see https://github.com/mranney/node_redis#rediscreateclient
        // }
    }
}

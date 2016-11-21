module.exports.tasks = {
    // see https://github.com/Automattic/kue#redis-connection-settings
    redis: {
        port: 6379,
        host: '127.0.01',
        auth: undefined,
        db: undefined, // if provided select a non-default redis db
        options: {
          // see https://github.com/mranney/node_redis#rediscreateclient
        }
    }
}

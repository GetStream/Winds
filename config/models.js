/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 */

module.exports.models = {

    // Your app's default connection.
    // i.e. the name of one of your app's connections (see `config/connections.js`)
    //
    // (defaults to localDiskDb)
    connection: 'localDiskDb',
    migrate: 'safe'

};

if (process.env.MONGO_URL) {
    module.exports.models = {
        connection: 'mongo',
        migrate: 'safe'
    };
}

console.log(module.exports.models)

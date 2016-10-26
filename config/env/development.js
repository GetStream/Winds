module.exports.log = {

  // Valid `level` configs:
  // i.e. the minimum log level to capture with sails.log.*()
  //
  // 'error'	: Display calls to `.error()`
  // 'warn'	: Display calls from `.error()` to `.warn()`
  // 'debug'	: Display calls from `.error()`, `.warn()` to `.debug()`
  // 'info'	: Display calls from `.error()`, `.warn()`, `.debug()` to `.info()`
  // 'verbose': Display calls from `.error()`, `.warn()`, `.debug()`, `.info()` to `.verbose()`
  //
  log: {
    level: 'info'
  }

};

module.exports.http = {
    baseUrl: 'http://localhost:1337',
}

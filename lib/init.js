var util = require('util')
var Backend = require('./backend')

exports.init = function(startupTime, config, emitter) {
  if (!config.cloudwatch)
    config.cloudwatch = {}

  if (!config.cloudwatch.region)
    return fail('configuration value cloudwatch.region is missing')
  if (!config.cloudwatch.namespace)
    return fail('configuration value cloudwatch.namespace is missing')

  new Backend(config.cloudwatch, function(flush, status) {
    if (flush) emitter.on('flush', flush)
    if (status) emitter.on('status', status)
  })

  return true
}

function fail(message) {
  util.log('[cloudwatch] ' + message)
  return false
}
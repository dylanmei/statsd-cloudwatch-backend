var AWS  = require('aws-sdk'),
    util = require('util'),
    _    = require('underscore')

var Backend = require('./backend')

exports.init = function(startupTime, config, emitter) {
  config = _.defaults(config.cloudwatch || {}, {
    debug: config.debug,
    dimensions: { 'InstanceId': '' }
  })

  if (!config.region)
    return fail('configuration value cloudwatch.region is missing')
  if (!config.namespace)
    return fail('configuration value cloudwatch.namespace is missing')

  AWS.config.update(config)
  AWS.config.apiVersions = {
    cloudwatch: '2010-08-01',
  }

  if (config.dimensions['InstanceId'] != '')
    startup(config, emitter)
  else {
    var metadata = new AWS.MetadataService()
    metadata.request('/latest/meta-data/instance-id', function(err, data) {
      if (err)
        return fail('could not access meta-data service; ' + err.code)

      config.dimensions['InstanceId'] = data
      startup(config, emitter)
    })
  }

  return true
}

function startup(config, emitter) {
  new Backend(config, function(flush, status) {
    if (flush) emitter.on('flush', flush)
    if (status) emitter.on('status', status)
  })
}

function fail(message) {
  util.log('[cloudwatch] ' + message)
  return false
}

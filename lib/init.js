var AWS  = require('aws-sdk'),
    fmt = require('fmt'),
    util = require('util'),
    _    = require('underscore')

var Backend = require('./backend')

exports.init = function(startupTime, config, emitter, logger) {
  config = _.defaults(config.cloudwatch || {}, {
    debug: config.debug,
    dumpMessages: config.dumpMessages,
    dimensions: { 'InstanceId': '' }
  })

  if (!config.namespace) {
    logger.log('cloudwatch config is missing "namespace"')
    return false
  }
  if (!config.region) {
    logger.log('cloudwatch config is missing "region"')
    return false
  }

  AWS.config.update(config)
  AWS.config.apiVersions = {
    cloudwatch: '2010-08-01',
  }

  if (config.dimensions['InstanceId'] != '')
    startup(config, emitter, logger)
  else {
    var metadata = new AWS.MetadataService()
    metadata.request('/latest/meta-data/instance-id', function(err, data) {
      if (err) {
        if (config.debug)
          logger.log('cloudwatch backend could not access meta-data service: ' + err.code)

        if (config.dumpMessages)
          fmt.dump(err)
      }

      if (data) {
        config.dimensions['InstanceId'] = data
      }
 
      startup(config, emitter, logger)
    })
  }

  return true
}

function startup(config, emitter, logger) {
  new Backend(config, function(flush, status) {
    if (flush) emitter.on('flush', flush)
    if (status) emitter.on('status', status)
  }, logger)
}

var AWS  = require('aws-sdk'),
    util = require('util'),
    fmt  = require('fmt'),
    _    = require('underscore')

var Backend = module.exports = function(options, binder) {
  AWS.config.update(options)
  AWS.config.apiVersions = {
    cloudwatch: '2010-08-01',
  }

  options = _.defaults(options, {
    client: new AWS.CloudWatch(),
    namespace: 'unknown'
  })

  this.client = options.client
  this.namespace = options.namespace

  if (binder) {
    binder(_.bind(this.flush, this), null)
  }
}

_.extend(Backend.prototype, {
  flush: function(time, metrics) {
    var data = collect_counters(time, this.filter(metrics.counters))

    if (data.length == 0)
      return

    var params = {
      Namespace: this.namespace,
      MetricData: data
    }

    this.client.putMetricData(params, function(err, data) {
      if (err) fmt.dump(err, "Err")
    })
  },

  status: function(callback) {
    // todo...
  },

  filter: function(metrics) {
    var result = {}, keys = _.keys(metrics)
    _.each(keys, function(key) {
      if (key.indexOf('statsd.') == -1)
        result[key] = metrics[key]
    })
    return result
  }
})

function collect_counters(time, counters) {
  var results = []
  for (var key in counters) {
    var value = counters[key]
    results.push({ MetricName: key, Unit: 'Count', Value : value, Timestamp: time, })
  }

  return results
}

function debug(message) {
  var args = Array.prototype.slice.call(arguments);
  util.debug("[cloudwatch] " + args.join(' '))
}

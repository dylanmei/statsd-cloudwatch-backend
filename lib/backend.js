var AWS  = require('aws-sdk'),
    util = require('util'),
    fmt  = require('fmt'),
    _    = require('underscore')

var debug = false

var Backend = module.exports = function(options, binder) {
  options = _.defaults(options || {}, {
    client:     new AWS.CloudWatch(),
    dimensions: {},
    namespace:  'unknown',
  })

  debug = options.debug
  this.client = options.client
  this.namespace = options.namespace
  this.dimensions = list_dimensions(options.dimensions)

  if (binder) {
    binder(_.bind(this.flush, this), null)
  }
}

_.extend(Backend.prototype, {
  flush: function(time, metrics) {
    var date = new Date(time * 1000)
    var data = _.union(
      collect_timers(date, this.filter(metrics.timers), this.dimensions),
      collect_counters(date, this.filter(metrics.counters), this.dimensions))

    if (data.length == 0)
      return

    var params = {
      Namespace: this.namespace,
      MetricData: data
    }

    this.client.putMetricData(params, function(err, data) {
      err ? report_failure(err) : report_success(params)
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

function collect_timers(date, timers, dimensions) {
  var results = []
  for (var key in timers) {
    var data = timers[key].length
      ? timers[key] : [0]
    
    var values = {
      Minimum:     _.min(data),
      Maximum:     _.max(data),
      Sum:         _.reduce(data, function(memo, num) { return memo + num }, 0),
      SampleCount: data.length
    }

    results.push({ MetricName: key, StatisticValues: values, Unit: 'Milliseconds',
      Timestamp: date, Dimensions: dimensions
    })
  }

  return results
}

function collect_counters(date, counters, dimensions) {
  var results = []
  for (var key in counters) {
    var value = counters[key]
    results.push({ MetricName: key, Value: value, Unit: 'Count',
      Timestamp: date, Dimensions: dimensions
    })
  }

  return results
}

function list_dimensions(dimensions) {
  var results = [], keys = _.keys(dimensions)
  _.each(keys, function(key) {
    var value = dimensions[key]
    if (value && value != '')
      results.push({ 'Name': key, 'Value': dimensions[key] })
  })

  return results
}

function report_success(metric_params) {
  if (!debug) return
  trace('sent', metric_params.MetricData.length, 'metrics')
}

function report_failure(err) {
  fmt.dump(err)
}

function log(message) {
  var args = Array.prototype.slice.call(arguments);
  util.log("[cloudwatch] " + args.join(' '))
}

function trace(message) {
  var args = Array.prototype.slice.call(arguments);
  util.debug("[cloudwatch] " + args.join(' '))
}

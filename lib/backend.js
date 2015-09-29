var AWS  = require('aws-sdk'),
    util = require('util'),
    fmt  = require('fmt'),
    _    = require('underscore')

var l, debug, dumpMessages
var noopLogger = {log: function(){}}

var Backend = module.exports = function(options, time, binder, logger) {
  options = _.defaults(options || {}, {
    client:     new AWS.CloudWatch(),
    dimensions: {},
    namespace:  'unknown',
    debug: false,
    dumpMessages: false
  })

  l = logger || noopLogger
  debug = options.debug
  dumpMessages = options.dumpMessages

  this.client = options.client
  this.namespace = options.namespace
  this.dimensions = list_dimensions(options.dimensions)

  this.stats = {
    last_flush: time,
    last_exception: time,
  }

  if (binder) {
    binder(_.bind(this.flush, this), _.bind(this.status, this))
  }
}

_.extend(Backend.prototype, {
  flush: function(time, metrics) {
    var date = new Date(time * 1000)
    var data = _.union(
      collect_timers(date, metrics.timers, this.dimensions),
      collect_counters(date, metrics.counters, this.dimensions),
      collect_gauges(date, metrics.gauges, this.dimensions))

    while (data.length > 0) {
      var params = {
        Namespace: this.namespace,
        MetricData: data.slice(0, 20)
      }

      var stats = this.stats
      this.client.putMetricData(params, function (err, data) {
        err ? report_error(err, stats) : report_success(params, stats)
      })

      data = data.slice(20);
    }
  },

  status: function(callback) {
    for (var key in this.stats) {
      callback(null, 'cloudwatch', key, this.stats[key])
    }
  },
})

function collect_timers(date, timers, dimensions) {
  var metrics = []
  for (var key in timers) {
    var data = timers[key].length
      ? timers[key] : [0]
    
    var values = {
      Minimum:     _.min(data),
      Maximum:     _.max(data),
      Sum:         _.reduce(data, function(memo, num) { return memo + num }, 0),
      SampleCount: data.length
    }

    metrics.push({ MetricName: key, StatisticValues: values, Unit: 'Milliseconds',
      Timestamp: date, Dimensions: dimensions
    })
  }

  return metrics
}

function collect_counters(date, counters, dimensions) {
  var metrics = []
  for (var key in filter_metrics(counters)) {
    var value = counters[key]
    metrics.push({ MetricName: key, Value: value, Unit: 'Count',
      Timestamp: date, Dimensions: dimensions
    })
  }

  return metrics
}

function collect_gauges(date, gauges, dimensions) {
  var metrics = []
  for (var key in filter_metrics(gauges)) {
    var value = gauges[key]
    metrics.push({ MetricName: key, Value: value, Unit: 'None',
      Timestamp: date, Dimensions: dimensions
    })
  }
  return metrics
}

function filter_metrics(metrics) {
  var result = {}, keys = _.keys(metrics || {})
  _.each(keys, function(key) {
    if (key.indexOf('statsd.') == -1)
      result[key] = metrics[key]
  })
  return result
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

function report_success(metric_params, stats) {
  stats.last_flush = Math.round(new Date().getTime() / 1000)

  if (!dumpMessages) return
  var data = metric_params.MetricData
  var counters = _.where(data, { Unit: 'Count' }),
      timers = _.where(data, { Unit: 'Milliseconds' }),
      gauges = _.where(data, { Unit: 'None' })

  var s = 'cloudwatch recieved ' +
    counters.length + ' counters, ' +
    timers.length + ' timers, and ' +
    gauges.length + ' gauges' 

   l.log(s)
}

function report_error(err, stats) {
  stats.last_exception = Math.round(new Date().getTime() / 1000)
  l.log('cloudwatch ' + err.code + ': ' + err.message)
  if (dumpMessages) fmt.dump(err)
}

var _ = require('underscore')

var Fake = module.exports = {
  CloudWatch: function() {
    this.Namespace = ''
    this.MetricData = []
  }
}

_.extend(Fake.CloudWatch.prototype, {
  putMetricData: function(params, complete) {
    _.extend(this, params)
    complete(null, {})
  }
})

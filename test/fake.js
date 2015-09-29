var _ = require('underscore')

var Fake = module.exports = {
  CloudWatch: function() {
    //this.Namespace = ''
    //this.MetricData = []
    this.params = []
  },
}

_.extend(Fake.CloudWatch.prototype, {
  putMetricData: function(params, complete) {
    this.params.push(params);
    complete(null, {})
  }
})

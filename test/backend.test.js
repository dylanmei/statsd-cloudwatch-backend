var expect  = require('chai').expect,
    _       = require('underscore'),
    Fixture = require('./fixture'),
    Fake    = require('./fake'),
    Backend = require('../lib/backend.js')

describe('new backend', function() {
  var backend = new Backend()

  it('should have a namespace', function() {
    expect(backend.namespace).to.exist
  })

  it('should have a cloudwatch client', function() {
    expect(backend.client).to.exist
  })

  it('should have a dimensions array', function() {
    expect(backend.dimensions).to.have.length(0)
  })
})

describe('flush with no metrics', function() {
  var cloudwatch = new Fake.CloudWatch()
  var backend = new Backend({
    client: cloudwatch, namespace: 'abc.123'
  })

  beforeEach(function() {
    backend.flush(Fixture.timestamp, {
      counters: {}, timers: {}, guages: {}, sets: {}
    })
  })

  it('should not send counters', function() {
    expect(cloudwatch.MetricData).to.have.length(0)
  })
})

describe('flushing counters', function() {
  var metric = null
  var cloudwatch = new Fake.CloudWatch()
  var backend = new Backend({
    client: cloudwatch, namespace: 'abc.123', dimensions: { 'InstanceId': 'i-xyz' }
  })

  beforeEach(function() {
    backend.flush(Fixture.timestamp, {
      counters: Fixture.counters, timers: {}
    })
    metric = _.first(cloudwatch.MetricData)
  })

  it('should send a namespace', function() {
    expect(cloudwatch.Namespace).to.equal('abc.123')
  })

  it('should send a counter', function() {
    expect(metric).to.exist
    expect(metric.Unit).to.equal('Count')
  })

  it('should send a metric name', function() {
    expect(metric.MetricName).to.equal('api.request_count')
  })

  it('should send a count', function() {
    expect(metric.Value).to.equal(100)
  })

  it('should send a timestamp', function() {
    expect(metric.Timestamp.getTime()).to.equal(Fixture.now.getTime())
  })

  it('should send a dimension', function() {
    var dimensions = metric.Dimensions
    expect(dimensions).to.have.length(1)
    expect(dimensions[0]['Name']).to.equal('InstanceId')
    expect(dimensions[0]['Value']).to.equal('i-xyz')
  })

  it('should not send a statsd counter', function() {
    var counters = _.filter(cloudwatch.MetricData, function(c) {
      return c.MetricName.indexOf('statsd.') == 0
    })
    expect(counters).to.have.length(0)
  })
})

describe('flusing timers', function() {
  var metric = null
  var cloudwatch = new Fake.CloudWatch()
  var backend = new Backend({
    client: cloudwatch, namespace: 'abc.123', dimensions: { 'InstanceId': 'i-xyz' }
  })

  beforeEach(function() {
    backend.flush(Fixture.timestamp, {
      timers: Fixture.timers, counters: {}
    })
    metric = _.first(cloudwatch.MetricData)
  })

  it('should send a namespace', function() {
    expect(cloudwatch.Namespace).to.equal('abc.123')
  })

  it('should send a timer', function() {
    expect(metric).to.exist
    expect(metric.Unit).to.equal('Milliseconds')
  })

  it('should send a metric name', function() {
    expect(metric.MetricName).to.equal('api.request_time')
  })

  it('should send a sum', function() {
    expect(metric.StatisticValues.Sum).to.equal(10)
  })

  it('should send a min', function() {
    expect(metric.StatisticValues.Minimum).to.equal(0)
  })

  it('should send a max', function() {
    expect(metric.StatisticValues.Maximum).to.equal(4)
  })

  it('should send a sample count', function() {
    expect(metric.StatisticValues.SampleCount).to.equal(5)
  })

  it('should send a timestamp', function() {
    expect(metric.Timestamp.getTime()).to.equal(Fixture.now.getTime())
  })

  it('should send a dimension', function() {
    var dimensions = metric.Dimensions
    expect(dimensions).to.have.length(1)
    expect(dimensions[0]['Name']).to.equal('InstanceId')
    expect(dimensions[0]['Value']).to.equal('i-xyz')
  })
})

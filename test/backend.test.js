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
  var counter = null
  var cloudwatch = new Fake.CloudWatch()
  var backend = new Backend({
    client: cloudwatch, namespace: 'abc.123', dimensions: { 'InstanceId': 'i-xyz' }
  })

  beforeEach(function() {
    backend.flush(Fixture.timestamp, {
      counters: Fixture.counters
    })
    counter = _.find(cloudwatch.MetricData, function(c) {
      return c.MetricName == 'api.requests'
    })
  })

  it('should send a namespace', function() {
    expect(cloudwatch.Namespace).to.equal('abc.123')
  })

  it('should send a counter', function() {
    expect(counter).to.exist
  })

  it('should not send a statsd counter', function() {
    var counters = _.filter(cloudwatch.MetricData, function(c) {
      return c.MetricName.indexOf('statsd.') == 0
    })
    expect(counters).to.have.length(0)
  })

  it('should send a metric name', function() {
    expect(counter.MetricName).to.equal('api.requests')
  })

  it('should send a metric value', function() {
    expect(counter.Value).to.equal(100)
  })

  it('should send a metric timestamp', function() {
    expect(counter.Timestamp.getTime()).to.equal(Fixture.now.getTime())
  })

  it('should send a metric unit', function() {
    expect(counter.Unit).to.equal('Count')
  })

  it('should send a metric dimension', function() {
    var dimensions = counter.Dimensions
    expect(dimensions).to.have.length(1)
    expect(dimensions[0]['Name']).to.equal('InstanceId')
    expect(dimensions[0]['Value']).to.equal('i-xyz')
  })
})


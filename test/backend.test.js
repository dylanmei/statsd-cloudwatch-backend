var expect  = require('chai').expect,
    _       = require('underscore'),
    Fixture = require('./fixture'),
    Fake    = require('./fake')
    Backend = require('../lib/backend.js'),

describe('new backend', function() {
  var backend = new Backend({})

  it('should have a namespace', function() {
    expect(backend.namespace).to.exist
  })

  it('should have a cloudwatch client', function() {
    expect(backend.client).to.exist
  })
})

describe('flush with no metrics', function() {
  var client = new Fake.CloudWatch()
  var backend = new Backend({
    client: client, namespace: 'abc.123'
  })

  beforeEach(function() {
    backend.flush(Fixture.today, {
      counters: {}, timers: {}, guages: {}, sets: {}
    })
  })

  it('should not send counters', function() {
    expect(client.MetricData).to.have.length(0)
  })
})

describe('flush counters', function() {
  var client = new Fake.CloudWatch()
  var backend = new Backend({
    client: client, namespace: 'abc.123'
  })

  beforeEach(function() {
    backend.flush(Fixture.today, {
      counters: Fixture.counters
    })
  })

  it('should send a namespace', function() {
    expect(client.Namespace).to.equal('abc.123')
  })

  it('should send a counter', function() {
    var counter = _.find(client.MetricData, function(c) {
      return c.MetricName == 'api.requests'
    })

    expect(counter).to.exist
    expect(counter.MetricName).to.equal('api.requests')
    expect(counter.Timestamp).to.equal(Fixture.today)
    expect(counter.Value).to.equal(100)
    expect(counter.Unit).to.equal('Count')
  })

  it('should not send a statsd counter', function() {
    var counters = _.filter(client.MetricData, function(c) {
      return c.MetricName.indexOf('statsd.') == 0
    })

    expect(counters).to.have.length(0)
  })
})


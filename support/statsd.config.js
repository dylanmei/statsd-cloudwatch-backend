{
  host: '0.0.0.0',
  port: 8125,
  backends: ['../../lib/init.js'],
  cloudwatch: {
    region: 'us-west-2',
    namespace: 'statsd-cloudwatch-backend'
  }
}

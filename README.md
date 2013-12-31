# StatsD CloudWatch Backend

This is a pluggable backend for [StatsD](https://github.com/etsy/statsd). It publishes stats to [Amazon's AWS CloudWatch](http://aws.amazon.com/cloudwatch/).

Be aware that AWS CloudWatch metrics are not free and the cost can quickly become prohibative. *Pricing details: [Amazon CloudWatch Pricing](http://aws.amazon.com/cloudwatch/pricing/).* This may be a good choice if your needs are simple and/or as a means of quickly getting off the ground, as setting up [Graphite](http://graphite.wikidot.com/) in EC2 is not trivial.

*Counters*, *Gauges*, and *Timers* are supported. *Sets* are not implemented.

## Requirements

* [StatsD deamon](https://npmjs.org/package/statsd) versions >= 0.7.0.
* An [Amazon AWS](https://aws.amazon.com) account.

## Installation

    $ cd /path/to/statsd
    $ npm install statsd-cloudwatch-backend


## Configuration

Add `statsd-cloudwatch-backend` to the list of backends in the StatsD configuration file:

    {
        backends: ["statsd-cloudwatch-backend"]
    }

Add the following basic configuration information to the StatsD configuration file.

    {
        cloudwatch: {
            namespace:  "my.api",
            region: "us-west-2",
            dimensions: {},
            accessKeyId:  "<YOUR ACCESS KEY ID>",
            secretAccessKey: "<YOUR SECRET ACCESS KEY>"
        }
    }

The *namespace*, and *region* settings are required. The *dimensions* structure is optional. The *accessKeyId* and *secretAccessKey* settings are not required if the EC2 instance is configured with an instance-profile with permissions to write to CloudWatch.

# StatsD CloudWatch Backend

This is a pluggable backend for [StatsD](https://github.com/etsy/statsd). It publishes stats to [Amazon CloudWatch](http://aws.amazon.com/cloudwatch/).

## Requirements

* [StatsD deamon](https://npmjs.org/package/statsd) versions >= 0.7.0.
* An [Amazon AWS](https://aws.amazon.com) account.

## Installation

    $ cd /path/to/statsd
    $ npm install statsd-cloudwatch-backend

## Configuration

Add `statsd-cloudwatch-backend` to the list of StatsD backends in the StatsD configuration file:

    {
        backends: ["statsd-cloudwatch-backend"]
    }

Add the following basic configuration information to your StatsD config file.

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


var now = new Date(2011, 1, 1)

module.exports = {
  now: now,
  timestamp: now.getTime() / 1000,
  counters: {
    'api.request_count': 100,
    'statsd.bad_lines_seen': 0,
    'statsd.packets_received': 50,
  },
  timers: {
    'api.request_time': [0, 1, 2, 3, 4]
  },
  gauges: {
    'api.num_sessions': 50,
    'statsd.timestamp_lag': 0
  }
}

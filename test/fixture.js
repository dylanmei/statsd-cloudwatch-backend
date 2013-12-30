var now = new Date(2011, 1, 1)

module.exports = {
  now: now,
  timestamp: now.getTime() / 1000,
  counters: {
    'statsd.bad_lines_seen': 0,
    'statsd.packets_received': 50,
    'api.request_count': 100,
  },
  timers: {
    'api.request_time': [0, 1, 2, 3, 4]
  },
}

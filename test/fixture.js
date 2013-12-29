var now = new Date(2011, 1, 1)

module.exports = {
  now: now,
  timestamp: now.getTime() / 1000,
  counters: {
    'statsd.bad_lines_seen': 0,
    'statsd.packets_received': 50,
    'api.requests': 100
  }
}

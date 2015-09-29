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
  },
  manyCounters: {
    'counter00': 100,
    'counter01': 100,
    'counter02': 100,
    'counter03': 100,
    'counter04': 100,
    'counter05': 100,
    'counter06': 100,
    'counter07': 100,
    'counter08': 100,
    'counter09': 100,
    'counter10': 100,
    'counter11': 100,
    'counter12': 100,
    'counter13': 100,
    'counter14': 100,
    'counter15': 100,
    'counter16': 100,
    'counter17': 100,
    'counter18': 100,
    'counter19': 100,
    'counter20': 100
  },
}

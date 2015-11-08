REPORTER = tap

start:
	./node_modules/.bin/statsd support/statsd.config.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
				--reporter $(REPORTER) \
				--ui tdd

.PHONY: start test

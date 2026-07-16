-- KEYS[1]=jobs:processing, KEYS[2]=jobs:counters
-- ARGV[1]=jobId
redis.call('HDEL', KEYS[1], ARGV[1])
redis.call('DEL', 'jobs:lock:'..ARGV[1])
redis.call('HINCRBY', KEYS[2], 'processing', -1)
return 1

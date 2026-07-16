-- KEYS[1] = jobs:queued, KEYS[2] = jobs:counters
-- ARGV[1] = jobId, ARGV[2] = priority, ARGV[3] = enqueuedAt
local score = tonumber(ARGV[2]) * 10000000000000 + tonumber(ARGV[3])
redis.call('ZADD', KEYS[1], score, ARGV[1])
redis.call('HINCRBY', KEYS[2], 'queued', 1)
return 1

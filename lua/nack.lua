-- KEYS[1]=jobs:processing, KEYS[2]=jobs:queued, KEYS[3]=jobs:counters
-- ARGV[1]=jobId, ARGV[2]=retryCount, ARGV[3]=maxRetries, ARGV[4]=nextDelayMs, ARGV[5]=nextAttemptAtMs, ARGV[6]=priority
redis.call('HDEL', KEYS[1], ARGV[1])
redis.call('DEL', 'jobs:lock:'..ARGV[1])
if tonumber(ARGV[2]) >= tonumber(ARGV[3]) then
  redis.call('HINCRBY', KEYS[3], 'processing', -1)
  return 'DLQ'
end
redis.call('ZADD', 'jobs:delayed', tonumber(ARGV[4]) + tonumber(ARGV[5]), ARGV[1])
redis.call('HINCRBY', KEYS[3], 'processing', -1)
return 'RETRY'

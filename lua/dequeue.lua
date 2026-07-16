-- KEYS[1]=jobs:queued, KEYS[2]=jobs:processing, KEYS[3]=jobs:counters
-- ARGV[1]=workerId, ARGV[2]=lockTtlSec, ARGV[3]=nowMs
if redis.call('GET', 'queue:paused') == '1' then return nil end
local popped = redis.call('ZPOPMIN', KEYS[1], 1)
if #popped == 0 then return nil end
local jobId = popped[1]
local entry = cjson.encode({workerId=ARGV[1], startedAt=ARGV[3], attempt=0})
redis.call('HSET', KEYS[2], jobId, entry)
redis.call('SET', 'jobs:lock:'..jobId, ARGV[1], 'EX', ARGV[2])
redis.call('HINCRBY', KEYS[3], 'queued', -1)
redis.call('HINCRBY', KEYS[3], 'processing', 1)
return jobId

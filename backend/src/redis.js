const Redis = require('ioredis');

// Create Redis client from environment variable
// Supports Upstash, Vercel KV, Redis Cloud, or any Redis instance
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('ERROR: REDIS_URL environment variable is required');
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

/**
 * Check Redis connectivity
 * @returns {Promise<boolean>} true if Redis is reachable
 */
async function ping() {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis ping failed:', error.message);
    return false;
  }
}

module.exports = {
  redis,
  ping,
};

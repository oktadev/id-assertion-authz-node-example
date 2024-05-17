import { createClient } from 'redis';

const createRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_SERVER,
  });
  client.on('error', (err) => console.log('Redis Client Error', err));

  return client;
};

export default createRedisClient;

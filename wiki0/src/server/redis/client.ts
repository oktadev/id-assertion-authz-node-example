import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_SERVER,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

class RedisConnection {
  client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  getClient() {
    if (!this.client.isReady) {
      this.connect();
    }

    return this.client;
  }

  connect() {
    if (!this.client.isReady) {
      console.log('Connecting to redis');
      this.client.connect();
    }
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export default new RedisConnection(redisClient);

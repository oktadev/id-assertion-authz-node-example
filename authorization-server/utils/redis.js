import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_SERVER,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

class RedisConnection {
  constructor(client) {
    this.client = client;
  }

  async getClient() {
    if (!this.client.isReady) {
      await this.connect();
    }

    return this.client;
  }

  async connect() {
    if (!this.client.isReady) {
      console.log('Connecting to redis');
      await this.client.connect();
    }
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export default new RedisConnection(redisClient);

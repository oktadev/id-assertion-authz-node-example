import redisConnection from './redis.js';

// eslint-disable-next-line import/prefer-default-export
export const storeJagTokenInRedis = async (key, token) => {
  try {
    const redisClient = await redisConnection.getClient();
    await redisClient.set(`jag_subject_token:${key}`, token);
  } catch (e) {
    console.log('Failed to save token to redis');
  }
};

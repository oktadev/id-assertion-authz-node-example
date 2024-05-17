import redisConnection from './client';

// eslint-disable-next-line import/prefer-default-export
export const getJagTokenFromRedis = async (key: string | null) => {
  if (!key) {
    return '';
  }
  try {
    const redisClient = redisConnection.getClient();
    const token = await redisClient.get(`jag_subject_token:${key}`);
    return token;
  } catch (e) {
    console.log('Failed to save token to redis');
  }
};

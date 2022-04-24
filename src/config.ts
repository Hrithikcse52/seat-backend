export const {
  PORT,
  MONGO_URI,
  FRONT_END_URL,
  //Access Token Secrets
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  //is prod
  NODE_ENV,
} = process.env;

export const isProd = NODE_ENV! === 'production';

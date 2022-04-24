export const {
  PORT,
  MONGO_URI,
  FRONT_END_URL,
  // Access Token Secrets

  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  // is prod

  NODE_ENV,
} = process.env;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const isProd = NODE_ENV! === 'production';

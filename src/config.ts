export const {
  PORT,
  MONGO_URI,
  FRONT_END_URL,
  // Access Token Secrets

  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  // is prod
  SUPABASE_ANON,
  NODE_ENV,
  EMAIL,
  PASS,
} = process.env;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ROOT = __dirname;
export const isProd = NODE_ENV === 'production';

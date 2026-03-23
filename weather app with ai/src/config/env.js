const REQUIRED_ENV_VARS = ['VITE_WEATHER_API_KEY'];
const OPTIONAL_ENV_VARS = ['VITE_GEMINI_API_KEY'];

const readEnv = () => ({
  VITE_WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY?.trim() || '',
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY?.trim() || '',
});

export const env = readEnv();

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Update your .env file and restart the Vite server.`,
    );
  }
};

export const getOptionalEnvWarnings = () =>
  OPTIONAL_ENV_VARS.filter((key) => !env[key]).map(
    (key) => `${key} is not set. AI insights will stay unavailable until it is added to .env.`,
  );

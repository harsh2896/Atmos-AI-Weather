const isDev = import.meta.env.DEV;

const formatContext = (context = {}) => {
  const entries = Object.entries(context).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return entries.length > 0 ? entries : undefined;
};

const log = (method, message, context) => {
  if (!isDev && method === 'debug') {
    return;
  }

  const safeContext = formatContext(context);

  if (safeContext) {
    console[method](message, Object.fromEntries(safeContext));
    return;
  }

  console[method](message);
};

export const logger = {
  debug: (message, context) => log('debug', message, context),
  info: (message, context) => log('info', message, context),
  warn: (message, context) => log('warn', message, context),
  error: (message, context) => log('error', message, context),
};

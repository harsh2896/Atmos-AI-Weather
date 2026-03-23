import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { getOptionalEnvWarnings, validateEnv } from './config/env';
import { logger } from './config/logger';

function StartupError({ message }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-400/40 bg-red-500/10 p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-red-200">Configuration Error</p>
        <h1 className="mt-3 text-3xl font-bold">Atmos AI could not start</h1>
        <p className="mt-4 text-base leading-7 text-red-50">{message}</p>
      </div>
    </main>
  );
}

let startupError = '';

try {
  validateEnv();

  getOptionalEnvWarnings().forEach((warning) => {
    logger.warn(warning);
  });
} catch (error) {
  startupError = error instanceof Error ? error.message : 'Unable to validate environment configuration.';
  logger.error('Application startup failed.', { reason: startupError });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {startupError ? <StartupError message={startupError} /> : <App />}
  </React.StrictMode>,
);

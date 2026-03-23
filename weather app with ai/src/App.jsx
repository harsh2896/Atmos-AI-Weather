import { useEffect, useState } from 'react';
import AIInsights from './components/AIInsights';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { logger } from './config/logger';
import { getWeatherInsights } from './services/geminiApi';
import { getWeatherByCity, getWeatherByCoords } from './services/weatherApi';

const DEFAULT_CITY = 'New York';
const RECENT_CITIES_KEY = 'weather-ai-recent-cities';
const THEME_KEY = 'weather-ai-theme';

const weatherThemes = {
  Clear: {
    background:
      'from-sky-200 via-cyan-100 to-amber-100 dark:from-sky-950 dark:via-sky-900 dark:to-slate-950',
    accent: 'Sunny glow',
  },
  Clouds: {
    background:
      'from-slate-200 via-slate-100 to-zinc-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950',
    accent: 'Soft cloud cover',
  },
  Rain: {
    background:
      'from-sky-400 via-slate-300 to-slate-200 dark:from-slate-950 dark:via-sky-950 dark:to-slate-900',
    accent: 'Rain alert',
  },
  Drizzle: {
    background:
      'from-cyan-300 via-slate-200 to-blue-100 dark:from-slate-950 dark:via-cyan-950 dark:to-slate-900',
    accent: 'Light drizzle',
  },
  Thunderstorm: {
    background:
      'from-slate-500 via-indigo-400 to-slate-200 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900',
    accent: 'Stormy skies',
  },
  Snow: {
    background:
      'from-slate-100 via-blue-50 to-white dark:from-slate-900 dark:via-blue-950 dark:to-slate-950',
    accent: 'Snowy air',
  },
  Mist: {
    background:
      'from-slate-300 via-stone-200 to-zinc-100 dark:from-slate-900 dark:via-zinc-900 dark:to-stone-950',
    accent: 'Low visibility',
  },
  Smoke: {
    background:
      'from-stone-300 via-neutral-200 to-slate-200 dark:from-neutral-950 dark:via-stone-900 dark:to-slate-950',
    accent: 'Muted skyline',
  },
  Haze: {
    background:
      'from-amber-200 via-orange-100 to-yellow-50 dark:from-slate-950 dark:via-amber-950 dark:to-slate-900',
    accent: 'Hazy daylight',
  },
  Fog: {
    background:
      'from-zinc-200 via-slate-100 to-stone-100 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-950',
    accent: 'Fog sweep',
  },
};

const getStoredTheme = () => localStorage.getItem(THEME_KEY) || 'light';

function App() {
  const [weather, setWeather] = useState(null);
  const [insight, setInsight] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [error, setError] = useState('');
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const stored = localStorage.getItem(RECENT_CITIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(recentCities));
  }, [recentCities]);

  const updateRecentCities = (city) => {
    setRecentCities((current) => {
      const normalized = city.trim();
      const next = [normalized, ...current.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, 6);
    });
  };

  const fetchInsight = async (weatherData) => {
    setLoadingInsight(true);

    try {
      const aiText = await getWeatherInsights({
        temperature: `${weatherData.temperature} deg C`,
        condition: weatherData.condition,
        humidity: `${weatherData.humidity}%`,
      });
      setInsight(aiText);
    } catch (aiError) {
      logger.warn('Showing AI fallback message.', {
        reason: aiError instanceof Error ? aiError.message : 'Unknown AI error',
      });
      setInsight(aiError instanceof Error ? aiError.message : 'AI insights are unavailable at the moment.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleWeatherResult = async (weatherData, shouldSaveRecent = true) => {
    setWeather(weatherData);
    setError('');
    if (shouldSaveRecent) {
      updateRecentCities(weatherData.city);
    }
    await fetchInsight(weatherData);
  };

  const fetchByCity = async (city) => {
    setLoadingWeather(true);
    setError('');

    try {
      const weatherData = await getWeatherByCity(city);
      await handleWeatherResult(weatherData);
    } catch (weatherError) {
      setError(weatherError instanceof Error ? weatherError.message : 'Unable to fetch weather data right now.');
      setInsight('');
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchByCoords = async (lat, lon) => {
    setLoadingWeather(true);
    setError('');

    try {
      const weatherData = await getWeatherByCoords(lat, lon);
      await handleWeatherResult(weatherData, true);
    } catch (weatherError) {
      logger.warn('Falling back to default city after location weather failure.');
      setError(weatherError instanceof Error ? weatherError.message : 'Unable to detect weather for your location.');
      setInsight('');
      await fetchByCity(DEFAULT_CITY);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            if (!ignore) {
              await fetchByCoords(coords.latitude, coords.longitude);
            }
          },
          async () => {
            if (!ignore) {
              await fetchByCity(DEFAULT_CITY);
            }
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else {
        await fetchByCity(DEFAULT_CITY);
      }
    };

    loadInitialWeather();

    return () => {
      ignore = true;
    };
  }, []);

  const activeTheme = weatherThemes[weather?.condition] || weatherThemes.Clear;

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${activeTheme.background} px-4 py-6 transition-all duration-700 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="glass-panel soft-ring animate-fadeUp overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
                {activeTheme.accent}
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Atmos AI blends live weather data with instant Gemini insights.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-200">
                Search any city, use your current location, and get a human-like weather summary with practical suggestions for the day.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className="self-start rounded-2xl border border-white/30 bg-white/30 px-5 py-3 text-sm font-semibold text-slate-900 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/45 dark:border-white/10 dark:bg-slate-950/35 dark:text-white dark:hover:bg-slate-950/55"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </header>

        <SearchBar
          onSearch={fetchByCity}
          recentCities={recentCities}
          onSelectRecent={fetchByCity}
          loading={loadingWeather}
        />

        {error ? (
          <div className="glass-panel soft-ring animate-fadeUp border-red-300/50 p-4 text-sm font-medium text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <WeatherCard weather={weather} loading={loadingWeather} />
          <AIInsights insight={insight} loading={loadingInsight} />
        </section>
      </div>
    </main>
  );
}

export default App;

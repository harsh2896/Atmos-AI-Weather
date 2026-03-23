import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

const WEATHER_API_KEY = env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const mapWeatherData = (data) => ({
  city: data.name,
  country: data.sys.country,
  temperature: Math.round(data.main.temp),
  feelsLike: Math.round(data.main.feels_like),
  condition: data.weather[0].main,
  description: data.weather[0].description,
  humidity: data.main.humidity,
  windSpeed: Number((data.wind.speed * 3.6).toFixed(1)),
  icon: data.weather[0].icon,
  sunrise: data.sys.sunrise,
  sunset: data.sys.sunset,
  clouds: data.clouds.all,
  coordinates: {
    lat: data.coord.lat,
    lon: data.coord.lon,
  },
});

const getApiErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    if (status === 401 || apiMessage?.toLowerCase().includes('invalid api key')) {
      return 'Invalid API Key';
    }

    if (status === 404 || apiMessage?.toLowerCase().includes('not found')) {
      return 'City not found';
    }

    if (!error.response) {
      return 'Check your internet connection';
    }

    return apiMessage || fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
};

const ensureApiKey = () => {
  if (!WEATHER_API_KEY) {
    throw new Error('Weather service is unavailable because VITE_WEATHER_API_KEY is missing.');
  }
};

const fetchWeatherByCityName = async (city) => {
  const response = await axios.get(WEATHER_BASE_URL, {
    params: {
      q: city,
      appid: WEATHER_API_KEY,
      units: 'metric',
    },
  });

  logger.debug('Weather data loaded.', { city: response.data?.name, status: response.status });
  return mapWeatherData(response.data);
};

export const getWeatherByCity = async (city) => {
  try {
    ensureApiKey();
    return await fetchWeatherByCityName(city);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Weather lookup by city failed.', {
        status: error.response?.status,
        city,
        apiMessage: error.response?.data?.message,
      });
    } else {
      logger.error('Weather lookup by city failed.', { city });
    }
    throw new Error(getApiErrorMessage(error, 'Unable to fetch weather data right now.'));
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  try {
    ensureApiKey();
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    logger.debug('Weather data loaded for coordinates.', {
      lat: Number(lat).toFixed(2),
      lon: Number(lon).toFixed(2),
      status: response.status,
    });
    return mapWeatherData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Weather lookup by coordinates failed.', {
        status: error.response?.status,
        apiMessage: error.response?.data?.message,
      });
    } else {
      logger.error('Weather lookup by coordinates failed.');
    }
    throw new Error(getApiErrorMessage(error, 'Unable to detect weather for your location.'));
  }
};

export const getCitySuggestions = async (city, signal) => {
  try {
    ensureApiKey();

    const response = await axios.get(GEOCODING_BASE_URL, {
      params: {
        q: city,
        limit: 5,
        appid: WEATHER_API_KEY,
      },
      signal,
    });

    logger.debug('City suggestions loaded.', {
      query: city,
      count: response.data?.length ?? 0,
      status: response.status,
    });

    return response.data.map((entry) => ({
      id: `${entry.name}-${entry.country}-${entry.lat}-${entry.lon}`,
      name: entry.name,
      country: entry.country,
      state: entry.state || '',
      label: [entry.name, entry.state, entry.country].filter(Boolean).join(', '),
    }));
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      return [];
    }

    if (axios.isAxiosError(error)) {
      logger.warn('City suggestions failed to load.', {
        query: city,
        status: error.response?.status,
        apiMessage: error.response?.data?.message,
      });
    } else {
      logger.warn('City suggestions failed to load.', { query: city });
    }
    throw new Error(getApiErrorMessage(error, 'Unable to load city suggestions right now.'));
  }
};

import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const getWeatherInsights = async ({ temperature, condition, humidity }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('AI insights are unavailable until VITE_GEMINI_API_KEY is added to .env.');
  }

  const prompt = `Based on this weather data: Temperature: ${temperature}, Condition: ${condition}, Humidity: ${humidity}, give a short summary and useful suggestions for the user.`;

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 120,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join(' ')
        .trim() || '';

    if (!text) {
      throw new Error('Empty AI response');
    }

    logger.debug('AI insight generated successfully.');
    return text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.warn('AI insight request failed.', {
        status: error.response?.status,
        apiMessage: error.response?.data?.error?.message,
      });
    } else {
      logger.warn('AI insight request failed.');
    }

    throw new Error('AI insights are unavailable at the moment.');
  }
};

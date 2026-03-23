# Atmos AI Weather

Project Overview
Atmos AI Weather is a modern frontend weather application that combines real-time weather data with AI-generated insights.

It transforms raw weather data into a human-friendly experience by providing practical daily suggestions powered by AI.
# Main Purpose

This project aims to make weather information:

Easy to understand
More actionable
Visually engaging

By combining:
Live weather data (OpenWeather)
AI insights (Google Gemini)
Clean & responsive UI with theme support
Tech Stack
Frontend
React
Vite
JavaScript (JSX)
Tailwind CSS
PostCSS
Autoprefixer
APIs / Services
OpenWeather Current Weather API
OpenWeather Geocoding API
Google Gemini API (gemini-2.0-flash)
Tools & Utilities
Axios
Browser Geolocation API
Local Storage
 Backend
No backend (Client-side application)
Features
Core Features
Search weather by city
Auto-detect user location
Default fallback (New York)
Detailed weather info:
Temperature
Feels like
Humidity
Wind speed
Cloud cover

AI Features
AI-generated weather summaries
Daily practical suggestions
Graceful fallback if AI fails
I / UX Features
Debounced search suggestions
Indian states quick suggestions
Recent search history
Dark/Light theme toggle
Dynamic weather-based UI backgrounds
Smooth loading states

#Reliability Features
Environment validation at startup
Clean error handling
API request cancellation
Developer-friendly logging

# Folder Structure
```
weather app with ai/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    ├── services/
    └── config/
```
⚙️ Installation
📌 Prerequisites
Node.js
npm

Steps
git clone <your-repository-url>
cd "weather app with ai"
npm install
npm run dev

Usage
Open the app
Allow location access (optional)
Search any city
View weather details
Check AI insights for suggestions
Toggle dark/light mode

Environment Variables
Create a .env file:

VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

Never upload .env to GitHub

#API Details
OpenWeather API

Used for:

Temperature
Humidity
Wind
Weather conditions

Geocoding API

Used for:

City suggestions
Autocomplete

Google Gemini API

Used for:

AI weather summaries
Smart suggestions
#Error Handling
Error	Solution
Invalid API Key	Check .env
City not found	Correct spelling
No internet	Check connection
Location blocked	Allow browser permission
Gemini error	Verify API key

#Known Issues
No backend (API keys exposed in frontend)
Missing package.json (if not included)
Indian state suggestions not fully functional

# Future Improvements
Backend proxy for API security
Weather forecast (5-day / hourly)
TypeScript integration
Favorites system
Deployment (Vercel / Netlify)
Accessibility improvements

#Summary
Atmos AI Weather is a smart weather app that blends real-time data with AI insights to deliver a more meaningful and user-friendly weather experience.

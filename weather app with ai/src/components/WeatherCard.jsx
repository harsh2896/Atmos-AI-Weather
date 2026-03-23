function WeatherCard({ weather, loading }) {
  if (loading) {
    return (
      <div className="glass-panel soft-ring min-h-[360px] animate-pulse p-6">
        <div className="h-full rounded-3xl bg-white/15 dark:bg-white/5" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-panel soft-ring flex min-h-[360px] items-center justify-center p-6 text-center text-slate-700 dark:text-slate-200">
        Search for a city or allow location access to load weather details.
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;

  return (
    <div className="glass-panel soft-ring animate-fadeUp overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">
            Now in
          </p>
          <h2 className="mt-2 text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">
            {weather.city}
          </h2>
          <p className="mt-2 text-lg text-slate-700 dark:text-slate-200">
            {weather.country} | {weather.description}
          </p>

          <div className="mt-8 flex items-end gap-3">
            <span className="text-6xl font-extrabold leading-none text-slate-950 dark:text-white sm:text-7xl">
              {weather.temperature}&deg;
            </span>
            <span className="pb-2 text-lg text-slate-600 dark:text-slate-300">
              Feels like {weather.feelsLike}&deg;C
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-3xl border border-white/25 bg-white/20 px-6 py-4 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <img
            src={iconUrl}
            alt={weather.description}
            className="h-28 w-28 animate-float drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
          />
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {weather.condition}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/25 bg-white/15 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-slate-600 dark:text-slate-300">Humidity</p>
          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {weather.humidity}%
          </p>
        </div>
        <div className="rounded-3xl border border-white/25 bg-white/15 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-slate-600 dark:text-slate-300">Wind Speed</p>
          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {weather.windSpeed} km/h
          </p>
        </div>
        <div className="rounded-3xl border border-white/25 bg-white/15 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-slate-600 dark:text-slate-300">Cloud Cover</p>
          <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
            {weather.clouds}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;

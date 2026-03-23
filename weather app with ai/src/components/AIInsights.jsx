function AIInsights({ insight, loading }) {
  return (
    <div className="glass-panel soft-ring animate-fadeUp p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300">
            Gemini Insight
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            Personal weather guidance
          </h3>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-300/80 to-pink-400/80 shadow-lg shadow-amber-500/20 animate-pulseSlow" />
      </div>

      <div className="mt-6 rounded-3xl border border-white/25 bg-white/15 p-5 text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
        {loading ? (
          <p>Generating AI summary and suggestions...</p>
        ) : insight ? (
          <p className="leading-7">{insight}</p>
        ) : (
          <p>Fetch weather data to unlock an AI-generated summary and suggestions.</p>
        )}
      </div>
    </div>
  );
}

export default AIInsights;

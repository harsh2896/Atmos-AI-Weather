import { useEffect, useRef, useState } from 'react';
import { logger } from '../config/logger';
import { getCitySuggestions } from '../services/weatherApi';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const MAX_SUGGESTIONS = 7;

function SearchBar({ onSearch, recentCities, onSelectRecent, loading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed || loading) {
      return;
    }

    setShowSuggestions(false);
    onSearch(trimmed);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      setSuggestionError('');
      setLoadingSuggestions(false);
      setShowSuggestions(false);
      return undefined;
    }

    if (trimmed.length < 2) {
      const localMatches = INDIAN_STATES.filter((state) =>
        state.toLowerCase().includes(trimmed.toLowerCase()),
      )
        .slice(0, MAX_SUGGESTIONS)
        .map((state) => ({
          id: `state-${state}`,
          name: state,
          country: 'India',
          state: '',
          label: state,
          type: 'state',
        }));

      setSuggestions(localMatches);
      setSuggestionError('');
      setLoadingSuggestions(false);
      setShowSuggestions(localMatches.length > 0);
      return undefined;
    }

    const normalizedQuery = trimmed.toLowerCase();
    const stateSuggestions = INDIAN_STATES.filter((state) =>
      state.toLowerCase().includes(normalizedQuery),
    )
      .slice(0, MAX_SUGGESTIONS)
      .map((state) => ({
        id: `state-${state}`,
        name: state,
        country: 'India',
        state: '',
        label: state,
        type: 'state',
      }));

    setSuggestions(stateSuggestions);
    setShowSuggestions(true);
    setSuggestionError('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);

      try {
        const citySuggestions = await getCitySuggestions(trimmed, controller.signal);
        const formattedCitySuggestions = citySuggestions.map((city) => ({
          ...city,
          type: 'city',
        }));

        const mergedSuggestions = [...stateSuggestions];

        formattedCitySuggestions.forEach((city) => {
          const isDuplicate = mergedSuggestions.some(
            (suggestion) => suggestion.label.toLowerCase() === city.label.toLowerCase(),
          );

          if (!isDuplicate && mergedSuggestions.length < MAX_SUGGESTIONS) {
            mergedSuggestions.push(city);
          }
        });

        setSuggestions(mergedSuggestions);
        setSuggestionError('');
        setShowSuggestions(true);
      } catch (error) {
        if (error?.message) {
          logger.warn('Suggestion dropdown fell back to local results.', { reason: error.message });
        }
        setSuggestions(stateSuggestions);
        setSuggestionError(error instanceof Error ? error.message : 'Unable to load suggestions right now.');
        setShowSuggestions(
          stateSuggestions.length > 0 ||
            Boolean(error instanceof Error ? error.message : 'Unable to load suggestions right now.'),
        );
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.label);
    setShowSuggestions(false);

    if (suggestion.type !== 'state') {
      onSearch(suggestion.label);
    }
  };

  const shouldShowEmptyState =
    showSuggestions && !loadingSuggestions && !suggestionError && suggestions.length === 0 && query.trim();

  return (
    <div ref={wrapperRef} className="glass-panel soft-ring animate-fadeUp p-4 sm:p-6">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (query.trim()) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search for any city..."
            className="w-full rounded-2xl border border-white/30 bg-white/40 px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-white/60 focus:bg-white/60 dark:border-white/10 dark:bg-slate-950/30 dark:text-white dark:placeholder:text-slate-400"
          />

          <div
            className={`absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-2xl border border-white/30 bg-white/85 shadow-2xl backdrop-blur-2xl transition-all duration-200 dark:border-white/10 dark:bg-slate-950/85 ${
              showSuggestions ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            {loadingSuggestions ? (
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-700 dark:border-slate-500/30 dark:border-t-slate-100" />
                Loading suggestions...
              </div>
            ) : null}

            {!loadingSuggestions && suggestionError ? (
              <div className="px-4 py-3 text-sm text-red-600 dark:text-red-300">{suggestionError}</div>
            ) : null}

            {!loadingSuggestions && suggestions.length > 0 ? (
              <ul className="py-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-slate-800 transition hover:bg-sky-100/70 focus:bg-sky-100/70 dark:text-slate-100 dark:hover:bg-white/10 dark:focus:bg-white/10"
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {suggestion.type === 'state'
                          ? 'Indian state'
                          : [suggestion.state, suggestion.country].filter(Boolean).join(', ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {shouldShowEmptyState ? (
              <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                No results found.
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex min-w-[128px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950" />
              Loading...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {recentCities.length > 0 ? (
          recentCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setQuery(city);
                setShowSuggestions(false);
                onSelectRecent(city);
              }}
              className="glass-chip transition hover:-translate-y-0.5 hover:bg-white/35 dark:hover:bg-white/15"
            >
              {city}
            </button>
          ))
        ) : (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Recent searches will appear here.
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

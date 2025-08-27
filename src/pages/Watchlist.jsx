// Replace your autocomplete logic in Watchlist.jsx with this:

import { useCallback } from ‘react’; // Add this import

// Inside your Watchlist component, replace the fetchSuggestions function:

const fetchSuggestions = useCallback(async (q) => {
if (!q || q.length < 1) {
setSuggestions([]);
return;
}

console.log(‘Fetching suggestions for:’, q); // DEBUG

try {
setSugLoading(true);
// cancel any in-flight request
if (abortRef.current) abortRef.current.abort();
abortRef.current = new AbortController();

```
const res = await api.get("/api/search-players", {
  params: { q },
  signal: abortRef.current.signal,
});

console.log('API response:', res.data); // DEBUG

// Use the same logic as your working player search
const players = res.data?.players || [];
console.log('Setting suggestions:', players); // DEBUG

setSuggestions(players);
setSugOpen(true);
```

} catch (e) {
console.error(‘Search error:’, e); // DEBUG
if (e.name !== ‘AbortError’) { // Don’t log abort errors
setSuggestions([]);
setSugOpen(true);
}
} finally {
setSugLoading(false);
}
}, []); // Empty dependency array since it doesn’t depend on anything

// Fix the useEffect dependency array:
useEffect(() => {
const q = form.player_name.trim();
const t = setTimeout(() => fetchSuggestions(q), 250);
return () => clearTimeout(t);
}, [form.player_name, fetchSuggestions]); // Include fetchSuggestions
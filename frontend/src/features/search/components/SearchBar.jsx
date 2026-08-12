import { useEffect, useState } from "react";

// Debounced "search as you type" rather than a submit button as the
// only way to trigger a search — the job of this page is speed, and a
// medicine name is usually short enough that debounced-as-you-type
// feels immediate without hammering the (rate-limited, FR-SRCH-4)
// endpoint on every keystroke. Enter still submits immediately, for
// anyone who types fast and expects that to just work.
const DEBOUNCE_MS = 350;

export function SearchBar({ value, onChange, onSubmit }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(draft);
    onSubmit?.(draft);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        className="search-bar__input"
        placeholder="e.g. Amoxicillin, Panadol, Paracetamol 500mg"
        aria-label="Search for a medicine by name"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
      />
      <button type="submit" className="search-bar__submit">
        Search
      </button>
    </form>
  );
}

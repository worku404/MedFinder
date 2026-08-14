import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 350;

export function SearchBar({ value, onChange, loading }) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) {
        onChange(draft);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(draft);
  };

  const handleClear = () => {
    setDraft("");
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      {loading ? (
        <span className="search-bar__spinner" aria-hidden="true" />
      ) : (
        <svg
          className="search-bar__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}

      <input
        id="medicine-search-input"
        ref={inputRef}
        type="search"
        className="search-bar__input"
        placeholder="Amoxicillin 500mg, Panadol, insulin…"
        aria-label="Search for a medicine by name"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoComplete="off"
        autoFocus
      />

      <div className="search-bar__actions">
        {draft.length > 0 && (
          <button
            type="button"
            aria-label="Clear search query"
            onClick={handleClear}
            className="search-bar__clear"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={draft.trim().length === 0}
          className="search-bar__submit"
        >
          Find stock
        </button>
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import { medicinesApi } from "../../medicines/api";

// A minimal search-select rather than a plain <select> with every
// medicine in the catalog — the catalog is expected to grow past what
// a dropdown can reasonably hold, and this reuses the same debounced-
// search pattern as the main search bar for a consistent feel.
//
// `onMouseDown` (not `onClick`) on each option is deliberate: the input's
// onBlur fires before a click would register, which would close the
// list before the click landed. mousedown fires first, so this works
// without a click-away library.
export function MedicinePicker({ value, onChange, error }) {
  const [query, setQuery] = useState(value?.name || "");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !query.trim()) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      medicinesApi
        .list({ search: query.trim() })
        .then((data) => {
          if (!cancelled) setOptions(data.results);
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const selectMedicine = (medicine) => {
    onChange(medicine);
    setQuery(medicine.name);
    setOpen(false);
  };

  return (
    <div className="form-field medicine-picker">
      <label htmlFor="medicine-picker" className="form-field__label">
        Medicine
      </label>
      <input
        id="medicine-picker"
        className={`form-field__input${error ? " form-field__input--error" : ""}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="Start typing a medicine name…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="medicine-picker-list"
      />
      {open && (query.trim() || loading) && (
        <ul id="medicine-picker-list" className="medicine-picker__list" role="listbox">
          {loading && <li className="medicine-picker__hint">Searching…</li>}
          {!loading && options.length === 0 && <li className="medicine-picker__hint">No matches.</li>}
          {!loading &&
            options.map((medicine) => (
              <li key={medicine.id}>
                <button
                  type="button"
                  className="medicine-picker__option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectMedicine(medicine);
                  }}
                >
                  <span>{medicine.name}</span>
                  {medicine.strength && <span className="medicine-picker__meta">{medicine.strength}</span>}
                </button>
              </li>
            ))}
        </ul>
      )}
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

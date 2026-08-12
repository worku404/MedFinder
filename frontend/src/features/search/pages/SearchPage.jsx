import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { chatApi } from "../../chat/api";
import { ChatModal } from "../../chat/components/ChatModal";
import { searchApi } from "../api";
import { useGeolocation } from "../useGeolocation";
import { SearchBar } from "../components/SearchBar";
import { LocationBanner } from "../components/LocationBanner";
import { ResultRow } from "../components/ResultRow";

// This is the app's landing page (see AppRoutes) and the only page in
// the product that has to work perfectly with zero setup: no login, no
// location, nothing but typing a word. Every other state (location
// granted, pharmacist signed in, etc.) is additive on top of that.
//
// Reads an initial `?q=` from the URL so other pages can deep-link
// straight into a search (e.g. MedicineDetailPage's "Check availability"
// link) instead of only being reachable by typing into the bar by hand.
export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const geolocation = useGeolocation();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  // "idle" (nothing searched yet) | "loading" | "ready" | "error"
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Chat modal state
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatPharmacyName, setChatPharmacyName] = useState("");

  const handleStartChat = async (pharmacy) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    try {
      const conv = await chatApi.startConversation(pharmacy.id);
      setChatPharmacyName(pharmacy.name);
      setActiveConversation(conv);
    } catch (err) {
      setError(err.message || "Could not start chat with this pharmacy.");
    }
  };

  // Guards against a slow earlier request overwriting a faster later
  // one — e.g. typing "para", then "paracetamol" quickly after: if the
  // "para" request resolves last, it must not clobber the newer results.
  const requestId = useRef(0);

  const runSearch = useCallback(
    async ({ q, page: requestedPage, append }) => {
      const thisRequest = ++requestId.current;
      setStatus("loading");
      setError(null);
      try {
        const data = await searchApi.search({
          q,
          page: requestedPage,
          lat: geolocation.coords?.lat,
          lng: geolocation.coords?.lng,
        });
        if (thisRequest !== requestId.current) return; // superseded
        setResults((prev) => (append ? [...prev, ...data.results] : data.results));
        setHasMore(Boolean(data.next));
        setStatus("ready");
      } catch (err) {
        if (thisRequest !== requestId.current) return;
        setError(err.message);
        setStatus("error");
      }
    },
    [geolocation.coords]
  );

  // Re-run the current query whenever it changes, or whenever location
  // becomes available (so an already-visible result set gets re-ranked
  // by distance the moment the user grants permission, instead of
  // requiring them to retype their search).
  useEffect(() => {
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    if (!trimmed) {
      setResults([]);
      setHasMore(false);
      setStatus("idle");
      return;
    }
    setPage(1);
    runSearch({ q: trimmed, page: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, geolocation.coords]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch({ q: query, page: nextPage, append: true });
  };

  return (
    <main className="search-shell__hero">
      <p className="search-shell__eyebrow">Live availability, Ethiopia</p>
      <h1 className="search-shell__title">What are you out of?</h1>
      <p className="search-shell__subtitle">
        Search by name — typos are fine. Results come from verified pharmacies' own confirmed stock,
        ranked by best match, freshness, and distance.
      </p>

      <SearchBar value={query} onChange={setQuery} />
      <LocationBanner status={geolocation.status} onRequest={geolocation.request} />

      <section className="search-results" aria-live="polite">
        {status === "idle" && (
          <p className="search-results__hint">Start typing a medicine name to see who has it in stock.</p>
        )}

        {status === "loading" && results.length === 0 && (
          <p className="search-results__hint">Searching…</p>
        )}

        {status === "error" && (
          <div className="search-results__error">
            <p>{error || "Something went wrong. Try again."}</p>
            <button type="button" className="search-bar__submit" onClick={() => runSearch({ q: query, page: 1, append: false })}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && results.length === 0 && (
          <p className="search-results__hint">
            No verified pharmacy has confirmed "{query}" recently. Try a different spelling, or check
            back later.
          </p>
        )}

        {results.length > 0 && (
          <>
            <ul className="search-results__list">
              {results.map((result) => (
                <li key={result.id}>
                  <ResultRow result={result} onChatClick={handleStartChat} />
                </li>
              ))}
            </ul>
            {hasMore && (
              <button
                type="button"
                className="search-bar__submit search-results__load-more"
                onClick={loadMore}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </section>

      {activeConversation && (
        <ChatModal
          conversationId={activeConversation.id}
          pharmacyName={chatPharmacyName}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </main>
  );
}

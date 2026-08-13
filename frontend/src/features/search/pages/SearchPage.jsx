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
import { SearchResultDetailModal } from "../components/SearchResultDetailModal";

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const geolocation = useGeolocation();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Detail Modal & Chat Modal state
  const [selectedResult, setSelectedResult] = useState(null);
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
        if (thisRequest !== requestId.current) return;
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
  }, [query, geolocation.coords]);

  const loadMore = () => {
    if (status === "loading" || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch({ q: query.trim(), page: nextPage, append: true });
  };

  return (
    <main className="search-shell">
      <section className="search-shell__hero" aria-label="Medicine availability search">
        <p className="search-shell__eyebrow">Live availability, Ethiopia</p>
        <h1 className="search-shell__title">What are you out of?</h1>
        <p className="search-shell__subtitle">
          Search by name — typos are fine. Results come from verified pharmacies' own confirmed stock,
          ranked by best match, freshness, and distance.
        </p>

        <SearchBar value={query} onChange={setQuery} loading={status === "loading"} />

        <LocationBanner
          state={geolocation.state}
          coords={geolocation.coords}
          onRequest={geolocation.request}
        />
      </section>

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
                  <ResultRow result={result} onViewDetails={setSelectedResult} />
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

      {/* Selected Result Detail Dossier Modal */}
      {selectedResult && (
        <SearchResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onStartChat={handleStartChat}
        />
      )}

      {/* Duplex Chat Modal */}
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

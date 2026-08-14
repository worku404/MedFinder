import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { chatApi } from "../../chat/api";
import { ChatModal } from "../../chat/components/ChatModal";
import { pharmaciesApi } from "../../pharmacies/api";
import { searchApi } from "../api";
import { useGeolocation } from "../useGeolocation";
import { SearchBar } from "../components/SearchBar";
import { DistanceToggle } from "../components/DistanceToggle";
import { IdleAsksList } from "../components/IdleAsksList";
import { ResultRow, ResultSkeleton } from "../components/ResultRow";
import { SearchResultDetailModal } from "../components/SearchResultDetailModal";

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const geolocation = useGeolocation();

  const [pharmacyStats, setPharmacyStats] = useState(null);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [nearby, setNearby] = useState(false);

  // Detail Modal & Duplex Chat Modal state
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
    async ({ q, page: requestedPage, append, useCoords }) => {
      const thisRequest = ++requestId.current;
      setStatus("loading");
      setError(null);
      try {
        const data = await searchApi.search({
          q,
          page: requestedPage,
          lat: useCoords ? geolocation.coords?.lat : undefined,
          lng: useCoords ? geolocation.coords?.lng : undefined,
        });
        if (thisRequest !== requestId.current) return;
        setResults((prev) => (append ? [...prev, ...data.results] : data.results));
        setHasMore(Boolean(data.next));
        setStatus("ready");
      } catch (err) {
        if (thisRequest !== requestId.current) return;
        setError(err.message || "Could not reach the stock service.");
        setStatus("error");
      }
    },
    [geolocation.coords]
  );

  useEffect(() => {
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    if (!trimmed) {
      requestId.current++;
      setResults([]);
      setHasMore(false);
      setStatus("idle");
      return;
    }
    setPage(1);
    runSearch({
      q: trimmed,
      page: 1,
      append: false,
      useCoords: nearby && Boolean(geolocation.coords),
    });
  }, [query, nearby, geolocation.coords, runSearch, setSearchParams]);

  useEffect(() => {
    let isMounted = true;
    pharmaciesApi
      .list()
      .then((data) => {
        if (!isMounted) return;
        const count = data.count ?? data.results?.length ?? 0;
        const cities = Array.from(
          new Set(
            (data.results || [])
              .map((p) => {
                if (!p.address) return null;
                const parts = p.address.split(",").map((s) => s.trim());
                return parts[parts.length - 1] || null;
              })
              .filter(Boolean)
          )
        );
        setPharmacyStats({ count, cities });
      })
      .catch(() => {
        // Handled silently to avoid interrupting search flow
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = () => {
    if (status === "loading" || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    runSearch({
      q: query.trim(),
      page: nextPage,
      append: true,
      useCoords: nearby && Boolean(geolocation.coords),
    });
  };

  return (
    <main className="search-shell">
      <section className="search-shell__hero" aria-label="Medicine availability search">
        <p className="search-shell__eyebrow">
          {pharmacyStats && pharmacyStats.count > 0
            ? `${pharmacyStats.count.toLocaleString()} ${
                pharmacyStats.count === 1 ? "pharmacy" : "pharmacies"
              }${pharmacyStats.cities.length > 0 ? ` · ${pharmacyStats.cities.join(", ")}` : ""}`
            : "Verified Pharmacy Network"}
        </p>
        <h1 className="search-shell__title">
          Which pharmacy still has it
          <span className="search-shell__title-muted">on the shelf today?</span>
        </h1>
        <p className="search-shell__subtitle">
          Type a medicine name — misspellings are fine. Every row below is a count a
          pharmacist entered themselves, with the hour they last checked it.
        </p>

        <SearchBar
          value={query}
          onChange={setQuery}
          loading={status === "loading"}
        />

        <DistanceToggle
          state={geolocation.status}
          coords={geolocation.coords}
          nearby={nearby}
          onToggleNearby={setNearby}
          onRequestCoords={geolocation.request}
        />
      </section>

      <section className="search-results" aria-live="polite" aria-busy={status === "loading"}>
        {status === "idle" && (
          <IdleAsksList onPick={setQuery} />
        )}

        {status === "loading" && results.length === 0 && (
          <div className="search-results__loading">
            <h2 className="search-results__heading">Checking pharmacy counts…</h2>
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </div>
        )}

        {status === "error" && (
          <div className="search-results__error-card">
            <h2 className="search-results__error-title">We couldn't reach the stock service</h2>
            <p className="search-results__error-desc">
              Your search for "{query.trim()}" didn't go through. Nothing is wrong with your spelling — the connection dropped.
            </p>
            <button
              type="button"
              className="search-results__retry-btn"
              onClick={() => runSearch({ q: query.trim(), page: 1, append: false, useCoords: nearby })}
            >
              Search again
            </button>
          </div>
        )}

        {status === "ready" && results.length === 0 && (
          <div className="search-results__empty-card">
            <h2 className="search-results__empty-title">
              No pharmacy has confirmed "{query.trim()}" recently
            </h2>
            <p className="search-results__empty-desc">
              Either nobody nearby stocks it, or the counts have gone stale. Try a brand name or different strength.
            </p>
            <div className="search-results__empty-actions">
              <button
                type="button"
                className="search-results__suggestion-btn"
                onClick={() => setQuery("Amoxicillin")}
              >
                Try "Amoxicillin"
              </button>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results__ready">
            <h2 className="search-results__heading">
              {results.length} confirmed {results.length === 1 ? "shelf" : "shelves"} for "{query.trim()}"
            </h2>

            <ul className="search-results__list">
              {results.map((result) => (
                <li key={result.id}>
                  <ResultRow
                    result={result}
                    showDistance={nearby}
                    onViewDetails={setSelectedResult}
                  />
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                type="button"
                className="search-results__load-more-btn"
                onClick={loadMore}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading…" : "Load more"}
              </button>
            )}

            <p className="search-results__disclaimer">
              Counts age. A pharmacy that checked its shelf 3 days ago may have sold out since — call before you travel.
            </p>
          </div>
        )}
      </section>

      {/* Detail Sheet Modal */}
      {selectedResult && (
        <SearchResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onStartChat={handleStartChat}
        />
      )}

      {/* Duplex Chat Consultation Modal */}
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

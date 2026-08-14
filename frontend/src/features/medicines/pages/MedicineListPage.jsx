import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { medicinesApi } from "../api";
import { cursorFromUrl } from "../../../lib/pagination";
import { MedicineRow, MedicineRowSkeleton } from "../components/MedicineRow";
import { CategoryChips } from "../components/CategoryChips";

const DEBOUNCE_MS = 300;

export function MedicineListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [otcOnly, setOtcOnly] = useState(searchParams.get("otc") === "true");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "name");

  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [query]);

  // Load category list once on mount
  useEffect(() => {
    let isMounted = true;
    medicinesApi
      .categoriesList()
      .then((data) => {
        if (!isMounted) return;
        setCategories(data.results || data || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync URL search params
  useEffect(() => {
    const params = {};
    if (debouncedQuery) params.search = debouncedQuery;
    if (category !== "all") params.category = category;
    if (otcOnly) params.otc = "true";
    if (ordering !== "name") params.ordering = ordering;
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, category, otcOnly, ordering, setSearchParams]);

  const reqId = useRef(0);

  const fetchMedicines = useCallback(
    async ({ search, cat, otc, order, cursor, append = false }) => {
      const currentReq = ++reqId.current;
      if (!append) setStatus("loading");
      setError(null);

      try {
        const queryParams = { cursor };
        if (search) queryParams.search = search;
        if (cat && cat !== "all") queryParams.category__slug = cat;
        if (otc) queryParams.requires_prescription = "false";
        if (order) queryParams.ordering = order;

        const data = await medicinesApi.list(queryParams);
        if (currentReq !== reqId.current) return;

        setMedicines((prev) => (append ? [...prev, ...data.results] : data.results));
        if (data.count != null) setTotalCount(data.count);
        setNextCursor(cursorFromUrl(data.next));
        setStatus("ready");
      } catch (err) {
        if (currentReq !== reqId.current) return;
        setError(err.message || "Could not load medicine catalog.");
        setStatus("error");
      }
    },
    []
  );

  // Trigger search on filter changes
  useEffect(() => {
    fetchMedicines({
      search: debouncedQuery,
      cat: category,
      otc: otcOnly,
      order: ordering,
      append: false,
    });
  }, [debouncedQuery, category, otcOnly, ordering, fetchMedicines]);

  const handleLoadMore = () => {
    if (!nextCursor || status === "loading") return;
    fetchMedicines({
      search: debouncedQuery,
      cat: category,
      otc: otcOnly,
      order: ordering,
      cursor: nextCursor,
      append: true,
    });
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategory("all");
    setOtcOnly(false);
    setOrdering("name");
  };

  return (
    <div className="catalog-shell">
      <header className="catalog-header">
        <p className="catalog-eyebrow">
          Catalog · {totalCount ? `${totalCount.toLocaleString()} medicines tracked` : "Medicines"}
        </p>
        <h1 className="catalog-title">
          Every medicine we count,
          <span>and how easy it is to find.</span>
        </h1>
        <p className="catalog-desc">
          Rows are ordered by how recently a pharmacist re-counted the shelf. The meter on the right shows how many Ethiopian pharmacies confirmed stock this week.
        </p>
      </header>

      {/* Sticky Filter Toolbar */}
      <div className="sticky-toolbar">
        <div className="toolbar-row">
          <div className="search-filter-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="medicine-catalog-filter"
              type="search"
              className="search-filter-input"
              placeholder="Filter by name or strength…"
              aria-label="Filter medicines by name or strength"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`filter-btn ${otcOnly ? "filter-btn--active" : ""}`}
            onClick={() => setOtcOnly((prev) => !prev)}
            aria-pressed={otcOnly}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" x2="20" y1="21" y2="21" />
              <line x1="4" x2="20" y1="3" y2="3" />
              <line x1="4" x2="20" y1="12" y2="12" />
            </svg>
            No prescription
          </button>

          <div className="sort-wrap">
            <span className="sort-label">Sort</span>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="sort-select"
              aria-label="Sort catalog order"
            >
              <option value="name">A–Z</option>
              <option value="-name">Z–A</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <CategoryChips
          categories={categories}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />
      </div>

      {/* Desktop Column Headers */}
      <div className="table-head" aria-hidden="true">
        <span />
        <span />
        <span>Medicine</span>
        <span>Pharmacy coverage</span>
        <span style={{ textAlign: "right" }}>From</span>
      </div>

      {/* Medicine List / States */}
      <ul className="medicine-list" aria-live="polite" aria-busy={status === "loading"}>
        {status === "loading" && medicines.length === 0 && (
          <>
            <MedicineRowSkeleton />
            <MedicineRowSkeleton />
            <MedicineRowSkeleton />
            <MedicineRowSkeleton />
          </>
        )}

        {status === "error" && (
          <li className="catalog-empty-card">
            <h2 className="catalog-empty-title">Could not load catalog</h2>
            <p className="catalog-empty-desc">{error}</p>
            <button type="button" className="catalog-reset-btn" onClick={handleResetFilters}>
              Retry
            </button>
          </li>
        )}

        {status === "ready" && medicines.length === 0 && (
          <li className="catalog-empty-card">
            <h2 className="catalog-empty-title">Nothing matches that filter</h2>
            <p className="catalog-empty-desc">
              Try the generic name instead of the brand, or clear the prescription filter.
            </p>
            <button type="button" className="catalog-reset-btn" onClick={handleResetFilters}>
              Reset filters
            </button>
          </li>
        )}

        {medicines.map((medicine) => (
          <MedicineRow key={medicine.slug || medicine.id} medicine={medicine} />
        ))}
      </ul>

      {/* Pagination Footer */}
      {medicines.length > 0 && (
        <div className="pagination-bar">
          <p className="pagination-count">
            Showing {medicines.length} {totalCount ? `of ${totalCount.toLocaleString()}` : ""} medicines
          </p>

          {nextCursor && (
            <button
              type="button"
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { FreshnessSignal } from "./FreshnessSignal";

function freshnessLabel(result) {
  if (result.is_stale) return "Not confirmed recently";
  const confirmedAt = new Date(result.last_confirmed_at);
  const hoursAgo = Math.max(0, Math.round((Date.now() - confirmedAt.getTime()) / 36e5));
  if (hoursAgo < 1) return "Confirmed just now";
  if (hoursAgo === 1) return "Confirmed 1 hour ago";
  return `Confirmed ${hoursAgo} hours ago`;
}

export function ResultRow({ result, onViewDetails }) {
  const outOfStock = result.quantity_available === 0;

  return (
    <article className={`result-row${outOfStock ? " result-row--out-of-stock" : ""}`}>
      <div className="result-row__signal">
        <FreshnessSignal stale={result.is_stale} />
      </div>

      <div className="result-row__body">
        <div className="result-row__headline">
          <h2 className="result-row__medicine">
            {result.medicine.name}
            {result.medicine.strength && (
              <span className="result-row__strength"> {result.medicine.strength}</span>
            )}
          </h2>
          <span className={`result-row__availability${outOfStock ? " result-row__availability--out" : ""}`}>
            {result.availability}
          </span>
        </div>

        <p className="result-row__address">{result.pharmacy.address || result.pharmacy.name}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          <p className="result-row__meta" style={{ margin: 0 }}>
            <span className="result-row__price">ETB {Number(result.price).toFixed(2)}</span>
            {result.distance_km != null && (
              <span className="result-row__distance">{result.distance_km.toFixed(1)} km away</span>
            )}
            <span className={`result-row__freshness${result.is_stale ? " result-row__freshness--stale" : ""}`}>
              {freshnessLabel(result)}
            </span>
          </p>

          <button
            type="button"
            className="btn btn--primary"
            style={{ width: "auto", padding: "0.35rem 0.85rem", fontSize: "0.85rem" }}
            onClick={() => onViewDetails(result)}
          >
            View Details ▾
          </button>
        </div>
      </div>
    </article>
  );
}

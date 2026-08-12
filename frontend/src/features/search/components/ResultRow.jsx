import { Link } from "react-router-dom";
import { FreshnessSignal } from "./FreshnessSignal";

function freshnessLabel(result) {
  if (result.is_stale) return "Not confirmed recently";
  const confirmedAt = new Date(result.last_confirmed_at);
  const hoursAgo = Math.max(0, Math.round((Date.now() - confirmedAt.getTime()) / 36e5));
  if (hoursAgo < 1) return "Confirmed just now";
  if (hoursAgo === 1) return "Confirmed 1 hour ago";
  return `Confirmed ${hoursAgo} hours ago`;
}

// A dense list row, not a card — this is a ranked list where order is
// the point, so the layout should read as "a scannable readout," not a
// grid of interchangeable tiles. Price/distance use the monospace face
// (shared with the rest of the app) since they're data, not prose.
export function ResultRow({ result }) {
  const outOfStock = result.quantity_available === 0;

  return (
    <article className={`result-row${outOfStock ? " result-row--out-of-stock" : ""}`}>
      <div className="result-row__signal">
        <FreshnessSignal stale={result.is_stale} />
      </div>

      <div className="result-row__body">
        <div className="result-row__headline">
          <h2 className="result-row__medicine">
            <Link to={`/medicines/${result.medicine.slug}`}>
              {result.medicine.name}
              {result.medicine.strength ? <span className="result-row__strength"> {result.medicine.strength}</span> : null}
            </Link>
          </h2>
          <span className={`result-row__availability${outOfStock ? " result-row__availability--out" : ""}`}>
            {result.availability}
          </span>
        </div>

        <p className="result-row__pharmacy">
          <Link to={`/pharmacies/${result.pharmacy.id}`}>{result.pharmacy.name}</Link>
        </p>
        <p className="result-row__address">{result.pharmacy.address || "Address not on file"}</p>

        <p className="result-row__meta">
          <span className="result-row__price">ETB {Number(result.price).toFixed(2)}</span>
          {result.distance_km != null && (
            <span className="result-row__distance">{result.distance_km.toFixed(1)} km away</span>
          )}
          <span className={`result-row__freshness${result.is_stale ? " result-row__freshness--stale" : ""}`}>
            {freshnessLabel(result)}
          </span>
        </p>
      </div>
    </article>
  );
}

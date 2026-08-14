import { Link } from "react-router-dom";
import { ConfirmationRail, FreshnessTag, hoursSince } from "./FreshnessGauge";

export function ResultRow({ result, showDistance, onViewDetails }) {
  const hours = hoursSince(result.last_confirmed_at);
  const units = result.quantity_available;
  const isLowStock = units <= 5;
  const formInfo = [result.medicine.dosage_form_display, result.medicine.strength]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="result-row">
      <ConfirmationRail hours={hours} isStale={result.is_stale} />

      <div className="result-row__content">
        <div className="result-row__header">
          <h3 className="result-row__medicine-name">
            {result.medicine.name}
          </h3>
          {formInfo && (
            <span className="result-row__form-tag">{formInfo}</span>
          )}
        </div>

        <div className="result-row__location">
          <Link
            to={`/pharmacies/${result.pharmacy.id}`}
            className="result-row__pharmacy-link"
            title={`View ${result.pharmacy.name} details`}
          >
            {result.pharmacy.name}
          </Link>
          {result.pharmacy.address && (
            <span className="result-row__district"> — {result.pharmacy.address}</span>
          )}
        </div>

        <div className="result-row__meta-pills">
          <FreshnessTag hours={hours} isStale={result.is_stale} />

          <span
            className={`result-row__stock-pill ${isLowStock ? "result-row__stock-pill--low" : ""}`}
          >
            {units === 0
              ? "Out of stock"
              : isLowStock
                ? `Only ${units} left`
                : `${units} in stock`}
          </span>

          {showDistance && result.distance_km != null && (
            <span className="result-row__meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {result.distance_km.toFixed(1)} km
            </span>
          )}

          {result.pharmacy.phone_number && (
            <span className="result-row__meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {result.pharmacy.phone_number}
            </span>
          )}
        </div>
      </div>

      <div className="result-row__side">
        <div className="result-row__price tabular">
          {Number(result.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          <span className="result-row__currency">ETB</span>
        </div>

        <button
          type="button"
          className="result-row__details-btn"
          onClick={() => onViewDetails(result)}
        >
          Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export function ResultSkeleton() {
  return (
    <div className="result-skeleton" aria-hidden="true">
      <div className="result-skeleton__rail" />
      <div className="result-skeleton__body">
        <div className="result-skeleton__line result-skeleton__line--title" />
        <div className="result-skeleton__line result-skeleton__line--subtitle" />
        <div className="result-skeleton__line result-skeleton__line--pills" />
      </div>
      <div className="result-skeleton__price" />
    </div>
  );
}

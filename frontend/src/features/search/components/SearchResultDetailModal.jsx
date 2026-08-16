import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FreshnessTag, hoursSince } from "./FreshnessGauge";

export function SearchResultDetailModal({ result, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hours = hoursSince(result.last_confirmed_at);
  const formInfo = [result.medicine.dosage_form_display, result.medicine.strength]
    .filter(Boolean)
    .join(", ");
  const cleanPhone = result.pharmacy.phone_number?.replace(/\s/g, "");

  return (
    <div className="detail-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-sheet-title"
        className="detail-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="detail-sheet__close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 id="detail-sheet-title" className="detail-sheet__title">
          {result.medicine.name}
        </h2>
        {formInfo && <p className="detail-sheet__subtitle">{formInfo}</p>}

        <div className="detail-sheet__tag-wrap">
          <FreshnessTag hours={hours} isStale={result.is_stale} />
        </div>

        <dl className="detail-sheet__dl">
          <div className="detail-sheet__dl-row">
            <dt>Pharmacy</dt>
            <dd>
              <Link
                to={`/pharmacies/${result.pharmacy.id}`}
                className="detail-sheet__link"
              >
                {result.pharmacy.name}
              </Link>
            </dd>
          </div>

          <div className="detail-sheet__dl-row">
            <dt>Area</dt>
            <dd>{result.pharmacy.address || "Addis Ababa"}</dd>
          </div>

          <div className="detail-sheet__dl-row">
            <dt>Price</dt>
            <dd className="tabular font-mono">
              {Number(result.price).toLocaleString("en-US", { maximumFractionDigits: 0 })} ETB
            </dd>
          </div>

          <div className="detail-sheet__dl-row">
            <dt>Units on shelf</dt>
            <dd className="tabular font-mono">{result.quantity_available}</dd>
          </div>

          {result.distance_km != null && (
            <div className="detail-sheet__dl-row">
              <dt>Distance</dt>
              <dd className="tabular font-mono">{result.distance_km.toFixed(1)} km</dd>
            </div>
          )}
        </dl>

        <div className="detail-sheet__actions">
          {cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="detail-sheet__btn detail-sheet__btn--primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call {result.pharmacy.name}
            </a>
          )}
          <Link
            to={`/pharmacies/${result.pharmacy.id}`}
            className="detail-sheet__btn detail-sheet__btn--secondary"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Directions & Profile
          </Link>
          <Link
            to={`/chat?pharmacy=${encodeURIComponent(result.pharmacy.name)}&branch=${encodeURIComponent(result.pharmacy.address || "Main Branch")}&medicine=${encodeURIComponent(result.medicine.name)}`}
            className="detail-sheet__btn detail-sheet__btn--secondary"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat with Pharmacist
          </Link>
        </div>

        <p className="detail-sheet__footer-hint">
          Counts come from the pharmacy's own last stock check. Call ahead before travelling far.
        </p>
      </div>
    </div>
  );
}

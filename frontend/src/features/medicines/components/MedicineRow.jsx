import { Link } from "react-router-dom";
import { PillGlyph } from "../../../components/PillGlyph";
import { ConfirmationRail, FreshnessTag, hoursSince } from "../../search/components/FreshnessGauge";

export function MedicineRow({ medicine }) {
  const hours = hoursSince(medicine.last_confirmed_at);
  const meta = [medicine.dosage_form_display, medicine.strength].filter(Boolean).join(" · ");
  const searchUrl = `/search?q=${encodeURIComponent(medicine.name)}`;

  return (
    <li className="medicine-row-wrap">
      <Link to={searchUrl} className="medicine-row" aria-label={`Find stock for ${medicine.name}`}>
        <ConfirmationRail hours={hours} isStale={medicine.is_stale} />

        <div className="medicine-thumb">
          {medicine.thumbnail ? (
            <img
              src={medicine.thumbnail}
              alt=""
              loading="lazy"
            />
          ) : (
            <PillGlyph size={22} />
          )}
        </div>

        <div className="medicine-info">
          <div className="medicine-info__header">
            <span className="medicine-name">{medicine.name}</span>
            {meta && <span className="medicine-form">{meta}</span>}
          </div>
          {medicine.category?.name && (
            <p className="medicine-category">
              {medicine.category.name}
              {medicine.description ? ` · ${medicine.description.slice(0, 60)}` : ""}
            </p>
          )}
          <div className="medicine-pills">
            {medicine.last_confirmed_at && (
              <FreshnessTag hours={hours} isStale={medicine.is_stale} />
            )}
            <span className={medicine.requires_prescription ? "tag-rx" : "tag-otc"}>
              {medicine.requires_prescription ? "Prescription required" : "Over the counter"}
            </span>
          </div>
        </div>

        <div className="coverage-col">
          <span className="coverage-label">
            {medicine.stocked_at_count ? `${medicine.stocked_at_count} pharmacies` : "Check stock"}
          </span>
          <div className="coverage-track">
            <div
              className={`coverage-bar ${medicine.stocked_at_count && medicine.stocked_at_count <= 5 ? "coverage-bar--scarce" : ""}`}
              style={{ width: `${Math.min(100, Math.max(20, (medicine.stocked_at_count || 1) * 10))}%` }}
            />
          </div>
          <span className="coverage-label">
            {medicine.stocked_at_count && medicine.stocked_at_count <= 5 ? "hard to find" : "available"}
          </span>
        </div>

        <div className="price-col">
          {medicine.from_price != null ? (
            <>
              <span className="price-prefix">from</span>
              <span className="price-val">
                {medicine.from_price.toLocaleString()}
                <span className="price-currency">ETB</span>
              </span>
            </>
          ) : null}
          <span className="action-link">Stock →</span>
        </div>
      </Link>
    </li>
  );
}

export function MedicineRowSkeleton() {
  return (
    <li className="medicine-row-skeleton">
      <div className="ledger-rail-track">
        <div className="ledger-rail" style={{ height: "40%", opacity: 0.3 }} />
      </div>
      <div className="skeleton-thumb animate-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--title animate-pulse" />
        <div className="skeleton-line skeleton-line--desc animate-pulse" />
        <div className="skeleton-line skeleton-line--pills animate-pulse" />
      </div>
      <div className="skeleton-coverage animate-pulse" />
      <div className="skeleton-price animate-pulse" />
    </li>
  );
}

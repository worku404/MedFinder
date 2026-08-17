import { Link, useNavigate } from "react-router-dom";
import { PillGlyph } from "../../../components/PillGlyph";
import { ConfirmationRail, FreshnessTag, hoursSince } from "../../search/components/FreshnessGauge";

export function MedicineRow({ medicine }) {
  const navigate = useNavigate();
  const lastConfirmed = medicine.latest_confirmed_at ?? medicine.last_confirmed_at;
  const hours = hoursSince(lastConfirmed);
  const inStockCount = medicine.in_stock_pharmacies_count ?? medicine.stocked_at_count ?? 0;
  const fromPrice = medicine.from_price != null ? Number(medicine.from_price) : null;
  const meta = [medicine.dosage_form_display, medicine.strength].filter(Boolean).join(" · ");
  const searchUrl = `/search?q=${encodeURIComponent(medicine.name)}`;
  const detailUrl = `/medicines/${medicine.slug}`;

  const handleStockClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(searchUrl);
  };

  return (
    <li className="medicine-row-wrap">
      <Link to={detailUrl} className="medicine-row" aria-label={`View details for ${medicine.name}`}>
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
            {lastConfirmed && (
              <FreshnessTag hours={hours} isStale={medicine.is_stale} />
            )}
            <span className={medicine.requires_prescription ? "tag-rx" : "tag-otc"}>
              {medicine.requires_prescription ? "Prescription required" : "Over the counter"}
            </span>
          </div>
        </div>

        <div className="coverage-col">
          <span className="coverage-label">
            {inStockCount > 0
              ? `${inStockCount} ${inStockCount === 1 ? "pharmacy" : "pharmacies"}`
              : "Check stock"}
          </span>
          <div className="coverage-track">
            <div
              className={`coverage-bar ${inStockCount > 0 && inStockCount <= 5 ? "coverage-bar--scarce" : ""}`}
              style={{ width: `${Math.min(100, Math.max(20, (inStockCount || 1) * 10))}%` }}
            />
          </div>
          <span className="coverage-label">
            {inStockCount > 0 && inStockCount <= 5 ? "hard to find" : inStockCount > 5 ? "available" : "check stock"}
          </span>
        </div>

        <div className="price-col">
          {fromPrice != null ? (
            <>
              <span className="price-prefix">from</span>
              <span className="price-val">
                {fromPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="price-currency"> ETB</span>
              </span>
            </>
          ) : null}
          <button
            type="button"
            className="action-link"
            onClick={handleStockClick}
            style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
            aria-label={`Find stock for ${medicine.name}`}
          >
            Stock →
          </button>
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

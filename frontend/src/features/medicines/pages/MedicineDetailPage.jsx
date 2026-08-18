import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { medicinesApi } from "../api";
import { searchApi } from "../../search/api";
import { medicineImageSrc } from "../utils";
import { PillGlyph } from "../../../components/PillGlyph";
import { StatusBanner } from "../../../components/StatusBanner";
import { FreshnessTag, hoursSince } from "../../search/components/FreshnessGauge";
import { SearchResultDetailModal } from "../../search/components/SearchResultDetailModal";

export function MedicineDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", medicine: null, error: null });
  const [imgFailed, setImgFailed] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [consulting, setConsulting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    medicinesApi
      .retrieve(slug)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", medicine: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", medicine: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleAskPharmacist = async () => {
    if (!state.medicine || consulting) return;
    setConsulting(true);

    try {
      const data = await searchApi.search({ q: state.medicine.name });
      const results = data.results || data || [];
      if (results.length > 0) {
        setSelectedResult(results[0]);
      } else {
        navigate(`/search?q=${encodeURIComponent(state.medicine.name)}`);
      }
    } catch {
      navigate(`/search?q=${encodeURIComponent(state.medicine.name)}`);
    } finally {
      setConsulting(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="med-detail-shell">
        <p className="auth-fineprint" style={{ textAlign: "center", padding: "4rem 0" }}>
          Loading medicine profile…
        </p>
      </div>
    );
  }

  if (state.status === "error" || !state.medicine) {
    return (
      <div className="med-detail-shell">
        <Link className="catalog-back" to="/medicines">
          ← Back to all medicines
        </Link>
        <StatusBanner tone="error">{state.error || "This medicine isn't available."}</StatusBanner>
      </div>
    );
  }

  const { medicine } = state;
  const src = medicineImageSrc(medicine);
  const inStockCount = medicine.in_stock_pharmacies_count ?? medicine.stocked_at_count ?? 0;
  const fromPrice = medicine.from_price != null ? Number(medicine.from_price) : null;
  const lastConfirmed = medicine.latest_confirmed_at ?? medicine.last_confirmed_at;
  const hours = hoursSince(lastConfirmed);

  return (
    <div className="med-detail-shell">
      {/* Breadcrumb Header */}
      <div className="med-detail-breadcrumb">
        <Link to="/medicines" className="med-breadcrumb-link">
          Medicines
        </Link>
        {medicine.category?.name && (
          <>
            <span className="med-breadcrumb-sep">/</span>
            <Link
              to={`/medicines/categories/${medicine.category.slug}`}
              className="med-breadcrumb-link"
            >
              {medicine.category.name}
            </Link>
          </>
        )}
        <span className="med-breadcrumb-sep">/</span>
        <span className="med-breadcrumb-current">{medicine.name}</span>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="med-detail-grid">
        {/* Left Column: Big Showcase Image & Quick Clinical Facts */}
        <div className="med-detail-left">
          <div className="med-showcase-card">
            {!imgFailed && src ? (
              <img
                src={src}
                alt={medicine.name}
                className="med-showcase-img"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="med-showcase-fallback">
                <PillGlyph size={80} />
              </div>
            )}
            <span
              className={`med-badge-floating ${
                medicine.requires_prescription ? "med-badge--rx" : "med-badge--otc"
              }`}
            >
              {medicine.requires_prescription ? "Prescription Required" : "Over the Counter"}
            </span>
          </div>

          {/* Clinical Specifications Fact Sheet */}
          <div className="med-fact-grid">
            <div className="med-fact-item">
              <span className="med-fact-label">Dosage Form</span>
              <span className="med-fact-val">
                {medicine.dosage_form_display || medicine.dosage_form || "Standard"}
              </span>
            </div>

            <div className="med-fact-item">
              <span className="med-fact-label">Strength</span>
              <span className="med-fact-val">{medicine.strength || "Standard Dose"}</span>
            </div>

            <div className="med-fact-item">
              <span className="med-fact-label">Therapeutic Category</span>
              <span className="med-fact-val">{medicine.category?.name || "General"}</span>
            </div>

            <div className="med-fact-item">
              <span className="med-fact-label">Dispensing Rule</span>
              <span className="med-fact-val">
                {medicine.requires_prescription ? "Rx Only (Physician)" : "OTC (Direct)"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Availability & Pricing Hero Card, Clinical Guidance */}
        <div className="med-detail-right">
          {/* Header Title Group */}
          <div className="med-title-group">
            {medicine.category?.name && (
              <Link
                className="med-category-pill"
                to={`/medicines/categories/${medicine.category.slug}`}
              >
                {medicine.category.name}
              </Link>
            )}
            <h1 className="med-title">{medicine.name}</h1>
            <p className="med-subtitle">
              {[medicine.dosage_form_display, medicine.strength].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Hero Action & Stock Card */}
          <div className="med-action-card">
            <div className="med-action-header">
              <div>
                <span className="med-stock-indicator">
                  <span className="med-stock-dot" />
                  {inStockCount > 0
                    ? `Verified in ${inStockCount} ${
                        inStockCount === 1 ? "Pharmacy" : "Pharmacies"
                      }`
                    : "Live Stock Verification"}
                </span>
                {lastConfirmed && (
                  <div style={{ marginTop: "6px" }}>
                    <FreshnessTag hours={hours} isStale={hours > 48} />
                  </div>
                )}
              </div>

              {fromPrice != null && (
                <div className="med-price-badge">
                  <span className="med-price-prefix">From</span>
                  <div className="med-price-number">
                    {fromPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="med-price-currency"> ETB</span>
                  </div>
                </div>
              )}
            </div>

            <div className="med-action-buttons">
              <Link
                to={`/search?q=${encodeURIComponent(medicine.name)}`}
                className="btn btn--primary med-btn-main"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ marginRight: "8px" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Find In Nearby Pharmacies (GPS)
              </Link>

              <button
                type="button"
                className="btn btn--outline med-btn-chat"
                onClick={handleAskPharmacist}
                disabled={consulting}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ marginRight: "8px" }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {consulting ? "Loading…" : "Ask Pharmacist"}
              </button>
            </div>
          </div>

          {/* Description & Clinical Information Card */}
          <div className="med-info-card">
            <h2 className="med-info-heading">Clinical Overview & Indications</h2>
            <p className="med-info-text">
              {medicine.description ||
                "This medication is licensed for distribution in Ethiopia. Check with a licensed pharmacist for exact indications, contraindications, and dosage instructions."}
            </p>
          </div>

          {/* Healthcare Safety Notice */}
          <div className="med-safety-card">
            <div className="med-safety-icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="med-safety-content">
              <strong>Patient Safety Reminder</strong>
              <p>
                MedFinder verifies real-time stock and prices. Prescription medicines require a
                valid doctor's prescription presented in-person upon pickup. Always consult a
                certified healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reusing existing SearchResultDetailModal */}
      {selectedResult && (
        <SearchResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

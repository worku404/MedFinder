import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { medicinesApi } from "../api";
import { medicineImageSrc } from "../utils";
import { PillGlyph } from "../../../components/PillGlyph";
import { StatusBanner } from "../../../components/StatusBanner";

export function MedicineDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: "loading", medicine: null, error: null });
  const [imgFailed, setImgFailed] = useState(false);

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

  if (state.status === "loading") return <p className="auth-fineprint">Loading medicine…</p>;
  if (state.status === "error") {
    return (
      <div className="catalog-page">
        <StatusBanner tone="error">This medicine isn't available.</StatusBanner>
      </div>
    );
  }

  const { medicine } = state;
  const src = medicineImageSrc(medicine);

  return (
    <div className="catalog-page">
      <Link className="catalog-back" to="/medicines">
        ← All medicines
      </Link>

      <div className="medicine-detail">
        <div className="medicine-detail__image">
          {!imgFailed && src ? (
            <img src={src} alt="" onError={() => setImgFailed(true)} />
          ) : (
            <PillGlyph size={48} />
          )}
        </div>
        <div className="medicine-detail__body">
          {medicine.category?.name && (
            <Link className="medicine-detail__category" to={`/medicines/categories/${medicine.category.slug}`}>
              {medicine.category.name}
            </Link>
          )}
          <h1 className="medicine-detail__name">{medicine.name}</h1>
          <p className="medicine-detail__meta">
            {[medicine.dosage_form_display, medicine.strength].filter(Boolean).join(" · ")}
          </p>
          <span className={medicine.requires_prescription ? "med-badge med-badge--rx" : "med-badge med-badge--otc"}>
            {medicine.requires_prescription ? "Prescription required" : "Over the counter"}
          </span>
          {medicine.description && <p className="medicine-detail__description">{medicine.description}</p>}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <Link className="btn btn--primary medicine-detail__search-link" to={`/search?q=${encodeURIComponent(medicine.name)}`}>
              Check availability near me
            </Link>
            <Link
              className="btn btn--outline"
              to={`/chat?medicine=${encodeURIComponent(medicine.name)}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ask Pharmacist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

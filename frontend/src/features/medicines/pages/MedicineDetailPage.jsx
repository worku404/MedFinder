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
          <Link className="btn btn--primary medicine-detail__search-link" to={`/search?q=${encodeURIComponent(medicine.name)}`}>
            Check availability near me
          </Link>
        </div>
      </div>
    </div>
  );
}

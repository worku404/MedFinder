import { useState } from "react";
import { Link } from "react-router-dom";
import { PillGlyph } from "../../../components/PillGlyph";
import { MedicineTag } from "./MedicineTag";
import { medicineImageSrc } from "../utils";

export function MedicineCard({ medicine }) {
  const [imgFailed, setImgFailed] = useState(false);
  const primarySrc = medicineImageSrc(medicine, { preferThumbnail: true });
  const [currentSrc, setCurrentSrc] = useState(primarySrc);

  const handleError = () => {
    // If local thumbnail fails, fallback to direct image_url before showing glyph
    if (currentSrc !== medicine.image_url && medicine.image_url) {
      setCurrentSrc(medicine.image_url);
    } else {
      setImgFailed(true);
    }
  };

  const meta = [medicine.dosage_form_display, medicine.strength].filter(Boolean).join(" · ");

  return (
    <Link className="medicine-card" to={`/medicines/${medicine.slug}`}>
      <div className="medicine-card__image">
        {!imgFailed && currentSrc ? (
          <img src={currentSrc} alt="" loading="lazy" onError={handleError} />
        ) : (
          <PillGlyph size={28} />
        )}
      </div>
      <div className="medicine-card__body">
        <p className="medicine-card__name">{medicine.name}</p>
        {medicine.category?.name && <p className="medicine-card__category">{medicine.category.name}</p>}
        {meta && <p className="medicine-card__meta">{meta}</p>}
        <MedicineTag requiresPrescription={medicine.requires_prescription} />
      </div>
    </Link>
  );
}

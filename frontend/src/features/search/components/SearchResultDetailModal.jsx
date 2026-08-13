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

export function SearchResultDetailModal({ result, onClose, onStartChat }) {
  if (!result) return null;

  const { medicine, pharmacy } = result;
  const outOfStock = result.quantity_available === 0;
  const imageUrl = medicine.thumbnail || medicine.image_url || medicine.image;
  const mapUrl = pharmacy.latitude && pharmacy.longitude
    ? `https://www.openstreetmap.org/?mlat=${pharmacy.latitude}&mlon=${pharmacy.longitude}#map=16/${pharmacy.latitude}/${pharmacy.longitude}`
    : null;

  return (
    <div className="chat-modal__backdrop" onClick={onClose}>
      <div
        className="chat-modal__card"
        style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="chat-modal__header" style={{ alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
              <h2 className="chat-modal__title" style={{ fontSize: "1.35rem", margin: 0 }}>
                {medicine.name}
              </h2>
              {medicine.strength && (
                <span className="result-row__strength" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {medicine.strength}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
              {medicine.dosage_form_display && (
                <span className="stamp-mark" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                  {medicine.dosage_form_display}
                </span>
              )}
              <span
                className="stamp-mark"
                style={{
                  padding: "0.15rem 0.5rem",
                  fontSize: "0.75rem",
                  borderColor: medicine.requires_prescription ? "var(--color-caution)" : "var(--color-verified)",
                  color: medicine.requires_prescription ? "var(--color-caution)" : "var(--color-verified)",
                }}
              >
                {medicine.requires_prescription ? "Rx - Prescription Required" : "OTC - Over The Counter"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--google"
            style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        {/* Media Image Banner */}
        {imageUrl && (
          <div style={{ margin: "1rem 0", borderRadius: "6px", overflow: "hidden", maxHeight: "200px", background: "var(--color-paper)" }}>
            <img
              src={imageUrl}
              alt={medicine.name}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Live Availability & Pricing Summary Box */}
        <div
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-line)",
            borderRadius: "6px",
            padding: "1rem",
            margin: "1rem 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-ink-soft)", textTransform: "uppercase" }}>Price</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>
              ETB {Number(result.price).toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-ink-soft)", textTransform: "uppercase" }}>Availability</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: outOfStock ? "var(--color-caution)" : "var(--color-verified)" }}>
              {result.availability}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-ink-soft)", textTransform: "uppercase" }}>Stock Quantity</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              {result.quantity_available} units
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-ink-soft)", textTransform: "uppercase" }}>Freshness</div>
            <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
              <FreshnessSignal stale={result.is_stale} />
              <span>{freshnessLabel(result)}</span>
            </div>
          </div>
        </div>

        {/* Pharmacy Information */}
        <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: "1rem", marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem", fontWeight: 600 }}>Pharmacy & Location</h3>
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 500 }}>
            <Link to={`/pharmacies/${pharmacy.id}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>
              {pharmacy.name} ↗
            </Link>
          </p>
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.875rem", color: "var(--color-ink-soft)" }}>
            {pharmacy.address || "Address not provided"}
            {result.distance_km != null && ` · ${result.distance_km.toFixed(1)} km away`}
          </p>

          {pharmacy.phone_number && (
            <p style={{ margin: "0 0 0.35rem", fontSize: "0.875rem" }}>
              <strong>Phone: </strong>
              <a href={`tel:${pharmacy.phone_number}`} style={{ color: "var(--color-primary)" }}>
                {pharmacy.phone_number}
              </a>
            </p>
          )}

          {mapUrl && (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                View on Map (GPS: {pharmacy.latitude.toFixed(4)}, {pharmacy.longitude.toFixed(4)}) ↗
              </a>
            </p>
          )}
        </div>

        {/* Medicine Description */}
        {medicine.description && (
          <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: "1rem", marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 0.5rem", fontWeight: 600 }}>Description & Usage</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-ink-soft)", lineHeight: 1.5, margin: 0 }}>
              {medicine.description}
            </p>
          </div>
        )}

        {/* Action Footer */}
        <div
          style={{
            borderTop: "1px solid var(--color-line)",
            paddingTop: "1rem",
            marginTop: "1.25rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              to={`/medicines/${medicine.slug}`}
              className="btn btn--google"
              style={{ width: "auto", padding: "0.5rem 0.85rem", fontSize: "0.85rem", textDecoration: "none" }}
            >
              Full Drug Monograph ↗
            </Link>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            style={{ width: "auto", padding: "0.6rem 1.25rem" }}
            onClick={() => {
              onClose();
              onStartChat(pharmacy);
            }}
          >
            Chat with Pharmacist
          </button>
        </div>
      </div>
    </div>
  );
}

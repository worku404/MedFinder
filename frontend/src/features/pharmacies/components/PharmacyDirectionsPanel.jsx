import { useState } from "react";
import { Link } from "react-router-dom";

export function PharmacyDirectionsPanel({
  pharmacy,
  origin,
  transitMode,
  onChangeTransitMode,
  routeStats,
  routingLoading,
  routingError,
  onRecenter,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cleanPhone = pharmacy.phone_number?.replace(/\s+/g, "");

  return (
    <aside className={`floating-directions-panel ${collapsed ? "floating-directions-panel--collapsed" : ""}`}>
      {/* Collapse Toggle Handle */}
      <button
        type="button"
        className="floating-panel-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand information panel" : "Collapse information panel"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {!collapsed && (
        <div className="floating-panel-content">
          {/* Top Bar / Navigation */}
          <div className="floating-panel-top">
            <Link to="/search" className="floating-back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Search
            </Link>

            {pharmacy.status === "verified" && (
              <span className="pharmacy-badge-verified">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Verified Pharmacy
              </span>
            )}
          </div>

          {/* Pharmacy Dossier */}
          <div className="pharmacy-dossier">
            <h1 className="pharmacy-dossier__title">{pharmacy.name}</h1>

            {pharmacy.license_reference && (
              <p className="pharmacy-dossier__license">
                License: <code>{pharmacy.license_reference}</code>
              </p>
            )}

            {pharmacy.address && (
              <p className="pharmacy-dossier__address">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {pharmacy.address}
              </p>
            )}

            {cleanPhone && (
              <a href={`tel:${cleanPhone}`} className="pharmacy-dossier__phone">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {pharmacy.phone_number}
              </a>
            )}

            <Link
              to={`/chat?pharmacy=${encodeURIComponent(pharmacy.name)}&branch=${encodeURIComponent(pharmacy.address || "Main Branch")}`}
              className="btn btn--primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                marginTop: "12px",
                fontSize: "0.9rem",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat with Pharmacist
            </Link>
          </div>

          <div className="floating-panel-divider" />

          {/* Point-to-Point Directions Section */}
          <div className="directions-section">
            <div className="directions-section__header">
              <h2 className="directions-section__title">Route & Directions</h2>
              {onRecenter && (
                <button type="button" className="directions-recenter-btn" onClick={onRecenter}>
                  Fit route
                </button>
              )}
            </div>

            {/* Transit Mode Selector Tabs */}
            <div className="directions-transit-tabs" role="tablist" aria-label="Transit modes">
              <button
                type="button"
                role="tab"
                aria-selected={transitMode === "driving"}
                className={`transit-tab ${transitMode === "driving" ? "transit-tab--active" : ""}`}
                onClick={() => onChangeTransitMode("driving")}
                title="Driving / Taxi"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="9" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Drive</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={transitMode === "foot"}
                className={`transit-tab ${transitMode === "foot" ? "transit-tab--active" : ""}`}
                onClick={() => onChangeTransitMode("foot")}
                title="Walking"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                  <path d="m15 10-3.5 3.5L9 9 5 13"/>
                  <path d="M7 21l3-6 4 2 2 4"/>
                </svg>
                <span>Walk</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={transitMode === "transit"}
                className={`transit-tab ${transitMode === "transit" ? "transit-tab--active" : ""}`}
                onClick={() => onChangeTransitMode("transit")}
                title="Public Transit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="16" rx="2"/>
                  <path d="M4 11h16"/>
                  <path d="M8 15h.01M16 15h.01"/>
                  <path d="M6 19v2M18 19v2"/>
                </svg>
                <span>Transit</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={transitMode === "bike"}
                className={`transit-tab ${transitMode === "bike" ? "transit-tab--active" : ""}`}
                onClick={() => onChangeTransitMode("bike")}
                title="Cycling"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5"/>
                  <circle cx="18.5" cy="17.5" r="3.5"/>
                  <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5L15 6h3M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
                <span>Cycle</span>
              </button>
            </div>

            {/* Point A to Point B Visual Stack */}
            <div className="directions-points-box">
              <div className="point-row">
                <div className="point-icon point-icon--origin">A</div>
                <div className="point-info">
                  <span className="point-label">Origin</span>
                  <p className="point-value">
                    {origin ? "My Current Location (GPS)" : "Detecting location…"}
                  </p>
                </div>
              </div>

              <div className="point-connector" />

              <div className="point-row">
                <div className="point-icon point-icon--dest">B</div>
                <div className="point-info">
                  <span className="point-label">Destination</span>
                  <p className="point-value">{pharmacy.name}</p>
                </div>
              </div>
            </div>

            {/* Route Summary Stats */}
            {routingLoading && (
              <div className="route-stats-loading">
                <div className="loading-spinner" />
                <span>Calculating best route…</span>
              </div>
            )}

            {!routingLoading && routeStats && (
              <div className="route-summary-card">
                <div className="route-summary-card__header">
                  <div className="route-time-val">{routeStats.durationFormatted}</div>
                  <div className="route-dist-val">{routeStats.distanceFormatted}</div>
                </div>
                <p className="route-summary-card__hint">
                  {transitMode === "driving" && "Fastest route considering typical city traffic"}
                  {transitMode === "foot" && "Pedestrian walkway & road-side path"}
                  {transitMode === "transit" && "Estimated local bus / taxi corridor"}
                  {transitMode === "bike" && "Optimal cycling route"}
                </p>
              </div>
            )}

            {!routingLoading && routingError && (
              <div className="route-error-notice">
                <p>{routingError}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

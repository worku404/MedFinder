import { StampMark } from "../../../components/StampMark";
import "./AuthLayout.css";

export function AuthLayout({ eyebrow, title, subtitle, panelNote, children }) {
  return (
    <div className="auth-shell">
      {/* =====================================================
          ANIMATED PHARMACY BACKGROUND
      ===================================================== */}
      <div className="auth-background" aria-hidden="true">
        <div className="auth-background__image" />

        <div className="auth-background__overlay" />

        {/* Soft medical glows */}
        <div className="auth-background__glow auth-background__glow--one" />
        <div className="auth-background__glow auth-background__glow--two" />

        {/* Floating medical decorations */}
        <span className="medical-plus medical-plus--one">+</span>

        <span className="medical-plus medical-plus--two">+</span>

        <span className="medical-pill medical-pill--one">
          <span />
        </span>

        <span className="medical-pill medical-pill--two">
          <span />
        </span>

        <span className="medical-dot medical-dot--one" />
        <span className="medical-dot medical-dot--two" />
      </div>

      {/* =====================================================
          LEFT — PHARMACY / MEDFINDER PRESENTATION
      ===================================================== */}
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__content">
          {/* Brand */}
          <div className="auth-panel__brand">
            <div className="auth-panel__mark">
              <StampMark state="pending" size={56} />
            </div>

            <div>
              <p className="auth-panel__brand-name">MedFinder</p>

              <p className="auth-panel__brand-tagline">
                Find medicine. Find care.
              </p>
            </div>
          </div>

          {/* Trust badge */}
          <div className="auth-panel__badge">
            <span className="auth-panel__status-dot" />
            Trusted Pharmacy Network
          </div>

          {/* Eyebrow */}
          <p className="auth-panel__eyebrow">
            {eyebrow || "Trusted Pharmacy Network"}
          </p>

          {/* Main heading */}
          <h2 className="auth-panel__title">
            {title || (
              <>
                Find the medicine you need.
                <span>Before you drive there.</span>
              </>
            )}
          </h2>

          {/* Description */}
          <p className="auth-panel__subtitle">
            {subtitle ||
              "Check real-time medicine availability at verified pharmacies near you."}
          </p>

          {/* =================================================
              VERIFIED PHARMACY CARD
          ================================================= */}
          <div className="auth-panel__verification">
            <div className="auth-panel__verification-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
            </div>

            <div>
              <strong>Verified pharmacy information</strong>

              <p>
                {panelNote ||
                  "Pharmacy listings are verified and regularly updated by healthcare professionals."}
              </p>
            </div>
          </div>

          {/* =================================================
              TRUST FEATURES
          ================================================= */}
          <div className="auth-panel__features">
            <div className="auth-panel__feature">
              <span>✓</span>
              Verified pharmacies
            </div>

            <div className="auth-panel__feature">
              <span>✓</span>
              Live availability
            </div>

            <div className="auth-panel__feature">
              <span>✓</span>
              Nearby locations
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          RIGHT — LOGIN / REGISTER CARD
      ===================================================== */}
      <main className="auth-main">
        <div className="auth-card">
          {/* Small mobile brand */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-brand__mark">
              <StampMark state="pending" size={42} />
            </div>

            <div>
              <p className="auth-mobile-brand__name">MedFinder</p>

              <p className="auth-mobile-brand__tagline">
                Find medicine. Find care.
              </p>
            </div>
          </div>

          {/* Authentication content */}
          {children}
        </div>
      </main>
    </div>
  );
}

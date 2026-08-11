import { StampMark } from "./StampMark";
import "./AuthLayout.css";

export function AuthLayout({ eyebrow, title, subtitle, panelNote, children }) {
  return (
    <div className="auth-shell">
      {/* Decorative on purpose — hidden from screen readers, and hidden
          entirely below 880px so mobile users (the priority audience per
          NFR-USE-1) never pay for it. */}
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__mark">
          <StampMark state="pending" size={56} />
        </div>
        <p className="auth-panel__eyebrow">MedFinder</p>
        <p className="auth-panel__note">{panelNote}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {eyebrow && <p className="auth-card__eyebrow">{eyebrow}</p>}
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

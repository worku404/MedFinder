import { confirmedLabel } from "./FreshnessGauge";

export const DEFAULT_ASKED_TODAY = [
  { name: "Amoxicillin 500mg", asks: 412, confirmedHoursAgo: 6 },
  { name: "Insulin glargine", asks: 233, confirmedHoursAgo: 19 },
  { name: "Salbutamol inhaler", asks: 188, confirmedHoursAgo: 2 },
  { name: "Metformin 850mg", asks: 164, confirmedHoursAgo: 11 },
  { name: "Ceftriaxone 1g", asks: 97, confirmedHoursAgo: 48 },
];

export function IdleAsksList({ onPick, items = DEFAULT_ASKED_TODAY }) {
  return (
    <div className="idle-panel">
      <div className="idle-panel__heading">
        <h2>Asked for most in the last 24 hours</h2>
      </div>

      <ul className="idle-panel__list">
        {items.map((m) => (
          <li key={m.name}>
            <button
              type="button"
              onClick={() => onPick(m.name)}
              className="idle-panel__item"
            >
              <div className="idle-panel__item-info">
                <span className="idle-panel__item-name">{m.name}</span>
                <span className="idle-panel__item-confirmed">
                  last confirmed {confirmedLabel(m.confirmedHoursAgo)}
                </span>
              </div>
              <span className="idle-panel__item-asks tabular">
                {m.asks} asks
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="idle-panel__footer-hint">
        Pick one to search it, or type any medicine above.
      </p>
    </div>
  );
}

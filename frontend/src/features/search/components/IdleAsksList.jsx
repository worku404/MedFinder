import { confirmedLabel, hoursSince } from "./FreshnessGauge";

export function IdleAsksList({ onPick, medicines = [] }) {
  if (!medicines || medicines.length === 0) {
    return null;
  }

  return (
    <div className="idle-panel">
      <div className="idle-panel__heading">
        <h2>Available in verified pharmacies today</h2>
      </div>

      <ul className="idle-panel__list">
        {medicines.map((m) => {
          const hours = hoursSince(m.latest_confirmed_at);
          const fullName = [m.name, m.strength].filter(Boolean).join(" ");
          const pharmacyCount = m.in_stock_pharmacies_count ?? 0;

          return (
            <li key={m.id || m.name}>
              <button
                type="button"
                onClick={() => onPick(m.name)}
                className="idle-panel__item"
              >
                <div className="idle-panel__item-info">
                  <span className="idle-panel__item-name">{fullName}</span>
                  <span className="idle-panel__item-confirmed">
                    {m.latest_confirmed_at
                      ? `last confirmed ${confirmedLabel(hours)}`
                      : "Verified canonical medicine"}
                  </span>
                </div>
                <span className="idle-panel__item-asks tabular">
                  {pharmacyCount > 0
                    ? `In ${pharmacyCount} ${pharmacyCount === 1 ? "pharmacy" : "pharmacies"}`
                    : "Catalog item"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="idle-panel__footer-hint">
        Pick one to search it, or type any medicine above.
      </p>
    </div>
  );
}

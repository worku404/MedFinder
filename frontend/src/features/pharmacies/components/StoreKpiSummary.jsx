export function StoreKpiSummary({ pharmacies }) {
  if (!pharmacies || pharmacies.length === 0) return null;

  const totalStores = pharmacies.length;
  const verifiedStores = pharmacies.filter((p) => p.status === "verified").length;
  const pendingStores = pharmacies.filter((p) => p.status === "pending").length;

  return (
    <section className="portal-kpi-grid" aria-label="Portal Overview Metrics">
      <div className="portal-kpi-card">
        <div className="portal-kpi-card__label">Total Associated Stores</div>
        <div className="portal-kpi-card__value">{totalStores}</div>
      </div>
      <div className="portal-kpi-card">
        <div className="portal-kpi-card__label">Verified Active Stores</div>
        <div className="portal-kpi-card__value" style={{ color: "var(--color-verified)" }}>
          {verifiedStores}
        </div>
      </div>
      {pendingStores > 0 && (
        <div className="portal-kpi-card">
          <div className="portal-kpi-card__label">Pending Admin Review</div>
          <div className="portal-kpi-card__value" style={{ color: "var(--color-stale)" }}>
            {pendingStores}
          </div>
        </div>
      )}
    </section>
  );
}

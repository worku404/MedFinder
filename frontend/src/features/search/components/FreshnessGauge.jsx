export function hoursSince(timestamp) {
  if (!timestamp) return 999;
  const confirmedAt = new Date(timestamp);
  return Math.max(0, (Date.now() - confirmedAt.getTime()) / 36e5);
}

export function freshnessOf(hours, isStale = false) {
  if (isStale || hours > 48) return "stale";
  if (hours <= 12) return "fresh";
  return "aging";
}

export function confirmedLabel(hours) {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

const COPY = {
  fresh: "Counted today",
  aging: "Counted this week",
  stale: "Not counted lately",
};

export function ConfirmationRail({ hours, isStale }) {
  const level = freshnessOf(hours, isStale);
  const fill = level === "fresh" ? "100%" : level === "aging" ? "58%" : "22%";

  return (
    <div className="ledger-rail-track" aria-hidden="true">
      <div
        className={`ledger-rail ledger-rail--${level}`}
        style={{ height: fill }}
      />
    </div>
  );
}

export function FreshnessTag({ hours, isStale }) {
  const level = freshnessOf(hours, isStale);

  return (
    <span className={`freshness-tag freshness-tag--${level}`}>
      <span
        className={`freshness-tag__dot ${level === "fresh" ? "freshness-tag__dot--pulse" : ""}`}
        aria-hidden="true"
      />
      {COPY[level]} · {confirmedLabel(hours)}
    </span>
  );
}

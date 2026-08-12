// The one signature element of the search UI — deliberately not another
// stamp/seal like StampMark (accounts/pharmacies), since this page is
// about *live, currently-true* data rather than a one-time confirmation
// event. A filled dot with a soft pulse reads as "live" (fresh, recently
// confirmed); a hollow dashed ring reads as "not currently live" (stale
// — last_confirmed_at fell outside the freshness window). Per FR-INV-3,
// stale entries are always shown, never hidden — this is purely a
// visual cue, not a filter.
//
// The pulse is the only animation in this feature. It's disabled
// globally under prefers-reduced-motion by the rule already in
// styles/tokens.css, so this component doesn't need its own check.
export function FreshnessSignal({ stale }) {
  return (
    <span className={`freshness-signal ${stale ? "freshness-signal--stale" : "freshness-signal--fresh"}`} aria-hidden="true">
      <span className="freshness-signal__dot" />
      {!stale && <span className="freshness-signal__pulse" />}
    </span>
  );
}

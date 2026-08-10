// The one signature element in the accounts flow. Grounded in something
// real about MedFinder — the verification/freshness concept that runs
// through the whole product (verified pharmacies, confirmed stock) —
// rather than a generic hero illustration.
//
// "pending": dashed ring, static. Used ambiently in the side panel.
// "settled": solid ring, plays a one-time settle animation. Used at the
//            moment something is actually confirmed (email verified,
//            verification link sent).
export function StampMark({ state = "pending", size = 72 }) {
  const dashed = state === "pending";
  return (
    <svg
      className={`stamp-mark stamp-mark--${state}`}
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r="30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={dashed ? "4 5" : "none"}
      />
      <path d="M36 22V50M22 36H50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

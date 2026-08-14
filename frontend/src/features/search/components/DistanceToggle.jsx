export function DistanceToggle({ state, coords, nearby, onToggleNearby, onRequestCoords }) {
  const handleClick = () => {
    if (!nearby && !coords) {
      onRequestCoords();
    }
    onToggleNearby(!nearby);
  };

  return (
    <div className="distance-toggle-bar">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={nearby}
        className="distance-toggle-btn"
      >
        <svg
          className="distance-toggle-btn__icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
        <span>
          {nearby && coords
            ? "Sorting by distance from you — turn off"
            : state === "requesting"
              ? "Requesting location…"
              : "Sort by distance from me"}
        </span>
      </button>

      <span className="distance-toggle-bar__hint">
        {nearby && coords
          ? "Closest confirmed shelf first."
          : "Ranked by name match, then by how fresh the count is."}
      </span>
    </div>
  );
}

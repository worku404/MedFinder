// Inline, not a modal — asking for location is secondary to the search
// itself, and a modal would block the one thing the page is actually
// for. Shown only in states where it's actionable or worth explaining;
// once granted, it disappears entirely rather than lingering as a
// "location: on" indicator nobody asked for.
export function LocationBanner({ status, onRequest }) {
  if (status === "granted") return null;

  if (status === "unsupported") {
    return (
      <p className="location-banner location-banner--muted">
        Your browser doesn't support location — results are ranked by best match and freshness only.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="location-banner location-banner--muted">
        Location wasn't shared — showing results ranked by best match and freshness. You can enable
        location access in your browser settings and search again to rank by distance too.
      </p>
    );
  }

  return (
    <div className="location-banner">
      <p>
        Share your location to rank results by distance too.{" "}
        <button type="button" className="location-banner__action" onClick={onRequest} disabled={status === "requesting"}>
          {status === "requesting" ? "Requesting…" : "Use my location"}
        </button>
      </p>
    </div>
  );
}

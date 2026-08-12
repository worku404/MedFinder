import { useCallback, useState } from "react";

// Wraps the browser Geolocation API in a small state machine so
// SearchPage doesn't juggle callback-style geolocation itself.
//
// Product decision this encodes (agreed on before building this): the
// backend only ever accepts plain lat/lng query params and doesn't care
// how they were obtained — no IP-based geolocation fallback exists or
// is planned. If the user denies/skips the browser prompt, search still
// works, just without distance ranking (text-match + freshness only).
export function useGeolocation() {
  // "idle" | "requesting" | "granted" | "denied" | "unsupported"
  const [status, setStatus] = useState("idle");
  const [coords, setCoords] = useState(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { status, coords, request };
}

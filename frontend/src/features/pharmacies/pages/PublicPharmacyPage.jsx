import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { StatusBanner } from "../../../components/StatusBanner";
import { useGeolocation } from "../../search/useGeolocation";
import { pharmaciesApi } from "../api";
import { PharmacyDirectionsPanel } from "../components/PharmacyDirectionsPanel";
import { PharmacyRouteMap } from "../components/PharmacyRouteMap";
import { fetchRoute } from "../utils/routing";

const DEFAULT_ORIGIN = { lat: 9.03, lng: 38.74 }; // Addis Ababa city center fallback

export function PublicPharmacyPage() {
  const { id } = useParams();
  const geolocation = useGeolocation();

  const [pharmacyState, setPharmacyState] = useState({ status: "loading", pharmacy: null, error: null });
  const [transitMode, setTransitMode] = useState("driving");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeStats, setRouteStats] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState(null);

  // 1. Fetch Pharmacy Details on mount
  useEffect(() => {
    let cancelled = false;
    pharmaciesApi
      .retrieve(id)
      .then((data) => {
        if (!cancelled) setPharmacyState({ status: "ready", pharmacy: data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setPharmacyState({ status: "error", pharmacy: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 2. Request user live GPS on mount
  useEffect(() => {
    geolocation.request();
  }, [geolocation.request]);

  // 3. Compute Route whenever origin, destination or transit mode changes
  useEffect(() => {
    if (pharmacyState.status !== "ready" || !pharmacyState.pharmacy) return;

    const dest = {
      lat: pharmacyState.pharmacy.latitude,
      lng: pharmacyState.pharmacy.longitude,
    };

    // If destination coordinates are missing, exit
    if (typeof dest.lat !== "number" || typeof dest.lng !== "number") return;

    const origin = geolocation.coords || DEFAULT_ORIGIN;

    let cancelled = false;
    setRoutingLoading(true);
    setRoutingError(null);

    fetchRoute({ origin, destination: dest, mode: transitMode })
      .then((res) => {
        if (cancelled) return;
        if (res) {
          setRouteCoordinates(res.coordinates);
          setRouteStats(res);
        }
      })
      .catch((err) => {
        if (!cancelled) setRoutingError("Could not calculate live route.");
      })
      .finally(() => {
        if (!cancelled) setRoutingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pharmacyState.status, pharmacyState.pharmacy, geolocation.coords, transitMode]);

  if (pharmacyState.status === "loading") {
    return (
      <div className="pharmacy-profile-loading">
        <div className="loading-spinner" />
        <p>Loading pharmacy profile & route map…</p>
      </div>
    );
  }

  if (pharmacyState.status === "error" || !pharmacyState.pharmacy) {
    return (
      <div className="settings-page">
        <StatusBanner tone="error">This pharmacy profile is not available.</StatusBanner>
      </div>
    );
  }

  const { pharmacy } = pharmacyState;
  const origin = geolocation.coords || DEFAULT_ORIGIN;
  const destination = { lat: pharmacy.latitude, lng: pharmacy.longitude };

  return (
    <div className="pharmacy-profile-viewport">
      {/* Full-Screen Interactive Map Canvas */}
      <PharmacyRouteMap
        origin={origin}
        destination={destination}
        routeCoordinates={routeCoordinates}
        pharmacyName={pharmacy.name}
      />

      {/* Floating Left-Hand Dossier & Directions Panel */}
      <PharmacyDirectionsPanel
        pharmacy={pharmacy}
        origin={geolocation.coords}
        transitMode={transitMode}
        onChangeTransitMode={setTransitMode}
        routeStats={routeStats}
        routingLoading={routingLoading}
        routingError={routingError}
      />
    </div>
  );
}

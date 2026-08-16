import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix standard Leaflet default icon paths in Vite bundle
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Point A (User Origin) Beacon Icon
const userBeaconIcon = L.divIcon({
  className: "map-beacon-marker",
  html: `
    <div class="beacon-pin">
      <div class="beacon-pin__pulse"></div>
      <div class="beacon-pin__core">A</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom Point B (Pharmacy Destination) Marker Icon
const pharmacyDestinationIcon = L.divIcon({
  className: "map-pharmacy-marker",
  html: `
    <div class="pharmacy-pin">
      <div class="pharmacy-pin__badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="m8.5 8.5 7 7"/>
        </svg>
      </div>
      <div class="pharmacy-pin__arrow"></div>
    </div>
  `,
  iconSize: [36, 46],
  iconAnchor: [18, 44],
});

function MapBoundsFitter({ origin, destination, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!destination) return;

    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
      return;
    }

    if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    } else {
      map.setView([destination.lat, destination.lng], 15);
    }
  }, [map, origin, destination, routeCoordinates]);

  return null;
}

export function PharmacyRouteMap({ origin, destination, routeCoordinates = [], pharmacyName }) {
  const defaultCenter = destination
    ? [destination.lat, destination.lng]
    : [9.03, 38.74]; // Default Addis Ababa

  return (
    <div className="fullscreen-map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={true}
        className="fullscreen-leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsFitter
          origin={origin}
          destination={destination}
          routeCoordinates={routeCoordinates}
        />

        {/* Origin (Point A: User Location) */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={userBeaconIcon} />
        )}

        {/* Destination (Point B: Pharmacy Location) */}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={pharmacyDestinationIcon}
          />
        )}

        {/* Street Route Polyline */}
        {routeCoordinates.length > 0 && (
          <>
            {/* Soft glow underlay */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "rgba(14, 138, 130, 0.3)",
                weight: 9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Primary route line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#0e8a82",
                weight: 5,
                lineCap: "round",
                lineJoin: "round",
                dashArray: undefined,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}

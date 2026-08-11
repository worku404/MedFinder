// Requires two new dependencies not assumed already installed:
//   npm install leaflet react-leaflet
import { useCallback, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// react-leaflet's default marker icon paths don't survive Vite's asset
// pipeline without this — the standard fix, done once at module load.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ADDIS_ABABA_CENTER = { lat: 9.03, lng: 38.74 };

function ClickToPlace({ onPlace }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng);
    },
  });
  return null;
}

export function PharmacyMap({ latitude, longitude, onChange = () => {}, readOnly = false }) {
  const position = useMemo(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      return { lat: latitude, lng: longitude };
    }
    return null;
  }, [latitude, longitude]);

  const handlePlace = useCallback(
    (latlng) => {
      onChange({ latitude: Number(latlng.lat.toFixed(6)), longitude: Number(latlng.lng.toFixed(6)) });
    },
    [onChange]
  );

  return (
    <div className="pharmacy-map">
      <MapContainer
        center={position ?? ADDIS_ABABA_CENTER}
        zoom={position ? 15 : 12}
        scrollWheelZoom={false}
        style={{ height: "260px", width: "100%", borderRadius: "var(--radius-md)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && <ClickToPlace onPlace={handlePlace} />}
        {position && (
          <Marker
            position={position}
            draggable={!readOnly}
            eventHandlers={!readOnly ? { dragend: (e) => handlePlace(e.target.getLatLng()) } : undefined}
          />
        )}
      </MapContainer>
      {!readOnly && (
        <p className="pharmacy-map__hint">
          Tap the map to drop a pin at your pharmacy, or drag the pin to fine-tune it.
        </p>
      )}
    </div>
  );
}

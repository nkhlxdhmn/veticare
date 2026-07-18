import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { NearbyPlace } from "@/services/services";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function SetViewOnChange({ center }: { center: [number, number] }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function FitBoundsOnData({
  places,
  selected,
}: {
  places: NearbyPlace[];
  selected: NearbyPlace | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.setView([selected.lat, selected.lng], 15, { animate: true });
    } else if (places.length > 0) {
      const bounds = L.latLngBounds(
        places.map((p) => [p.lat, p.lng] as [number, number]),
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [places, selected, map]);

  return null;
}

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapView({
  places,
  selectedPlace,
  center,
  userLocation,
  onMapClick,
  onSelectPlace,
}: {
  places: NearbyPlace[];
  selectedPlace: NearbyPlace | null;
  center: [number, number];
  userLocation: [number, number] | null;
  onMapClick: (pos: [number, number]) => void;
  onSelectPlace: (place: NearbyPlace | null) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      <SetViewOnChange center={center} />
      <FitBoundsOnData places={places} selected={selectedPlace} />

      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {places.map((place) => (
        <Marker
          key={`${place.osm_type}-${place.osm_id}`}
          position={[place.lat, place.lng]}
          icon={
            selectedPlace?.osm_id === place.osm_id
              ? selectedIcon
              : defaultIcon
          }
          eventHandlers={{
            click: () => onSelectPlace(place),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="font-medium text-sm">{place.name}</h3>
              {place.address && (
                <p className="text-xs text-gray-500 mt-1">{place.address}</p>
              )}
              {place.phone && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {place.phone}
                </p>
              )}
              {place.distance !== null && (
                <p className="text-xs font-medium mt-1 text-blue-600">
                  {(place.distance / 1000).toFixed(1)} km
                </p>
              )}
              {place.type_label && (
                <p className="text-xs text-amber-600 mt-0.5">
                  {place.type_label}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

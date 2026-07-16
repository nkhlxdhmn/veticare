import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Navigation,
  Filter,
  Crosshair,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MapView from "@/components/map/MapView";
import LocationSearch from "@/components/map/LocationSearch";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  servicesService,
  type NearbyPlace,
} from "@/services/services";

const PLACE_TYPES = [
  { label: "All", value: "" },
  { label: "Veterinary", value: "veterinary" },
  { label: "Animal Hospital", value: "animal_hospital" },
  { label: "Pet Shop", value: "pet_shop" },
  { label: "Pet Food Store", value: "pet_food" },
  { label: "Animal Shelter", value: "animal_shelter" },
  { label: "NGO", value: "ngo" },
];

const RADII = [
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
] as const;

type LocationState = "loading" | "prompt" | "ready";

export default function NearbyServices() {
  const [locationState, setLocationState] = useState<LocationState>("loading");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [locationLabel, setLocationLabel] = useState("");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState("");
  const [geoError, setGeoError] = useState("");
  const [radius, setRadius] = useState(5000);
  const [placeType, setPlaceType] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const fetching = useRef(false);

  const requestGeolocation = useCallback(() => {
    setGeoError("");
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setCenter([latitude, longitude]);
        setLocationState("ready");
        const result = await servicesService.reverseGeocode(latitude, longitude);
        setLocationLabel(result?.display_name ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        fetchNearby(latitude, longitude);
      },
      (err) => {
        let msg = "Location access denied. Please search manually.";
        if (err.code === err.TIMEOUT) msg = "Location request timed out. Please search manually.";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "Location unavailable. Please search manually.";
        setGeoError(msg);
        setLocationState("prompt");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    requestGeolocation();
  }, []);

  const fetchNearby = useCallback(
    async (lat: number, lng: number) => {
      if (fetching.current) return;
      fetching.current = true;
      setLoadingServices(true);
      setError("");
      setHasSearched(true);
      try {
        const data = await servicesService.nearby(
          lat,
          lng,
          radius,
          placeType || undefined,
        );
        setPlaces(data);
        setSelectedPlace(null);
      } catch {
        setError("Unable to fetch nearby services.");
        setPlaces([]);
      } finally {
        setLoadingServices(false);
        fetching.current = false;
      }
    },
    [radius, placeType],
  );

  const handleLocationSelect = (lat: number, lng: number, label: string) => {
    setCenter([lat, lng]);
    setLocationLabel(label);
    setLocationState("ready");
    fetchNearby(lat, lng);
  };

  const handleMapClick = (pos: [number, number]) => {
    setCenter(pos);
    setLocationLabel(`${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`);
    if (locationState === "ready") {
      fetchNearby(pos[0], pos[1]);
    }
  };

  useEffect(() => {
    if (hasSearched && locationState === "ready") {
      fetchNearby(center[0], center[1]);
    }
  }, [radius, placeType]);

  const showInitialLoading = locationState === "loading" && !geoError;
  const showPrompt = locationState === "prompt" && !hasSearched;
  const showNoResults = hasSearched && !loadingServices && places.length === 0 && !error;

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-full">
        <aside className="border-b lg:border-b-0 lg:border-r border-borderLight overflow-y-auto bg-white lg:order-first">
          <div className="p-4 space-y-4">
            <div>
              <h1 className="text-xl font-serif font-medium tracking-tight">
                Nearby Services
              </h1>
              <p className="text-sm text-textSecondary mt-1">
                Find vet clinics, pet hospitals, and animal services near you.
              </p>
            </div>

            {showInitialLoading && (
              <div className="flex items-center gap-3 text-sm text-textSecondary bg-blue-50 rounded-md p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                Detecting your location...
              </div>
            )}

            {geoError && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-md p-2.5">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            <LocationSearch
              onSelect={handleLocationSelect}
              onRequestGeolocation={
                geoError || locationState === "prompt"
                  ? requestGeolocation
                  : undefined
              }
            />

            {locationState === "ready" && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-textSecondary mb-2">
                    <Filter className="h-3.5 w-3.5" />
                    Service Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLACE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setPlaceType(t.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          placeType === t.value
                            ? "bg-textPrimary text-background"
                            : "bg-gray-50 text-textSecondary hover:bg-gray-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-textSecondary mb-2">
                    <Navigation className="h-3.5 w-3.5" />
                    Radius
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RADII.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRadius(r.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          radius === r.value
                            ? "bg-textPrimary text-background"
                            : "bg-gray-50 text-textSecondary hover:bg-gray-100"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {locationLabel && (
                  <div className="flex items-start gap-2 text-xs text-textSecondary bg-gray-50 rounded-md p-2.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{locationLabel}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-borderLight">
            {loadingServices && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-textPrimary border-t-transparent" />
                <p className="text-xs text-textSecondary">Searching nearby services...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3 p-4 m-4 text-sm text-red-600 bg-red-50 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNearby(center[0], center[1])}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            )}

            {showPrompt && !loadingServices && !error && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Crosshair className="h-8 w-8 text-textSecondary mb-3" />
                <p className="text-sm text-textSecondary mb-4">
                  Search a location above to find nearby veterinary services.
                </p>
              </div>
            )}

            {showNoResults && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MapPin className="h-8 w-8 text-textSecondary mb-3" />
                <p className="text-sm text-textSecondary">
                  No services found within the selected radius. Try increasing
                  the radius or changing the service type.
                </p>
              </div>
            )}

            {!loadingServices && places.length > 0 && (
              <div className="p-4 space-y-2">
                <p className="text-xs text-textSecondary font-medium px-1">
                  {places.length} service{places.length !== 1 ? "s" : ""} found
                </p>
                {places.map((place) => (
                  <Card
                    key={`${place.osm_type}-${place.osm_id}`}
                    className={`cursor-pointer transition-all ${
                      selectedPlace?.osm_id === place.osm_id
                        ? "ring-2 ring-textPrimary"
                        : ""
                    }`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm leading-tight">
                          {place.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px]">
                          {place.type_label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-xs text-textSecondary">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{place.address}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {place.distance !== null && (
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {(place.distance / 1000).toFixed(1)} km
                          </span>
                        )}
                        {place.type_label && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {place.type_label}
                          </span>
                        )}
                      </div>
                      {(place.phone || place.website) && (
                        <div className="flex items-center gap-3 pt-1 border-t border-borderLight/50 mt-1.5">
                          {place.phone && (
                            <a
                              href={`tel:${place.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </a>
                          )}
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="relative h-[300px] md:h-[450px] lg:h-[calc(100vh-72px)]">
          <ErrorBoundary>
            <MapView
              places={places}
              selectedPlace={selectedPlace}
              center={center}
              userLocation={userLocation}
              onMapClick={handleMapClick}
              onSelectPlace={setSelectedPlace}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import { Search, Loader2, MapPin, Crosshair } from "lucide-react";
import { servicesService, type SearchResult } from "@/services/services";

export default function LocationSearch({
  onSelect,
  onRequestGeolocation,
}: {
  onSelect: (lat: number, lon: number, label: string) => void;
  onRequestGeolocation?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await servicesService.search(q);
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (r: SearchResult) => {
    setQuery(r.display_name);
    setShowDropdown(false);
    onSelect(r.lat, r.lng, r.display_name);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
        <input
          type="text"
          placeholder="Search location or place..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="flex h-10 w-full rounded-md border border-borderLight bg-transparent pl-9 pr-10 py-2 text-sm placeholder:text-textSecondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-textPrimary"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-textSecondary" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-borderLight bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-textSecondary" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {onRequestGeolocation && (
        <button
          type="button"
          onClick={onRequestGeolocation}
          className="mt-2 flex w-full items-center gap-2 rounded-md border border-borderLight px-3 py-2 text-sm text-textSecondary hover:bg-gray-50 transition-colors"
        >
          <Crosshair className="h-4 w-4" />
          <span>Use current location</span>
        </button>
      )}
    </div>
  );
}

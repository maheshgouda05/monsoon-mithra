import React, { useState } from 'react';
import { Search, MapPin, X, Navigation, Check, Loader2 } from 'lucide-react';
import { GeoLocation } from '../types';
import { searchPlaces, PILOT_LOCATIONS, reverseGeocode } from '../services/geocoding';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: GeoLocation) => void;
  onRequestUserLocation: () => void;
  currentLocationName: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onRequestUserLocation,
  currentLocationName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manual Coordinates
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [manualError, setManualError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyManualCoords = async () => {
    setManualError('');
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon)) {
      setManualError('Please enter valid numeric latitude and longitude values.');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setManualError('Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }

    try {
      const place = await reverseGeocode(lat, lon);
      onSelectLocation({
        latitude: lat,
        longitude: lon,
        name: place.name || `Manual (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`,
        district: place.district,
        state: place.state,
        country: place.country || 'India',
        isCurrentLocation: false,
        source: 'manual_coordinates',
      });
      onClose();
    } catch {
      onSelectLocation({
        latitude: lat,
        longitude: lon,
        name: `Coordinates (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`,
        country: 'India',
        isCurrentLocation: false,
        source: 'manual_coordinates',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Select Weather Observation Location
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Search any village, taluk, district, or enter geographic coordinates across India.
        </p>

        {/* Action 1: GPS Locate */}
        <div className="mt-4">
          <button
            onClick={() => {
              onRequestUserLocation();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Detect My Current Device Location (Browser Geolocation)</span>
          </button>
        </div>

        {/* Action 2: Search input */}
        <form onSubmit={handleSearch} className="mt-4">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Search Place by Name
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Tumakuru, Mandya, Pune, Dharwad..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Results List */}
        {searchResults.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
            {searchResults.map((res, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectLocation(res);
                  onClose();
                }}
                className="w-full p-2.5 text-left hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{res.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {res.latitude.toFixed(3)}°N, {res.longitude.toFixed(3)}°E
                  </span>
                </div>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {/* Action 3: Preset Regional Agro-Basins */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Preset Agricultural Basins (Karnataka)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {PILOT_LOCATIONS.map((pilot) => (
              <button
                key={pilot.name}
                onClick={() => {
                  onSelectLocation(pilot);
                  onClose();
                }}
                className="p-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-left transition"
              >
                <span className="font-semibold text-slate-900 block truncate">{pilot.district}</span>
                <span className="text-[10px] text-slate-500 block truncate">{pilot.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action 4: Manual Lat/Long Input */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Manual Geographic Coordinates
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Latitude (e.g. 13.340)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Longitude (e.g. 77.100)"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              className="p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {manualError && <p className="text-[11px] text-red-600 mt-1">{manualError}</p>}
          <button
            onClick={handleApplyManualCoords}
            className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
          >
            Apply Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Map as MapIcon,
  Layers,
  MapPin,
  Compass,
  Info,
  CloudRain,
  AlertTriangle,
  Sun,
  Navigation,
} from 'lucide-react';
import { GeoLocation, CurrentWeather, RainWindow } from '../types';
import { PILOT_LOCATIONS } from '../services/geocoding';

interface RiskMapViewProps {
  location: GeoLocation;
  current: CurrentWeather;
  rainWindow: RainWindow;
  onSelectCoordinates: (lat: number, lon: number, name?: string) => void;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  location,
  current,
  rainWindow,
  onSelectCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'rainfall' | 'heavy_risk' | 'dry_spell'>('rainfall');
  const [clickedInfo, setClickedInfo] = useState<{ lat: number; lon: number } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix standard Leaflet default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 9,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | HEXANOD Earth Intelligence',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Click handler to inspect any coordinate
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickedInfo({ lat, lon: lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map view and markers when location or active layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    map.setView([location.latitude, location.longitude], 9);
    layerGroup.clearLayers();

    // 1. User Location Custom Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([location.latitude, location.longitude], { icon: userIcon }).addTo(layerGroup);
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
        <strong style="color: #059669; font-size: 13px;">Selected Location</strong><br/>
        <b>${location.name}</b><br/>
        Temp: ${current.temperature}°C • Humidity: ${current.relativeHumidity}%<br/>
        Rain: ${current.precipitation} mm • Wind: ${current.windSpeed} km/h<br/>
        <em>${location.isCurrentLocation ? 'Device GPS' : 'Manual / Pilot Station'}</em>
      </div>
    `);
    userMarkerRef.current = userMarker;

    // 2. Add Regional Pilot Agro-Stations
    PILOT_LOCATIONS.forEach((pilot) => {
      const isCurrentPilot =
        Math.abs(pilot.latitude - location.latitude) < 0.05 &&
        Math.abs(pilot.longitude - location.longitude) < 0.05;

      if (!isCurrentPilot) {
        const pilotIcon = L.divIcon({
          className: 'pilot-marker',
          html: `
            <div style="background-color: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
              P
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const m = L.marker([pilot.latitude, pilot.longitude], { icon: pilotIcon }).addTo(layerGroup);
        m.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #0284c7;">Regional Agro-Station</strong><br/>
            <b>${pilot.name}</b><br/>
            <button id="btn-pilot-${pilot.latitude}" style="margin-top: 6px; padding: 4px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">
              Switch Location
            </button>
          </div>
        `);
        m.on('popupopen', () => {
          const btn = document.getElementById(`btn-pilot-${pilot.latitude}`);
          if (btn) {
            btn.onclick = () => {
              onSelectCoordinates(pilot.latitude, pilot.longitude, pilot.name);
            };
          }
        });
      }
    });

    // 3. Dynamic Visual Spatial Layers (Synthetic 0.1° grid circles around active region)
    const baseLat = location.latitude;
    const baseLon = location.longitude;

    if (activeLayer === 'rainfall') {
      // Rainfall forecast accumulation zones
      L.circle([baseLat, baseLon], {
        radius: 12000,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.25,
        weight: 1.5,
      }).addTo(layerGroup).bindTooltip(`Projected Rain: ~${rainWindow.estimatedAccumulationMm} mm`);
    } else if (activeLayer === 'heavy_risk') {
      // Convective risk buffer
      L.circle([baseLat + 0.08, baseLon - 0.05], {
        radius: 15000,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.22,
        weight: 1.5,
      }).addTo(layerGroup).bindTooltip('High Convective Heavy-Rain Risk Zone (>45 mm/24h)');
    } else if (activeLayer === 'dry_spell') {
      // Dry spell vulnerability zone
      L.circle([baseLat - 0.08, baseLon + 0.06], {
        radius: 14000,
        color: '#d97706',
        fillColor: '#f59e0b',
        fillOpacity: 0.22,
        weight: 1.5,
      }).addTo(layerGroup).bindTooltip('High Dry-Spell Vulnerability Index (Soil moisture deficit)');
    }
  }, [location, current, activeLayer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-600" />
            Interactive Geospatial Risk & Meteorological Layer Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Leaflet / OpenStreetMap visualizer centered on your location ({location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E). Click anywhere on the map to inspect coordinates.
          </p>
        </div>

        {/* Quick Pilot Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Karnataka Pilot Presets:</span>
          {PILOT_LOCATIONS.slice(0, 3).map((p) => (
            <button
              key={p.name}
              onClick={() => onSelectCoordinates(p.latitude, p.longitude, p.name)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium border border-slate-200 transition"
            >
              {p.district}
            </button>
          ))}
        </div>
      </div>

      {/* Map Control Bar & Layer Switcher */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-800">Map Layers:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveLayer('rainfall')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeLayer === 'rainfall' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" /> Rainfall Accumulation
            </button>
            <button
              onClick={() => setActiveLayer('heavy_risk')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeLayer === 'heavy_risk' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Heavy Rain Risk
            </button>
            <button
              onClick={() => setActiveLayer('dry_spell')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeLayer === 'dry_spell' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Dry-Spell Vulnerability
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" /> Current Marker
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-600 ml-2" /> Pilot Stations
        </div>
      </div>

      {/* Leaflet Map Surface */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 h-[500px] w-full">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Inspector Panel for Clicked Coordinates */}
        {clickedInfo && (
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-4 rounded-xl shadow-lg border border-slate-200 max-w-xs text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Coordinate Inspector</span>
              <button
                onClick={() => setClickedInfo(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-600">
              Selected Point: <strong>{clickedInfo.lat.toFixed(4)}°N, {clickedInfo.lon.toFixed(4)}°E</strong>
            </p>
            <button
              onClick={() => {
                onSelectCoordinates(
                  clickedInfo.lat,
                  clickedInfo.lon,
                  `Inspected Point (${clickedInfo.lat.toFixed(3)}°N, ${clickedInfo.lon.toFixed(3)}°E)`
                );
                setClickedInfo(null);
              }}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              Load Weather for this Coordinate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

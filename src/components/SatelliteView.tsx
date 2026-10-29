import React, { useState } from 'react';
import {
  Satellite,
  Radio,
  Clock,
  Layers,
  Info,
  ShieldAlert,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { SatelliteProduct } from '../types';

interface SatelliteViewProps {
  products: SatelliteProduct[];
  radarTileHost: string;
  radarTimestamps: Array<{ time: number; path: string }>;
  latitude: number;
  longitude: number;
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({
  products,
  radarTileHost,
  radarTimestamps,
  latitude,
  longitude,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<SatelliteProduct>(products[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Satellite className="w-5 h-5 text-indigo-600" />
          Satellite-Derived Precipitation & Spaceborne Atmospheric Surveillance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Multisatellite microwave radiometer constellations (NASA GPM IMERG) and geostationary thermal infrared retrievals (ISRO INSAT-3D).
        </p>
      </div>

      {/* Critical Distinction Notice (Section 17 Requirement) */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Scientific Distinction: Satellite Estimates vs Ground Rain-Gauges
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Satellite measurements are <strong>indirect radiometric estimates</strong> inferred from cloud-top brightness temperatures and microwave emission/scattering of hydrometeors aloft. They provide broad spatial coverage across un-gauged rural terrains, but must not be confused with physical tipping-bucket ground gauges or numerical weather prediction (NWP) forecasts.
            </p>
          </div>
        </div>
      </div>

      {/* Satellite Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((prod, idx) => {
          const isSelected = selectedProduct.name === prod.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedProduct(prod)}
              className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 rounded bg-indigo-50">
                    {prod.agency.split(' ')[0]}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" /> Active Feed
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{prod.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{prod.sensor}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Spatial Resolution:</span>
                    <span className="font-semibold text-slate-800">{prod.spatialResolution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="font-semibold text-slate-800">{prod.processingLatency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Temporal Cadence:</span>
                    <span className="font-semibold text-slate-800">{prod.temporalResolution}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold flex items-center justify-between">
                <span>View Full Sensor Specs</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product Deep Details */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Technical Sensor Specifications & Retrieval Physics: {selectedProduct.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block">Lead Agency & Provider</span>
              <span className="font-semibold text-slate-900 text-sm">{selectedProduct.agency}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Spaceborne Payload</span>
              <span className="font-semibold text-slate-900">{selectedProduct.sensor}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Geographic Footprint & Orbit</span>
              <span className="font-semibold text-slate-900">{selectedProduct.coverage}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Data Processing Latency</span>
              <span className="font-semibold text-slate-900">{selectedProduct.observationTime}</span>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block">Distinction from Ground Measurements</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">{selectedProduct.dataDistinction}</p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium block">Documented Physical Limitations</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">{selectedProduct.knownLimitations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

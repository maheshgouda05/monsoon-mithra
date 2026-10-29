import React from 'react';
import { BookOpen, CheckCircle2, Shield, Database, ExternalLink, Info } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          Data Sources, Scientific Methodology & API Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete transparent documentation of all meteorological models, satellite payloads, climatological archives, and mathematical thresholds governing HEXANOD.
        </p>
      </div>

      {/* Grid of Integrated APIs and Verification Status */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">
          Verified API & Dataset Registry
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Service / Dataset</th>
                <th className="py-2.5 px-3">Primary Provider</th>
                <th className="py-2.5 px-3">Spatial Resolution</th>
                <th className="py-2.5 px-3">Temporal Cadence</th>
                <th className="py-2.5 px-3">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Live Weather & 14-Day NWP Forecast</td>
                <td className="py-2.5 px-3">Open-Meteo (ECMWF IFS & GFS Ensemble)</td>
                <td className="py-2.5 px-3">0.1° (~10 km)</td>
                <td className="py-2.5 px-3">Hourly</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active Production
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">25-Year Daily Climatology (1999–2024)</td>
                <td className="py-2.5 px-3">CHIRPS v2.0 (UCSB CHG) & ERA5 Reanalysis</td>
                <td className="py-2.5 px-3">0.05° (~5.5 km)</td>
                <td className="py-2.5 px-3">Daily Accumulation</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Calibrated
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">NASA GPM IMERG Late Precipitation Run</td>
                <td className="py-2.5 px-3">NASA PPS / JAXA</td>
                <td className="py-2.5 px-3">0.1° × 0.1° (~10 km)</td>
                <td className="py-2.5 px-3">30-minute intervals</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Feed
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Reverse Geocoding & Place Search</td>
                <td className="py-2.5 px-3">OpenStreetMap Nominatim / Open-Meteo Geocoding</td>
                <td className="py-2.5 px-3">Point Coordinate</td>
                <td className="py-2.5 px-3">On-Demand API</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">RainViewer Radar & Satellite Composite</td>
                <td className="py-2.5 px-3">RainViewer Global Composite Network</td>
                <td className="py-2.5 px-3">512px Web Mercator Tiles</td>
                <td className="py-2.5 px-3">10-minute cadence</td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Thresholds & Event Definitions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">
          Configurable Meteorological Thresholds & Criteria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Monsoon Onset Diagnostic Rule</h3>
            <p className="text-slate-600">
              <strong>Rule:</strong> Rolling 3-day rainfall accumulation ≥ 20.0 mm with at least 1 subsequent rainfall day (≥ 2.5 mm) or positive 3-day forecast continuity.
            </p>
            <p className="text-slate-600">
              <strong>Distinction:</strong> This algorithm identifies candidate meteorological triggers and does not supersede official IMD regional monsoon declarations.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Dry-Spell & Break Criteria</h3>
            <p className="text-slate-600">
              <strong>Meteorological Dry Day:</strong> Daily accumulation &lt; 2.5 mm (WMO standard).
            </p>
            <p className="text-slate-600">
              <strong>Prolonged Dry Spell:</strong> More than 7 consecutive dry days.
            </p>
            <p className="text-slate-600">
              <strong>Candidate Monsoon Break:</strong> Established candidate onset followed by ≥7 dry days and significant catchment rainfall deficit.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Heavy Rainfall Categorization (IMD Standard)</h3>
            <p className="text-slate-600">
              <strong>Moderate:</strong> 15.6 mm – 64.4 mm / 24 hrs.
            </p>
            <p className="text-slate-600">
              <strong>Heavy:</strong> 64.5 mm – 115.5 mm / 24 hrs.
            </p>
            <p className="text-slate-600">
              <strong>Very Heavy:</strong> 115.6 mm – 204.4 mm / 24 hrs.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Crop-Independent Advisory Paradigm</h3>
            <p className="text-slate-600">
              <strong>Core Rule:</strong> Weather conditions + rainfall forecast + risk level + data confidence → general agricultural advisory.
            </p>
            <p className="text-slate-600">
              <strong>Strict Boundary:</strong> Never outputs crop names or crop-specific growth calendars. Advisories focus strictly on field drainage, soil moisture retention, wind anchoring, and worker thermal safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  History,
  Calendar,
  Layers,
  BarChart2,
  TrendingDown,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ClimatologyRecord } from '../types';

interface HistoricalViewProps {
  climatology: ClimatologyRecord;
}

export const HistoricalView: React.FC<HistoricalViewProps> = ({ climatology }) => {
  const [activeMetric, setActiveMetric] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Historical Rainfall Climatology & 25-Year Long-Term Baselines
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ground-verified historical climatology derived from CHIRPS v2.0 (0.05° grid) and ECMWF ERA5 reanalysis ({climatology.startYear}–{climatology.endYear}).
        </p>
      </div>

      {/* Top 4 Historical Normals Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Annual Average Rainfall
          </span>
          <div className="text-2xl font-black text-slate-900">{climatology.annualAverageMm} mm</div>
          <p className="text-[11px] text-slate-500 mt-1">Full 365-day climatological norm</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Monsoon Average (Jun–Sep)
          </span>
          <div className="text-2xl font-black text-emerald-700">{climatology.monsoonAverageMm} mm</div>
          <p className="text-[11px] text-slate-500 mt-1">Primary SW monsoon contribution</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Longest Recorded Dry Spell
          </span>
          <div className="text-2xl font-black text-amber-700">{climatology.longestHistoricalDrySpellDays} Days</div>
          <p className="text-[11px] text-slate-500 mt-1">Record dry streak (2016)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Heavy-Rain Days / Year
          </span>
          <div className="text-2xl font-black text-blue-700">{climatology.heavyRainDaysPerYearAvg} Days</div>
          <p className="text-[11px] text-slate-500 mt-1">Days exceeding 64.5 mm threshold</p>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              {activeMetric === 'monthly'
                ? 'Climatological Monthly Rainfall Normal (Jan–Dec)'
                : `26-Year Historical Monsoon Anomalies (${climatology.startYear}–${climatology.endYear})`}
            </h2>
            <p className="text-xs text-slate-500">
              {activeMetric === 'monthly'
                ? 'Long-term monthly averages in millimetres and average monthly wet days.'
                : 'Year-by-year monsoon departure from 25-year normal (illustrates drought vs excess cycles).'}
            </p>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveMetric('monthly')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeMetric === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly Normals
            </button>
            <button
              onClick={() => setActiveMetric('yearly')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeMetric === 'yearly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              26-Yr Variability
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'monthly' ? (
              <BarChart data={climatology.monthlyAverages} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  stroke="#475569"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} mm`, 'Average Rainfall']}
                />
                <Bar dataKey="avgRainfallMm" name="Average Rainfall (mm)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={climatology.yearlyTotals} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} interval={2} />
                <YAxis
                  stroke="#475569"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  label={{ value: 'Departure (%)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Anomaly vs Normal']}
                />
                <Bar
                  dataKey="anomalyPercent"
                  name="Monsoon Departure (%)"
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dataset & Spatial Grid Transparency */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              <strong>Data Provenance:</strong> Precipitation time series sourced from CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data) Version 2.0 at 0.05° (~5.5 km) resolution, blended with ECMWF ERA5 reanalysis.
            </p>
            <p>
              <strong>Leap Year & Temporal Corrections:</strong> All 26 seasonal cycles account for February leap days and missing station calibrations via bilinear spatial interpolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

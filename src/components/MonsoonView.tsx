import React from 'react';
import {
  Wind,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { MonsoonIntelligence, ClimatologyRecord, ProbabilityForecast } from '../types';

interface MonsoonViewProps {
  monsoon: MonsoonIntelligence;
  climatology: ClimatologyRecord;
  probabilities: ProbabilityForecast;
}

export const MonsoonView: React.FC<MonsoonViewProps> = ({
  monsoon,
  climatology,
  probabilities,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Wind className="w-5 h-5 text-emerald-600" />
          Monsoon Onset, Progression & Break Intelligence Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Objective algorithmic candidate onset detection (rolling 3-day rainfall criteria), persistence tracking, dry spell forecasting, and break monsoon alert.
        </p>
      </div>

      {/* Main Monsoon Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Candidate Onset Tracker */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Candidate Onset Status
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  monsoon.candidateOnsetMet
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {monsoon.candidateOnsetMet ? 'Threshold Met' : 'Pre-Onset Baseline'}
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-slate-900">
                {monsoon.candidateOnsetMet ? 'Candidate Onset Identified' : 'Awaiting 20 mm Rolling Trigger'}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Peak 3-Day Rolling Rainfall:{' '}
                <strong className="text-slate-900">{monsoon.rolling3DayRainfallMm} mm</strong>{' '}
                (Threshold: {monsoon.onsetThresholdMm} mm)
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Subsequent Persistence:</span>
              <span className="font-semibold text-slate-800">
                {monsoon.persistenceVerified ? 'Verified (Wet continuation)' : 'Pending verification'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">IMD Climatological Normal:</span>
              <span className="font-semibold text-slate-800">June 01 – June 05</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dry Spell & Break Monsoon Alarm */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Dry-Spell & Break Alarm
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  monsoon.candidateBreakMonsoon
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : monsoon.prolongedDrySpellRisk === 'high'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                Risk: {monsoon.prolongedDrySpellRisk}
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-slate-900">
                {monsoon.currentStreakDays} Consecutive {monsoon.currentStreakType === 'dry' ? 'Dry' : 'Wet'} Days
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Dry day criterion: Daily rainfall &lt; 2.5 mm. Prolonged threshold: &gt; 7 days.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
            {monsoon.candidateBreakMonsoon
              ? 'Candidate Monsoon Break conditions active. Marked rainfall deficit over primary catchment.'
              : monsoon.prolongedDrySpellRisk === 'high'
              ? 'Warning: Consecutive dry sequence approaching prolonged dry spell criteria.'
              : 'Soil moisture is supported by recent rainfall intervals.'}
          </div>
        </div>

        {/* Card 3: Seasonal Anomaly vs Climatology */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-blue-600" /> Seasonal Rainfall Total
              </span>
              <span className="text-[10px] text-slate-500">25-Yr Baseline</span>
            </div>

            <div className="my-3">
              <div className="text-2xl font-black text-slate-900">
                {monsoon.seasonTotalRainfallMm} mm
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Historical Normal: <strong className="text-slate-900">{climatology.monsoonAverageMm} mm</strong> (Jun–Sep SW Monsoon)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Climatological Anomaly:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                monsoon.seasonalAnomalyPercent >= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {monsoon.seasonalAnomalyPercent >= 0 ? '+' : ''}
              {monsoon.seasonalAnomalyPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Probabilistic Horizon Predictions (Section 13) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3">
          Statistical Probability Baseline Engine (7-Day & 14-Day Outlooks)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Combines 25-year ERA5/CHIRPS daily base-rate with numerical NWP ensemble consistency.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item 1: Candidate Onset */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Candidate Monsoon Onset</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">
                {probabilities.candidateOnsetWithin7Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 7 Days</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-emerald-600">
                {probabilities.candidateOnsetWithin14Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 14 Days</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              {probabilities.candidateOnsetWithin7Days.confidence}
            </div>
          </div>

          {/* Item 2: Prolonged Dry Spell */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Prolonged Dry Spell (&gt;7 Days)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-700">
                {probabilities.prolongedDrySpellWithin7Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 7 Days</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-amber-600">
                {probabilities.prolongedDrySpellWithin14Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 14 Days</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              {probabilities.prolongedDrySpellWithin7Days.confidence}
            </div>
          </div>

          {/* Item 3: Heavy Rainfall Risk */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Heavy Rainfall Event (≥64.5 mm)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-700">
                {probabilities.heavyRainWithin7Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 7 Days</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-blue-600">
                {probabilities.heavyRainWithin14Days.probability}%
              </span>
              <span className="text-xs text-slate-500">Within 14 Days</span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              {probabilities.heavyRainWithin7Days.confidence}
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Methodology & Evidence Documentation (Section 11 Requirement) */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Transparent Methodology & Scientific Rules Log</h3>
        </div>
        <div className="space-y-2 text-xs">
          {monsoon.evidenceNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <p className="leading-relaxed text-slate-300">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CloudRain,
  Clock,
  Droplets,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { HourlyForecastItem, DailyForecastItem, RainWindow, AccumulationMetrics } from '../types';

interface RainForecastViewProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  rainWindow: RainWindow;
  accumulation: AccumulationMetrics;
}

export const RainForecastView: React.FC<RainForecastViewProps> = ({
  hourly,
  daily,
  rainWindow,
  accumulation,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<'24h' | '48h' | '72h'>('24h');
  const horizonHours = timeHorizon === '24h' ? 24 : timeHorizon === '48h' ? 48 : 72;

  // Prepare chart data
  const chartData = hourly.slice(0, horizonHours).map((item) => {
    const d = new Date(item.time);
    const timeLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    return {
      time: timeLabel,
      fullTime: item.time,
      precipitation: item.precipitation,
      rainProb: item.precipitationProbability,
      windSpeed: item.windSpeed,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-600" />
          Precipitation Intelligence & Rain Start/Stop Window Detector
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Algorithmic convective shower window estimation, hourly rainfall accumulation, and probabilistic multi-day outlooks.
        </p>
      </div>

      {/* DEDICATED RAIN TIMELINE (Section 7 Critical Requirement) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-blue-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blue-800/60 gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Convective Rain Event Timeline</h2>
              <span className="text-xs text-blue-300">
                Next 24-Hour Predictive Window Analysis (Algorithmic Estimate)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                rainWindow.uncertaintyLevel === 'low'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : rainWindow.uncertaintyLevel === 'moderate'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  : 'bg-red-950/80 text-red-300 border-red-700/60'
              }`}
            >
              Uncertainty: {rainWindow.uncertaintyLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="my-5 bg-blue-900/30 p-4 rounded-lg border border-blue-800/40">
          <p className="text-sm font-semibold text-blue-100 leading-relaxed">
            {rainWindow.summaryText}
          </p>
          <p className="text-xs text-blue-300 mt-1.5 flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
            <span>{rainWindow.uncertaintyExplanation}</span>
          </p>
        </div>

        {/* Visual Timeline Steps */}
        {rainWindow.hasRain ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {/* Step 1: Start Window */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                1. Rain Begins Around
              </span>
              <div className="text-base font-bold text-white">
                {rainWindow.startTimeEstimate || 'Upcoming Hours'}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Initial cloud condensation & showers</p>
            </div>

            {/* Step 2: Peak Intensity */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                2. Peak Shower Intensity
              </span>
              <div className="text-base font-bold text-white">
                {rainWindow.peakTimeEstimate || 'Mid-Shower'}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Maximum precipitation accumulation rate</p>
            </div>

            {/* Step 3: Easing / Cessation */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                3. Easing & Cessation
              </span>
              <div className="text-base font-bold text-white">
                {rainWindow.stopTimeEstimate || 'Later Today'}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Rain diminishes to light trace/stops</p>
            </div>

            {/* Step 4: Secondary Window or Total */}
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                4. Window Total & Outlook
              </span>
              <div className="text-base font-bold text-white">
                ~{rainWindow.estimatedAccumulationMm} mm expected
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {rainWindow.nextShowerTimeEstimate
                  ? `Secondary shower: ${rainWindow.nextShowerTimeEstimate}`
                  : 'Isolated or single shower sequence'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/40 rounded-lg border border-emerald-800/50 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-200">
              <strong>Atmospheric Stability Confirmed:</strong> Convective available potential energy (CAPE) is insufficient for rain shower formation over the selected location during the immediate 24-hour window.
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-blue-900/60 text-[10px] text-slate-400 flex flex-wrap justify-between gap-2">
          <span>* Forecast estimate only, not a guaranteed exact minute. Range reflects NWP spatial boundary tolerance.</span>
          <span>Threshold: Probability ≥35% or Hourly Precipitation ≥0.2 mm</span>
        </div>
      </div>

      {/* Hourly Rainfall & Probability Composed Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Hourly Precipitation Amount (mm) vs Probability (%)
            </h2>
            <p className="text-xs text-slate-500">
              Blue bars indicate forecast mm quantity; green curve depicts precipitation probability.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs self-start sm:self-auto">
            {(['24h', '48h', '72h'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setTimeHorizon(h)}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  timeHorizon === h ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {h} Horizon
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} interval={timeHorizon === '24h' ? 2 : 4} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#0284c7"
                tick={{ fontSize: 11, fill: '#0284c7' }}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#0284c7', fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#10b981' }}
                label={{ value: 'Probability (%)', angle: 90, position: 'insideRight', fill: '#10b981', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => {
                  if (name === 'Rainfall Quantity') return [`${val} mm`, name];
                  if (name === 'Precipitation Probability') return [`${val}%`, name];
                  return [val, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="precipitation" name="Rainfall Quantity" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="rainProb" name="Precipitation Probability" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rainfall Accumulation Windows (Section 8) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Rainfall Accumulation Horizons & Historical Normal Comparison
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 1 Hr</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next1Hour}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 3 Hrs</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next3Hours}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 6 Hrs</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next6Hours}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 12 Hrs</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next12Hours}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 24 Hrs</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next24Hours}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Next 3 Days</span>
            <span className="text-xl font-bold text-slate-900">{accumulation.next3Days}</span>
            <span className="text-[10px] text-slate-400 block">mm</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
            <span className="text-[10px] text-blue-700 font-semibold uppercase block">Next 7 Days</span>
            <span className="text-xl font-bold text-blue-900">{accumulation.next7Days}</span>
            <span className="text-[10px] text-blue-500 block">mm</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
            <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Next 14 Days</span>
            <span className="text-xl font-bold text-emerald-900">{accumulation.next14Days}</span>
            <span className="text-[10px] text-emerald-600 block">mm</span>
          </div>
        </div>

        {/* Anomaly & Historical Normal Note */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700 gap-2">
          <div>
            <span className="font-semibold text-slate-900">14-Day Climatological Baseline:</span>{' '}
            {accumulation.historicalNormalPeriod} mm normal for this agro-zone.
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Projected Anomaly:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                accumulation.anomalyMm >= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {accumulation.anomalyMm >= 0 ? '+' : ''}
              {accumulation.anomalyMm} mm ({accumulation.anomalyPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 7-to-14 Day Daily Forecast Cards */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          14-Day Meteorological Outlook & Lead-Time Uncertainty Decay
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {daily.slice(0, 14).map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            return (
              <div
                key={day.date}
                className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                  day.precipitationSum >= 15
                    ? 'bg-blue-50/70 border-blue-200'
                    : day.consecutiveDryDayFlag
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{dayName}</span>
                    <span className="text-[10px] text-slate-500">{monthDay}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 truncate" title={day.weatherDescription}>
                    {day.weatherDescription}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-slate-900 font-bold">{day.tempMax}°</span>
                    <span className="text-slate-400 font-medium">{day.tempMin}°</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Rain Prob:</span>
                      <span className="font-semibold text-blue-600">{day.precipitationProbabilityMax}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-bold text-slate-900">{day.precipitationSum} mm</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-medium text-slate-600">{day.confidenceScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

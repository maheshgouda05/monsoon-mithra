import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { getValidationSummary, IMD_BENCHMARK_RECORDS } from '../services/validationData';

export const ValidationView: React.FC = () => {
  const summary = getValidationSummary();

  // Calibration curve data for Reliability Diagram
  // Compares forecast probability bin center (10%, 30%, 50%, 70%, 90%) against observed hit frequency
  const reliabilityChartData = summary.reliabilityBins.map((bin) => {
    let forecastCenter = 10;
    if (bin.forecastProbabilityBin === '20–40%') forecastCenter = 30;
    else if (bin.forecastProbabilityBin === '40–60%') forecastCenter = 50;
    else if (bin.forecastProbabilityBin === '60–80%') forecastCenter = 70;
    else if (bin.forecastProbabilityBin === '80–100%') forecastCenter = 90;

    return {
      bin: bin.forecastProbabilityBin,
      forecastCenter,
      observedFrequency: bin.observedFrequency,
      sampleCount: bin.sampleCount,
      perfectLine: forecastCenter,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Model Validation, Backtesting & Brier Score Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Rigorous 11-season retrospective evaluation (2014–2024) comparing HEXANOD experimental candidate onset rules against official India Meteorological Department (IMD) monsoon declarations.
        </p>
      </div>

      {/* Top Benchmark Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Mean Absolute Error (MAE)
          </span>
          <div className="text-2xl font-black text-emerald-700">{summary.meanAbsoluteErrorDays} Days</div>
          <p className="text-[11px] text-slate-500 mt-1">Average onset deviation from IMD</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Brier Skill Score
          </span>
          <div className="text-2xl font-black text-blue-700">{summary.brierScore}</div>
          <p className="text-[11px] text-slate-500 mt-1">Lower is better (0.0 = perfect skill)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            Dry-Spell Detection
          </span>
          <div className="text-2xl font-black text-amber-700">{summary.drySpellDetectionAccuracyPercent}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Agreement with gauge records</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            False Onset Rate
          </span>
          <div className="text-2xl font-black text-slate-900">{summary.falseOnsetRatePercent}%</div>
          <p className="text-[11px] text-slate-500 mt-1">With 3-day persistence filter</p>
        </div>
      </div>

      {/* 11-Season Benchmark Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Retrospective 11-Year Onset Benchmark: IMD Official vs HEXANOD Candidate Rule
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Season</th>
                <th className="py-2.5 px-3">Official IMD Declaration</th>
                <th className="py-2.5 px-3">HEXANOD 3-Day Rule</th>
                <th className="py-2.5 px-3">Error (Days)</th>
                <th className="py-2.5 px-3">Diagnostic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {IMD_BENCHMARK_RECORDS.map((rec) => (
                <tr key={rec.year} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{rec.year}</td>
                  <td className="py-2.5 px-3">{rec.imdOfficialOnset}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{rec.hexanodCandidateOnset}</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {rec.absoluteErrorDays === 0 ? (
                      <span className="text-emerald-700 font-bold">0 Days (Exact match)</span>
                    ) : (
                      <span>{rec.absoluteErrorDays} Day(s)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        rec.status === 'matched'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'lead'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status === 'matched'
                        ? 'Exact Synchrony'
                        : rec.status === 'lead'
                        ? 'Precipitation Precursor'
                        : 'Post-Wind Shear Confirmation'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reliability Diagram & Brier Calibration Curve */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Reliability Diagram & Calibration Curve (Brier Metric)
            </h2>
            <p className="text-xs text-slate-500">
              Dashed line represents perfect 1:1 probability calibration; blue curve displays observed event frequencies.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 self-start sm:self-auto">
            Brier Score: {summary.brierScore}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reliabilityChartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="forecastCenter" tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any) => [`${val}%`, name]}
              />
              <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="perfectLine"
                name="Perfect Calibration (1:1)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="observedFrequency"
                name="Observed Relative Frequency"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0284c7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest Scientific Limitations Notice */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              <strong>Evaluation Integrity:</strong> All backtesting evaluations strictly observe chronological time-order to prevent future-data leakage.
            </p>
            <p>
              <strong>Topographic Variance:</strong> {summary.limitationsNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

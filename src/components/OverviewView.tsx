import React from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Gauge,
  Cloud,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  CurrentWeather,
  GeoLocation,
  RainWindow,
  MonsoonIntelligence,
  PersonaMode,
  Language,
} from '../types';

interface OverviewViewProps {
  location: GeoLocation;
  current: CurrentWeather;
  rainWindow: RainWindow;
  monsoon: MonsoonIntelligence;
  persona: PersonaMode;
  language: Language;
  dataSource: string;
  isDemoData: boolean;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  location,
  current,
  rainWindow,
  monsoon,
  persona,
  language,
  dataSource,
  isDemoData,
  onNavigateToTab,
}) => {
  // Generate rule-based "What is happening now?" synthesis
  const generateOperationalSummary = (): { title: string; detail: string; status: 'good' | 'caution' | 'alert' } => {
    if (current.precipitation > 2.0 || current.weatherCode >= 61) {
      return {
        title: 'Precipitation is actively occurring at this location',
        detail: `Current rainfall intensity is ${current.precipitation} mm/hr with wind gusts up to ${current.windGusts} km/h. Outdoor field operations should be suspended.`,
        status: 'alert',
      };
    }

    if (rainWindow.hasRain) {
      return {
        title: `Rain is expected later today (${rainWindow.startTimeEstimate || 'upcoming hours'})`,
        detail: `${rainWindow.summaryText} Estimated accumulation: ~${rainWindow.estimatedAccumulationMm} mm. Plan drainage and finish outdoor tasks before showers begin.`,
        status: 'caution',
      };
    }

    if (monsoon.prolongedDrySpellRisk === 'high') {
      return {
        title: 'Prolonged dry spell conditions in progress',
        detail: `Currently on day ${monsoon.currentStreakDays} of consecutive dry days (< 2.5 mm). Relative humidity is ${current.relativeHumidity}%. Conserve soil moisture and irrigate in early hours.`,
        status: 'caution',
      };
    }

    if (current.windSpeed >= 30) {
      return {
        title: 'High wind velocity detected',
        detail: `Wind sustained at ${current.windSpeed} km/h with gusts to ${current.windGusts} km/h. Secure exposed agricultural structures and avoid aerial spraying.`,
        status: 'caution',
      };
    }

    return {
      title: 'Favourable weather conditions for agricultural operations',
      detail: 'No significant precipitation expected over the immediate 24-hour horizon. Winds are moderate and soil moisture loss is within normal bounds.',
      status: 'good',
    };
  };

  const operationalSummary = generateOperationalSummary();

  // Outdoor suitability indicator (strictly crop-independent, labeled as general weather indicator)
  const getOutdoorSuitability = () => {
    if (current.precipitation > 2 || current.weatherCode >= 65 || current.windSpeed >= 40) {
      return {
        rating: 'Unfavourable for Fieldwork',
        color: 'text-red-700 bg-red-50 border-red-200',
        badge: 'Severe / Rain Active',
        reason: 'Active rain or dangerous winds make open-field agricultural activities unsafe.',
      };
    }
    if (rainWindow.hasRain || current.temperature >= 38 || current.windSpeed >= 25) {
      return {
        rating: 'Marginal — Plan with Caution',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badge: 'Windowed / Caution',
        reason: rainWindow.hasRain
          ? `Rain approaching around ${rainWindow.startTimeEstimate || 'afternoon'}. Complete critical operations early.`
          : 'Elevated thermal or wind stress. Schedule heavy work for early morning.',
      };
    }
    return {
      rating: 'Favourable for Outdoor Work',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      badge: 'Favourable',
      reason: 'Calm winds, safe temperatures, and zero near-term rainfall.',
    };
  };

  const suitability = getOutdoorSuitability();

  return (
    <div className="space-y-6">
      {/* Top Banner: Detected Location & Sync Status */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hyperlocal Meteorological Observatory</span>
            {isDemoData && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-[10px]">
                Demo Mode Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {location.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
            <span>Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
            <span>•</span>
            <span>Elevation / Grid: ERA5 0.1° (~10 km)</span>
            <span>•</span>
            <span>Source: {dataSource}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 text-xs">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div>
            <div className="font-semibold text-slate-800">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="text-[11px] text-slate-500">
              Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* "What is happening now?" Rule-Based Synthesis Banner */}
      <div
        className={`p-5 rounded-xl border shadow-xs transition-all ${
          operationalSummary.status === 'alert'
            ? 'bg-red-50/90 border-red-300 text-red-950'
            : operationalSummary.status === 'caution'
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              operationalSummary.status === 'alert'
                ? 'bg-red-200 text-red-800'
                : operationalSummary.status === 'caution'
                ? 'bg-amber-200 text-amber-800'
                : 'bg-emerald-200 text-emerald-800'
            }`}
          >
            {operationalSummary.status === 'alert' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : operationalSummary.status === 'caution' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight">{operationalSummary.title}</h2>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/70 border border-current">
                Live Status
              </span>
            </div>
            <p className="text-sm mt-1 leading-relaxed opacity-90">{operationalSummary.detail}</p>
          </div>
        </div>
      </div>

      {/* Farmer Highlight Box (When Farmer Mode is Active) */}
      {persona === 'farmer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rain Start/Stop Quick Card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-xl shadow-xs border border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-blue-300 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-400" /> Rain Prediction Window
              </span>
              <button
                onClick={() => onNavigateToTab('rain_forecast')}
                className="text-xs text-blue-300 hover:text-white flex items-center gap-1 underline"
              >
                Detailed Timeline <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            {rainWindow.hasRain ? (
              <div>
                <p className="text-xl font-bold text-white mt-1">
                  {rainWindow.startTimeEstimate
                    ? `Rain expected around ${rainWindow.startTimeEstimate}`
                    : 'Showers expected today'}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-800/80 text-xs">
                  <div>
                    <span className="text-blue-300 block text-[10px]">Expected Total</span>
                    <span className="font-bold text-sm text-blue-100">{rainWindow.estimatedAccumulationMm} mm</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[10px]">Peak Intensity</span>
                    <span className="font-bold text-sm text-blue-100">{rainWindow.peakTimeEstimate || 'Mid-window'}</span>
                  </div>
                  <div>
                    <span className="text-blue-300 block text-[10px]">Easing Window</span>
                    <span className="font-bold text-sm text-blue-100">{rainWindow.stopTimeEstimate || 'Evening'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xl font-bold text-emerald-300 mt-1">No Rain Expected Today</p>
                <p className="text-xs text-blue-200 mt-1">
                  Atmospheric moisture is low. Open field operations and harvesting are currently safe from rain wash-off.
                </p>
              </div>
            )}
          </div>

          {/* Outdoor Work Suitability Card */}
          <div className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between ${suitability.color}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">Fieldwork Suitability</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {suitability.badge}
                </span>
              </div>
              <p className="text-xl font-bold mt-1">{suitability.rating}</p>
              <p className="text-xs mt-2 leading-relaxed opacity-95">{suitability.reason}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-current/20 flex items-center justify-between text-[11px]">
              <span className="font-medium">General weather indicator (not a safety guarantee)</span>
              <button
                onClick={() => onNavigateToTab('advisory')}
                className="font-bold underline hover:opacity-80"
              >
                View Advisories →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Core Meteorological Telemetry Grid (Section 5) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            Live Weather Observations & Sensor Telemetry
          </h2>
          <span className="text-xs text-slate-500">Updated: {current.timestamp ? new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Temperature */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Temperature</span>
              <Thermometer className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.temperature}°C</div>
            <p className="text-[11px] text-slate-500 mt-1">Feels like {current.apparentTemperature}°C</p>
          </div>

          {/* Relative Humidity */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Humidity</span>
              <Droplets className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.relativeHumidity}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Dew point: {current.dewPoint}°C</p>
          </div>

          {/* Rain Probability */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Rain Chance</span>
              <CloudRain className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.precipitationProbability}%</div>
            <p className="text-[11px] text-slate-500 mt-1">Rate: {current.precipitation} mm/hr</p>
          </div>

          {/* Wind Speed & Direction */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Wind Speed</span>
              <Wind className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.windSpeed} <span className="text-xs font-normal text-slate-500">km/h</span></div>
            <p className="text-[11px] text-slate-500 mt-1">Gusts: {current.windGusts} km/h • {current.windDirection}°</p>
          </div>

          {/* Atmospheric Pressure */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Pressure</span>
              <Gauge className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.surfacePressure} <span className="text-xs font-normal text-slate-500">hPa</span></div>
            <p className="text-[11px] text-slate-500 mt-1">Surface barometric</p>
          </div>

          {/* Cloud Cover */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Cloud Cover</span>
              <Cloud className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.cloudCover}%</div>
            <p className="text-[11px] text-slate-500 mt-1">{current.weatherDescription}</p>
          </div>

          {/* UV Index */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">UV Index</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{current.uvIndex} <span className="text-xs font-normal text-slate-500">/ 11</span></div>
            <p className="text-[11px] text-slate-500 mt-1">{current.uvIndex >= 6 ? 'High solar exposure' : 'Moderate UV'}</p>
          </div>

          {/* Visibility */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Visibility</span>
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{(current.visibility / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span></div>
            <p className="text-[11px] text-slate-500 mt-1">Atmospheric clarity</p>
          </div>

          {/* Sunrise */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Sunrise</span>
              <Sunrise className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">{current.sunrise}</div>
            <p className="text-[11px] text-slate-500 mt-1">Solar dawn</p>
          </div>

          {/* Sunset */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Sunset</span>
              <Sunset className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">{current.sunset}</div>
            <p className="text-[11px] text-slate-500 mt-1">Solar dusk</p>
          </div>

          {/* Monsoon Streak */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Current Streak</span>
              <Compass className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-slate-900">
              {monsoon.currentStreakDays} {monsoon.currentStreakType === 'wet' ? 'Wet Days' : 'Dry Days'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Rain threshold 2.5 mm</p>
          </div>

          {/* Candidate Onset Status */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Candidate Onset</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">
              {monsoon.candidateOnsetMet ? 'Threshold Met' : 'Pre-Onset Window'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">3-Day Sum: {monsoon.rolling3DayRainfallMm} mm</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards into Deep Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigateToTab('rain_forecast')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <CloudRain className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Rain Start & Stop Timeline</h3>
          <p className="text-xs text-slate-500 mt-1">
            Hour-by-hour convective shower window prediction, easing intervals, and 14-day accumulation metrics.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('monsoon')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Wind className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Monsoon Onset & Break Analysis</h3>
          <p className="text-xs text-slate-500 mt-1">
            Experimental 3-day rolling rainfall rule, candidate break detection, and seasonal rainfall anomaly tracking.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('advisory')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Agricultural Advisory (Crop-Free)</h3>
          <p className="text-xs text-slate-500 mt-1">
            General guidance for drainage, moisture conservation, and spraying windows in English, Kannada, and Hindi.
          </p>
        </div>
      </div>
    </div>
  );
};

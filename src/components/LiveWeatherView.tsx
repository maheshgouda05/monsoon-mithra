import React, { useState } from 'react';
import {
  Wind,
  Droplets,
  Gauge,
  Sun,
  Eye,
  Thermometer,
  CloudSun,
  Compass,
  ArrowUp,
  Info,
} from 'lucide-react';
import { CurrentWeather, HourlyForecastItem } from '../types';

interface LiveWeatherViewProps {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
}

export const LiveWeatherView: React.FC<LiveWeatherViewProps> = ({ current, hourly }) => {
  const [windUnit, setWindUnit] = useState<'kmh' | 'ms'>('kmh');

  const convertWind = (kmh: number) => {
    if (windUnit === 'ms') {
      return (kmh / 3.6).toFixed(1);
    }
    return kmh.toString();
  };

  const getCardinalDirection = (deg: number): string => {
    const val = Math.floor(deg / 22.5 + 0.5);
    const arr = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
    ];
    return arr[val % 16] || 'N';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-emerald-600" />
          Live Meteorological Telemetry & Boundary Layer Atmosphere
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct sensor readouts, surface boundary layer vectors, dew point, barometric pressure trend, and worker solar exposure.
        </p>
      </div>

      {/* Main 4 Deep-Dive Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: Wind Dynamics & Vector Compass */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-teal-600" /> Wind Dynamics
              </span>
              <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[10px]">
                <button
                  onClick={() => setWindUnit('kmh')}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    windUnit === 'kmh' ? 'bg-teal-600 text-white' : 'text-slate-600'
                  }`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setWindUnit('ms')}
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    windUnit === 'ms' ? 'bg-teal-600 text-white' : 'text-slate-600'
                  }`}
                >
                  m/s
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 my-2">
              {/* Compass Dial Visual */}
              <div className="relative w-20 h-20 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                <span className="absolute top-1 text-[9px] font-bold text-slate-400">N</span>
                <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
                <span className="absolute left-1.5 text-[9px] font-bold text-slate-400">W</span>
                <span className="absolute right-1.5 text-[9px] font-bold text-slate-400">E</span>
                <div
                  className="w-10 h-10 flex items-center justify-center transition-transform duration-500"
                  style={{ transform: `rotate(${current.windDirection}deg)` }}
                >
                  <ArrowUp className="w-6 h-6 text-teal-600 drop-shadow-xs" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {convertWind(current.windSpeed)}{' '}
                  <span className="text-xs font-normal text-slate-500">{windUnit === 'kmh' ? 'km/h' : 'm/s'}</span>
                </div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">
                  Direction: {getCardinalDirection(current.windDirection)} ({current.windDirection}°)
                </div>
                <div className="text-xs text-slate-500">
                  Gusts: {convertWind(current.windGusts)} {windUnit === 'kmh' ? 'km/h' : 'm/s'}
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {current.windSpeed >= 30
              ? 'Warning: Exceeds 30 km/h threshold. High risk of spray drift and shed roof damage.'
              : 'Wind is within safe limits for open-field agronomic activities (<20 km/h).'}
          </p>
        </div>

        {/* Panel 2: Atmospheric Pressure & Barometric State */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-600" /> Barometric Pressure
              </span>
              <span className="text-[10px] text-slate-500">Surface 10m</span>
            </div>

            <div className="my-2">
              <div className="text-3xl font-extrabold text-slate-900">
                {current.surfacePressure} <span className="text-xs font-normal text-slate-500">hPa</span>
              </div>
              <p className="text-xs font-medium text-slate-700 mt-1">
                {current.surfacePressure < 1005
                  ? 'Low Pressure Depression Zone'
                  : current.surfacePressure > 1014
                  ? 'Stable High Pressure Ridge'
                  : 'Standard Monsoon Trough Baseline'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 mt-3">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Note:</strong> Barometric pressure trends indicate synoptic scale air movement, but pressure alone does not guarantee local convective shower occurrence.
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Humidity & Dew Point Saturation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" /> Humidity & Moisture
              </span>
              <span className="text-[10px] text-slate-500">Psychrometric</span>
            </div>

            <div className="my-2">
              <div className="text-3xl font-extrabold text-slate-900">{current.relativeHumidity}%</div>
              <p className="text-xs font-medium text-slate-700 mt-1">
                Dew Point Temperature: {current.dewPoint}°C
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Vapor Depression: {(current.temperature - current.dewPoint).toFixed(1)}°C
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {current.relativeHumidity >= 80
              ? 'Near-saturated boundary layer. High potential for condensation and prolonged dew persistence.'
              : current.relativeHumidity < 40
              ? 'Dry atmospheric boundary layer. Rapid surface soil evaporation expected.'
              : 'Moderate relative humidity conducive to standard outdoor operations.'}
          </p>
        </div>

        {/* Panel 4: UV Radiance & Comfort Index */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-600" /> UV & Thermal Comfort
              </span>
              <span className="text-[10px] text-slate-500">WHO Standard</span>
            </div>

            <div className="my-2">
              <div className="text-3xl font-extrabold text-slate-900">
                {current.uvIndex} <span className="text-xs font-normal text-slate-500">/ 11</span>
              </div>
              <p className="text-xs font-medium text-slate-700 mt-1">
                Feels-Like Temperature: {current.apparentTemperature}°C
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Daylight Window: {current.sunrise} – {current.sunset}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {current.uvIndex >= 8
              ? 'Very high UV radiation. Direct exposure between 11 AM and 3 PM requires eye and skin protection.'
              : current.uvIndex >= 5
              ? 'Moderate solar radiation. Seek shade during peak midday hours.'
              : 'Low UV exposure. Safe for continuous outdoor work.'}
          </p>
        </div>
      </div>

      {/* Hourly Trend Table for Inspection (Next 12 Hours) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
          Hourly Atmospheric Trend (Immediate 12-Hour Telemetry)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Local Time</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Feels Like</th>
                <th className="py-2.5 px-3">Rain Prob (%)</th>
                <th className="py-2.5 px-3">Precip (mm)</th>
                <th className="py-2.5 px-3">Humidity (%)</th>
                <th className="py-2.5 px-3">Wind ({windUnit === 'kmh' ? 'km/h' : 'm/s'})</th>
                <th className="py-2.5 px-3">Gusts</th>
                <th className="py-2.5 px-3">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {hourly.slice(0, 12).map((item, idx) => {
                const d = new Date(item.time);
                const timeLabel = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">{timeLabel}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{item.weatherDescription}</td>
                    <td className="py-2.5 px-3 font-medium">{item.temperature}°</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.apparentTemperature}°</td>
                    <td className="py-2.5 px-3 font-medium text-blue-600">{item.precipitationProbability}%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.precipitation} mm</td>
                    <td className="py-2.5 px-3">{item.relativeHumidity}%</td>
                    <td className="py-2.5 px-3">{convertWind(item.windSpeed)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{convertWind(item.windGusts)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.surfacePressure} hPa</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

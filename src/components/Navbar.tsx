import React from 'react';
import {
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Globe,
  UserCheck,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { GeoLocation, PersonaMode, Language } from '../types';

interface NavbarProps {
  location: GeoLocation;
  isLoading: boolean;
  isDemoData: boolean;
  persona: PersonaMode;
  language: Language;
  onRefresh: () => void;
  onRequestUserLocation: () => void;
  onOpenSearch: () => void;
  onTogglePersona: (persona: PersonaMode) => void;
  onChangeLanguage: (lang: Language) => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  isLoading,
  isDemoData,
  persona,
  language,
  onRefresh,
  onRequestUserLocation,
  onOpenSearch,
  onTogglePersona,
  onChangeLanguage,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-wider text-emerald-400">HEXANOD</span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    SIH26086
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Earth Intelligence for Agriculture
                </p>
              </div>
            </div>
          </div>

          {/* Location Bar & Quick Action */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[190px]">{location.name}</span>
                <span className="text-[10px] text-slate-400">
                  {location.latitude.toFixed(3)}°N, {location.longitude.toFixed(3)}°E
                  {location.accuracyMeters ? ` (±${location.accuracyMeters}m)` : ''}
                </span>
              </div>
              {location.isCurrentLocation && (
                <span className="ml-2 inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> GPS
                </span>
              )}
            </div>

            <button
              onClick={onRequestUserLocation}
              className="px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center transition shadow-sm active:scale-95"
              title="Detect device GPS coordinates"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 sm:mr-1.5 text-white" />
              <span className="hidden sm:inline">Use My Location</span>
              <span className="sm:hidden">GPS</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center border border-slate-700 transition"
              title="Search villages, districts, or enter coordinates"
            >
              <Search className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Change Location</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition disabled:opacity-50"
              title="Refresh live meteorological telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Persona & Language Controls */}
          <div className="flex items-center space-x-2">
            {/* Persona Toggle */}
            <div className="hidden xl:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => onTogglePersona('farmer')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1 ${
                  persona === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>Farmer Mode</span>
              </button>
              <button
                onClick={() => onTogglePersona('analyst')}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center space-x-1 ${
                  persona === 'analyst'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Officer / Analyst</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
                aria-label="Select platform language"
              >
                <option value="en" className="bg-slate-800 text-slate-200">
                  English
                </option>
                <option value="kn" className="bg-slate-800 text-slate-200">
                  ಕನ್ನಡ (Kannada)
                </option>
                <option value="hi" className="bg-slate-800 text-slate-200">
                  हिंदी (Hindi)
                </option>
              </select>
            </div>

            {/* Data Source Badge */}
            <div className="hidden lg:flex items-center">
              {isDemoData ? (
                <span className="inline-flex items-center text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded">
                  <AlertCircle className="w-2.5 h-2.5 mr-1" /> Demonstration Data
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Live Open-Meteo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

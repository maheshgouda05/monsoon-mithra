import React, { useState } from 'react';
import {
  User,
  ChevronDown,
  Settings,
  X,
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileModal, setProfileModal] = useState<'profile' | 'preferences' | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('user_name') ||
        localStorage.getItem('userName') ||
        ((window as unknown as { __USER__?: { name?: string } }).__USER__?.name) ||
        ''
      );
    } catch {
      return '';
    }
  });
  const [tempName, setTempName] = useState('');

  const displayName = userName.trim() || 'User Profile';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* User Profile Section (Replaced HEXANOD / SIH26086 branding) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 sm:space-x-2.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-800/90 active:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer select-none group text-left"
                  aria-label="User Profile Menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 group-hover:border-emerald-400/60 transition shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-medium text-xs sm:text-sm text-slate-100 max-w-[105px] sm:max-w-[160px] truncate group-hover:text-emerald-300 transition">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block font-normal capitalize">
                      {persona === 'farmer' ? 'Farmer Profile' : 'Analyst Profile'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown backdrop */}
                {isProfileOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1 z-50 text-xs backdrop-blur-md animate-in fade-in duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-800/40">
                      <p className="font-semibold text-slate-200 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {persona === 'farmer' ? 'Role: Farmer' : 'Role: Officer / Analyst'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setTempName(userName);
                        setProfileModal('profile');
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 text-slate-200 flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSearch();
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 text-slate-200 flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">Location Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setProfileModal('preferences');
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 text-slate-200 flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">Preferences</span>
                    </button>
                  </div>
                )}
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

      {/* My Profile Modal */}
      {profileModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setProfileModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">User Profile</h3>
              </div>
              <button
                onClick={() => setProfileModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Display Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name or handle"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Active Persona</span>
                  <span className="font-medium text-emerald-400 capitalize">
                    {persona === 'farmer' ? 'Farmer Mode' : 'Officer / Analyst'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Monitored Location</span>
                  <span className="font-medium text-slate-200 max-w-[180px] truncate">
                    {location.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Coordinates</span>
                  <span className="font-mono text-[11px] text-slate-300">
                    {location.latitude.toFixed(3)}°N, {location.longitude.toFixed(3)}°E
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setProfileModal(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmed = tempName.trim();
                  setUserName(trimmed);
                  try {
                    if (trimmed) {
                      localStorage.setItem('user_name', trimmed);
                    } else {
                      localStorage.removeItem('user_name');
                    }
                  } catch {}
                  setProfileModal(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer text-xs shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {profileModal === 'preferences' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setProfileModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-100">Preferences</h3>
              </div>
              <button
                onClick={() => setProfileModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-400 font-medium">Application Persona</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTogglePersona('farmer')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                      persona === 'farmer'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Farmer Mode</p>
                      <p className="text-[10px] text-slate-400">Actionable field advisories</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onTogglePersona('analyst')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                      persona === 'analyst'
                        ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Officer / Analyst</p>
                      <p className="text-[10px] text-slate-400">Technical met diagnostics</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Language / ಭಾಷೆ</label>
                <select
                  value={language}
                  onChange={(e) => onChangeLanguage(e.target.value as Language)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProfileModal(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer text-xs shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


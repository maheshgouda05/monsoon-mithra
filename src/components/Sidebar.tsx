import React from 'react';
import {
  LayoutDashboard,
  CloudSun,
  CloudRain,
  Wind,
  History,
  Satellite,
  Sprout,
  Map,
  ShieldCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  BarChart3,
  X,
} from 'lucide-react';
import { PersonaMode } from '../types';

export type ActiveTab =
  | 'overview'
  | 'live_weather'
  | 'rain_forecast'
  | 'monsoon'
  | 'historical'
  | 'satellite'
  | 'advisory'
  | 'risk_map'
  | 'validation'
  | 'methodology';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  persona: PersonaMode;
  onTogglePersona: (mode: PersonaMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  persona,
  onTogglePersona,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live_weather', label: 'Live Weather', icon: CloudSun },
    { id: 'rain_forecast', label: 'Rain Forecast', icon: CloudRain, badge: 'Timeline' },
    { id: 'monsoon', label: 'Monsoon Intelligence', icon: Wind, badge: 'Onset' },
    { id: 'historical', label: 'Historical Rainfall', icon: History, badge: '25-Yr' },
    { id: 'satellite', label: 'Satellite Intelligence', icon: Satellite, badge: 'IMERG' },
    { id: 'advisory', label: 'Agricultural Advisory', icon: Sprout, badge: 'Crop-Free' },
    { id: 'risk_map', label: 'Risk Map', icon: Map, badge: 'Leaflet' },
    { id: 'validation', label: 'Model Validation', icon: ShieldCheck, badge: '11-Yr' },
    { id: 'methodology', label: 'Data Sources & Methodology', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-50 lg:z-30 h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 ${
          isMobileOpen ? 'left-0 w-72' : '-left-72 lg:left-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Navigation Header for Mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <span className="font-semibold text-slate-200 text-sm">Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona quick switch on mobile & collapsed */}
        <div className="p-3 border-b border-slate-800 xl:hidden">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => onTogglePersona('farmer')}
              className={`flex-1 py-1 rounded text-center font-medium ${
                persona === 'farmer' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => onTogglePersona('analyst')}
              className={`flex-1 py-1 rounded text-center font-medium ${
                persona === 'analyst' ? 'bg-sky-600 text-white' : 'text-slate-400'
              }`}
            >
              Analyst
            </button>
          </div>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                      isActive
                        ? 'bg-emerald-700/80 text-emerald-100 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when collapsed */}
                {isCollapsed && (
                  <span className="hidden lg:group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 border border-slate-700">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 hidden lg:flex items-center justify-between">
          {!isCollapsed && (
            <div className="text-[11px] text-slate-500">
              <p className="font-semibold text-slate-400">SIH 2026</p>
              <p>Problem SIH26086</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto lg:mx-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};

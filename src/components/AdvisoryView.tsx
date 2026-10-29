import React, { useState } from 'react';
import {
  Sprout,
  ShieldAlert,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe,
  Filter,
} from 'lucide-react';
import { AgriculturalAdvisoryItem, Language } from '../types';

interface AdvisoryViewProps {
  advisories: AgriculturalAdvisoryItem[];
  language: Language;
  onChangeLanguage: (lang: Language) => void;
}

export const AdvisoryView: React.FC<AdvisoryViewProps> = ({
  advisories,
  language,
  onChangeLanguage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered =
    selectedCategory === 'all'
      ? advisories
      : advisories.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Strictly Crop-Independent Meteorological Advisory</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Agronomic Decision Support & General Field Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Purely derived from ambient weather, convective rain horizons, wind vectors, and humidity. No specific crop species or growth-stages assumed.
          </p>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
          <button
            onClick={() => onChangeLanguage('en')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onChangeLanguage('kn')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              language === 'kn' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => onChangeLanguage('hi')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              language === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {[
          { id: 'all', label: 'All Advisories' },
          { id: 'drainage', label: 'Drainage & Runoff' },
          { id: 'irrigation_conservation', label: 'Moisture Conservation' },
          { id: 'wind_shelter', label: 'Wind Precaution' },
          { id: 'spraying_window', label: 'Spraying Window' },
          { id: 'general_precautions', label: 'Worker & Field Safety' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            No specific alerts for the selected category under current weather conditions.
          </div>
        ) : (
          filtered.map((adv) => {
            const title =
              language === 'kn' ? adv.titleKn : language === 'hi' ? adv.titleHi : adv.titleEn;
            const action =
              language === 'kn' ? adv.actionKn : language === 'hi' ? adv.actionHi : adv.actionEn;
            const evidence =
              language === 'kn'
                ? adv.weatherEvidenceKn
                : language === 'hi'
                ? adv.weatherEvidenceHi
                : adv.weatherEvidenceEn;

            const badgeColor =
              adv.riskLevel === 'severe'
                ? 'bg-red-100 text-red-800 border-red-300'
                : adv.riskLevel === 'warning'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : adv.riskLevel === 'caution'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={adv.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                      {adv.riskLevel.toUpperCase()}
                    </span>
                    <h2 className="font-bold text-slate-900 text-base">{title}</h2>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Time Window: <strong>{adv.timeWindow}</strong>
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                    {action}
                  </p>
                </div>

                {/* Evidence & Confidence Metadata (Mandatory Section 15 Fields) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-700 block mb-0.5">Atmospheric Weather Evidence:</span>
                    <p className="text-slate-600">{evidence}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Model Confidence:</span>
                      <span className="capitalize font-bold text-emerald-700">{adv.confidence}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>Next Forecast Check:</span>
                      <span>{adv.nextCheckWindow}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap justify-between gap-2 pt-2 border-t border-slate-100">
                  <span>Source: {adv.dataSource}</span>
                  <span>Limitation: {adv.limitations}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

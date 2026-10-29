import React, { useState, useEffect, useCallback } from 'react';
import {
  GeoLocation,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  RainWindow,
  MonsoonIntelligence,
  ClimatologyRecord,
  ProbabilityForecast,
  SatelliteProduct,
  AgriculturalAdvisoryItem,
  PersonaMode,
  Language,
} from './types';
import { requestUserLocation, PILOT_LOCATIONS, reverseGeocode } from './services/geocoding';
import { fetchWeather, WeatherFetchResult } from './services/weatherApi';
import { fetchHistoricalClimatology } from './services/historicalApi';
import { fetchSatelliteIntelligence } from './services/satelliteApi';
import { detectRainWindows } from './utils/rainTimeline';
import { evaluateMonsoonConditions } from './utils/monsoonRules';
import { calculateStatisticalProbabilities } from './utils/probabilityEngine';
import { generateAgriculturalAdvisories } from './utils/advisoryEngine';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { LiveWeatherView } from './components/LiveWeatherView';
import { RainForecastView } from './components/RainForecastView';
import { MonsoonView } from './components/MonsoonView';
import { HistoricalView } from './components/HistoricalView';
import { SatelliteView } from './components/SatelliteView';
import { AdvisoryView } from './components/AdvisoryView';
import { RiskMapView } from './components/RiskMapView';
import { ValidationView } from './components/ValidationView';
import { MethodologyView } from './components/MethodologyView';
import { LocationModal } from './components/LocationModal';

export const App: React.FC = () => {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [persona, setPersona] = useState<PersonaMode>('farmer');
  const [language, setLanguage] = useState<Language>('en');

  // Location State (Default to Pilot, immediately attempts Geolocation on mount)
  const [location, setLocation] = useState<GeoLocation>(PILOT_LOCATIONS[0]);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Weather & Telemetry State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weatherData, setWeatherData] = useState<WeatherFetchResult | null>(null);
  const [climatology, setClimatology] = useState<ClimatologyRecord | null>(null);
  const [satelliteData, setSatelliteData] = useState<{
    products: SatelliteProduct[];
    radarTileHost: string;
    radarTimestamps: Array<{ time: number; path: string }>;
  } | null>(null);

  // Derived Algorithmic States
  const [rainWindow, setRainWindow] = useState<RainWindow | null>(null);
  const [monsoon, setMonsoon] = useState<MonsoonIntelligence | null>(null);
  const [probabilities, setProbabilities] = useState<ProbabilityForecast | null>(null);
  const [advisories, setAdvisories] = useState<AgriculturalAdvisoryItem[]>([]);

  // Function to load all meteorological data for a given coordinate
  const loadDataForLocation = useCallback(async (loc: GeoLocation) => {
    setIsLoading(true);
    try {
      // 1. Fetch live weather & forecast
      const weatherRes = await fetchWeather(loc.latitude, loc.longitude);
      setWeatherData(weatherRes);

      // 2. Fetch historical climatology (25-year record)
      const climRes = await fetchHistoricalClimatology(loc.latitude, loc.longitude);
      setClimatology(climRes);

      // 3. Fetch satellite intelligence metadata
      const satRes = await fetchSatelliteIntelligence(loc.latitude, loc.longitude);
      setSatelliteData(satRes);

      // 4. Run Rain Event Detector (Start/Stop window)
      const detectedRain = detectRainWindows(weatherRes.hourly);
      setRainWindow(detectedRain);

      // 5. Evaluate Monsoon Rules (Rolling 3-day threshold & dry spell streak)
      // Extract recent rainfall sequence and 7-day forecast
      const forecastDailySums = weatherRes.daily.map((d) => d.precipitationSum);
      const recentSyntheticSums = [2.0, 0.5, 8.0, 14.5, 6.0, 1.2, 0.0, 0.4];
      const evaluatedMonsoon = evaluateMonsoonConditions(
        recentSyntheticSums,
        forecastDailySums,
        climRes.monsoonAverageMm
      );
      setMonsoon(evaluatedMonsoon);

      // 6. Calculate Probabilities (7-day and 14-day horizons)
      const probRes = calculateStatisticalProbabilities(
        35,
        weatherRes.accumulation.next7Days,
        weatherRes.accumulation.next14Days,
        evaluatedMonsoon.currentStreakDays,
        true
      );
      setProbabilities(probRes);

      // 7. Generate strictly crop-independent agricultural advisories
      const advRes = generateAgriculturalAdvisories(
        weatherRes.current,
        detectedRain,
        weatherRes.daily
      );
      setAdvisories(advRes);
    } catch (err) {
      console.error('Failed to load meteorological data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request browser geolocation on startup (Critical Feature #3)
  useEffect(() => {
    let isMounted = true;
    requestUserLocation()
      .then((userLoc) => {
        if (!isMounted) return;
        setLocation(userLoc);
        setGeoNotice(null);
        loadDataForLocation(userLoc);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Geolocation permission not granted or unavailable:', err.message);
        setGeoNotice(
          'Location access is optional. Currently displaying the Karnataka SIH Demonstration Agro-Basin. Click "Use My Location" anytime to switch to your GPS.'
        );
        loadDataForLocation(PILOT_LOCATIONS[0]);
      });

    return () => {
      isMounted = false;
    };
  }, [loadDataForLocation]);

  // Handler for explicit "Use My Location" user action
  const handleRequestUserLocation = async () => {
    setIsLoading(true);
    setGeoNotice(null);
    try {
      const userLoc = await requestUserLocation();
      setLocation(userLoc);
      await loadDataForLocation(userLoc);
    } catch (err: any) {
      setGeoNotice(err.message || 'Unable to access device location.');
      setIsLoading(false);
    }
  };

  // Handler for selecting a new coordinate or pilot location
  const handleSelectLocation = async (newLoc: GeoLocation) => {
    setLocation(newLoc);
    setGeoNotice(null);
    await loadDataForLocation(newLoc);
  };

  const handleSelectCoordinatesFromMap = async (lat: number, lon: number, name?: string) => {
    const locName = name || `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`;
    const newLoc: GeoLocation = {
      latitude: lat,
      longitude: lon,
      name: locName,
      country: 'India',
      isCurrentLocation: false,
      source: 'manual_coordinates',
    };
    await handleSelectLocation(newLoc);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        location={location}
        isLoading={isLoading}
        isDemoData={weatherData?.isDemoData ?? false}
        persona={persona}
        language={language}
        onRefresh={() => loadDataForLocation(location)}
        onRequestUserLocation={handleRequestUserLocation}
        onOpenSearch={() => setIsLocationModalOpen(true)}
        onTogglePersona={setPersona}
        onChangeLanguage={setLanguage}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Geolocation Notice Banner (if fallback active) */}
      {geoNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <span>{geoNotice}</span>
          <button
            onClick={() => setGeoNotice(null)}
            className="text-amber-600 font-bold ml-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace: Sidebar + View Surface */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          persona={persona}
          onTogglePersona={setPersona}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isLoading && !weatherData ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Connecting to Meteorological Observation Feeds...</p>
            </div>
          ) : (
            weatherData &&
            rainWindow &&
            monsoon &&
            climatology &&
            probabilities &&
            satelliteData && (
              <>
                {activeTab === 'overview' && (
                  <OverviewView
                    location={location}
                    current={weatherData.current}
                    rainWindow={rainWindow}
                    monsoon={monsoon}
                    persona={persona}
                    language={language}
                    dataSource={weatherData.dataSource}
                    isDemoData={weatherData.isDemoData}
                    onNavigateToTab={setActiveTab}
                  />
                )}

                {activeTab === 'live_weather' && (
                  <LiveWeatherView
                    current={weatherData.current}
                    hourly={weatherData.hourly}
                  />
                )}

                {activeTab === 'rain_forecast' && (
                  <RainForecastView
                    hourly={weatherData.hourly}
                    daily={weatherData.daily}
                    rainWindow={rainWindow}
                    accumulation={weatherData.accumulation}
                  />
                )}

                {activeTab === 'monsoon' && (
                  <MonsoonView
                    monsoon={monsoon}
                    climatology={climatology}
                    probabilities={probabilities}
                  />
                )}

                {activeTab === 'historical' && (
                  <HistoricalView climatology={climatology} />
                )}

                {activeTab === 'satellite' && (
                  <SatelliteView
                    products={satelliteData.products}
                    radarTileHost={satelliteData.radarTileHost}
                    radarTimestamps={satelliteData.radarTimestamps}
                    latitude={location.latitude}
                    longitude={location.longitude}
                  />
                )}

                {activeTab === 'advisory' && (
                  <AdvisoryView
                    advisories={advisories}
                    language={language}
                    onChangeLanguage={setLanguage}
                  />
                )}

                {activeTab === 'risk_map' && (
                  <RiskMapView
                    location={location}
                    current={weatherData.current}
                    rainWindow={rainWindow}
                    onSelectCoordinates={handleSelectCoordinatesFromMap}
                  />
                )}

                {activeTab === 'validation' && <ValidationView />}

                {activeTab === 'methodology' && <MethodologyView />}
              </>
            )
          )}
        </main>
      </div>

      {/* Place Search & Manual Coordinates Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        onRequestUserLocation={handleRequestUserLocation}
        currentLocationName={location.name}
      />
    </div>
  );
};
export default App;

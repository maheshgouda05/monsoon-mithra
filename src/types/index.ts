export type PersonaMode = 'farmer' | 'analyst';
export type Language = 'en' | 'kn' | 'hi';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  district?: string;
  state?: string;
  country: string;
  isCurrentLocation: boolean;
  accuracyMeters?: number;
  source: 'browser_geolocation' | 'search_geocoding' | 'preset_pilot' | 'manual_coordinates';
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  surfacePressure: number;
  cloudCover: number;
  visibility: number; // in meters or km
  uvIndex: number;
  dewPoint: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  timestamp: string;
}

export interface HourlyForecastItem {
  time: string; // ISO string
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number; // mm
  rain: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  relativeHumidity: number;
  cloudCover: number;
  surfacePressure: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface DailyForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  weatherCode: number;
  weatherDescription: string;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  heavyRainRisk: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  consecutiveDryDayFlag: boolean;
  keyChangeFromPrevDay: string;
  confidenceScore: number; // 0-100% declining with lead days
}

export interface RainWindow {
  hasRain: boolean;
  summaryText: string;
  startTimeEstimate?: string;
  peakTimeEstimate?: string;
  easingTimeEstimate?: string;
  stopTimeEstimate?: string;
  nextShowerTimeEstimate?: string;
  estimatedAccumulationMm: number;
  probabilityRange: [number, number];
  uncertaintyLevel: 'low' | 'moderate' | 'high';
  uncertaintyExplanation: string;
  isIntermittent: boolean;
  windows: Array<{
    start: string;
    end: string;
    peak: string;
    intensity: 'light' | 'moderate' | 'heavy' | 'torrential';
    expectedMm: number;
    probability: number;
  }>;
}

export interface AccumulationMetrics {
  next1Hour: number;
  next3Hours: number;
  next6Hours: number;
  next12Hours: number;
  next24Hours: number;
  next3Days: number;
  next7Days: number;
  next14Days: number;
  historicalNormalPeriod: number;
  anomalyMm: number;
  anomalyPercent: number;
}

export interface MonsoonIntelligence {
  rolling3DayRainfallMm: number;
  onsetThresholdMm: number;
  candidateOnsetMet: boolean;
  candidateOnsetDate?: string;
  persistenceVerified: boolean;
  officialImdOnsetState: 'not_declared' | 'declared_kerala' | 'advanced_peninsula' | 'fully_covered';
  officialImdDeclaredDate?: string;
  currentStreakDays: number;
  currentStreakType: 'wet' | 'dry';
  prolongedDrySpellRisk: 'low' | 'moderate' | 'high';
  candidateBreakMonsoon: boolean;
  seasonTotalRainfallMm: number;
  historicalSeasonNormalMm: number;
  seasonalAnomalyPercent: number;
  evidenceNotes: string[];
}

export interface ClimatologyRecord {
  yearsCount: number;
  startYear: number;
  endYear: number;
  annualAverageMm: number;
  monsoonAverageMm: number;
  monthlyAverages: { month: string; monthIndex: number; avgRainfallMm: number; wetDays: number }[];
  yearlyTotals: { year: number; monsoonMm: number; annualMm: number; anomalyPercent: number }[];
  longestHistoricalDrySpellDays: number;
  averageOnsetDayOfYear: number;
  heavyRainDaysPerYearAvg: number;
  dataSource: string;
  resolutionKm: number;
}

export interface ProbabilityForecast {
  candidateOnsetWithin7Days: { probability: number; label: string; confidence: string };
  candidateOnsetWithin14Days: { probability: number; label: string; confidence: string };
  prolongedDrySpellWithin7Days: { probability: number; label: string; confidence: string };
  prolongedDrySpellWithin14Days: { probability: number; label: string; confidence: string };
  heavyRainWithin7Days: { probability: number; label: string; confidence: string };
  heavyRainWithin14Days: { probability: number; label: string; confidence: string };
  modelAssumptions: string[];
}

export interface SatelliteProduct {
  name: string;
  sensor: string;
  agency: string;
  observationTime: string;
  spatialResolution: string;
  temporalResolution: string;
  currentRainfallEstimateMmHr: number;
  coverage: string;
  processingLatency: string;
  status: 'active_live' | 'demonstration_reference' | 'feed_delayed';
  dataDistinction: string;
  knownLimitations: string;
}

export interface AgriculturalAdvisoryItem {
  id: string;
  category: 'drainage' | 'irrigation_conservation' | 'wind_shelter' | 'field_access' | 'spraying_window' | 'general_precautions';
  titleEn: string;
  titleKn: string;
  titleHi: string;
  actionEn: string;
  actionKn: string;
  actionHi: string;
  weatherEvidenceEn: string;
  weatherEvidenceKn: string;
  weatherEvidenceHi: string;
  riskLevel: 'favourable' | 'caution' | 'warning' | 'severe';
  confidence: 'high' | 'moderate' | 'low';
  timeWindow: string;
  nextCheckWindow: string;
  dataSource: string;
  limitations: string;
}

export interface ValidationMetric {
  year: number;
  imdOfficialOnset: string;
  hexanodCandidateOnset: string;
  absoluteErrorDays: number;
  status: 'matched' | 'lead' | 'lag' | 'false_onset';
}

export interface ValidationSummary {
  evaluationPeriod: string;
  totalSeasons: number;
  meanAbsoluteErrorDays: number;
  falseOnsetRatePercent: number;
  drySpellDetectionAccuracyPercent: number;
  brierScore: number;
  reliabilityBins: { forecastProbabilityBin: string; observedFrequency: number; sampleCount: number }[];
  limitationsNote: string;
}

export interface WeatherAlert {
  id: string;
  type: 'heavy_rain' | 'gusty_winds' | 'prolonged_dry_spell' | 'sudden_downpour' | 'heat_index';
  severity: 'info' | 'caution' | 'warning' | 'emergency';
  title: string;
  description: string;
  validFrom: string;
  validTo: string;
  source: 'HEXANOD Rule Engine' | 'IMD Warning Feeds';
}

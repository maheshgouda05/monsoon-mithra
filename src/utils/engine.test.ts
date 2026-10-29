import test from 'node:test';
import assert from 'node:assert/strict';
import { detectRainWindows, formatTimeWindow } from './rainTimeline';
import { evaluateMonsoonConditions } from './monsoonRules';
import { calculateBrierScore, generateReliabilityBins, calculateStatisticalProbabilities } from './probabilityEngine';
import { generateAgriculturalAdvisories } from './advisoryEngine';
import { HourlyForecastItem, CurrentWeather, DailyForecastItem } from '../types';

test('detectRainWindows handles completely dry forecast without crashing', () => {
  const dryHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() + i * 3600000).toISOString(),
    temperature: 28,
    apparentTemperature: 29,
    precipitationProbability: 5,
    precipitation: 0.0,
    rain: 0.0,
    windSpeed: 10,
    windDirection: 180,
    windGusts: 14,
    relativeHumidity: 45,
    cloudCover: 10,
    surfacePressure: 1012,
    uvIndex: 4,
    weatherCode: 0,
    weatherDescription: 'Clear sky',
  }));

  const result = detectRainWindows(dryHourly);
  assert.equal(result.hasRain, false);
  assert.equal(result.estimatedAccumulationMm, 0);
  assert.equal(result.windows.length, 0);
  assert.match(result.summaryText, /dry conditions|unlikely/i);
});

test('detectRainWindows accurately groups consecutive rain hours and detects start, peak, and stop windows', () => {
  const now = new Date('2026-10-29T12:00:00Z').getTime();
  const sampleHourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
    // Rain event occurring at hours 3, 4, 5 (15:00, 16:00, 17:00)
    const isRain = i >= 3 && i <= 5;
    const precip = i === 4 ? 8.5 : isRain ? 3.0 : 0.0;
    const prob = isRain ? 80 : 10;
    return {
      time: new Date(now + i * 3600000).toISOString(),
      temperature: 25,
      apparentTemperature: 26,
      precipitationProbability: prob,
      precipitation: precip,
      rain: precip,
      windSpeed: 12,
      windDirection: 210,
      windGusts: 18,
      relativeHumidity: 70,
      cloudCover: 80,
      surfacePressure: 1008,
      uvIndex: 2,
      weatherCode: isRain ? 63 : 1,
      weatherDescription: isRain ? 'Moderate rain' : 'Mainly clear',
    };
  });

  const result = detectRainWindows(sampleHourly);
  assert.equal(result.hasRain, true);
  assert.equal(result.estimatedAccumulationMm, 14.5); // 3.0 + 8.5 + 3.0
  assert.equal(result.windows.length, 1);
  assert.equal(result.windows[0].expectedMm, 14.5);
  assert.equal(result.windows[0].intensity, 'heavy'); // > 7.5 peak
  assert.ok(result.startTimeEstimate !== undefined);
  assert.ok(result.stopTimeEstimate !== undefined);
});

test('evaluateMonsoonConditions identifies candidate onset when rolling 3-day sum >= 20mm', () => {
  // Scenario 1: Below 20mm
  const dryPeriod = [2, 1, 0, 4, 3, 2, 1, 0];
  const forecast1 = [1, 2, 0, 0, 1, 0, 0];
  const res1 = evaluateMonsoonConditions(dryPeriod, forecast1, 850);
  assert.equal(res1.candidateOnsetMet, false);

  // Scenario 2: Rolling 3-day reaches 30mm (10 + 15 + 5)
  const wetPeriod = [1, 0, 10, 15, 5, 8, 4, 2];
  const forecast2 = [6, 4, 2, 0, 1, 0, 0];
  const res2 = evaluateMonsoonConditions(wetPeriod, forecast2, 850);
  assert.equal(res2.candidateOnsetMet, true);
  assert.ok(res2.rolling3DayRainfallMm >= 20);
  assert.equal(res2.persistenceVerified, true);
});

test('evaluateMonsoonConditions detects dry spell and streak accurately', () => {
  // 8 consecutive dry days (< 2.5 mm)
  const prolongedDry = [12, 10, 1.0, 0.2, 0.0, 0.0, 0.5, 0.0, 0.0, 0.1];
  const dryForecast = [0, 0, 0, 0.5, 0, 0, 1];
  const res = evaluateMonsoonConditions(prolongedDry, dryForecast, 900);
  assert.equal(res.currentStreakType, 'dry');
  assert.equal(res.currentStreakDays, 8);
  assert.equal(res.prolongedDrySpellRisk, 'high');
});

test('calculateBrierScore returns correct mathematical value', () => {
  // Known cases:
  // Perfect prediction: f=1, o=1 -> (1-1)^2 = 0
  const perfect = [{ forecastProb: 1.0, observedOutcome: 1 as const }];
  assert.equal(calculateBrierScore(perfect), 0);

  // Worst prediction: f=1, o=0 -> (1-0)^2 = 1
  const worst = [{ forecastProb: 1.0, observedOutcome: 0 as const }];
  assert.equal(calculateBrierScore(worst), 1);

  // Mixed: f1=0.8, o1=1 (err=0.04); f2=0.2, o2=0 (err=0.04); average = 0.04
  const mixed = [
    { forecastProb: 0.8, observedOutcome: 1 as const },
    { forecastProb: 0.2, observedOutcome: 0 as const },
  ];
  assert.equal(calculateBrierScore(mixed), 0.04);
});

test('generateReliabilityBins groups sample counts and frequencies', () => {
  const dataset = [
    { forecastProb: 0.1, observedOutcome: 0 as const },
    { forecastProb: 0.15, observedOutcome: 0 as const },
    { forecastProb: 0.5, observedOutcome: 1 as const },
    { forecastProb: 0.55, observedOutcome: 0 as const },
    { forecastProb: 0.9, observedOutcome: 1 as const },
  ];

  const bins = generateReliabilityBins(dataset);
  assert.equal(bins.length, 5);
  // Bin 0-20% has 2 samples, 0 hits -> 0%
  assert.equal(bins[0].sampleCount, 2);
  assert.equal(bins[0].observedFrequency, 0);
  // Bin 40-60% has 2 samples, 1 hit -> 50%
  assert.equal(bins[2].sampleCount, 2);
  assert.equal(bins[2].observedFrequency, 50);
  // Bin 80-100% has 1 sample, 1 hit -> 100%
  assert.equal(bins[4].sampleCount, 1);
  assert.equal(bins[4].observedFrequency, 100);
});

test('generateAgriculturalAdvisories is strictly crop-independent and provides multilingual outputs', () => {
  const current: CurrentWeather = {
    temperature: 31,
    apparentTemperature: 33,
    relativeHumidity: 65,
    precipitationProbability: 80,
    precipitation: 12.0,
    windSpeed: 24,
    windDirection: 240,
    windGusts: 42,
    surfacePressure: 1005,
    cloudCover: 90,
    visibility: 8000,
    uvIndex: 4,
    dewPoint: 22,
    weatherCode: 65,
    weatherDescription: 'Heavy rain',
    isDay: true,
    sunrise: '06:10 AM',
    sunset: '06:15 PM',
    timestamp: new Date().toISOString(),
  };

  const rainWindow = detectRainWindows([
    {
      time: new Date().toISOString(),
      temperature: 28,
      apparentTemperature: 29,
      precipitationProbability: 85,
      precipitation: 32.0,
      rain: 32.0,
      windSpeed: 25,
      windDirection: 240,
      windGusts: 40,
      relativeHumidity: 88,
      cloudCover: 95,
      surfacePressure: 1004,
      uvIndex: 3,
      weatherCode: 65,
      weatherDescription: 'Heavy rain',
    },
  ]);

  const daily: DailyForecastItem[] = [
    {
      date: '2026-10-29',
      tempMax: 30,
      tempMin: 22,
      precipitationSum: 35.0,
      precipitationProbabilityMax: 90,
      windSpeedMax: 32,
      windGustsMax: 45,
      windDirectionDominant: 240,
      weatherCode: 65,
      weatherDescription: 'Heavy rain showers',
      sunrise: '06:10 AM',
      sunset: '06:15 PM',
      uvIndexMax: 4,
      heavyRainRisk: 'high',
      consecutiveDryDayFlag: false,
      keyChangeFromPrevDay: 'Rainfall intensifies',
      confidenceScore: 88,
    },
  ];

  const advisories = generateAgriculturalAdvisories(current, rainWindow, daily);
  assert.ok(advisories.length > 0);

  // Strict check: Verify NO crop names appear in the advice
  const forbiddenCropTerms = ['rice', 'paddy', 'wheat', 'cotton', 'ragi', 'sugarcane', 'maize', 'soybean', 'groundnut'];
  for (const adv of advisories) {
    const fullText = (adv.titleEn + ' ' + adv.actionEn + ' ' + adv.weatherEvidenceEn).toLowerCase();
    for (const term of forbiddenCropTerms) {
      assert.equal(
        fullText.includes(term),
        false,
        `Crop name "${term}" found in crop-independent advisory: "${adv.titleEn}"`
      );
    }
    // Verify multilingual fields exist
    assert.ok(adv.titleKn.length > 0, 'Kannada title must be non-empty');
    assert.ok(adv.actionKn.length > 0, 'Kannada action must be non-empty');
    assert.ok(adv.titleHi.length > 0, 'Hindi title must be non-empty');
    assert.ok(adv.actionHi.length > 0, 'Hindi action must be non-empty');
  }
});

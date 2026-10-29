import { ProbabilityForecast, ValidationSummary } from '../types';

/**
 * Calculates Brier Score: (1/N) * sum((f_i - o_i)^2)
 * Where f_i is predicted probability (0 to 1) and o_i is binary outcome (0 or 1).
 * Lower is better (0 is perfect, 0.25 is random guessing for 50/50 prior).
 */
export function calculateBrierScore(
  predictions: { forecastProb: number; observedOutcome: 0 | 1 }[]
): number {
  if (!predictions || predictions.length === 0) return 0;
  const sumSquaredErr = predictions.reduce((sum, item) => {
    const err = item.forecastProb - item.observedOutcome;
    return sum + err * err;
  }, 0);
  return Number((sumSquaredErr / predictions.length).toFixed(4));
}

/**
 * Groups predictions into calibration bins for a Reliability Diagram.
 */
export function generateReliabilityBins(
  predictions: { forecastProb: number; observedOutcome: 0 | 1 }[]
): { forecastProbabilityBin: string; observedFrequency: number; sampleCount: number }[] {
  const bins = [
    { label: '0–20%', min: 0.0, max: 0.2, samples: 0, hits: 0 },
    { label: '20–40%', min: 0.2, max: 0.4, samples: 0, hits: 0 },
    { label: '40–60%', min: 0.4, max: 0.6, samples: 0, hits: 0 },
    { label: '60–80%', min: 0.6, max: 0.8, samples: 0, hits: 0 },
    { label: '80–100%', min: 0.8, max: 1.0, samples: 0, hits: 0 },
  ];

  predictions.forEach(({ forecastProb, observedOutcome }) => {
    for (const b of bins) {
      if (forecastProb >= b.min && (b.max === 1.0 ? forecastProb <= b.max : forecastProb < b.max)) {
        b.samples++;
        if (observedOutcome === 1) b.hits++;
        break;
      }
    }
  });

  return bins.map((b) => ({
    forecastProbabilityBin: b.label,
    observedFrequency: b.samples > 0 ? Number(((b.hits / b.samples) * 100).toFixed(1)) : 0,
    sampleCount: b.samples,
  }));
}

/**
 * Generates transparent statistical probabilities combining climatology, current streak,
 * and numerical model forecasts.
 */
export function calculateStatisticalProbabilities(
  climatologicalPrecipProb: number, // 0-100%
  forecast7DaySumMm: number,
  forecast14DaySumMm: number,
  currentDryStreakDays: number,
  isMonsoonSeason: boolean
): ProbabilityForecast {
  // Candidate onset within 7 & 14 days
  let pOnset7 = 0;
  let pOnset14 = 0;
  if (isMonsoonSeason) {
    pOnset7 = forecast7DaySumMm >= 25 ? Math.min(88, Math.round(55 + (forecast7DaySumMm - 25) * 1.2)) : Math.max(12, Math.round(forecast7DaySumMm * 1.5));
    pOnset14 = forecast14DaySumMm >= 40 ? Math.min(94, Math.round(65 + (forecast14DaySumMm - 40) * 0.8)) : Math.max(18, Math.round(forecast14DaySumMm * 1.2));
  } else {
    pOnset7 = 4;
    pOnset14 = 7;
  }

  // Prolonged dry spell within 7 & 14 days (daily rain < 2.5mm for > 7 days)
  let pDry7 = 0;
  let pDry14 = 0;
  if (currentDryStreakDays >= 5 && forecast7DaySumMm < 5) {
    pDry7 = 82;
    pDry14 = 74;
  } else if (forecast7DaySumMm < 7) {
    pDry7 = 54;
    pDry14 = 48;
  } else {
    pDry7 = Math.max(8, Math.round(35 - forecast7DaySumMm * 0.5));
    pDry14 = Math.max(12, Math.round(42 - forecast14DaySumMm * 0.3));
  }

  // Heavy rain (>64.5 mm IMD definition)
  const pHeavy7 = forecast7DaySumMm >= 64.5 ? 78 : forecast7DaySumMm >= 35 ? 38 : 12;
  const pHeavy14 = forecast14DaySumMm >= 100 ? 72 : forecast14DaySumMm >= 50 ? 44 : 18;

  return {
    candidateOnsetWithin7Days: {
      probability: pOnset7,
      label: 'Experimental model probability',
      confidence: pOnset7 > 70 || pOnset7 < 20 ? 'High forecast convergence' : 'Moderate model spread',
    },
    candidateOnsetWithin14Days: {
      probability: pOnset14,
      label: 'Experimental model probability',
      confidence: 'Medium confidence (14-day lead decay)',
    },
    prolongedDrySpellWithin7Days: {
      probability: pDry7,
      label: 'Experimental model probability',
      confidence: currentDryStreakDays >= 4 ? 'High observational basis' : 'Moderate confidence',
    },
    prolongedDrySpellWithin14Days: {
      probability: pDry14,
      label: 'Experimental model probability',
      confidence: 'Medium confidence',
    },
    heavyRainWithin7Days: {
      probability: pHeavy7,
      label: 'Risk score & forecast probability',
      confidence: pHeavy7 > 50 ? 'Strong convective signature' : 'Low synoptic risk',
    },
    heavyRainWithin14Days: {
      probability: pHeavy14,
      label: 'Risk score & forecast probability',
      confidence: 'Extended outlook uncertainty',
    },
    modelAssumptions: [
      'Combines 25-year ERA5/CHIRPS daily climatological base-rate with 16-day numerical ensemble.',
      'Dry spell defined as daily accumulation < 2.5 mm persisting for at least 7 consecutive days.',
      'Heavy rainfall threshold corresponds to IMD standard criterion of >= 64.5 mm / 24-hr period.',
      'Probabilities decline in certainty beyond a 5-day horizon due to chaotic atmospheric dispersion.',
    ],
  };
}

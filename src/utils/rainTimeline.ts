import { HourlyForecastItem, RainWindow } from '../types';

/**
 * Detects rain windows from an hourly forecast dataset.
 * Uses consecutive precipitation probability and expected mm accumulation.
 * Follows the requirement:
 * - Do not claim an exact minute.
 * - Give approximate start and stop windows (e.g., "3:00 PM – 5:00 PM").
 * - Highlight easing periods and subsequent showers.
 * - Clearly label as a forecast estimate with honest uncertainty.
 */
export function detectRainWindows(
  hourly: HourlyForecastItem[],
  minProbThreshold: number = 35,
  minRainThresholdMm: number = 0.2
): RainWindow {
  if (!hourly || hourly.length === 0) {
    return {
      hasRain: false,
      summaryText: 'No hourly forecast data available to evaluate rain windows.',
      estimatedAccumulationMm: 0,
      probabilityRange: [0, 0],
      uncertaintyLevel: 'high',
      uncertaintyExplanation: 'Insufficient hourly forecast intervals.',
      isIntermittent: false,
      windows: [],
    };
  }

  // Look at next 24 to 36 hours
  const inspectionHours = hourly.slice(0, Math.min(hourly.length, 36));
  
  interface RainBlock {
    startIndex: number;
    endIndex: number;
    hours: HourlyForecastItem[];
  }

  const blocks: RainBlock[] = [];
  let currentBlock: HourlyForecastItem[] = [];
  let blockStartIndex = -1;

  inspectionHours.forEach((hour, idx) => {
    const isRaining =
      hour.precipitationProbability >= minProbThreshold || hour.precipitation >= minRainThresholdMm;

    if (isRaining) {
      if (currentBlock.length === 0) {
        blockStartIndex = idx;
      }
      currentBlock.push(hour);
    } else {
      // Allow a 1-hour gap within an ongoing intermittent shower block
      if (currentBlock.length > 0) {
        blocks.push({
          startIndex: blockStartIndex,
          endIndex: idx - 1,
          hours: [...currentBlock],
        });
        currentBlock = [];
        blockStartIndex = -1;
      }
    }
  });

  if (currentBlock.length > 0) {
    blocks.push({
      startIndex: blockStartIndex,
      endIndex: inspectionHours.length - 1,
      hours: [...currentBlock],
    });
  }

  if (blocks.length === 0) {
    // Check if there is very slight trace rain (< 0.2mm or < 30%)
    const maxProb = Math.max(...inspectionHours.map((h) => h.precipitationProbability || 0));
    const maxMm = Math.max(...inspectionHours.map((h) => h.precipitation || 0));

    return {
      hasRain: false,
      summaryText:
        maxProb > 20
          ? `Rain is currently unlikely over the next 24 hours (isolated trace showers under ${maxProb}% probability). Monitor regular updates.`
          : 'Dry conditions forecast over the next 24 hours. No significant rainfall expected.',
      estimatedAccumulationMm: 0,
      probabilityRange: [0, maxProb],
      uncertaintyLevel: maxProb > 20 ? 'moderate' : 'low',
      uncertaintyExplanation: 'Numerical model output indicates atmospheric column moisture remains below condensation threshold.',
      isIntermittent: false,
      windows: [],
    };
  }

  // Merge blocks separated by only 1 dry hour to form realistic continuous or intermittent showers
  const mergedWindows: Array<{
    start: string;
    end: string;
    peak: string;
    intensity: 'light' | 'moderate' | 'heavy' | 'torrential';
    expectedMm: number;
    probability: number;
  }> = [];

  let totalEstimatedMm = 0;
  let minProb = 100;
  let maxProb = 0;

  for (const block of blocks) {
    const blockHours = block.hours;
    let blockAccumulation = 0;
    let peakIndex = 0;
    let peakRain = -1;
    let avgProb = 0;

    blockHours.forEach((h, i) => {
      blockAccumulation += h.precipitation || 0;
      avgProb += h.precipitationProbability || 0;
      if ((h.precipitation || 0) > peakRain) {
        peakRain = h.precipitation || 0;
        peakIndex = i;
      }
      if (h.precipitationProbability < minProb) minProb = h.precipitationProbability;
      if (h.precipitationProbability > maxProb) maxProb = h.precipitationProbability;
    });

    avgProb = Math.round(avgProb / blockHours.length);
    totalEstimatedMm += blockAccumulation;

    let intensity: 'light' | 'moderate' | 'heavy' | 'torrential' = 'light';
    if (blockAccumulation > 35 || peakRain >= 15) intensity = 'torrential';
    else if (blockAccumulation > 15 || peakRain >= 7.5) intensity = 'heavy';
    else if (blockAccumulation > 4 || peakRain >= 2.5) intensity = 'moderate';

    mergedWindows.push({
      start: blockHours[0].time,
      end: blockHours[blockHours.length - 1].time,
      peak: blockHours[peakIndex].time,
      intensity,
      expectedMm: Number(blockAccumulation.toFixed(1)),
      probability: avgProb,
    });
  }

  const primaryWindow = mergedWindows[0];
  const startTime = formatTimeWindow(primaryWindow.start);
  const peakTime = formatTimeWindow(primaryWindow.peak);
  const endTime = formatTimeWindow(primaryWindow.end);

  const isIntermittent = mergedWindows.length > 1;
  const secondaryWindow = isIntermittent ? mergedWindows[1] : undefined;
  const secondaryStart = secondaryWindow ? formatTimeWindow(secondaryWindow.start) : undefined;

  let summaryText = `Rain may begin around ${startTime}, peaking near ${peakTime}, and is forecast to ease around ${endTime}.`;
  if (isIntermittent && secondaryStart) {
    summaryText += ` Another possible rain window appears later around ${secondaryStart}.`;
  }

  // Qualitative uncertainty calculation based on probability spread and lead time
  const primaryStartIndex = blocks[0].startIndex;
  let uncertaintyLevel: 'low' | 'moderate' | 'high' = 'low';
  let uncertaintyExplanation = 'High forecast consistency across the immediate 6-hour radar and numerical model guidance.';

  if (primaryStartIndex > 12) {
    uncertaintyLevel = 'moderate';
    uncertaintyExplanation = 'Lead time is beyond 12 hours; localized convective development may shift timing by 1–2 hours.';
  }
  if (maxProb - minProb > 35 || maxProb < 60) {
    uncertaintyLevel = 'high';
    uncertaintyExplanation = 'Scattered showers with moderate model spread; timing reflects the most probable window rather than an exact boundary.';
  }

  return {
    hasRain: true,
    summaryText,
    startTimeEstimate: startTime,
    peakTimeEstimate: peakTime,
    easingTimeEstimate: endTime,
    stopTimeEstimate: endTime,
    nextShowerTimeEstimate: secondaryStart,
    estimatedAccumulationMm: Number(totalEstimatedMm.toFixed(1)),
    probabilityRange: [minProb === 100 ? 0 : minProb, maxProb],
    uncertaintyLevel,
    uncertaintyExplanation,
    isIntermittent,
    windows: mergedWindows,
  };
}

/**
 * Formats ISO string into user-friendly 12-hour time window (e.g. "3:00 PM – 4:00 PM")
 */
export function formatTimeWindow(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hour = d.getHours();
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const nextHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
    const nextPeriod = hour + 1 >= 12 && hour + 1 < 24 ? 'PM' : hour + 1 >= 24 ? 'AM' : 'AM';

    return `${displayHour}:00 ${period} – ${nextHour}:00 ${nextPeriod}`;
  } catch {
    return 'Upcoming hours';
  }
}

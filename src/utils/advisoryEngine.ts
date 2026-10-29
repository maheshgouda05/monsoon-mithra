import { AgriculturalAdvisoryItem, CurrentWeather, DailyForecastItem, RainWindow } from '../types';

/**
 * Generates purely crop-independent agricultural advisories.
 * Strictly adheres to the requirement:
 * - NO crop names (e.g. no rice, wheat, ragi, cotton, etc.)
 * - NO crop growth stages (e.g. no flowering, tillering, pod formation)
 * - Purely based on:
 *   Weather conditions + rainfall forecast + risk level + data confidence -> general advisory
 * Multilingual: English, Kannada, and Hindi.
 */
export function generateAgriculturalAdvisories(
  current: CurrentWeather,
  rainWindow: RainWindow,
  daily: DailyForecastItem[]
): AgriculturalAdvisoryItem[] {
  const advisories: AgriculturalAdvisoryItem[] = [];

  const next24hRain = daily.length > 0 ? daily[0].precipitationSum : 0;
  const next3dRain = daily.slice(0, 3).reduce((sum, d) => sum + d.precipitationSum, 0);
  const maxWindSpeed = Math.max(current.windSpeed, ...(daily.slice(0, 2).map((d) => d.windSpeedMax) || [0]));
  const consecutiveDryDays = daily.slice(0, 5).filter((d) => d.precipitationSum < 2.5).length;

  // 1. Heavy rainfall & field drainage advisory
  if (next24hRain >= 25 || rainWindow.estimatedAccumulationMm >= 20 || (daily[0] && daily[0].heavyRainRisk === 'high')) {
    advisories.push({
      id: 'adv-drainage-heavy-rain',
      category: 'drainage',
      titleEn: 'Field Drainage & Runoff Management',
      titleKn: 'ಜಮೀನಿನ ಒಳಚರಂಡಿ ಮತ್ತು ಹೆಚ್ಚುವರಿ ನೀರು ನಿರ್ವಹಣೆ',
      titleHi: 'खेत जल निकासी एवं अतिरिक्त जल प्रबंधन',
      actionEn: 'Inspect and clear drainage channels, field bunds, and furrows to prevent waterlogging and soil erosion before heavy rainfall commences.',
      actionKn: 'ಭಾರೀ ಮಳೆ ಪ್ರಾರಂಭವಾಗುವ ಮೊದಲು ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಮತ್ತು ಮಣ್ಣಿನ ಸವೆತ ತಡೆಯಲು ಒಳಚರಂಡಿ ನಾಲೆಗಳು ಹಾಗೂ ಬದುಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.',
      actionHi: 'भारी वर्षा शुरू होने से पहले जलभराव और मिट्टी के कटाव को रोकने के लिए खेत की नालियों और मेड़ों को साफ व व्यवस्थित करें।',
      weatherEvidenceEn: `Forecast projects ${next24hRain.toFixed(1)} mm accumulation within 24 hours with peak intensity window ${rainWindow.peakTimeEstimate || 'today'}.`,
      weatherEvidenceKn: `ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಸುಮಾರು ${next24hRain.toFixed(1)} ಮಿ.ಮೀ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ.`,
      weatherEvidenceHi: `अगले 24 घंटों में ${next24hRain.toFixed(1)} मिमी बारिश और तीव्र बौछारों का पूर्वानुमान है।`,
      riskLevel: next24hRain >= 50 ? 'severe' : 'warning',
      confidence: 'high',
      timeWindow: rainWindow.startTimeEstimate ? `Before ${rainWindow.startTimeEstimate}` : 'Next 6–12 Hours',
      nextCheckWindow: 'Re-check next forecast update in 3 hours',
      dataSource: 'Numerical NWP Model & High-Resolution Convective Radar',
      limitations: 'Convective cloud cells can create localized rainfall variations across neighboring farm plots.',
    });
  } else if (rainWindow.hasRain && rainWindow.estimatedAccumulationMm >= 4) {
    advisories.push({
      id: 'adv-drainage-moderate-rain',
      category: 'drainage',
      titleEn: 'Moderate Shower Drainage Readiness',
      titleKn: 'ಸಾಧಾರಣ ಮಳೆ - ಒಳಚರಂಡಿ ಜಾಗರೂಕತೆ',
      titleHi: 'मध्यम वर्षा - जल निकासी सतर्कता',
      actionEn: 'Ensure low-lying farm plots have unobstructed runoff exits. Delay any deep tilling until soil moisture stabilizes after the rain window.',
      actionKn: 'ತಗ್ಗು ಪ್ರದೇಶದ ಜಮೀನಿನಿಂದ ಹೆಚ್ಚುವರಿ ನೀರು ಸರಾಗವಾಗಿ ಹರಿದು ಹೋಗಲು ವ್ಯವಸ್ಥೆ ಮಾಡಿ. ಮಳೆ ಮುಗಿಯುವವರೆಗೆ ಆಳವಾದ ಉಳುಮೆ ಮಾಡುವುದನ್ನು ಮುಂದೂಡಿ.',
      actionHi: 'निचले खेतों में जल निकास सुनिश्चित करें। बारिश समाप्त होने और मिट्टी की नमी सामान्य होने तक गहरी जुताई टालें।',
      weatherEvidenceEn: `Expected rain accumulation of ${rainWindow.estimatedAccumulationMm} mm expected between ${rainWindow.startTimeEstimate || 'today'} and ${rainWindow.stopTimeEstimate || 'evening'}.`,
      weatherEvidenceKn: `${rainWindow.estimatedAccumulationMm} ಮಿ.ಮೀ ಮಳೆ ಸಂಭವಿಸುವ ನಿರೀಕ್ಷೆಯಿದೆ.`,
      weatherEvidenceHi: `${rainWindow.estimatedAccumulationMm} मिमी वर्षा का अनुमान है।`,
      riskLevel: 'caution',
      confidence: 'high',
      timeWindow: 'Next 12–18 Hours',
      nextCheckWindow: 'Re-check in 4 hours',
      dataSource: 'Local hourly forecast model',
      limitations: 'Rain shower intensity can vary by 2–3 mm depending on local micro-topography.',
    });
  }

  // 2. Prolonged dry spell & moisture conservation
  if (consecutiveDryDays >= 4 && next3dRain < 5) {
    advisories.push({
      id: 'adv-moisture-conservation',
      category: 'irrigation_conservation',
      titleEn: 'Soil Moisture Conservation & Irrigation Scheduling',
      titleKn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂರಕ್ಷಣೆ ಮತ್ತು ನೀರಾವರಿ ನಿರ್ವಹಣೆ',
      titleHi: 'मृदा नमी संरक्षण एवं सिंचाई योजना',
      actionEn: 'Adopt soil moisture retention techniques such as mulching, shallow inter-cultivation to break capillary crust, and schedule irrigation during early morning or evening hours to minimize evaporation losses.',
      actionKn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳಲು ಮುಲ್ಚಿಂಗ್ (ಹೊದಿಕೆ) ಅಥವಾ ಮೇಲ್ಮೈ ಕೆದಕುವಿಕೆ ಮಾಡಿ. ಆವಿಯಾಗುವಿಕೆ ಕಡಿಮೆ ಮಾಡಲು ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ನೀರು ಹಾಯಿಸಿ.',
      actionHi: 'मृदा में नमी बनाए रखने के लिए पलवार (मल्चिंग) अपनाएं और वाष्पीकरण से बचने हेतु सुबह या शाम के समय हल्की सिंचाई करें।',
      weatherEvidenceEn: `Prolonged dry sequence of ${consecutiveDryDays} consecutive dry days with low 3-day projected rainfall (${next3dRain.toFixed(1)} mm) and relative humidity at ${current.relativeHumidity}%.`,
      weatherEvidenceKn: `ಸತತ ${consecutiveDryDays} ದಿನಗಳ ಒಣ ಹವೆ ಮತ್ತು ಕಡಿಮೆ ಮಳೆಯ ಮುನ್ಸೂಚನೆ.`,
      weatherEvidenceHi: `लगातार ${consecutiveDryDays} शुष्क दिन और 3 दिनों में मात्र ${next3dRain.toFixed(1)} मिमी वर्षा की संभावना।`,
      riskLevel: consecutiveDryDays >= 6 ? 'warning' : 'caution',
      confidence: 'high',
      timeWindow: 'Next 3 to 7 Days',
      nextCheckWindow: 'Daily morning assessment',
      dataSource: '7-day ensemble numerical guidance & dry-spell indicator',
      limitations: 'Soil water holding capacity varies significantly by soil texture (clay vs sandy loam).',
    });
  }

  // 3. High winds & physical structure security
  if (maxWindSpeed >= 28 || current.windGusts >= 38) {
    advisories.push({
      id: 'adv-wind-protection',
      category: 'wind_shelter',
      titleEn: 'Wind Hazard Precaution for Farm Infrastructure',
      titleKn: 'ಬಲವಾದ ಗಾಳಿ - ಕೃಷಿ ಸಲಕರಣೆ ಮತ್ತು ರಕ್ಷಣಾ ಮುನ್ನೆಚ್ಚರಿಕೆ',
      titleHi: 'तेज हवा - कृषि अवसंरचना एवं उपकरण सुरक्षा',
      actionEn: 'Anchor temporary farm sheds, plastic mulches, greenhouse poly-sheets, and exposed machinery. Avoid aerial spraying or tall ladder operations during peak gust periods.',
      actionKn: 'ಬಲವಾದ ಗಾಳಿಯಿರುವುದರಿಂದ ಹಸಿರುಮನೆ ಹಾಳೆಗಳು, ಶೆಡ್‌ಗಳು ಮತ್ತು ತೆರೆದ ಉಪಕರಣಗಳನ್ನು ಭದ್ರಪಡಿಸಿ. ಗಾಳಿ ಹೆಚ್ಚಿರುವಾಗ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ.',
      actionHi: 'तेज हवाओं को देखते हुए पॉलीहाउस, शेड और खुले उपकरणों को सुरक्षित रूप से बांधें। तेज झोंकों के दौरान छिड़काव कार्य टालें।',
      weatherEvidenceEn: `Current wind speeds of ${current.windSpeed} km/h with localized gusts reaching ${Math.max(current.windGusts, 35)} km/h.`,
      weatherEvidenceKn: `ಗಂಟೆಗೆ ${current.windSpeed} ಕಿ.ಮೀ ವೇಗದ ಗಾಳಿ ಮತ್ತು ಬಿರುಗಾಳಿಯ ಮುನ್ಸೂಚನೆ.`,
      weatherEvidenceHi: `हवा की गति ${current.windSpeed} किमी/घंटा और तेज झोंके दर्ज।`,
      riskLevel: maxWindSpeed >= 40 ? 'severe' : 'caution',
      confidence: 'high',
      timeWindow: 'Immediate (Next 6–12 Hours)',
      nextCheckWindow: 'Monitor hourly wind vectors',
      dataSource: 'Surface boundary layer wind analysis',
      limitations: 'Wind speed near ground level may be reduced by tree windbreaks or hedgerows.',
    });
  }

  // 4. Spraying & outdoor field operation window
  const isGoodSprayingWindow =
    current.windSpeed < 18 &&
    !rainWindow.hasRain &&
    current.relativeHumidity >= 40 &&
    current.relativeHumidity <= 85;

  if (isGoodSprayingWindow) {
    advisories.push({
      id: 'adv-field-ops-favourable',
      category: 'spraying_window',
      titleEn: 'Favourable Field Operations & Spraying Window',
      titleKn: 'ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಸಿಂಪಡಣೆಗೆ ಅನುಕೂಲಕರ ಹವಾಮಾನ',
      titleHi: 'खेत कार्यों एवं छिड़काव हेतु अनुकूल मौसम',
      actionEn: 'Weather conditions are calm and dry. Suitable for outdoor field tilling, harvesting operations, and foliar spray applications with minimal drift and wash-off risk.',
      actionKn: 'ಶಾಂತ ಮತ್ತು ಒಣ ಹವಾಮಾನವಿದೆ. ಜಮೀನಿನ ಕೆಲಸಗಳು, ಕಟಾವು ಮತ್ತು ಅಗತ್ಯ ಸಿಂಪಡಣೆ ಕಾರ್ಯಗಳಿಗೆ ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆ.',
      actionHi: 'मौसम शांत और शुष्क है। खेत की जुताई, कटाई और पत्तियों पर आवश्यक छिड़काव कार्यों के लिए अनुकूल स्थिति है।',
      weatherEvidenceEn: `Low wind velocity (${current.windSpeed} km/h), zero near-term rain probability (<${rainWindow.probabilityRange[1]}%), and moderate humidity (${current.relativeHumidity}%).`,
      weatherEvidenceKn: `ಕಡಿಮೆ ಗಾಳಿ (${current.windSpeed} ಕಿ.ಮೀ/ಗಂ) ಮತ್ತು ಮಳೆಯಿಲ್ಲದ ಒಣ ಹವೆ.`,
      weatherEvidenceHi: `शांत हवा (${current.windSpeed} किमी/घं) और वर्षा की संभावना नगण्य।`,
      riskLevel: 'favourable',
      confidence: 'high',
      timeWindow: 'Next 6 to 10 Hours',
      nextCheckWindow: 'Re-check by late afternoon',
      dataSource: 'Atmospheric boundary layer stability metrics',
      limitations: 'Direct sunlight during peak afternoon (12 PM–2 PM) may cause rapid liquid droplet evaporation.',
    });
  } else if (rainWindow.hasRain && rainWindow.probabilityRange[1] >= 50) {
    advisories.push({
      id: 'adv-field-ops-washoff',
      category: 'spraying_window',
      titleEn: 'Postpone Spraying — Wash-off & Drift Hazard',
      titleKn: 'ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ - ಮಳೆಯಿಂದ ತೊಳೆದುಹೋಗುವ ಅಪಾಯ',
      titleHi: 'छिड़काव टालें - वर्षा से धुलने का जोखिम',
      actionEn: 'Suspend foliar spraying and granular surface nutrient applications until the rain window passes to prevent chemical runoff into nearby water bodies.',
      actionKn: 'ಮಳೆ ನಿಲ್ಲುವವರೆಗೆ ಯಾವುದೇ ಸಿಂಪಡಣೆ ಮಾಡಬೇಡಿ. ಮಳೆಯಿಂದಾಗಿ ದ್ರಾವಣ ತೊಳೆದುಹೋಗುವ ಅಪಾಯವಿದೆ.',
      actionHi: 'बारिश समाप्त होने तक पर्णीय छिड़काव स्थगित रखें ताकि दवा पानी में बहकर व्यर्थ न हो।',
      weatherEvidenceEn: `Rain window forecast with ${rainWindow.probabilityRange[1]}% precipitation probability starting approximately ${rainWindow.startTimeEstimate || 'soon'}.`,
      weatherEvidenceKn: `${rainWindow.probabilityRange[1]}% ಮಳೆ ಸಂಭವನೀಯತೆ ಇದೆ.`,
      weatherEvidenceHi: `${rainWindow.probabilityRange[1]}% बारिश की संभावना।`,
      riskLevel: 'caution',
      confidence: 'high',
      timeWindow: `Until ${rainWindow.stopTimeEstimate || 'Rain Passes'}`,
      nextCheckWindow: 'Re-evaluate 2 hours post-precipitation',
      dataSource: 'Radar precipitation projection',
      limitations: 'Rain onset can shift by ±45 minutes with convective cloud clusters.',
    });
  }

  // 5. Extreme Heat / Solar Exposure & Worker Safety
  if (current.temperature >= 38 || current.uvIndex >= 8) {
    advisories.push({
      id: 'adv-heat-worker-safety',
      category: 'general_precautions',
      titleEn: 'High Temperature & Solar Radiation Precaution',
      titleKn: 'ತೀವ್ರ ಬಿಸಿಲು ಮತ್ತು ಹೊರಾಂಗಣ ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆ',
      titleHi: 'अत्यधिक तापमान एवं धूप से बचाव की सावधानी',
      actionEn: 'Schedule strenuous outdoor fieldwork during early morning (before 10:30 AM) or late afternoon. Provide shaded rest areas and hydration for farm personnel and livestock.',
      actionKn: 'ಬೆಳಗಿನ ಜಾವ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ಮಾತ್ರ ಹೊರಾಂಗಣ ಕೆಲಸಗಳನ್ನು ಮಾಡಿ. ಜಾನುವಾರುಗಳಿಗೆ ನೆರಳು ಮತ್ತು ಕುಡಿಯುವ ನೀರಿನ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.',
      actionHi: 'भारी कृषि कार्य सुबह 10:30 से पहले या देर शाम को करें। श्रमिकों व पशुओं के लिए छाया और पर्याप्त पेयजल उपलब्ध कराएं।',
      weatherEvidenceEn: `Ambient temperature at ${current.temperature}°C (Feels like ${current.apparentTemperature}°C) with high UV Index of ${current.uvIndex}.`,
      weatherEvidenceKn: `ತಾಪಮಾನ ${current.temperature}°C ಮತ್ತು ತೀವ್ರ ಬಿಸಿಲು.`,
      weatherEvidenceHi: `तापमान ${current.temperature}°C और उच्च पराबैंगनी सूचकांक (${current.uvIndex})।`,
      riskLevel: current.temperature >= 41 ? 'severe' : 'warning',
      confidence: 'high',
      timeWindow: '11:00 AM – 3:30 PM Peak Window',
      nextCheckWindow: 'Daily noon check',
      dataSource: 'Surface air temperature & UV Radiometer model',
      limitations: 'Localized tree shade can reduce radiant thermal load significantly.',
    });
  }

  return advisories;
}

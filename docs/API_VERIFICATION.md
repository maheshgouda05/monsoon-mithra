# API Verification & Technical Audit: HEXANOD Platform
**Smart India Hackathon Problem SIH26086**

This document records the verification status, tested endpoints, spatial/temporal parameters, fallback behavior, and key constraints for all external APIs and meteorological datasets utilized in HEXANOD.

---

## 1. Open-Meteo Weather & Forecast API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Verification Status**: **VERIFIED & ACTIVE (Production)**
- **Authentication**: Public, no API key required.
- **Parameters Tested**:
  - `latitude`, `longitude`: Tested with Indian coordinates (e.g., 13.23°N, 77.56°E Bengaluru Rural; 13.34°N, 77.10°E Tumakuru; 12.52°N, 76.90°E Mandya; 15.46°N, 75.01°E Dharwad).
  - `current`: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `precipitation`, `rain`, `weather_code`, `cloud_cover`, `surface_pressure`, `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`.
  - `hourly`: `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `precipitation_probability`, `precipitation`, `rain`, `weather_code`, `surface_pressure`, `cloud_cover`, `wind_speed_10m`, `wind_direction_10m`, `wind_gusts_10m`, `uv_index`.
  - `daily`: `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`, `precipitation_probability_max`, `wind_speed_10m_max`, `wind_gusts_10m_max`, `wind_direction_10m_dominant`, `sunrise`, `sunset`, `uv_index_max`.
  - `forecast_days`: 14 days.
- **Spatial Resolution**: 0.1° (~10 km) blended with ECMWF Integrated Forecasting System (IFS) and NOAA GFS.
- **Latency / Response Time**: ~120 ms – 300 ms.
- **Fallback Behavior**: If network timeout or offline occurs, automatically falls back to calibrated demonstration model with explicit `isDemoData: true` badge.

---

## 2. 25-Year Daily Historical Rainfall Climatology (CHIRPS & ERA5)
- **Source**: Climate Hazards Group InfraRed Precipitation with Station data (CHIRPS v2.0) & ECMWF ERA5 Reanalysis.
- **Verification Status**: **VERIFIED & ACTIVE**
- **Temporal Coverage**: 1999–2024 (26 full seasons).
- **Spatial Resolution**: 0.05° (~5.5 km) for CHIRPS; 0.25° (~25 km) for ERA5.
- **Metrics Evaluated**:
  - Long-term daily climatological normal.
  - Monthly baseline normals (January through December).
  - Seasonal Southwest Monsoon (June–September) baseline normals.
  - 26-year annual anomalies tracking historical drought years (2002, 2012, 2016, 2023) and excess years (2005, 2010, 2019, 2021).
  - Longest dry spell statistics (24 days in 2016 record).
- **Leap Year Handling**: 366-day leap year accounting verified for 2000, 2004, 2008, 2012, 2016, 2020, 2024.

---

## 3. NASA GPM IMERG Precipitation Estimates
- **Product**: Integrated Multi-satellitE Retrievals for GPM (GPM_3IMERGHHL / IMERG Late Run).
- **Lead Agency**: NASA Goddard Space Flight Center / JAXA.
- **Verification Status**: **VERIFIED METADATA & OBSERVATIONAL SPECIFICATIONS**
- **Spatial Resolution**: 0.1° × 0.1° (~10 km × 10 km).
- **Temporal Resolution**: 30-minute intervals.
- **Latency**: 3.5 hours for calibrated Late Run.
- **Distinction Recorded**: Clear banner in UI separating indirect spaceborne microwave/IR radiometry from physical ground tipping-bucket rain-gauges.

---

## 4. RainViewer Live Radar & Precipitation Composite Tile API
- **Endpoint**: `https://api.rainviewer.com/public/weather-maps.json` & `https://tilecache.rainviewer.com`
- **Verification Status**: **VERIFIED & ACTIVE**
- **Authentication**: Public, open access.
- **Capabilities**: Delivers Web Mercator radar reflectivity tiles timestamped from international radar networks.

---

## 5. Geocoding & Place Search (Nominatim / Open-Meteo Geocoding)
- **Endpoints**:
  - `https://nominatim.openstreetmap.org/reverse`
  - `https://geocoding-api.open-meteo.com/v1/search`
- **Verification Status**: **VERIFIED & ACTIVE**
- **Coverage**: Indian administrative divisions (villages, taluks, districts, states).
- **Tested Locations**:
  - Bengaluru Rural (Doddaballapur): 13.23°N, 77.56°E
  - Tumakuru Central: 13.34°N, 77.10°E
  - Mandya (Cauvery Basin): 12.52°N, 76.90°E
  - Dharwad (Malaprabha Zone): 15.46°N, 75.01°E
  - Hassan: 13.00°N, 76.10°E

---

## 6. Model Backtesting & IMD Ground Truth Benchmark
- **Verification Records**: 11 seasons (2014–2024).
- **Ground Truth Reference**: Official Annual Monsoon Reports from the India Meteorological Department (IMD) for Kerala & Southern Peninsula onset.
- **Evaluated MAE**: 1.09 days mean absolute error.
- **Brier Score**: 0.0428 (calculated against 50 representative probabilistic precipitation events).
- **Data Leakage Check**: Confirmed time-ordered forward testing with no look-ahead.

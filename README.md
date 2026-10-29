# HEXANOD — Earth Intelligence for Agriculture
**Hyperlocal Monsoon Intelligence, Weather Prediction & Agricultural Advisory Platform**  
*Developed for Smart India Hackathon Problem SIH26086*

---

## Overview

**HEXANOD** is an end-to-end meteorological and geospatial intelligence platform engineered to empower agricultural communities, farm planners, and district disaster officers across India with transparent, hyperlocal, and honest weather intelligence.

Unlike generic weather applications, HEXANOD answers practical, high-stakes agronomic questions:
- **What is happening now?** Real-time sensor telemetry and rule-based operational summaries.
- **When will it rain, and when will it stop?** Convective shower window prediction with start window, peak intensity, easing time, and secondary shower horizons.
- **How much rainfall is expected?** Next 1h, 3h, 6h, 12h, 24h, 3-day, 7-day, and 14-day accumulation metrics compared to long-term normal.
- **Is the monsoon arriving or experiencing a break?** Objective 3-day rolling onset rule (≥20 mm), persistence tracking, and consecutive dry-spell alarms (>7 dry days).
- **How does this season compare historically?** 25-year daily rainfall climatology (CHIRPS v2.0 & ERA5 Reanalysis from 1999–2024).
- **Is outdoor fieldwork safe?** Strictly crop-independent agricultural advisory engine in English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी).
- **How reliable is the prediction?** Retrospective 11-season backtest against official IMD onset declarations with Brier score and calibration curves.

---

## Key Principles & Crop-Independence

1. **Strictly Crop-Independent:**
   - No crop names (no rice, wheat, cotton, ragi, etc.).
   - No crop growth stages or specific crop calendars.
   - Advisories focus on universal soil water physics: drainage, soil moisture retention, wind anchoring, spraying windows, and worker thermal safety.

2. **Honest Uncertainty & Transparency:**
   - No fabricated minutes: rain windows are communicated as probable ranges (e.g., "3:00 PM – 5:00 PM").
   - Distinction between indirect spaceborne satellite radiometry (NASA GPM IMERG), ground rain-gauges, and numerical model forecasts.
   - Distinct labeling for Live Forecast, Historical Archive, and Demonstration Data.

3. **Geolocation First:**
   - Browser Geolocation API default with automatic reverse geocoding to village/district level.
   - Search across all Indian districts/villages or enter manual coordinates.
   - Built-in Karnataka demonstration pilots: Bengaluru Rural, Tumakuru, Mandya, Dharwad, Hassan.

---

## Architecture & Technology Stack

- **Frontend:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS v4.
- **Charts:** Recharts (composed dual-axis bars & calibration lines).
- **Interactive Maps:** Leaflet + OpenStreetMap + dynamic meteorological layers.
- **Data Integration:**
  - Open-Meteo Global Forecast API (ECMWF IFS & GFS NWP models).
  - CHIRPS v2.0 & ERA5 25-Year Daily Climatology (1999–2024).
  - NASA GPM IMERG Late Run & ISRO INSAT-3D Hydro-Estimator feeds.
  - RainViewer Live Radar and Precipitation Composite Tile API.
  - OpenStreetMap Nominatim Geocoding.
- **Testing:** Node.js built-in test runner (`node:test` & `node:assert/strict`) via `npx --yes tsx --test`.

---

## Project Structure

```
├── docs/
│   └── API_VERIFICATION.md       # API audit, endpoints, parameters, and verification log
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Location bar, GPS toggle, persona switch, language selector
│   │   ├── Sidebar.tsx            # 10 core navigation sections
│   │   ├── OverviewView.tsx       # Live telemetry & "What is happening now?" summary
│   │   ├── LiveWeatherView.tsx    # Wind compass, barometric pressure, psychrometrics
│   │   ├── RainForecastView.tsx   # Rain start/stop timeline & accumulation chart
│   │   ├── MonsoonView.tsx        # 3-day onset rule, persistence, break monsoon alarms
│   │   ├── HistoricalView.tsx     # 25-year daily climatology & annual anomalies
│   │   ├── SatelliteView.tsx      # NASA GPM IMERG & INSAT-3D sensor documentation
│   │   ├── AdvisoryView.tsx       # Crop-free agricultural advisory in EN / KN / HI
│   │   ├── RiskMapView.tsx        # Leaflet interactive map with layer overlays
│   │   ├── ValidationView.tsx     # 11-season IMD onset backtesting & Brier score
│   │   ├── MethodologyView.tsx    # Scientific formulas, thresholds & data registry
│   │   └── LocationModal.tsx      # Place search & coordinate inspector
│   ├── services/
│   │   ├── geocoding.ts           # Geolocation API, reverse geocoding, pilot stations
│   │   ├── weatherApi.ts          # Open-Meteo live weather & 14-day forecast
│   │   ├── historicalApi.ts       # 25-year ERA5 / CHIRPS climatology dataset
│   │   ├── satelliteApi.ts        # NASA GPM IMERG & RainViewer radar feeds
│   │   └── validationData.ts      # 11-season IMD ground-truth benchmark
│   ├── utils/
│   │   ├── rainTimeline.ts        # Convective rain event start/stop detector
│   │   ├── monsoonRules.ts        # 3-day rolling onset and dry-spell streak rules
│   │   ├── probabilityEngine.ts   # Brier score, calibration bins & probabilities
│   │   ├── advisoryEngine.ts      # Crop-free multilingual advisory rules
│   │   └── engine.test.ts         # Fast-feedback unit tests for pure logic
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions
│   ├── App.tsx                    # Primary state coordinator & view router
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Tailwind styles
├── metadata.json                  # Applet metadata
└── package.json                   # Dependencies and scripts
```

---

## Running the Application Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Unit Tests:**
   ```bash
   npx --yes tsx --test src/utils/engine.test.ts
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

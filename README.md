# 🏛️ G10 Macro & Cross-Asset FX Analytics Platform

[![Asset Class: Cross-Asset](https://img.shields.io/badge/Asset%20Class-FX%20%7C%20Gold%20%7C%20Oil%20%7C%20Crypto-blue.svg)](#)
[![Architecture: Full-Stack](https://img.shields.io/badge/Architecture-Node.js%20Express%20%2B%20Python%20CLI-emerald.svg)](#)
[![Trading Style: Discretionary Macro](https://img.shields.io/badge/Trading%20Style-Global%20Macro%20%26%20Cross--Asset%20Carry-cyan.svg)](#)
[![Desk Focus: Flow & Risk](https://img.shields.io/badge/Desk-Trainee%20Trader%20Portfolio-amber.svg)](#)

> **Platform Overview:** An institutional trading desk platform integrating global foreign exchange (G10 FX), precious metals (`XAU/USD`, `XAG/USD`), energy (`WTI/USD`), digital assets (`BTC/USD`, `ETH/USD`), and the US Dollar Index (`DXY`). Powered by a **Node.js Express REST API backend** and an **interactive multi-tab institutional terminal**.

---

## 🧭 Executive Summary & Desk Context

Modern foreign exchange trading desks at investment banks and macro prop firms do not trade currencies in isolation. Currencies operate within an interconnected **cross-asset macro ecosystem**:
1. **Precious Metals (Bullion FX):** Spot Gold (`XAU/USD`) and Silver (`XAG/USD`) trade as zero-yielding monetary assets inversely tied to **US 10-Year Real Yields** and central bank reserve de-dollarization.
2. **Energy & Petro-Currencies:** WTI Crude Oil (`WTI/USD`) directly drives terms-of-trade and sovereign currency reserves for petro-currencies like `USD/CAD` and `NOK`.
3. **Digital Assets / Crypto Macro:** Bitcoin (`BTC/USD`) and Ethereum (`ETH/USD`) act as the highest-beta liquidity proxies sensitive to Federal Reserve net liquidity and US Dollar Index (`DXY`) weakness.
4. **G10 Sovereign Yield Differentials:** 2-year sovereign yield spreads establish persistent, multi-month carry trade trends (e.g. `USD/JPY`, `EUR/USD`).

This platform provides the complete analytical architecture: a live **Node.js Express REST API server**, an **interactive multi-view trading terminal**, and a **Python CLI engine** for multi-asset risk-parity sizing.

---

## 🏗️ Full-Stack Project Architecture

```
X01-MacroCarry-Scorecard/
├── server.js                    # Node.js + Express REST API Backend (:3000)
├── package.json                 # Project dependencies (express, cors) & scripts
├── index.html                   # Multi-tab institutional financial terminal
├── style.css                    # Professional dark theme styling (Bloomberg/Refinitiv aesthetic)
├── app.js                       # Frontend engine: API fetches, multi-tab routing, Canvas chart
├── macro_analyzer.py            # Python CLI tool for terminal-based cross-asset risk sizing
├── macro_trade_dossier.md       # In-depth research dossier: USD/JPY, Gold vs Real Yields, Crypto Beta
├── README.md                    # Platform documentation & resume integration
└── data/
    └── g10_macro_data.json      # Structured dataset: FX, Metals, Energy, Crypto, Correlations
```

---

## ⚡ Multi-View Terminal Modules

### 🌐 View 1: Cross-Asset Market Matrix
* **Complete Asset Coverage (11 Instruments):**
  * **Major FX:** `USD/JPY`, `EUR/USD`, `GBP/USD`, `AUD/USD`, `USD/CAD`
  * **Precious Metals (Bullion FX):** Spot Gold (`XAU/USD`), Spot Silver (`XAG/USD`)
  * **Energy & Petro-Commodities:** WTI Crude Oil (`WTI/USD`)
  * **Digital Assets / Macro Liquidity:** Bitcoin (`BTC/USD`), Ethereum (`ETH/USD`)
  * **Global Benchmark:** US Dollar Index (`DXY`)
* Real-time top scrolling ticker strip, live category filtering, search engine, spot pricing, 24h performance, CME futures proxy mapping, and key macro drivers.

### 🏛️ View 2: G10 Sovereign Yields & Central Bank Scorecard
* G10 monetary policy rates, 2Y sovereign yields, 10Y yields, headline CPI, and calculated real yields ($\text{Nominal 2Y} - \text{CPI}$).
* Hawkish / Dovish policy stance scoring ($-5$ to $+5$) with statement inspection drawer.
* Dynamic 2-Year sovereign yield spread calculator across any G10 pair combination.

### 📊 View 3: Cross-Asset Macro Correlation Heatmap Matrix
* Interactive 9x9 correlation matrix quantifying empirical relationships over a rolling 180-day window:
  * Gold (`XAU/USD`) vs. US 10Y Real Yield: **-0.84** (Strong inverse sensitivity)
  * Bitcoin (`BTC/USD`) vs. DXY: **-0.72** (Global dollar liquidity beta)
  * WTI Crude Oil vs. USD/CAD: **-0.68** (Petro-currency terms-of-trade)

### 🛡️ View 4: Multi-Asset Risk-Parity & Volatility Sizing Engine
* Powered by the backend endpoint: `POST /api/risk/calculate`.
* Standardizes dollar risk to a uniform **1.0% capital budget** across asset classes:
  * **FX Majors:** Output in Standard & Mini Lots (e.g. 0.40 Lots USD/JPY)
  * **Gold (XAU/USD):** Output in Lots and Troy Ounces (e.g. 0.10 Lots = ~10.3 oz)
  * **Crude Oil (WTI/USD):** Output in Contracts and Barrels (e.g. 0.14 Contracts = ~139 bbl)
  * **Crypto (BTC/ETH):** Output in exact coin units (e.g. 0.136 BTC or 2.899 ETH)

### 📑 View 5: Macro Case Studies & Market Cycles
* Interactive USD/JPY 2022–2024 Carry Cycle Simulator with dual-axis Canvas chart.
* Comprehensive research documentation on institutional risk protocols and Uncovered Interest Rate Parity breakdown.

---

## 🔌 Backend REST API Specifications

The Node.js server (`server.js`) exposes the following endpoints:

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/health` | Server status, active trading session (London/NY/Tokyo), and UTC timestamp. |
| `GET` | `/api/assets` | Catalog of all 11 cross-assets with categories, ATR, CME proxies, and correlations. |
| `GET` | `/api/central-banks` | G10 central bank rates, 2Y/10Y yields, CPI, and policy stance scores. |
| `GET` | `/api/macro/spread?base=USD&quote=JPY` | Computes 2Y nominal spread (bps), real spread, and carry bias. |
| `GET` | `/api/correlations` | 9x9 cross-asset correlation matrix. |
| `GET` | `/api/cycles` | Historical 8-stage USD/JPY carry cycle dataset. |
| `POST` | `/api/risk/calculate` | Computes volatility-adjusted risk-parity lot sizes, notional, stop prices, and profit targets. |

---

## 🚀 Quickstart & Execution Guide

### 1. Run the Full-Stack Web Application (Node.js Backend)
From the workspace root or project folder:

```bash
npm run dev
```

Open **`http://localhost:3000`** in any browser.

### 2. Run the Python CLI Analytics Engine
Requirements: Python 3.8+ (no third-party dependencies required):

```bash
python macro_analyzer.py
```

---

## 💼 Resume Integration & Portfolio Bullets

Use these quantified, action-oriented bullet points on your CV under **Projects**:

* **G10 Macro & Cross-Asset FX Analytics Platform (Node.js / Express / Python / REST API)**
  * Engineered a full-stack cross-asset macro platform integrating G10 currencies, bullion (`XAU/USD`, `XAG/USD`), energy (`WTI/USD`), digital assets (`BTC/USD`, `ETH/USD`), and the Dollar Index (`DXY`).
  * Developed a Node.js Express REST API backend serving real-time 2-year sovereign yield spreads, central bank policy stances, and an empirical 9x9 cross-asset correlation matrix.
  * Formulated an automated risk-parity sizing engine using 14-day Average True Range (ATR), standardizing dollar exposure to a uniform 1.0% capital budget across FX lots, ounces of gold, barrels of oil, and crypto units.
  * Analyzed structural macro transmission channels, modeling the -0.84 inverse correlation between Gold and US 10-year real yields and the +450 bps US-Japan 2Y spread expansion during the 2022–2024 carry cycle.

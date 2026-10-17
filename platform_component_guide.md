# 📖 Component-by-Component Guide: G10 Macro & Cross-Asset FX Platform

> **Purpose:** A complete, from-scratch explanation of **every single UI component, data metric, mathematical formula, backend API route, and visual element** in the platform.  
> **Platform URL:** `http://localhost:3000`  
> **Source Files:** `server.js` (Backend API), `index.html` (Markup), `style.css` (Styling), `app.js` (Logic), `data/g10_macro_data.json` (Dataset).

---

## 🗺️ Master Visual Layout Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ [TOP TICKER STRIP]  USD/JPY 152.40  |  XAU/USD $2,720.50  |  BTC/USD $68,450  |  DXY 103.85  │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [HEADER BAR]        Title, Subtitle, Active Session Clock, Live API Status, Top Benchmarks   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NAVIGATION TABS]   [🌐 Cross-Assets] [🏛️ G10 Yields] [📊 Correlations] [🛡️ Risk] [📑 Research]│
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  TAB 1: Cross-Asset Matrix     ──► Currencies, Gold, Silver, Crude Oil, Bitcoin, Ethereum   │
│  TAB 2: G10 Sovereign Yields   ──► Central Bank Rates, 2Y Yields, Spreads, Forward Guidance  │
│  TAB 3: Correlation Heatmap    ──► 9x9 Cross-Asset Sensitivity Matrix (DXY, Real Yields)     │
│  TAB 4: Multi-Asset Risk Engine──► Position Sizing across Lots, Ounces, Barrels, and Coins   │
│  TAB 5: Macro Case Studies     ──► Historical USD/JPY Carry Simulator & Dual-Axis Canvas     │
│                                                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [FOOTER BAR]        Platform Specifications, Full-Stack REST API Signature, Desk Legal Note  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 1. Top Persistent Components (Visible on All Views)

### 1.1 The Top Live Ticker Strip (`#ticker-strip`)
* **Where It Sits:** The very top bar of the application.
* **What It Shows:** A continuous horizontal feed of real-time prices and 24-hour percentage changes for all 11 cross-assets.
* **Every Element Explained:**
  * **Asset Symbol (White bold text):** e.g., `USD/JPY`, `XAU/USD`, `BTC/USD`, `WTI/USD`.
  * **Spot Price (Cyan numbers):** Current market exchange rate or commodity price in USD.
  * **24h Change (Green/Red pill):** Shows $+0.85\%$ (green) for price gains or $-1.10\%$ (red) for declines over the last 24 hours.
* **Interactive Feature:** Clicking on *any* asset item automatically switches to the **Multi-Asset Risk Engine** and pre-fills that asset for instant position sizing.

---

### 1.2 The Terminal Header (`.terminal-header`)
* **Terminal Badge (`.terminal-badge`):** Displays `INSTITUTIONAL DESK TERMINAL // FULL-STACK API`. Signals institutional build status.
* **Platform Title & Sub-label:** `G10 Macro & Cross-Asset FX Platform` — categorizes the five core market pillars: Currencies, Precious Metals (Gold/Silver), Energy (WTI), Digital Assets (Bitcoin/Ethereum), and the Dollar Index (`DXY`).
* **Session Clock (`#session-clock`):**
  * Automatically calculates the live active global trading window using real UTC hours:
    * **07:00–12:00 UTC:** `LONDON OPEN ACTIVE`
    * **12:00–16:00 UTC:** `LONDON / NY OVERLAP (PEAK LIQUIDITY)` (the highest-volume window in global finance)
    * **16:00–21:00 UTC:** `NEW YORK AFTERNOON`
    * **21:00–07:00 UTC:** `ASIAN SESSION`
* **Desk Stat Badges (Right Header):**
  * `API BACKEND:` Displays `REST ONLINE (:3000)` in green when connected to `server.js`.
  * `DXY BENCHMARK:` Real-time US Dollar Index benchmark ($103.85$, $+0.28\%$).
  * `GOLD (XAU):` Real-time spot gold bullion reference price ($\$2,720.50$).

---

### 1.3 Multi-View Navigation Tabs (`.desk-nav`)
Five interactive buttons with icons allowing the trader to switch instantly between specialized modules without refreshing the page:
1. `🌐 Cross-Asset Market Matrix` (Tab ID: `tab-cross-assets`)
2. `🏛️ G10 Sovereign Yields & Central Banks` (Tab ID: `tab-macro-scorecard`)
3. `📊 Macro Correlation Matrix` (Tab ID: `tab-correlations`)
4. `🛡️ Multi-Asset Risk-Parity Engine` (Tab ID: `tab-risk-calculator`)
5. `📑 Macro Cycles & Trade Research` (Tab ID: `tab-case-studies`)

---

# 2. TAB 1: Cross-Asset Market Matrix (`#tab-cross-assets`)

This view displays the complete universe of 11 financial instruments that make up the global macro currency ecosystem.

### 2.1 The Category Filter Bar & Live Search
* **Category Filter Buttons (`.filter-btn`):**
  * `All Assets (11)`: Shows the full market catalog.
  * `FX Majors (5)`: Filters for `USD/JPY`, `EUR/USD`, `GBP/USD`, `AUD/USD`, `USD/CAD`.
  * `Precious Metals (XAU/XAG)`: Filters for Spot Gold (`XAU/USD`) and Spot Silver (`XAG/USD`).
  * `Energy (WTI/Brent)`: Filters for WTI Crude Oil (`WTI/USD`).
  * `Digital Assets (BTC/ETH)`: Filters for Bitcoin (`BTC/USD`) and Ethereum (`ETH/USD`).
  * `Dollar Index (DXY)`: Filters for the USD benchmark basket.
* **Search Box (`#asset-search-input`):** Live text filtering. Typing *"Gold"*, *"Japan"*, *"Inflation"*, or *"Crude"* instantly narrows the grid in real-time.

---

### 2.2 The Asset Card Anatomy (`.asset-card`)
Each card in the grid contains eight standardized institutional metrics:

```
┌─────────────────────────────────────────────────────────────┐
│  USD/JPY                          [MAJOR FX PAIR]           │
│  US Dollar / Japanese Yen                                   │
├─────────────────────────────────────────────────────────────┤
│  152.40                                  +0.35% (24h)       │
├─────────────────────────────────────────────────────────────┤
│  Key Macro Driver:                                          │
│  US-Japan 2Y Sovereign Yield Spread (+353 bps) & BoJ Risk   │
├─────────────────────────────────────────────────────────────┤
│  CME: 6J  │  14D ATR: 128.0 pips  │  DXY Corr: +0.82        │
└─────────────────────────────────────────────────────────────┘
```

1. **Symbol & Full Name:** The primary market ticker and its descriptive name.
2. **Category Badge (`.asset-cat-badge`):** Color-coded pill:
   * **Blue (`cat-fx`):** Foreign Exchange currency pairs.
   * **Gold (`cat-metals`):** Precious Metals bullion.
   * **Orange (`cat-energy`):** Petro-commodities.
   * **Purple (`cat-crypto`):** Digital assets & liquidity proxies.
   * **Cyan (`cat-index`):** Benchmark index.
3. **Spot Price Box:** The last traded interbank cash or spot price.
4. **24-Hour Change (%):** Daily price momentum (Green if positive, Red if negative).
5. **Key Macro Driver:** The fundamental thesis monitored by trading desks (e.g., for Gold: *"US 10Y Real Yield Compression & Central Bank Gold Accumulation"*).
6. **CME Futures Proxy:** The corresponding centralized futures contract code traded on the Chicago Mercantile Exchange (e.g., `GC` for Gold, `CL` for Crude, `6E` for Euro, `6J` for Yen, `BTC` for Bitcoin).
7. **14-Day ATR:** The Average True Range measuring expected daily volatility (measured in pips for FX, dollars for metals/crypto, or points for DXY).
8. **DXY Correlation:** The mathematical correlation coefficient ($-1.0$ to $+1.0$) relative to the US Dollar Index.

---

# 3. TAB 2: G10 Sovereign Yields & Central Banks (`#tab-macro-scorecard`)

This view models sovereign monetary policy divergence—the primary driver of medium- and long-term currency moves.

---

### 3.1 Table 01: G10 Central Bank Monetary Policy & Yield Matrix
A nine-column comparative matrix covering the major G10 central banks (Federal Reserve, ECB, Bank of Japan, Bank of England, Reserve Bank of Australia, Bank of Canada, Swiss National Bank):

| Column Name | Metric Meaning | Why Desks Track It |
|:---|:---|:---|
| **Country & Bank** | Country flag, currency code, and official central bank name. | Identifies the sovereign jurisdiction. |
| **Policy Rate** | The official benchmark lending/deposit rate set by the central bank. | Dictates overnight borrowing costs (e.g., US Fed Funds $4.75\%$, BoJ $0.50\%$). |
| **2Y Sovereign Yield** | Market yield on benchmark 2-year government bonds (US 2Y, German Schatz, Japanese JGB). | **The Core Benchmark:** Reflects the market's expected central bank interest rate path over the next 24 months. |
| **10Y Yield** | Market yield on benchmark 10-year sovereign debt. | Measures long-term cost of capital, inflation expectations, and term premiums. |
| **Headline CPI** | Latest Year-over-Year (YoY) Consumer Price Index print. | Measures domestic inflation versus the central bank's $2.0\%$ mandate. |
| **Real 2Y Yield** | $\text{Nominal 2Y Yield} - \text{Headline CPI}$. | **The Real Return:** Capital flees negative real rates (Japan: $-1.78\%$) toward positive real rates (US: $+1.55\%$). |
| **Policy Stance** | Standardized score from $-5$ (Dovish) to $+5$ (Hawkish). | Synthesizes central bank rhetoric and dot plots into a single comparative scalar. |
| **Next Meeting** | The calendar date of the next official rate decision. | High-volatility event catalyst date. |
| **Action (Inspect)** | Interactive button that opens the Forward Guidance Drawer below. | Reads the official statement excerpt and outlook. |

---

### 3.2 Forward Guidance Inspection Drawer (`#guidance-box`)
* **What It Does:** When you click any central bank row (or click "Inspect"), this drawer opens dynamically.
* **Content Displayed:** The title updates with the country's flag and bank name. The body displays the curated summary of their latest rate statement, forward guidance posture, and key risks (e.g., the Fed's stance on services inflation vs. labor market resilience).

---

### 3.3 Engine 02: 2-Year Sovereign Yield Spread & Carry Arbitrage
* **Base & Quote Dropdowns:** Choose any base currency (USD, EUR, GBP, AUD, CAD, CHF) and quote/funding currency (JPY, CHF, USD, EUR).
* **The 4 KPI Cards:**
  1. **2Y Yield Spread (`#kpi-2y-spread`):**
     $$\text{Spread (bps)} = (\text{Yield}_{\text{Base}} - \text{Yield}_{\text{Quote}}) \times 100$$
     *(e.g., US 2Y $4.15\% - \text{Japan 2Y } 0.62\% = +353\text{ bps}$)*.
  2. **Real Yield Spread (`#kpi-real-spread`):** The spread adjusted for CPI inflation differences in both countries.
  3. **Stance Divergence (`#kpi-stance-div`):**
     $$\Delta \text{Stance} = \text{Score}_{\text{Base}} - \text{Score}_{\text{Quote}}$$
  4. **Carry Trade Incentive (`#kpi-carry-incentive`):** Labels whether the pair provides positive or negative overnight swap rollover yield.
* **Desk Signal Card (`#desk-signal-card`):**
  * **Green Badge:** `STRONG LONG CARRY` (when spread $> +150\text{ bps}$). Recommends long base / short quote.
  * **Red Badge:** `STRONG SHORT CARRY` (when spread $< -150\text{ bps}$). Recommends short base / long quote.
  * **Amber Badge:** `NEUTRAL / RANGE ROTATION` (when spread is near zero). Advises trading intraday session flows rather than carry trades.

---

# 4. TAB 3: Cross-Asset Macro Correlation Heatmap (`#tab-correlations`)

This view quantifies the mathematical relationships between currencies, bullion, commodities, digital assets, and yields.

---

### 4.1 The 9x9 Correlation Heatmap Table
* **Assets Analyzed:** US 2Y Yield, US 10Y Real Yield, US Dollar Index (DXY), `USD/JPY`, `EUR/USD`, Gold (`XAU/USD`), Crude Oil (`WTI/USD`), Bitcoin (`BTC/USD`), Ethereum (`ETH/USD`).
* **Rolling Window:** Computed over a 180-day lookback window.
* **Color Scale Mechanics:**
  * **Dark Green (`corr-high-pos`, $\ge +0.70$):** Strong positive correlation (assets move together in lockstep).
  * **Light Green (`corr-med-pos`, $+0.25$ to $+0.70$):** Moderate positive relationship.
  * **Neutral Grey (`corr-neutral`, $-0.25$ to $+0.25$):** Little to no correlation (independent drivers).
  * **Light Red (`corr-med-neg`, $-0.70$ to $-0.25$):** Moderate inverse relationship.
  * **Dark Red (`corr-high-neg`, $\le -0.70$):** Strong inverse correlation (assets move in opposite directions).

---

### 4.2 The 3 Strategic Correlation Breakdowns
1. **🥇 Gold (`XAU/USD`) vs. US 10Y Real Yield (-0.84):**
   * *Mechanism:* When inflation-adjusted real yields fall, the opportunity cost of holding non-yielding bullion collapses, triggering aggressive institutional inflows into Gold.
2. **⚡ Bitcoin & Ethereum vs. DXY (-0.72):**
   * *Mechanism:* Crypto behaves as a high-beta global liquidity sponge. When the US Dollar weakens and global central bank balance sheets expand, crypto rallies aggressively.
3. **🛢️ WTI Crude Oil vs. USD/CAD (-0.68):**
   * *Mechanism:* Canada is the largest foreign oil supplier to the US. Rising crude prices boost Canadian trade surpluses, driving `USD/CAD` down (strengthening the Canadian Dollar).

---

# 5. TAB 4: Multi-Asset Risk-Parity Engine (`#tab-risk-calculator`)

This engine is powered by the backend API (`POST /api/risk/calculate`) and enforces institutional risk parity so you never blow up an account.

---

### 5.1 Input Parameters (Left Card)
* **Select Target Asset (`#calc-select-asset`):** Choose between FX (`USD/JPY`, `EUR/USD`, etc.), Bullion (`XAU/USD`, `XAG/USD`), Energy (`WTI/USD`), or Crypto (`BTC/USD`, `ETH/USD`).
* **Account Capital ($):** Total capital allocated to the desk (default: $\$50,000$).
* **Max Risk Per Setup (%):** Maximum permitted loss if stop-loss is hit (default: $1.0\% = \$500.00$).
* **Stop Distance Multiple:** Multiplier applied to the 14-day ATR:
  * $1.0\times\text{ ATR}$ (Tight intraday scalp)
  * $1.5\times\text{ ATR}$ (Standard discretionary swing)
  * $2.0\times\text{ ATR}$ (Macro wide runner)
* **Target Risk-to-Reward (R:R):** Minimum expected payoff ratio ($1:1.5$, $1:2.0$, $1:2.5$, $1:3.0$).
* **14-Day ATR:** Auto-populated from the asset database, but fully customizable.

---

### 5.2 API-Calculated Outputs (Right Card)
When you click **"Calculate Risk-Parity Allocation"** (or adjust inputs), the backend calculates:

1. **Allocated Dollar Risk (`#calc-display-risk`):**
   $$\text{Dollar Risk} = \text{Capital} \times \left(\frac{\text{Risk \%}}{100}\right) = \$50,000 \times 1.0\% = \mathbf{\$500.00}$$
2. **Position Sizing Allocation (`#calc-res-lots`):**
   * **For FX:** Displays in Standard Lots ($100\text{k}$) and Mini Lots ($10\text{k}$), e.g., `0.40 Standard Lots (4.0 Mini)`.
   * **For Gold (XAU):** Displays in Standard Lots and Troy Ounces, e.g., `0.10 Lots (~10.3 Troy Oz)`.
   * **For Crude Oil (WTI):** Displays in NYMEX Contracts and Physical Barrels, e.g., `0.14 Contracts (~139 Barrels)`.
   * **For Crypto (BTC/ETH):** Displays in exact coin units, e.g., `0.136 BTC` or `2.899 ETH`.
3. **Notional Position Value (`#calc-res-notional`):** The total cash market value of the underlying position.
4. **Stop-Loss Price & Distance (`#calc-res-stop-price`):** The exact price level where the trade must be liquidated.
5. **Profit Target Price & Distance (`#calc-res-target-price`):** Target price level and calculated dollar gain (e.g., $+\$1,000.00$ at $1:2.0\text{ R:R}$).
6. **Trailing Stop Protocol (`#calc-res-protocol`):** Enforces the desk rule: *Move stop-loss to breakeven once price advances $+1.5R$. Trail remaining position behind the 20-day EMA.*

> 🔑 **The Universal Risk Guarantee:** Regardless of whether you trade calm `EUR/USD` or volatile `BTC/USD`, hitting your stop-loss results in the **exact same $\$500.00$ ($1.0\%$) loss**.

---

# 6. TAB 5: Macro Cycles & Trade Research (`#tab-case-studies`)

This view contains the historical trade simulators and the quantitative frameworks that prove your institutional market intuition.

---

### 6.1 Historical Carry Cycle Simulator (USD/JPY 2022–2024)
An interactive 8-stage stepper tracking the historic 4,500-pip rally in `USD/JPY`:
* **Stage Controls (`#btn-prev-cycle`, `#btn-next-cycle`):** Step forward and backward through the 8 stages of the cycle:
  1. *2022-Q1:* Fed Initial Hike Cycle (Spread: $+164\text{ bps}$, Spot: $115.50$)
  2. *2022-Q3:* Rapid Fed 75bps Hikes (Spread: $+418\text{ bps}$, Spot: $144.20$)
  3. *2022-Q4:* First MoF Intervention Shock (Spread: $+445\text{ bps}$, Spot: $151.90$)
  4. *2023-Q2:* Regional Banking Consolidation (Spread: $+426\text{ bps}$, Spot: $139.80$)
  5. *2023-Q4:* Yield Spread Peak & Carry Surge (Spread: $+479\text{ bps}$, Spot: $151.50$)
  6. *2024-Q2:* Massive \$62B MoF Interventions (Spread: $+467\text{ bps}$, Spot: $160.20$)
  7. *2024-Q3:* Violent August 2024 Carry Unwind (Spread: $+345\text{ bps}$, Spot: $142.00$)
  8. *2024-Q4:* Spread Stabilization & Re-pricing (Spread: $+353\text{ bps}$, Spot: $152.40$)
* **Dual-Axis Canvas Chart (`#historical-chart`):**
  * **Cyan Curve:** The 2-Year Sovereign Yield Spread (bps).
  * **Amber Curve:** The `USD/JPY` Spot Exchange Rate.
  * **Red Dots & Labels:** The exact moments when Japan's Ministry of Finance intervened.
  * **Dotted Vertical White Line:** Indicates the currently active historical stage.
* **Stage Metrics & Desk Takeaway:** Displays US 2Y yield, Japan 2Y yield, spread, spot, and an executive *Desk Lesson* for that macro regime.

---

### 6.2 Analytical Framework Cards
Three authoritative technical modules detailing the mathematical and economic foundation of the platform:
1. **Principle 01: 2-Year Sovereign Yield Duration vs. 10-Year Transmission:** Explains why 2Y yields correlate vastly higher with currencies than 10Y yields.
2. **Principle 02: Negative Skewness & Asymmetric Carry Unwind Mechanics:** Explains the math of carry trades (steady positive carry punctuated by rapid volatility-driven liquidations).
3. **Principle 03: Risk-Parity Volatility Normalization (ATR Framework):** The mathematical rationale behind standardizing portfolio risk budgets.

---

# 7. Persistent Footer (`.terminal-footer`)

* **Left Signature:** `G10 MACRO & CROSS-ASSET FX ANALYTICS PLATFORM // FULL-STACK API`
* **Center Tag:** `CURRENCIES • GOLD (XAU) • SILVER (XAG) • CRUDE (WTI) • CRYPTO (BTC/ETH)`
* **Right Tag:** `PROPRIETARY TRADING RESEARCH & RISK SUITE`
* Confirms clean, institutional branding with zero placeholder text or generic watermarks.

---

# 8. Backend REST API Architecture (`server.js`)

The Node.js server powers the data layer and serves the static files:

```
                                  EXPRESS BACKEND (server.js)
                                      Port 3000 (REST API)
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         ▼                  ▼                   ▼                   ▼                  ▼
   GET /api/health    GET /api/assets    GET /api/central-   GET /api/correl-    POST /api/risk/
   (Session & Status) (11 Cross-Assets)        banks              ations            calculate
                                         (G10 Policy Matrix) (9x9 Heatmap)       (Parity Sizing)
```

1. **`GET /api/health`:** Returns `{ status: "ONLINE", session: "...", utc_time: "..." }`.
2. **`GET /api/assets`:** Returns the full JSON array of 11 cross-assets with categories, ATR, CME proxies, and correlations.
3. **`GET /api/central-banks`:** Returns G10 policy rates, 2Y/10Y yields, CPI, and policy stances.
4. **`GET /api/macro/spread?base=USD&quote=JPY`:** Calculates live nominal spread, real spread, and trade bias.
5. **`GET /api/correlations`:** Serves the 9x9 cross-asset correlation matrix.
6. **`GET /api/cycles`:** Serves the 8-stage historical USD/JPY dataset.
7. **`POST /api/risk/calculate`:** Takes `{ assetId, capital, riskPct, atrMult, rrRatio }` and computes exact standard lots, ounces of gold, barrels of oil, crypto units, stop price, target price, and trailing stop instructions.

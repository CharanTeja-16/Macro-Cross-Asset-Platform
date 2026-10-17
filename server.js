/**
 * ============================================================================
 * G10 MACRO & CROSS-ASSET FX PLATFORM - BACKEND SERVER
 * Architecture: Node.js + Express REST API
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Load macroeconomic and cross-asset dataset
const dataFilePath = path.join(__dirname, 'data', 'g10_macro_data.json');
let macroData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

// Helper: Calculate current active session
function getActiveSession() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  let session = "ASIAN SESSION";
  if (utcHours >= 7 && utcHours < 12) session = "LONDON OPEN ACTIVE";
  else if (utcHours >= 12 && utcHours < 16) session = "LONDON / NY OVERLAP (PEAK LIQUIDITY)";
  else if (utcHours >= 16 && utcHours < 21) session = "NEW YORK AFTERNOON";
  return {
    session,
    utc_time: now.toISOString().substring(11, 19) + " UTC",
    server_time: now.toISOString()
  };
}

// ----------------------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------------------

// 1. Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: macroData.platform_name,
    version: macroData.version,
    ...getActiveSession()
  });
});

// 2. Central Banks Matrix
app.get('/api/central-banks', (req, res) => {
  res.json({
    last_updated: macroData.last_updated,
    central_banks: macroData.central_banks
  });
});

// 3. Cross-Asset Catalog (FX, Precious Metals XAU/XAG, Energy WTI, Crypto BTC/ETH, DXY)
app.get('/api/assets', (req, res) => {
  const { category } = req.query;
  let assets = macroData.cross_assets;
  if (category) {
    assets = assets.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  res.json({
    total_assets: assets.length,
    assets
  });
});

// 4. Specific Asset Detail
app.get('/api/assets/:id', (req, res) => {
  const asset = macroData.cross_assets.find(a => a.id.toLowerCase() === req.params.id.toLowerCase());
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  res.json(asset);
});

// 5. Cross-Asset Correlation Matrix
app.get('/api/correlations', (req, res) => {
  res.json(macroData.cross_asset_correlations);
});

// 6. Historical Macro Carry Cycles
app.get('/api/cycles', (req, res) => {
  res.json({
    historical_cycles: macroData.historical_cycles
  });
});

// 7. Dynamic Risk-Parity & Sizing Engine (POST)
app.post('/api/risk/calculate', (req, res) => {
  const {
    assetId = 'USDJPY',
    capital = 50000,
    riskPct = 1.0,
    atrMult = 1.5,
    rrRatio = 2.0,
    customAtr = null
  } = req.body;

  const asset = macroData.cross_assets.find(a => a.id.toLowerCase() === assetId.toLowerCase());
  if (!asset) {
    return res.status(404).json({ error: 'Invalid assetId specified' });
  }

  const atr = customAtr ? parseFloat(customAtr) : asset.atr_14;
  const dollarRisk = (capital * (riskPct / 100.0));
  const stopDistance = (atr * atrMult);
  const targetDistance = (stopDistance * rrRatio);

  // Position Sizing:
  // Units / Lots = Dollar Risk / (Stop Distance * Pip Value per unit)
  let standardUnits = 0;
  let notionalUsd = 0;
  let lotDisplay = '';

  if (asset.category === 'FX_MAJORS') {
    standardUnits = dollarRisk / (stopDistance * asset.pip_value_usd);
    notionalUsd = standardUnits * 100000;
    lotDisplay = `${standardUnits.toFixed(2)} Standard Lots (${(standardUnits * 10).toFixed(1)} Mini Lots)`;
  } else if (asset.category === 'METALS') {
    // Gold/Silver: 1 standard lot = 100 oz of Gold, $10 per $0.10 move
    // Dollar move per stop = stopDistance * 100 oz
    standardUnits = dollarRisk / (stopDistance * 100);
    notionalUsd = standardUnits * 100 * asset.spot_price;
    lotDisplay = `${standardUnits.toFixed(2)} Lots (~${(standardUnits * 100).toFixed(1)} Troy Oz)`;
  } else if (asset.category === 'ENERGY') {
    // Crude Oil: 1 lot = 1,000 barrels ($10 per $0.01 tick)
    standardUnits = dollarRisk / (stopDistance * 1000);
    notionalUsd = standardUnits * 1000 * asset.spot_price;
    lotDisplay = `${standardUnits.toFixed(2)} Contracts (~${(standardUnits * 1000).toFixed(0)} Barrels)`;
  } else if (asset.category === 'DIGITAL_ASSETS') {
    // Crypto (BTC/ETH): dollarRisk / stopDistance in $
    standardUnits = dollarRisk / stopDistance;
    notionalUsd = standardUnits * asset.spot_price;
    lotDisplay = `${standardUnits.toFixed(3)} ${asset.base} (~$${notionalUsd.toLocaleString()})`;
  } else {
    standardUnits = dollarRisk / (stopDistance * asset.pip_value_usd);
    notionalUsd = standardUnits * 100000;
    lotDisplay = `${standardUnits.toFixed(2)} Contracts`;
  }

  // Directional Stop & Target Price
  const isLong = asset.direction_long;
  let stopPrice = isLong ? (asset.spot_price - (asset.category === 'FX_MAJORS' ? (stopDistance * (asset.id.includes('JPY') ? 0.01 : 0.0001)) : stopDistance))
                         : (asset.spot_price + (asset.category === 'FX_MAJORS' ? (stopDistance * (asset.id.includes('JPY') ? 0.01 : 0.0001)) : stopDistance));

  let targetPrice = isLong ? (asset.spot_price + (asset.category === 'FX_MAJORS' ? (targetDistance * (asset.id.includes('JPY') ? 0.01 : 0.0001)) : targetDistance))
                           : (asset.spot_price - (asset.category === 'FX_MAJORS' ? (targetDistance * (asset.id.includes('JPY') ? 0.01 : 0.0001)) : targetDistance));

  res.json({
    asset: asset.symbol,
    category: asset.category_label,
    spot_price: asset.spot_price,
    allocated_dollar_risk: parseFloat(dollarRisk.toFixed(2)),
    risk_percentage: parseFloat(riskPct),
    atr_14: atr,
    atr_unit: asset.atr_unit,
    stop_distance: parseFloat(stopDistance.toFixed(2)),
    stop_price: parseFloat(stopPrice.toFixed(4)),
    target_distance: parseFloat(targetDistance.toFixed(2)),
    target_price: parseFloat(targetPrice.toFixed(4)),
    potential_dollar_gain: parseFloat((dollarRisk * rrRatio).toFixed(2)),
    rr_ratio: `1:${rrRatio.toFixed(1)}`,
    position_sizing: {
      standard_units: parseFloat(standardUnits.toFixed(3)),
      display: lotDisplay,
      notional_usd: Math.round(notionalUsd)
    },
    trailing_protocol: `Move stop to breakeven at +${(stopDistance * 1.5).toFixed(1)} ${asset.atr_unit} (+1.5R). Trail remaining position behind the 20-day EMA.`
  });
});

// 8. Yield Spread Computation Endpoint
app.get('/api/macro/spread', (req, res) => {
  const { base = 'USD', quote = 'JPY' } = req.query;
  const baseBank = macroData.central_banks[base.toUpperCase()];
  const quoteBank = macroData.central_banks[quote.toUpperCase()];

  if (!baseBank || !quoteBank) {
    return res.status(400).json({ error: 'Invalid base or quote currency code' });
  }

  const nominalSpreadBps = Math.round((baseBank.yield_2y - quoteBank.yield_2y) * 100);
  const realSpreadBps = Math.round((baseBank.real_yield_2y - quoteBank.real_yield_2y) * 100);
  const stanceDiff = baseBank.stance_score - quoteBank.stance_score;

  let bias = 'NEUTRAL / RANGE ROTATION';
  if (nominalSpreadBps > 150) bias = 'STRONG LONG CARRY (+)';
  else if (nominalSpreadBps < -150) bias = 'STRONG SHORT CARRY (-)';

  res.json({
    pair: `${base.toUpperCase()}/${quote.toUpperCase()}`,
    base_currency: baseBank.currency,
    quote_currency: quoteBank.currency,
    nominal_spread_bps: nominalSpreadBps,
    real_spread_bps: realSpreadBps,
    stance_divergence: stanceDiff,
    bias,
    base_bank: {
      name: baseBank.bank_name,
      policy_rate: baseBank.policy_rate,
      yield_2y: baseBank.yield_2y,
      cpi: baseBank.cpi_yoy
    },
    quote_bank: {
      name: quoteBank.bank_name,
      policy_rate: quoteBank.policy_rate,
      yield_2y: quoteBank.yield_2y,
      cpi: quoteBank.cpi_yoy
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` ${macroData.platform_name} v${macroData.version}`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Endpoints available at /api/health, /api/assets, /api/central-banks`);
  console.log(`================================================================`);
});

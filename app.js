/**
 * ============================================================================
 * G10 MACRO & CROSS-ASSET FX PLATFORM - FRONTEND APPLICATION
 * Full-Stack API Integration with Express Backend (:3000)
 * ============================================================================
 */

// Global State
let allAssets = [];
let centralBanksData = {};
let correlationData = null;
let historicalCycles = [];
let activeCycleIndex = 0;
let activeCategoryFilter = "ALL";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
  initTabNavigation();
  await loadBackendHealth();
  await loadCrossAssets();
  await loadCentralBanks();
  await loadCorrelations();
  await loadCycles();
  initRiskCalculator();
  initSpreadEngine();

  // Periodic Clock & Status Ping
  setInterval(loadBackendHealth, 5000);
});

// ----------------------------------------------------------------------------
// 1. Tab Navigation System
// ----------------------------------------------------------------------------
function initTabNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;
      
      // Update Tab Headers
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Update Tab Panels
      document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
      });
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      // Re-render canvas if switching to case studies tab
      if (targetId === "tab-case-studies") {
        setTimeout(renderHistoricalChart, 50);
      }
    });
  });
}

// ----------------------------------------------------------------------------
// 2. Load Backend Health & Clock
// ----------------------------------------------------------------------------
async function loadBackendHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();

    document.getElementById("api-status-badge").textContent = `REST ONLINE (:3000)`;
    document.getElementById("api-status-badge").className = "stat-val positive";
    document.getElementById("session-clock").textContent = `${data.session} // ${data.utc_time}`;
  } catch (err) {
    document.getElementById("api-status-badge").textContent = `LOCAL STATIC MODE`;
    document.getElementById("api-status-badge").className = "stat-val";
    document.getElementById("session-clock").textContent = `CLIENT CLOCK ACTIVE`;
  }
}

// ----------------------------------------------------------------------------
// 3. Tab 1: Cross-Asset Market Matrix (Currencies, Gold, Crude, Crypto)
// ----------------------------------------------------------------------------
async function loadCrossAssets() {
  try {
    const res = await fetch("/api/assets");
    const data = await res.json();
    allAssets = data.assets || [];
  } catch (err) {
    console.warn("Using inline fallback for assets:", err);
  }

  renderTickerStrip();
  renderCrossAssetCards();
  initAssetFilters();
}

function renderTickerStrip() {
  const container = document.getElementById("ticker-content");
  if (!container || allAssets.length === 0) return;

  container.innerHTML = allAssets.map(asset => {
    const isPos = asset.change_24h >= 0;
    return `
      <div class="ticker-item" onclick="selectAssetForRisk('${asset.id}')">
        <span class="ticker-sym">${asset.symbol}</span>
        <span class="ticker-price">${asset.spot_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span class="ticker-chg ${isPos ? 'pos' : 'neg'}">${isPos ? '+' : ''}${asset.change_24h}%</span>
      </div>
    `;
  }).join("");

  // Update header highlights
  const dxy = allAssets.find(a => a.id === "DXY");
  if (dxy) document.getElementById("header-dxy-val").textContent = `${dxy.spot_price} (${dxy.change_24h >= 0 ? '+' : ''}${dxy.change_24h}%)`;

  const xau = allAssets.find(a => a.id === "XAUUSD");
  if (xau) document.getElementById("header-xau-val").textContent = `$${xau.spot_price.toLocaleString()} (${xau.change_24h >= 0 ? '+' : ''}${xau.change_24h}%)`;
}

function renderCrossAssetCards() {
  const container = document.getElementById("cross-asset-cards-container");
  if (!container) return;

  const searchTerm = (document.getElementById("asset-search-input")?.value || "").toLowerCase();

  const filtered = allAssets.filter(asset => {
    const matchesCategory = activeCategoryFilter === "ALL" || asset.category === activeCategoryFilter;
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm) ||
                          asset.name.toLowerCase().includes(searchTerm) ||
                          asset.macro_driver.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-dim);">No assets matching filter or search query.</div>`;
    return;
  }

  container.innerHTML = filtered.map(asset => {
    let catClass = "cat-fx";
    if (asset.category === "METALS") catClass = "cat-metals";
    else if (asset.category === "ENERGY") catClass = "cat-energy";
    else if (asset.category === "DIGITAL_ASSETS") catClass = "cat-crypto";
    else if (asset.category === "INDEX") catClass = "cat-index";

    const isPos = asset.change_24h >= 0;

    return `
      <div class="asset-card" onclick="selectAssetForRisk('${asset.id}')">
        <div class="asset-card-top">
          <div class="asset-symbol-block">
            <span class="asset-sym">${asset.symbol}</span>
            <span class="asset-name">${asset.name}</span>
          </div>
          <span class="asset-cat-badge ${catClass}">${asset.category_label}</span>
        </div>

        <div class="asset-price-block">
          <span class="asset-spot">${asset.spot_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span class="asset-change ${isPos ? 'pos' : 'neg'}">${isPos ? '+' : ''}${asset.change_24h}% (24h)</span>
        </div>

        <div class="asset-driver-box">
          <strong>Key Macro Driver:</strong> ${asset.macro_driver}
        </div>

        <div class="asset-footer-metrics">
          <span>CME: <strong>${asset.cme_futures}</strong></span>
          <span>14D ATR: <strong>${asset.atr_14} ${asset.atr_unit}</strong></span>
          <span>DXY Corr: <strong>${asset.corr_dxy >= 0 ? '+' : ''}${asset.corr_dxy}</strong></span>
        </div>
      </div>
    `;
  }).join("");
}

function initAssetFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.dataset.category;
      renderCrossAssetCards();
    });
  });

  const searchInput = document.getElementById("asset-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", renderCrossAssetCards);
  }
}

function selectAssetForRisk(assetId) {
  const select = document.getElementById("calc-select-asset");
  if (select) {
    select.value = assetId;
    // Switch to Risk Tab
    document.querySelector('.nav-tab[data-tab="tab-risk-calculator"]').click();
    syncRiskFormWithAsset();
    calculateRiskBackend();
  }
}

// ----------------------------------------------------------------------------
// 4. Tab 2: G10 Sovereign Yields & Central Bank Scorecard
// ----------------------------------------------------------------------------
async function loadCentralBanks() {
  try {
    const res = await fetch("/api/central-banks");
    const data = await res.json();
    centralBanksData = data.central_banks || {};
  } catch (err) {
    console.warn("Central banks fetch failed:", err);
  }

  renderCentralBanksTable();
  updateSpreadKPIs();

  document.getElementById("btn-refresh-macro")?.addEventListener("click", async () => {
    await loadCentralBanks();
  });
}

function renderCentralBanksTable() {
  const tbody = document.getElementById("macro-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  Object.keys(centralBanksData).forEach(key => {
    const bank = centralBanksData[key];
    const tr = document.createElement("tr");

    let stanceClass = "stance-neutral";
    if (bank.stance_score > 1) stanceClass = "stance-hawkish";
    else if (bank.stance_score < -1) stanceClass = "stance-dovish";

    tr.innerHTML = `
      <td>
        <div class="bank-name-cell">
          <span style="font-size: 16px;">${bank.flag}</span>
          <div>
            <div>${bank.country} (${bank.currency})</div>
            <div style="font-size: 11px; color: var(--text-dim);">${bank.bank_name}</div>
          </div>
        </div>
      </td>
      <td class="num-cell">${bank.policy_rate_range}</td>
      <td class="num-cell highlight">${bank.yield_2y.toFixed(2)}%</td>
      <td class="num-cell">${bank.yield_10y.toFixed(2)}%</td>
      <td class="num-cell">${bank.cpi_yoy.toFixed(1)}%</td>
      <td class="num-cell ${bank.real_yield_2y >= 0 ? 'positive' : 'negative'}">
        ${bank.real_yield_2y >= 0 ? '+' : ''}${bank.real_yield_2y.toFixed(2)}%
      </td>
      <td>
        <span class="stance-pill ${stanceClass}">
          ${bank.stance_score >= 0 ? '+' : ''}${bank.stance_score} &bull; ${bank.stance_label}
        </span>
      </td>
      <td class="num-cell" style="font-size: 12px; color: var(--text-muted);">${bank.next_meeting}</td>
      <td>
        <button class="btn-inspect" onclick="inspectBankGuidance('${key}')">Inspect</button>
      </td>
    `;
    tr.addEventListener("click", () => inspectBankGuidance(key));
    tbody.appendChild(tr);
  });

  document.getElementById("btn-close-guidance")?.addEventListener("click", () => {
    document.getElementById("guidance-box").style.display = "none";
  });
}

function inspectBankGuidance(key) {
  const bank = centralBanksData[key];
  if (!bank) return;

  const box = document.getElementById("guidance-box");
  box.style.display = "block";
  document.getElementById("guidance-title").textContent = `${bank.flag} ${bank.country}: ${bank.bank_name} — Policy Guidance & Outlook`;
  document.getElementById("guidance-text").textContent = bank.summary;
}

function initSpreadEngine() {
  const baseSel = document.getElementById("select-spread-base");
  const quoteSel = document.getElementById("select-spread-quote");

  if (baseSel && quoteSel) {
    baseSel.addEventListener("change", updateSpreadKPIs);
    quoteSel.addEventListener("change", updateSpreadKPIs);
  }
}

async function updateSpreadKPIs() {
  const base = document.getElementById("select-spread-base")?.value || "USD";
  const quote = document.getElementById("select-spread-quote")?.value || "JPY";

  try {
    const res = await fetch(`/api/macro/spread?base=${base}&quote=${quote}`);
    const data = await res.json();

    document.getElementById("kpi-2y-spread").textContent = `${data.nominal_spread_bps >= 0 ? '+' : ''}${data.nominal_spread_bps} bps`;
    document.getElementById("kpi-2y-details").textContent = `${base} 2Y (${data.base_bank.yield_2y}%) - ${quote} 2Y (${data.quote_bank.yield_2y}%)`;

    document.getElementById("kpi-real-spread").textContent = `${data.real_spread_bps >= 0 ? '+' : ''}${data.real_spread_bps} bps`;
    document.getElementById("kpi-real-details").textContent = `Spread adjusted for CPI inflation differentials`;

    document.getElementById("kpi-stance-div").textContent = `${data.stance_divergence >= 0 ? '+' : ''}${data.stance_divergence} pts`;

    const badge = document.getElementById("signal-badge");
    const headline = document.getElementById("signal-headline");
    const rationale = document.getElementById("signal-rationale");

    if (data.nominal_spread_bps > 150) {
      badge.className = "signal-badge";
      badge.style.background = "var(--accent-emerald)";
      badge.style.color = "#080b11";
      badge.textContent = "STRONG LONG CARRY";
      headline.textContent = `Long ${base} / Short ${quote} (Positive Carry +${data.nominal_spread_bps} bps)`;
      rationale.textContent = `Wide ${data.nominal_spread_bps} bps sovereign yield advantage favors holding ${base} against ${quote}. Overnight rollover credits positive daily swap into the desk account.`;
    } else if (data.nominal_spread_bps < -150) {
      badge.className = "signal-badge";
      badge.style.background = "var(--accent-rose)";
      badge.style.color = "#ffffff";
      badge.textContent = "STRONG SHORT CARRY";
      headline.textContent = `Short ${base} / Long ${quote} (Negative Carry ${data.nominal_spread_bps} bps)`;
      rationale.textContent = `Yield differential heavily penalizes holding ${base}. Going long incurs heavy negative rollover financing costs. Look for technical rejection rallies to sell short along macro yield flows.`;
    } else {
      badge.className = "signal-badge";
      badge.style.background = "var(--accent-amber)";
      badge.style.color = "#080b11";
      badge.textContent = "NEUTRAL / RANGE ROTATION";
      headline.textContent = `Yield Spread Near Balance (${data.nominal_spread_bps >= 0 ? '+' : ''}${data.nominal_spread_bps} bps)`;
      rationale.textContent = `Central bank policies are synchronized or yield differentials are insufficient to dominate session flow. Trade session volume profiles and liquidity sweeps.`;
    }
  } catch (err) {
    console.warn("Spread KPI fetch failed:", err);
  }
}

// ----------------------------------------------------------------------------
// 5. Tab 3: Cross-Asset Correlation Heatmap Matrix
// ----------------------------------------------------------------------------
async function loadCorrelations() {
  try {
    const res = await fetch("/api/correlations");
    correlationData = await res.json();
    renderCorrelationTable();
  } catch (err) {
    console.warn("Correlations fetch failed:", err);
  }
}

function renderCorrelationTable() {
  const table = document.getElementById("correlation-matrix-table");
  if (!table || !correlationData) return;

  const labels = correlationData.labels;
  const matrix = correlationData.matrix;

  let headerHtml = `<thead><tr><th>Asset / Benchmark</th>`;
  labels.forEach(l => {
    headerHtml += `<th>${l}</th>`;
  });
  headerHtml += `</tr></thead>`;

  let bodyHtml = `<tbody>`;
  matrix.forEach((row, i) => {
    bodyHtml += `<tr><td style="text-align: left; font-weight: 700; color: #fff;">${labels[i]}</td>`;
    row.forEach((val, j) => {
      let cellClass = "corr-neutral";
      if (val >= 0.70) cellClass = "corr-high-pos";
      else if (val >= 0.25) cellClass = "corr-med-pos";
      else if (val <= -0.70) cellClass = "corr-high-neg";
      else if (val <= -0.25) cellClass = "corr-med-neg";

      bodyHtml += `<td class="${cellClass}">${val >= 0 ? '+' : ''}${val.toFixed(2)}</td>`;
    });
    bodyHtml += `</tr>`;
  });
  bodyHtml += `</tbody>`;

  table.innerHTML = headerHtml + bodyHtml;
}

// ----------------------------------------------------------------------------
// 6. Tab 4: Multi-Asset Risk-Parity & Sizing Engine (POST to Backend)
// ----------------------------------------------------------------------------
function initRiskCalculator() {
  const assetSelect = document.getElementById("calc-select-asset");
  if (assetSelect) {
    assetSelect.addEventListener("change", () => {
      syncRiskFormWithAsset();
      calculateRiskBackend();
    });
  }

  const runBtn = document.getElementById("btn-run-calculation");
  if (runBtn) {
    runBtn.addEventListener("click", calculateRiskBackend);
  }

  const liveInputs = ["calc-account-capital", "calc-risk-pct", "calc-atr-mult", "calc-rr-ratio", "calc-custom-atr"];
  liveInputs.forEach(id => {
    document.getElementById(id)?.addEventListener("input", calculateRiskBackend);
  });

  syncRiskFormWithAsset();
  calculateRiskBackend();
}

function syncRiskFormWithAsset() {
  const assetId = document.getElementById("calc-select-asset")?.value || "USDJPY";
  const asset = allAssets.find(a => a.id === assetId);
  if (asset) {
    document.getElementById("calc-custom-atr").value = asset.atr_14;
  }
}

async function calculateRiskBackend() {
  const assetId = document.getElementById("calc-select-asset")?.value || "USDJPY";
  const capital = parseFloat(document.getElementById("calc-account-capital")?.value) || 50000;
  const riskPct = parseFloat(document.getElementById("calc-risk-pct")?.value) || 1.0;
  const atrMult = parseFloat(document.getElementById("calc-atr-mult")?.value) || 1.5;
  const rrRatio = parseFloat(document.getElementById("calc-rr-ratio")?.value) || 2.0;
  const customAtr = parseFloat(document.getElementById("calc-custom-atr")?.value) || null;

  try {
    const res = await fetch("/api/risk/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId, capital, riskPct, atrMult, rrRatio, customAtr })
    });
    const data = await res.json();

    document.getElementById("calc-display-risk").textContent = `$${data.allocated_dollar_risk.toFixed(2)} (${data.risk_percentage}% Risk)`;
    document.getElementById("calc-res-lots").textContent = data.position_sizing.display;
    document.getElementById("calc-res-notional").textContent = `Notional Value: ~$${data.position_sizing.notional_usd.toLocaleString()}`;
    document.getElementById("calc-res-spot").textContent = data.spot_price.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById("calc-res-category").textContent = data.category;
    document.getElementById("calc-res-stop-dist").textContent = `${data.stop_distance} ${data.atr_unit}`;
    document.getElementById("calc-res-stop-price").textContent = `Stop Price: ${data.stop_price}`;
    document.getElementById("calc-res-target-dist").textContent = `${data.target_distance} ${data.atr_unit}`;
    document.getElementById("calc-res-target-price").textContent = `Target: ${data.target_price} (+$${data.potential_dollar_gain.toFixed(0)})`;
    document.getElementById("calc-res-protocol").innerHTML = `<strong>Trailing Protocol:</strong> ${data.trailing_protocol}`;
  } catch (err) {
    console.warn("Risk calculation backend call failed:", err);
  }
}

// ----------------------------------------------------------------------------
// 7. Tab 5: Historical Macro Cycle Simulator (USD/JPY Engine)
// ----------------------------------------------------------------------------
async function loadCycles() {
  try {
    const res = await fetch("/api/cycles");
    const data = await res.json();
    historicalCycles = data.historical_cycles || [];
  } catch (err) {
    console.warn("Cycles fetch failed:", err);
  }

  document.getElementById("btn-prev-cycle")?.addEventListener("click", () => {
    if (activeCycleIndex > 0) {
      activeCycleIndex--;
      updateCycleDisplay();
    }
  });

  document.getElementById("btn-next-cycle")?.addEventListener("click", () => {
    if (activeCycleIndex < historicalCycles.length - 1) {
      activeCycleIndex++;
      updateCycleDisplay();
    }
  });

  updateCycleDisplay();
}

function updateCycleDisplay() {
  if (historicalCycles.length === 0) return;
  const current = historicalCycles[activeCycleIndex];

  document.getElementById("cycle-step-display").textContent = `Stage ${activeCycleIndex + 1} of ${historicalCycles.length}: ${current.regime}`;
  document.getElementById("sim-period-badge").textContent = current.period;
  document.getElementById("sim-regime-title").textContent = current.regime;

  document.getElementById("sim-us2y").textContent = `${current.us_2y.toFixed(2)}%`;
  document.getElementById("sim-jp2y").textContent = `${current.jp_2y.toFixed(2)}%`;
  document.getElementById("sim-spread").textContent = `+${current.spread_bps} bps`;
  document.getElementById("sim-spot").textContent = current.spot.toFixed(2);

  document.getElementById("sim-explanation").textContent = current.explanation;
  document.getElementById("sim-takeaway").innerHTML = `<strong>Desk Lesson:</strong> ${current.takeaway}`;

  renderHistoricalChart();
}

function renderHistoricalChart() {
  const canvas = document.getElementById("historical-chart");
  if (!canvas || historicalCycles.length === 0) return;
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 32;
  const height = 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const padLeft = 50;
  const padRight = 50;
  const padTop = 30;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minSpread = 100;
  const maxSpread = 520;
  const minSpot = 110;
  const maxSpot = 165;

  // Grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "10px JetBrains Mono";
    const spreadLabel = Math.round(maxSpread - (i * (maxSpread - minSpread) / 4)) + " bps";
    ctx.fillText(spreadLabel, 8, y + 3);
  }

  // Spread Curve (Cyan)
  ctx.beginPath();
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 2.5;
  historicalCycles.forEach((c, idx) => {
    const x = padLeft + (chartW / (historicalCycles.length - 1)) * idx;
    const y = padTop + chartH - ((c.spread_bps - minSpread) / (maxSpread - minSpread)) * chartH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Spot Curve (Amber)
  ctx.beginPath();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2.5;
  historicalCycles.forEach((c, idx) => {
    const x = padLeft + (chartW / (historicalCycles.length - 1)) * idx;
    const y = padTop + chartH - ((c.spot - minSpot) / (maxSpot - minSpot)) * chartH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Markers
  historicalCycles.forEach((c, idx) => {
    const x = padLeft + (chartW / (historicalCycles.length - 1)) * idx;
    const ySpread = padTop + chartH - ((c.spread_bps - minSpread) / (maxSpread - minSpread)) * chartH;
    const ySpot = padTop + chartH - ((c.spot - minSpot) / (maxSpot - minSpot)) * chartH;

    ctx.fillStyle = (idx === activeCycleIndex) ? "#ffffff" : "#64748b";
    ctx.font = (idx === activeCycleIndex) ? "bold 10px JetBrains Mono" : "10px JetBrains Mono";
    ctx.fillText(c.period, x - 16, height - 10);

    if (idx === 2 || idx === 5) {
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(x, ySpot, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 9px JetBrains Mono";
      ctx.fillText("MoF Intervention", x - 35, ySpot - 10);
    } else {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, ySpot, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.arc(x, ySpread, 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (idx === activeCycleIndex) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

window.addEventListener("resize", renderHistoricalChart);

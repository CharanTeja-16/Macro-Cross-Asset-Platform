#!/usr/bin/env python3
"""
=============================================================================
G10 Macro & Cross-Asset FX Analytics Platform
CLI Trading Desk Analytics Engine & Multi-Asset Risk-Parity Tool
=============================================================================
Assets: G10 FX, Precious Metals (XAU/XAG), Energy (WTI), Crypto (BTC/ETH), DXY
"""

import json
import math
import sys
from pathlib import Path

def load_macro_data():
    data_path = Path(__file__).parent / "data" / "g10_macro_data.json"
    if not data_path.exists():
        print(f"[!] Error: Data file not found at {data_path}")
        sys.exit(1)
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)

def print_header(title):
    print("\n" + "=" * 90)
    print(f" {title.upper()}")
    print("=" * 90)

def display_central_bank_scorecard(data):
    print_header("G10 Central Bank Monetary Policy & 2-Year Sovereign Yield Matrix")
    headers = ["Country", "Central Bank", "Rate", "2Y Yield", "CPI YoY", "Real 2Y", "Stance", "Next Meeting"]
    row_fmt = "{:<12} {:<24} {:<8} {:<10} {:<9} {:<10} {:<8} {:<12}"
    print(row_fmt.format(*headers))
    print("-" * 96)

    for ccy, info in data["central_banks"].items():
        real_yield_str = f"{info['real_yield_2y']:+.2f}%"
        stance_str = f"{info['stance_score']:+d}"
        print(row_fmt.format(
            f"{info['country']} ({ccy})",
            info["bank_name"][:23],
            f"{info['policy_rate']:.2f}%",
            f"{info['yield_2y']:.2f}%",
            f"{info['cpi_yoy']:.1f}%",
            real_yield_str,
            stance_str,
            info["next_meeting"]
        ))

def display_cross_asset_matrix(data):
    print_header("Cross-Asset Market Matrix (Currencies, Metals, Energy, Crypto, DXY)")
    headers = ["Asset", "Category", "Spot Price", "24h Chg", "14D ATR", "CME Proxy", "Macro Driver"]
    row_fmt = "{:<10} {:<18} {:<12} {:<10} {:<14} {:<11} {:<32}"
    print(row_fmt.format(*headers))
    print("-" * 115)

    for asset in data.get("cross_assets", []):
        spot_str = f"${asset['spot_price']:,.2f}" if asset["spot_price"] > 10 else f"{asset['spot_price']:.4f}"
        chg_str = f"{asset['change_24h']:+.2f}%"
        atr_str = f"{asset['atr_14']} {asset['atr_unit']}"
        print(row_fmt.format(
            asset["symbol"],
            asset["category_label"][:17],
            spot_str,
            chg_str,
            atr_str,
            asset["cme_futures"],
            asset["macro_driver"][:31] + "..."
        ))

def calculate_multi_asset_risk_parity(data, capital=50000.0, risk_pct=1.0, atr_mult=1.5, rr_ratio=2.0):
    print_header(f"Multi-Asset Risk-Parity & Position Sizing Engine (Capital: ${capital:,.2f} | Risk: {risk_pct:.2f}%)")
    dollar_risk = capital * (risk_pct / 100.0)
    print(f"[*] Max Allocated Dollar Loss: ${dollar_risk:,.2f} | Stop Multiplier: {atr_mult}x ATR | Target R:R: 1:{rr_ratio:.1f}\n")

    headers = ["Asset", "Category", "14D ATR", "Stop Distance", "Allocated Sizing", "Notional ($)", "Target Gain ($)"]
    row_fmt = "{:<10} {:<18} {:<14} {:<16} {:<24} {:<14} {:<16}"
    print(row_fmt.format(*headers))
    print("-" * 115)

    for asset in data.get("cross_assets", []):
        if asset["category"] == "INDEX":
            continue

        stop_dist = asset["atr_14"] * atr_mult
        target_dollar = dollar_risk * rr_ratio

        if asset["category"] == "FX_MAJORS":
            std_lots = dollar_risk / (stop_dist * asset["pip_value_usd"])
            sizing_str = f"{std_lots:.2f} Lots ({std_lots*10:.1f} Mini)"
            notional = std_lots * 100000
        elif asset["category"] == "METALS":
            oz = dollar_risk / (stop_dist * 100)
            sizing_str = f"{oz:.2f} Lots (~{oz*100:.1f} Oz)"
            notional = oz * 100 * asset["spot_price"]
        elif asset["category"] == "ENERGY":
            contracts = dollar_risk / (stop_dist * 1000)
            sizing_str = f"{contracts:.2f} Lots (~{contracts*1000:.0f} bbl)"
            notional = contracts * 1000 * asset["spot_price"]
        elif asset["category"] == "DIGITAL_ASSETS":
            units = dollar_risk / stop_dist
            sizing_str = f"{units:.3f} {asset['base']}"
            notional = units * asset["spot_price"]
        else:
            continue

        print(row_fmt.format(
            asset["symbol"],
            asset["category_label"][:17],
            f"{asset['atr_14']} {asset['atr_unit']}",
            f"{stop_dist:.2f} {asset['atr_unit']}",
            sizing_str,
            f"${notional:,.0f}",
            f"+${target_dollar:,.2f}"
        ))

def main():
    data = load_macro_data()
    display_central_bank_scorecard(data)
    display_cross_asset_matrix(data)
    calculate_multi_asset_risk_parity(data, capital=50000.0, risk_pct=1.0, atr_mult=1.5, rr_ratio=2.0)
    print("\n[+] Full cross-asset macro analysis executed successfully.")

if __name__ == "__main__":
    main()
